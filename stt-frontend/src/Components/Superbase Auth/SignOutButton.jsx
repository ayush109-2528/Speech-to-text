import React from 'react';
import { supabase } from './SupabaseClient';

export default function SignOutButton() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
    >
      Sign Out
    </button>
  );
}
