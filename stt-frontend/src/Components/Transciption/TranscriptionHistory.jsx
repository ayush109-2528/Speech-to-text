import React from "react";

export default function TranscriptionHistory({ history, loading, mp3Url, onDelete }) {
  return (
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
                onClick={() => onDelete(item.id)}
                className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
