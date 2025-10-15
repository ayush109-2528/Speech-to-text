import React, { useState, useRef, useEffect } from "react";
import supabase from "../Superbase Auth/SupabaseClient";
import NavBar from "../Navbar.jsx/Navbar";
import FileUploader from "../File upload/FileUploader";
import RecordingControls from "../audiorecorder/AudioRecorder";
import WaveformCanvas from "../Canvas/WaveformCanvas";
import StatusMessage from "../status/StatusMessage";
import Mp3Player from "../audiorecorder/Mp3Player";
import TranscriptionResult from "../Transciption/TranscriptionResult";
import TranscriptionHistory from "../Transciption/TranscriptionHistory";
//Supabase intialization
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  } // Waveform drawing functions here... (same as your code)

  function drawWaveform() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height; // Clear previous frame

    ctx.clearRect(0, 0, width, height);

    if (!analyser.current) return;

    analyser.current.getByteTimeDomainData(dataArray.current);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#a78bfa"; // Tailwind indigo-400 for waveform line

    ctx.beginPath();

    const sliceWidth = width / dataArray.current.length;
    let x = 0;

    for (let i = 0; i < dataArray.current.length; i++) {
      const v = dataArray.current[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke(); // Request next frame

    animationId.current = requestAnimationFrame(drawWaveform);
  }

  async function startRecording() {
    // After connecting analyser and creating dataArray:

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

      drawWaveform();
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
    cancelAnimationFrame(animationId.current);
    const canvas = canvasRef.current;
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
  } // async function saveTranscription(req, transcriptionText, audioUrl = null) { //   const userId = req.headers["x-user-id"] || null; //   if (userId) { //     const { data, error } = await supabase //       .from("auth.users") //       .select() //       .eq("id", userId) //       .single(); //     if (error || !data) { //       console.warn( //         `User with ID ${userId} does not exist, saving transcription without user association.` //       ); //       // Don't throw, allow save without user_id //     } //   } //   const { data: insertData, error: insertError } = await supabase //     .from("transcriptions") //     .insert([ //       { //         transcription: transcriptionText, //         audio_url: audioUrl, //         user_id: userId, //       }, //     ]); //   if (insertError) throw insertError; //   return insertData; // }
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
        setStatus("Deleted successfully"); // Remove deleted transcription from state
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      setStatus("Delete error: " + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Fixed background layer */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "url('/src/assets/background1.png') center center / cover no-repeat, linear-gradient(to bottom right,#000A2E 80%, #170024 100%)",
        }}
      />

      {/* Main content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col justify-start items-start pt-20 px-4 md:px-8 w-full max-w-xl mx-auto">
        <NavBar user={user} onSignOut={() => setUser(null)} />

        <div className="bg-white/90 rounded-2xl shadow-2xl px-10 py-8 md:px-16 md:py-12 max-w-xl mx-auto overflow-y-auto">
          <div className="mb-8 flex flex-col items-center text-center">
            <img
              src="/src/assets/mic.png"
              alt="Speech Icon"
              className="w-16 h-16 mb-4 rounded-2xl"
            />
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              Speech to Text Converter
            </h1>
            <p className="text-md text-gray-500 mt-2">
              Upload or record audio and get instant, accurate transcription.
            </p>
          </div>

          <FileUploader
            file={file}
            onFileChange={handleFileChange}
            onUpload={uploadFile}
            loading={loading}
            recording={recording}
          />
          <RecordingControls
            recording={recording}
            loading={loading}
            onStart={startRecording}
            onStop={stopRecording}
          />
          <WaveformCanvas canvasRef={canvasRef} />
          <StatusMessage status={status} />
          <Mp3Player mp3Url={mp3Url} />
          <TranscriptionResult transcription={transcription} />
          <TranscriptionHistory
            history={history}
            loading={loading}
            mp3Url={mp3Url}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-20" />
    </div>
  );
}
