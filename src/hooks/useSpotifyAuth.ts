import { useState, useEffect, useCallback } from "react";
import type { SpotifyToken } from "../types";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
// Must match exactly what you registered in the Spotify Dashboard.
// Spotify no longer allows "localhost" — use the explicit IP in dev.
// Set VITE_REDIRECT_URI in .env.local for dev, and in your host's env vars for prod.
const REDIRECT_URI =
  (import.meta.env.VITE_REDIRECT_URI as string | undefined) ??
  `${window.location.origin}/`;

// Scopes needed for search + preview playback (no Premium required)
const SCOPES = [
  "user-read-email",    // required to get a valid token
  "user-read-private",  // required by Spotify for PKCE apps
].join(" ");

const TOKEN_KEY = "gh_spotify_token";
const VERIFIER_KEY = "gh_code_verifier";

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function generateVerifier(length = 64): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

async function generateChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function loadToken(): SpotifyToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as SpotifyToken;
    if (Date.now() > t.expires_at) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return t;
  } catch {
    return null;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSpotifyAuth() {
  const [token, setToken] = useState<SpotifyToken | null>(loadToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle OAuth callback — fires once on mount if ?code= is in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    if (!code || !verifier) return;

    // Clean the URL immediately so a refresh doesn't re-submit the code
    window.history.replaceState({}, "", window.location.pathname);
    sessionStorage.removeItem(VERIFIER_KEY);

    setLoading(true);
    setError(null);

    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: verifier,
      }),
    })
      .then((r) => r.json())
      .then(
        (data: Omit<SpotifyToken, "expires_at"> & { error?: string }) => {
          if (data.error) throw new Error(data.error);
          const t: SpotifyToken = {
            ...data,
            expires_at: Date.now() + data.expires_in * 1000,
          };
          localStorage.setItem(TOKEN_KEY, JSON.stringify(t));
          setToken(t);
        }
      )
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async () => {
    if (!CLIENT_ID) {
      setError("Missing VITE_SPOTIFY_CLIENT_ID — copy .env.example → .env");
      return;
    }
    const verifier = generateVerifier();
    const challenge = await generateChallenge(verifier);
    sessionStorage.setItem(VERIFIER_KEY, verifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: SCOPES,
      redirect_uri: REDIRECT_URI,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setError(null);
  }, []);

  return { token, login, logout, loading, error };
}
