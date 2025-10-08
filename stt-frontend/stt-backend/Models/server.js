import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import axios from "axios";

import Transcription from "./models/Transcription.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// POST /upload: upload audio, transcribe, save
app.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Audio file is required." });

    const audioPath = path.join(uploadsDir, req.file.filename);

    // Call OpenAI Whisper API for transcription
    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioPath));
    formData.append("model", "whisper-1");

    const transcriptionResponse = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    const transcriptionText = transcriptionResponse.data.text;

    // Save to MongoDB
    const newTranscription = new Transcription({
      audioPath: req.file.filename,
      transcriptionText,
    });
    await newTranscription.save();

    res.json({ transcription: transcriptionText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to transcribe audio." });
  }
});

// GET /transcriptions: get all saved transcriptions
app.get("/transcriptions", async (req, res) => {
  try {
    const transcriptions = await Transcription.find().sort({ createdAt: -1 });
    res.json(transcriptions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transcriptions." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
