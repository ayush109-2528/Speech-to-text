const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Upload audio file and get transcription result
export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append("audio", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Upload failed");
  }

  return response.json();
}

// Fetch transcription history list
export async function fetchTranscriptions() {
  const response = await fetch(`${API_BASE_URL}/transcriptions`);

  if (!response.ok) {
    throw new Error("Failed to fetch transcription history");
  }

  return response.json();
}
