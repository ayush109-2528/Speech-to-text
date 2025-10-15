import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from "./SupabaseClient";

// const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleReset(e) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      alert("Password updated, please sign in.");
      navigate('/signin');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <form onSubmit={handleReset} className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">Reset Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4 px-4 py-2 w-full border rounded text-gray-700"
        />
        {error && <div className="text-red-500 mb-3">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}
