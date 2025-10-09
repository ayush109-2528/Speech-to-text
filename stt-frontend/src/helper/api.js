const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append("audio", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }
  return await response.json();
}

export async function fetchTranscriptions() {
  const response = await fetch(`${API_BASE_URL}/transcriptions`);
  if (!response.ok) {
    throw new Error("Failed to retrieve transcriptions");
  }
  return await response.json();
}
