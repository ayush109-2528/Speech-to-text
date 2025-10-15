import React from "react";

export default function RecordingControls({ recording, loading, onStart, onStop }) {
  return (
    <div className="mb-6 text-center">
      <button
        onClick={recording ? onStop : onStart}
        disabled={loading}
        className={`px-10 py-3 rounded-full font-bold shadow-lg transition-colors duration-300 ${
          recording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}
