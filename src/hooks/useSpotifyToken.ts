import { useState, useEffect } from "react";

// Set in .env.local for dev, Hostinger env/file for production.
// Points to public/api/spotify-token.php (same origin — no CORS issues in prod).
const TOKEN_URL = import.meta.env.VITE_SPOTIFY_TOKEN_URL as string | undefined;

/**
 * Fetches a Spotify Client Credentials access token from the PHP proxy on load.
 * No user login required — the secret lives on the server, never in the browser.
 *
 * Falls back gracefully if the endpoint is unavailable (e.g. local dev without PHP).
 */
export function useSpotifyToken() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading]         = useState(!!TOKEN_URL);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (!TOKEN_URL) {
      setLoading(false);
      return;
    }

    fetch(TOKEN_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ access_token?: string; error?: string }>;
      })
      .then((data) => {
        if (!data.access_token) throw new Error(data.error ?? "No token");
        setAccessToken(data.access_token);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { accessToken, loading, error };
}
