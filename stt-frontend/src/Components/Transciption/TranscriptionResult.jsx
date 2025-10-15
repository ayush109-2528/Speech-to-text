import React from "react";

export default function TranscriptionResult({ transcription }) {
  if (!transcription) return null;
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow text-black">
      <h3 className="mb-2 font-semibold">Transcription Result</h3>
      <pre className="whitespace-pre-wrap">{transcription}</pre>
    </div>
  );
}
