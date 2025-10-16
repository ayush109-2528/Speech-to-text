🎤 Speech-to-Text Frontend (React)

This React frontend provides a modern UI for recording, uploading, and viewing speech transcriptions powered by a Node.js backend with Deepgram and Supabase.
🚀 Features

    🎙 Live audio recording with waveform visualization

    ⬆️ Upload MP3/MP4 audio files for transcription

    🧠 Real-time transcription display

    📜 Transcription history with play & delete capabilities

    🔒 Simple authentication integration via Supabase

    🎨 Responsive, clean UI with Tailwind CSS

🛠️ Tech Stack
Technology	Purpose
React	UI & State Management
Supabase	Auth & Database Client
Fetch API	API communication
Tailwind CSS	Styling & Layout
⚙ Setup & Running Locally
1. Clone repository:

bash
git clone https://github.com/your-username/speech-to-text-frontend.git
cd speech-to-text-frontend

2. Install dependencies:

bash
npm install

3. Setup environment variables:

Create a .env file in the project root:

text
VITE_API_URL=http://localhost:5000

Adjust API URL for your deployed backend.
4. Run development server:

bash
npm run dev

5. Open your browser and go to:

text
http://localhost:5173

🔗 Backend Integration

    All API calls send authenticated user ID in "x-user-id" header.

    Audio is streamed or uploaded to backend endpoints /upload, /upload-chunk, /stop-recording.

    Transcriptions fetched from /transcriptions endpoint and displayed.

🎨 UI Components

    NavBar: Sign-in/out management

    FileUploader: Upload audio files

    RecordingControls: Record and control live audio

    WaveformCanvas: Visualize audio recording waveform

    StatusMessage: Show status/errors

    Mp3Player: Playback recorded audio

    TranscriptionResult: Display current transcription

    TranscriptionHistory: List and manage past transcriptions

🧪 Testing & Debugging

    The frontend uses console logs and status messages for feedback.

    Ensure backend is running with correct env vars.

    Watch network requests for API error details.

🚀 Deployment Notes

    Use environment variable VITE_API_URL to point to production backend.

    Build optimized production bundle with npm run build.

    Deploy on any static host like Netlify, Vercel, GitHub Pages.

📜 License

MIT License.
