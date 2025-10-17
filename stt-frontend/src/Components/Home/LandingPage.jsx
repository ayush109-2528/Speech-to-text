import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Navbar/Navbar";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-start items-start"
      style={{
        background:
          "url('/background.png') center center / cover no-repeat, linear-gradient(to bottom right,#000A2E 80%, #170024 100%)",
      }}
    >
      <NavBar />
      <div className="z-10 mt-28 ml-10 md:mt-40 md:ml-24 text-left w-full max-w-2xl">
        <h1 className="text-5xl font-extrabold text-white mb-8 leading-tight">
          Capture Every Word with<br />Seamless Transcription Technology.
        </h1>
        <p className="text-lg text-white/90 mb-10 max-w-xl">
          Fast, accurate speech-to-text transcription with easy upload and recording.
          <br />
          real-time recording, history tracking, secure user accounts,{" "}
          <br />
          and seamless API integration.
        </p>
        <button
          onClick={() => navigate("/signin")}
          className="inline-block px-8 py-3 bg-red-500 text-white text-lg font-bold rounded-md shadow hover:bg-red-600 transition"
        >
          Get Started
        </button>
      </div>
      <div className="absolute bottom-0 w-full h-[60px] bg-gradient-to-t from-black/60 to-transparent"></div>
    </div>
  );
}
