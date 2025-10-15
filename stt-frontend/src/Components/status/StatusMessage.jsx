import React from "react";

export default function StatusMessage({ status }) {
  return (
    status && (
      <div className="mb-4 text-center font-semibold text-indigo-300">
        {status}
      </div>
    )
  );
}
