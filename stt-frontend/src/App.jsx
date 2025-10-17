import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// Page Components
import SignInPage from "./Components/Superbase Auth/SignIn";
import SignUpPage from "./Components/Superbase Auth/Signup";
import ForgotPasswordPage from "./Components/Superbase Auth/ForgotPassword";
import ResetPassword from "./Components/Superbase Auth/ResetPassword";
import LandingPage from "./Components/Home/LandingPage";
import SpeechToTextApp from "./Components/speech to text/SpeechToTextApp";

// Supabase Client
import supabase from "./Components/Superbase Auth/SupabaseClient";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for any auth state changes (sign in / sign out / refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  // Nice UI loading screen while checking session
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-800">
        <div className="flex flex-col items-center space-y-4 text-white animate-pulse">
          <div className="h-16 w-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          <p className="text-xl font-semibold tracking-wide">
            Restoring your session...
          </p>
          <p className="text-sm text-indigo-200">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Routing setup with protected dashboard
  const routes = [
    { path: "/", element: <LandingPage /> },
    { path: "/signin", element: <SignInPage setUser={setUser} /> },
    { path: "/signup", element: <SignUpPage /> },
    { path: "/forgot", element: <ForgotPasswordPage /> },
    { path: "/reset", element: <ResetPassword /> },
    {
      path: "/dashboard",
      element: user ? (
        <SpeechToTextApp user={user} setUser={setUser} />
      ) : (
        <Navigate to="/signin" />
      ),
    },
    { path: "*", element: <Navigate to="/" /> },
  ];

  const router = createBrowserRouter(routes, {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  });

  return <RouterProvider future={{ v7_startTransition: true }} router={router} />;
}
