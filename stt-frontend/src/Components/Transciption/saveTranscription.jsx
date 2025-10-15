async function saveTranscription(userId, transcriptionText, audioUrl = null) {
  const res = await fetch(`${API_URL}/transcriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId || "",
    },
    body: JSON.stringify({ transcription: transcriptionText, audio_url: audioUrl }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to save transcription");
  }

  return await res.json();
}
