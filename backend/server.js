require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
const { createClient: createDeepgramClient } = require("@deepgram/sdk");
const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const { createReadStream } = require("fs");
const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
const tempWebmPath = path.join(uploadsDir, "live_recording.webm");
const mp3OutputPath = path.join(uploadsDir, "final_recording.mp3");
const supabase = createSupabaseClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY);

// In-memory transcription history
const transcriptionHistory = [];

async function saveTranscription(req, transcriptionText, audioUrl = null) {
  const userId = req.headers["x-user-id"] || null;

  // Only check if userId is provided and non-null
  if (userId) {
    const { data, error } = await supabase
      .from("auth.users")
      .select()
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.warn(`User with ID ${userId} does not exist, saving transcription without user association.`);
      // Do NOT throw, allow saving without user association.
    }
  }

  // Insert transcription with user_id (nullable)
  const { data: insertData, error: insertError } = await supabase
    .from("transcriptions")
    .insert([{ transcription: transcriptionText, audio_url: audioUrl, user_id: userId }]);

  if (insertError) {
    throw insertError;
  }

  return insertData;
}

app.post("/upload", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  try {
    // Read uploaded audio file into buffer
    createReadStream(req.file.path);

    // Call Deepgram v3 transcription API
    const response = await deepgram.listen.prerecorded.transcribeFile(
      createReadStream(req.file.path),
      { punctuate: true, language: "en-US" }
    );

    // Now safely access response.result.results.channels
    if (response.error) throw new Error(response.error);

    const channels = response.result?.results?.channels;
    if (!channels || channels.length === 0) {
      throw new Error("No transcription channels found in Deepgram response.");
    }
    // proceed with alternatives...
    const alternatives = channels[0].alternatives;
    const transcription = alternatives[0].transcript;

    // Save or handle transcription here...

    fs.unlinkSync(req.file.path);
   await saveTranscription(req, transcription);
    res.json({ transcription });
  } catch (err) {
    console.error("Error during transcription:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// let chunkFilePath = path.join(uploadsDir, "live_recording.webm");

app.post("/upload-chunk", upload.single("chunk"), (req, res) => {
  try {
    const chunkFilePath = req.file.path;
    const chunkData = fs.readFileSync(chunkFilePath);
    fs.appendFileSync(tempWebmPath, chunkData);
    fs.unlinkSync(chunkFilePath);
    res.json({ message: "Chunk received and appended" });
  } catch (error) {
    console.error("Error appending chunk:", error);
    res.status(500).json({ error: "Failed to append chunk" });
  }
});

app.post("/stop-recording", async (req, res) => {
  if (!fs.existsSync(tempWebmPath)) {
    return res.status(400).json({ error: "No recording found to convert" });
  }

  ffmpeg(tempWebmPath)
    .format("mp3")
    .on("end", async () => {
      fs.unlinkSync(tempWebmPath);

      try {
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
          createReadStream(mp3OutputPath),
          { punctuate: true, language: "en-US" }
        );
        if (error) throw new Error(error);

        const channels = result?.results?.channels;
        if (!channels || channels.length === 0) throw new Error("No transcription channels");

        const transcription = channels[0].alternatives[0].transcript;

        // Save transcription optionally, if user info available
        await saveTranscription(req, transcription);

        res.json({ mp3: "/uploads/final_recording.mp3", transcription });
      } catch (err) {
        console.error("Error during post-conversion transcription:", err);
        res.status(500).json({ error: err.message });
      }
    })
    .on("error", (err) => {
      console.error("Conversion error:", err);
      res.status(500).json({ error: "MP3 conversion failed" });
    })
    .save(mp3OutputPath);
});

app.get("/transcriptions", async (req, res) => {
  try {
    // Fetch transcriptions from your database or memory

    // Example: fetch from Supabase table
    const { data, error } = await supabase.from("transcriptions").select().order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching transcriptions:", error);
      return res.status(500).json({ error: "Failed to fetch transcriptions" });
    }

    res.json(data);
  } catch (err) {
    console.error("Server error in /transcriptions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use("/uploads", express.static(uploadsDir));
app.delete("/transcriptions/:id", async (req, res) => {
  const transcriptionId = req.params.id;
  try {
    const { error } = await supabase
      .from("transcriptions")
      .delete()
      .eq("id", transcriptionId);

    if (error) {
      console.error("Error deleting transcription:", error);
      return res.status(500).json({ error: "Failed to delete transcription" });
    }

    res.json({ message: "Transcription deleted successfully" });
  } catch (err) {
    console.error("Server error deleting transcription:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend listening on http://localhost:${PORT}`)
);
