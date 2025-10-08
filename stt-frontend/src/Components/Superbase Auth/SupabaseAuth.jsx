import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "./SupabaseClient";

export default function SupabaseAuth() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["google"]}
        redirectTo={window.location.origin + "/"}
      />
    </div>
  );
}
