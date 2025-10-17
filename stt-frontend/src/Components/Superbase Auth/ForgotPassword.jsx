import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from "./SupabaseClient";


export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleForgot(e) {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset" });
    if (error) {
      setError(error.message);
      setSuccess('');
    } else {
      setSuccess("Reset link sent! Check your email.");
      setError('');
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
      <form onSubmit={handleForgot} className="bg-white bg-opacity-90 backdrop-blur-lg max-w-md w-full p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-indigo-800">Forgot Password</h2>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 px-4 py-2 w-full border rounded text-gray-700"
        />
        {error && <div className="text-red-500 mb-3">{error}</div>}
        {success && <div className="text-green-500 mb-3">{success}</div>}
        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition"
        >
          Send Reset Link
        </button>
        <div className="flex justify-end mt-4">
          <button type="button" onClick={() => navigate('/signin')} className="text-indigo-700">Back to Sign In</button>
        </div>
      </form>
    </div>
  );
}
