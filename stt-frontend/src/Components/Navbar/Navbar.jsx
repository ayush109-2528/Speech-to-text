import React from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../Superbase Auth/SupabaseClient";

export default function NavBar({ user, onSignOut }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (onSignOut) onSignOut();
    // Optionally redirect to landing:
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-transparent z-50">
      <span
        className="text-white text-xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        Speech to Text
      </span>
      {!user ? (
        <button
          onClick={() => navigate("/signin")}
          className="px-4 py-2 bg-white text-indigo-700 font-semibold rounded shadow hover:bg-indigo-100 transition"
        >
          Sign In
        </button>
      ) : (
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-white text-indigo-700 font-bold rounded shadow hover:bg-indigo-100 transition"
        >
          Sign Out
        </button>
      )}
    </nav>
  );
}
