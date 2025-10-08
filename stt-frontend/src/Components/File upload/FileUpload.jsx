import React from "react";

export default function FileUpload({ selectedFile, setSelectedFile, uploading, uploadFile, setStatusMsg, statusMsg }) {
  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== "video/mp4" && !f.name.endsWith(".mp4")) {
        setStatusMsg("Only MP4 files are allowed!");
        setSelectedFile(null);
      } else {
        setSelectedFile(f);
        setStatusMsg("MP4 file selected. Ready to upload.");
      }
    }
  };

  return (
    <section className="bg-white border-4 border-blue-300 rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-blue-500 mb-4 flex items-center gap-2">
        <span>📁</span> Upload MP4 File
      </h2>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <input
          type="file"
          accept=".mp4,video/mp4"
          onChange={onPickFile}
          className="block w-full md:w-auto text-base file:bg-gradient-to-r file:from-green-200 file:to-green-300 file:font-bold file:text-green-700 file:border-0 file:rounded file:px-4 file:py-2 hover:file:bg-green-400 transition"
        />
        <button
          onClick={uploadFile}
          disabled={uploading || !selectedFile}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold shadow-lg hover:scale-105 hover:from-violet-600 hover:to-pink-500 transition-transform duration-200 disabled:from-gray-400 disabled:to-gray-500"
        >
          {uploading ? (
            <span className="animate-pulse">Uploading...</span>
          ) : (
            "Upload 🎉"
          )}
        </button>
      </div>
      {selectedFile && (
        <p className="text-base text-indigo-700 mt-3">
          Selected: {selectedFile.name}{" "}
          <span className="text-gray-500">({Math.round(selectedFile.size / 1024)} KB)</span>
        </p>
      )}
      <div className="mt-2 text-sm text-red-500">
        {statusMsg?.includes("MP4") && statusMsg}
      </div>
    </section>
  );
}
