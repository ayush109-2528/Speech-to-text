const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const { createClient } = require("@supabase/supabase-js");


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const uploadDir = path.resolve("./uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.get("/", (_req, res) => res.send("Speech-to-Text Backend is running."));

app.post("/upload", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file provided." });

  try {
    // Transcribe audio with OpenAI Whisper
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));
    formData.append("model", "whisper-1");
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions", formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );
    const transcriptionText = response.data.text;

    // Upload audio to Supabase Storage
    const fileContent = fs.readFileSync(req.file.path);
    const fileName = `audiofiles/${Date.now()}${path.extname(req.file.originalname)}`;
    const { error: storageError } = await supabase.storage.from("audiofiles").upload(fileName, fileContent);
    if (storageError) throw storageError;

    const { data: { publicUrl } } = supabase.storage.from("audiofiles").getPublicUrl(fileName);

    // Save to Supabase DB
    const { error: dbError } = await supabase.from("transcriptions").insert({
      user_id: "anon",
      audio_url: publicUrl,
      transcription: transcriptionText,
    });
    if (dbError) throw dbError;

    res.json({ transcription: transcriptionText, audioUrl: publicUrl });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/transcriptions", async (_req, res) => {
  const { data, error } = await supabase.from("transcriptions").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));