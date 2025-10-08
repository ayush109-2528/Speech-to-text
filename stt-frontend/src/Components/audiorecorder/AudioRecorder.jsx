import React from "react";

export default function AudioRecorder({ permission, getMicPermission, recording, startRecording, stopRecording, statusMsg }) {
  return (
    <section className="bg-white border-4 border-pink-300 rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">
        <span>🎤</span> Record Audio (MP4)
      </h2>
      <div className="flex gap-4 flex-wrap items-center">
        {!permission ? (
          <button
            onClick={getMicPermission}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 text-white font-bold shadow-lg hover:scale-105 hover:from-green-600 hover:to-yellow-400 transition-transform duration-200"
          >
            Get Microphone
          </button>
        ) : (
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`px-6 py-2 rounded-xl font-bold shadow-lg transition-transform duration-200 ${
              recording
                ? "bg-gradient-to-r from-red-500 to-pink-400 text-white hover:scale-105 hover:from-pink-600 hover:to-yellow-400"
                : "bg-gradient-to-r from-green-500 to-blue-400 text-white hover:scale-105 hover:from-blue-600 hover:to-green-400"
            }`}
          >
            {recording ? "🛑 Stop Recording" : "🎙️ Start Recording"}
          </button>
        )}
      </div>
      <p className="text-base text-pink-700 mt-3">Recording is saved as MP4 (<span className="italic">note: browser support may vary</span>).</p>
      <div className="mt-2 text-sm text-red-500">
        {statusMsg?.includes("Recording") && statusMsg}
      </div>
    </section>
  );
}
