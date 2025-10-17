export default function FileUploader({ file, onFileChange, onUpload, loading, recording }) {
  return (
    <div className="mb-6 flex flex-col md:flex-row items-center md:space-x-4 space-y-3 md:space-y-0">
      <div className="flex-grow min-w-[200px]">
        <input
          type="file"
          accept="audio/*"
          onChange={onFileChange}
          disabled={loading || recording}
          className="file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:bg-indigo-600 file:text-white file:cursor-pointer block w-full text-gray-800 border-2 border-gray-200 rounded-lg transition"
        />
      </div>
      {file && (
        <div className="text-gray-700 font-medium">
          {file.name.length > 30 ? file.name.slice(0, 27) + "..." : file.name}
        </div>
      )}
      <button
        onClick={onUpload}
        disabled={!file || loading || recording}
        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg transition ease-in-out duration-200 disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
            Processing...
          </span>
        ) : (
          "Upload & Transcribe"
        )}
      </button>
    </div>
  );
}
