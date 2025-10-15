import React from "react";

export default function WaveformCanvas({ canvasRef }) {
  return (
    <canvas
      ref={canvasRef}
      width={420}
      height={90}
      className="w-full rounded-lg shadow border-2 border-indigo-200 bg-gray-900"
    />
  );
}
