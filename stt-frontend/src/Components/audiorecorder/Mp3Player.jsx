import React from "react";

export default function Mp3Player({ mp3Url }) {
  if (!mp3Url) return null;
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow text-black">
      <h3 className="mb-2 font-semibold text-center">Recorded Audio</h3>
      <audio controls src={mp3Url} className="w-full" />
    </div>
  );
}
