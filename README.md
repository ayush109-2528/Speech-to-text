Speech-to-Text React App with Supabase & Datagram

A modern web application for converting speech (MP4 audio/video) to text with user authentication using Supabase Auth and transcription via OpenAI Whisper API.
Features

    User authentication with email/social login using Supabase

    Google OAuth support

    Upload or record MP4 audio/video files

    Transcription with OpenAI Whisper API

    Manage user sessions with auto-login and sign-out

    Responsive UI built with React and Tailwind CSS

Demo

Add a URL here if deployed
Getting Started
Prerequisites

    Node.js (v16+ recommended)

    npm or yarn

    Supabase account & project

    OpenAI API key

Environment Variables

Create a .env file in the project root with the following keys:

text
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_Datagram_API_KEY=your-openai-api-key

Installation

# Install dependencies
npm install

# Run the development server
npm run dev

Supabase Setup

    Create a Supabase project at supabase.com.

    Enable Authentication providers (email, google, github).

    Create a table called transcriptions with:

        id (UUID, primary key)

        user_id (UUID)

        audio_url (text)

        transcription (text)

        created_at (timestamp, default now())

    Create a Storage bucket named audiofiles, optionally public.

Usage

    Visit the app at http://localhost:5173.

    Create an account or login with Google.

    Upload or record your MP4 audio/video.

    Wait for transcription and see results.

    Use the sign-out button to log out.

Folder Structure

text
src/
  Components/
    SupabaseAuth.jsx
    SignOutButton.jsx
    SpeechToTextApp.jsx
  supabaseClient.js
  App.jsx
  main.jsx
.env
package.json

Technologies Used

    React 18

    React Router v6

    Tailwind CSS

    Supabase Auth & Storage

    OpenAI Whisper API

    Vite development server

🎙️ Speech-To-Text React App with Supabase & Datagram Whisper

![App Screenshot](./screenshots/app-home.png, modern web app to transcribe your speech from MP4 audio/video files, powered by React, Supabase authentication, and OpenAI Whisper.*
🚀 Features

    🔐 Secure user authentication with Supabase (email and social login)

    🟢 Google OAuth support for easy login

    📁 Upload or 🎤 record MP4 audio/video files seamlessly

    📝 Instant speech transcription powered by Datgarm Whisper API

    🔄 Persistent user sessions with auto-login and sign-out

    📱 Responsive and accessible UI built with React & Tailwind CSS

🎬 Demo

not yet

🔧 Getting Started
Prerequisites

    Node.js (v16+ recommended)

    npm or yarn

    Supabase account & project

    Datagram API key

🛠️ Environment Variables

Create a .env file at the root of your project and add:

text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_OPENAI_API_KEY=your-openai-secret-key

    ⚠️ Keep your API keys secure! Never commit .env files to public repos.

⏳ Installation

bash
# Clone the repository
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name

# Install dependencies
npm install

# Start development server
npm run dev

🗂️ Supabase Setup

    Create a new project at supabase.com.

    Enable Authentication providers (email, Google, GitHub) in your dashboard.

    Create a table named transcriptions with these columns:

Column	Type	Notes
id	uuid	Primary key, default generated
user_id	uuid	Foreign key for user
audio_url	text	Link to uploaded audio file
transcription	text	Transcribed text
created_at	timestamp	Defaults to current timestamp

    Create a Storage bucket named audiofiles, enable public access if you want.

📱 Usage

    Access the app locally on http://localhost:5173

    Register or sign in using Google or email

    Upload an MP4 audio/video file or record live voice

    Watch real-time transcription results

    Use the Sign Out button in the header to log out

🖼 Screenshots
Home Page (Authenticated)

![Home Page](
Login / Authentication Page

![Login Page](
Upload & Transcription in Progress

![Uploading](./screenshots/uploading.png Structure

text
src/
  Components/
    SupabaseAuth.jsx        # Authentication UI
    SignOutButton.jsx       # Sign out button component
    SpeechToTextApp.jsx     # Main app with speech-to-text logic
  supabaseClient.js         # Supabase initialization
  App.jsx                   # Routing and session management
  main.jsx                  # Entry point
.screenshots/               # Folder containing screenshots
.env                       # Environment config (not committed)
package.json

💻 Tech Stack

    React 18, React Router v6

    Tailwind CSS for UI

    Supabase Auth & Storage backend

    Datagram Whisper speech-to-text API

    Vite development server

🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for improvements or bug fixes.
📜 License

© 2025 Ayush
