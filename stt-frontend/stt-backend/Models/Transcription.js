import mongoose from "mongoose";

const TranscriptionSchema = new mongoose.Schema({
  audioPath: { type: String, required: true },
  transcriptionText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Transcription", TranscriptionSchema);
