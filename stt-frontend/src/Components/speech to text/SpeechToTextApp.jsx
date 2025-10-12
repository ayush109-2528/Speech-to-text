import React, { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SpeechToTextApp() {
  const [user, setUser] = useState(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [transcription, setTranscription] = useState("");
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mp3Url, setMp3Url] = useState(null);

  const mediaRecorder = useRef(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const dataArray = useRef(null);
  const source = useRef(null);
  const animationId = useRef(null);
  const canvasRef = useRef(null);
  function handleFileChange(e) {
    setFile(e.target.files[0]);
    setTranscription("");
    setStatus("");
    setMp3Url(null);
  }
  const userId = user?.id;
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    }
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);
  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/transcriptions");
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setStatus("Failed to load history: " + err.message);
    }
    setLoading(false);
  }
  useEffect(() => {
    async function fetchUserAndHistory() {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchHistory();
      }
    }
    fetchUserAndHistory();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchHistory();
        } else {
          setHistory([]);
        }
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function uploadFile() {
    if (!file) {
      setStatus("Select a file first");
      return;
    }
    if (!userId) {
      setStatus("Please log in first");
      return;
    }
    setStatus("Uploading...");
    setLoading(true);
    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: { "x-user-id": userId },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setTranscription(data.transcription ?? "");
        setStatus("Upload complete!");
        await fetchHistory();
      } else {
        setStatus("Upload error: " + (data.error || "unknown error"));
      }
    } catch (err) {
      setStatus("Upload failed: " + err.message);
    }
    setLoading(false);
  }

  // Waveform drawing functions here... (same as your code)
  function drawWaveform() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear previous frame
    ctx.clearRect(0, 0, width, height);

    if (!analyser.current) return;

    analyser.current.getByteTimeDomainData(dataArray.current);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#050505ff"; // green color for waveform

    ctx.beginPath();

    const sliceWidth = width / dataArray.current.length;
    let x = 0;

    for (let i = 0; i < dataArray.current.length; i++) {
      const v = dataArray.current[i] / 128.0; // normalize byte 0-255 to 0-2
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Request next frame
    animationId.current = requestAnimationFrame(drawWaveform);
  }

  async function startRecording() {
    // After connecting analyser and creating dataArray:
    drawWaveform();

    if (!userId) {
      setStatus("Please log in first");
      return;
    }
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setStatus("Recording not supported in your browser");
      return;
    }
    setStatus("Requesting microphone access...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 2048;
      dataArray.current = new Uint8Array(analyser.current.frequencyBinCount);
      source.current = audioContext.current.createMediaStreamSource(stream);
      source.current.connect(analyser.current);

      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorder.current.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          const formData = new FormData();
          formData.append("chunk", e.data, "chunk.webm");
          try {
            await fetch("http://localhost:5000/upload-chunk", {
              method: "POST",
              headers: { "x-user-id": userId },
              body: formData,
            });
          } catch (err) {
            console.error("Chunk upload error", err);
          }
        }
      };
      mediaRecorder.current.start(1000);
      setRecording(true);
      setStatus("Recording...");
      setMp3Url(null);
      setTranscription("");
    } catch (err) {
      setStatus("Microphone access error: " + err.message);
    }
  }
  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  async function stopRecording() {
    clearCanvas();
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animationId.current);
      audioContext.current.close();
      setStatus("Processing...");
      try {
        const res = await fetch("http://localhost:5000/stop-recording", {
          method: "POST",
          headers: { "x-user-id": userId },
        });
        const data = await res.json();
        setMp3Url("http://localhost:5000" + data.mp3);
        setTranscription(data.transcription);
        setStatus("Recording complete!");
        await fetchHistory();
      } catch (err) {
        setStatus("Processing error: " + err.message);
      }
      setRecording(false);
    }
  }
  // async function saveTranscription(req, transcriptionText, audioUrl = null) {
  //   const userId = req.headers["x-user-id"];

  //   if (userId) {
  //     // Check user exists only if userId is provided
  //     const { data: user, error: userErr } = await supabase
  //       .from("auth.users")
  //       .select()
  //       .eq("id", userId)
  //       .single();

  //     if (userErr || !user) {
  //       throw new Error("User does not exist");
  //     }
  //   }

  //   // Insert with user_id or null
  //   const { data, error } = await supabase.from("transcriptions").insert([
  //     {
  //       transcription: transcriptionText,
  //       audio_url: audioUrl,
  //       user_id: userId || null,
  //     },
  //   ]);

  //   if (error) {
  //     throw error;
  //   }
  //   return data;
  // }
  async function handleDelete(id) {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/transcriptions/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": userId }, // optional, if you want to authorize deletes
      });
      if (!res.ok) {
        const data = await res.json();
        setStatus("Delete failed: " + (data.error || "Unknown error"));
      } else {
        setStatus("Deleted successfully");
        // Remove deleted transcription from state
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      setStatus("Delete error: " + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto my-8 p-8 rounded-lg shadow-lg bg-gradient-to-br from-purple-700 via-pink-600 to-red-500 text-white font-sans">
      <h1 className="text-4xl font-bold mb-8 text-center drop-shadow-lg">
        Speech to Text
      </h1>
      {/* File Upload */}
      <div className="mb-6 flex items-center space-x-4">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={loading || recording}
          className="text-black p-2 rounded"
        />
        <button
          onClick={uploadFile}
          disabled={!file || loading || recording}
          className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 rounded shadow font-semibold text-black"
        >
          {loading ? "Processing..." : "Upload & Transcribe"}
        </button>
      </div>
      {/* Recording Controls */}
      <div className="mb-6 text-center">
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
          className={`px-10 py-3 rounded-full font-bold shadow-lg transition-colors duration-300 ${
            recording
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>
      {/* Waveform Canvas */}
      <canvas
        ref={canvasRef}
        width={500}
        height={100}
        className="w-full rounded-lg shadow-lg border-4 border-white bg-black mb-6"
      />
      {/* Status */}
      {status && (
        <div className="mb-4 text-center font-semibold text-yellow-300">
          {status}
        </div>
      )}
      {/* MP3 Player */}
      {mp3Url && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow text-black">
          <h3 className="mb-2 font-semibold text-center">Recorded Audio</h3>
          <audio controls src={mp3Url} className="w-full" />
        </div>
      )}
      {/* Transcription Result */}
      {transcription && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow text-black">
          <h3 className="mb-2 font-semibold">Transcription Result</h3>
          <pre className="whitespace-pre-wrap">{transcription}</pre>
        </div>
      )}
      {/* History */}
      <div className="p-4 bg-white rounded-lg shadow text-black">
        <h3 className="mb-4 font-semibold text-center">
          Transcription History
        </h3>
        {loading && !mp3Url ? (
          <p className="text-center">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-center">No previous transcriptions.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((item) => (
              <li
                key={item.id || item.created_at}
                className="border p-3 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              >
                <div>
                  {item.audio_url && (
                    <a
                      href={item.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Audio File
                    </a>
                  )}
                  <p className="mt-2 whitespace-pre-wrap">
                    {item.transcription}
                  </p>
                  <small className="text-gray-600">
                    {new Date(item.created_at).toLocaleString()}
                  </small>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
