import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import SignInPage from "./Components/Superbase Auth/SignIn";
import SpeechToTextApp from "./Components/speech to text/SpeechToTextApp";
import LandingPage from "./Components/Home/LandingPage";
import SignUpPage from "./Components/Superbase Auth/Signup";  // check if this is right, SignOut as SignUp?
import ResetPassword from "./Components/Superbase Auth/ResetPassword";
import ForgotPasswordPage from "./Components/Superbase Auth/ForgotPassword";

import supabase from "./Components/Superbase Auth/SupabaseClient";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

 const routes = [
    { path: "/", element: <LandingPage /> },
    { path: "/signin", element: <SignInPage /> },
    { path: "/signup", element: <SignUpPage /> },
    { path: "/forgot", element: <ForgotPasswordPage /> },
    { path: "/reset", element: <ResetPassword /> },
    {
      path: "/dashboard",
      element: user ? <SpeechToTextApp user={user} setUser={setUser} /> : <Navigate to="/signin" />,
    },
    { path: "*", element: <LandingPage /> }
  ];

  const router = createBrowserRouter(routes, {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  });


  return <RouterProvider  future={{ v7_startTransition: true }} router={router} />;
}
