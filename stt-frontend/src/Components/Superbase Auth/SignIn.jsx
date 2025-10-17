import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from "./SupabaseClient";

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSignIn(e) {
    e.preventDefault();
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background:
          "url('/background.png') center center / cover no-repeat, linear-gradient(to bottom right,#000A2E 80%, #170024 100%)",
      }}
    >
      <form onSubmit={handleSignIn} className="bg-white bg-opacity-90 backdrop-blur-lg max-w-md w-full p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-indigo-800">Sign In</h2>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 px-4 py-2 w-full border rounded text-gray-700"
        />
        <input
          type="password"
          placeholder="Password"
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
          Sign In
        </button>
        <div className="flex justify-between mt-4">
          <button type="button" onClick={() => navigate('/signup')} className="text-indigo-700">Sign Up</button>
          <button type="button" onClick={() => navigate('/forgot')} className="text-indigo-700">Forgot Password?</button>
        </div>
      </form>
    </div>
  );
}
