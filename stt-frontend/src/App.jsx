import React, { useEffect, useState } from "react";
import { supabase } from "./Components/Superbase Auth/SupabaseClient";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SupabaseAuth from "./Components/Superbase Auth/SupabaseAuth";
import SpeechToTextApp from "./Components/speech to text/SpeechToTextApp";
import SignOutButton from "./Components/Superbase Auth/SignOutButton";

function PrivateRoute({ session, children }) {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function PublicRoute({ session, children }) {
  if (session) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicRoute session={session}>
              <SupabaseAuth />
            </PublicRoute>
          }
        />
        <Route
          path="/*"
          element={
            <PrivateRoute session={session}>
              <header className="p-4 flex justify-end bg-white shadow">
                <SignOutButton />
              </header>
              <SpeechToTextApp session={session} />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
