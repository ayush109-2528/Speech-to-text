import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../Superbase Auth/SupabaseClient";
import { uploadAudio, getTranscriptions } from '../api';
import axios from "axios";
export default function SpeechToTextApp({ session }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [permission, setPermission] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const getMicPermission = async () => {
    if (!("MediaRecorder" in window)) {
      setStatusMsg("MediaRecorder not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermission(true);
      setStatusMsg("Microphone permission granted.");
    } catch (e) {
      setStatusMsg(`Microphone error: ${e.message}`);
    }
  };

  const startRecording = () => {
    if (!permission || !streamRef.current) {
      setStatusMsg("Grant microphone permission first.");
      return;
    }
    audioChunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: "video/mp4" });
    mediaRecorderRef.current = mr;
    mr.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) audioChunksRef.current.push(event.data);
    };
    mr.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "video/mp4" });
      const file = new File([blob], `recording-${Date.now()}.mp4`, { type: "video/mp4" });
      setSelectedFile(file);
      setStatusMsg("🎤 MP4 recording ready for upload.");
    };
    mr.start();
    setRecording(true);
    setStatusMsg("🎙️ Recording...");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setStatusMsg("Stopped recording.");
    }
  };

  const uploadAudioAndSaveTranscription = async (file, transcriptionText, userId) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("audiofiles")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { publicUrl, error: urlError } = supabase.storage
        .from("audiofiles")
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      const { error: dbError } = await supabase.from("transcriptions").insert({
        user_id: userId,
        audio_url: publicUrl,
        transcription: transcriptionText,
      });

      if (dbError) throw dbError;

      setStatusMsg("✅ Transcription saved with audio URL!");
    } catch (error) {
      setStatusMsg("Error during upload/save: " + error.message);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMsg("Please select or record an MP4 file.");
      return;
    }

    setUploading(true);
    setStatusMsg("Uploading and transcribing...");

    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("audiofiles")
        .upload(fileName, selectedFile, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from("audiofiles")
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      setStatusMsg("File uploaded, transcribing now...");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("model", "whisper-1");

      const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const transcriptionText = response.data.text;

      setStatusMsg("Transcription received! Saving record...");

      await uploadAudioAndSaveTranscription(selectedFile, transcriptionText, session.user.id);

      setUploading(false);
      setSelectedFile(null);
    } catch (error) {
      setStatusMsg("Error: " + error.message);
      setUploading(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "video/mp4" && !file.name.endsWith(".mp4")) {
      setStatusMsg("Only MP4 files are allowed.");
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
      setStatusMsg("MP4 file selected. Ready to upload.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-blue-100 text-gray-900 p-6 max-w-4xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-2">Speech-to-Text with Supabase & Whisper</h1>
        <p className="text-lg font-medium text-gray-700">Welcome, {session.user.email}</p>
      </header>

      <section className="mb-8 p-6 bg-white rounded-xl shadow-lg border-4 border-blue-300">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center gap-2">📁 Upload MP4 File</h2>
        <input
          type="file"
          accept=".mp4,video/mp4"
          onChange={onFileChange}
          className="mb-4 block w-full text-gray-700 file:cursor-pointer file:px-4 file:py-2 file:border-0 file:rounded file:bg-gradient-to-r file:from-green-300 file:to-green-400 file:text-green-900 file:font-semibold hover:file:from-green-400 hover:file:to-green-500"
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
        >
          {uploading ? "Uploading & Transcribing..." : "Upload & Transcribe"}
        </button>
      </section>

      <section className="mb-8 p-6 bg-white rounded-xl shadow-lg border-4 border-pink-300">
        <h2 className="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">🎤 Record Audio (MP4)</h2>
        {!permission ? (
          <button
            onClick={getMicPermission}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow hover:scale-105 transition-transform"
          >
            Get Microphone Permission
          </button>
        ) : (
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`px-6 py-3 rounded-xl font-bold shadow text-white transition-transform ${
              recording
                ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-600 hover:to-red-600"
                : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-blue-700 hover:to-green-700"
            } hover:scale-105`}
          >
            {recording ? "🛑 Stop Recording" : "🎙️ Start Recording"}
          </button>
        )}
        {selectedFile && (
          <p className="mt-3 text-indigo-700 font-semibold">
            Selected File: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </p>
        )}
      </section>

      <section className="p-6 bg-white rounded-xl shadow-lg border-4 border-yellow-400">
        <h2 className="text-2xl font-bold text-yellow-600 mb-3 flex items-center gap-2">💡 Status</h2>
        <p className="text-lg font-semibold text-gray-700 min-h-[40px]">{statusMsg || "Ready to upload or record audio."}</p>
      </section>
    </div>
  );
}
