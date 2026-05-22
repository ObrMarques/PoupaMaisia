import { createRoot } from "react-dom/client";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";
import App from "./App";
import "./index.css";

// Keep a cached reference updated by the Supabase listener.
// This avoids calling getSession() (a network/storage round-trip) on
// every single API request, which can return stale/expired tokens.
let cachedSession: Session | null = null;

supabase.auth.getSession().then(({ data: { session } }) => {
  cachedSession = session;
});

supabase.auth.onAuthStateChange((_event, session) => {
  cachedSession = session;
});

setAuthTokenGetter(() => {
  return Promise.resolve(cachedSession?.access_token ?? null);
});

createRoot(document.getElementById("root")!).render(<App />);
