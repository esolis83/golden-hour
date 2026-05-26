import { useState, useEffect } from "react";
import type { SunsetData } from "../types";

/**
 * Builds a Map<sunsetId, spotifyTrackId> for the embed player.
 *
 * Priority:
 *  1. If a sunset has `spotifyTrackId` set → used instantly, no API call.
 *  2. Any sunset without one → searched via the Spotify API (requires token).
 *
 * spotifyTrackId accepts any of these formats:
 *   "2kcFvqzhHgbMqMwGF3zCqS"                                  ← bare ID
 *   "https://open.spotify.com/track/2kcFvqzhHgbMqMwGF3zCqS"  ← full URL
 *   "spotify:track:2kcFvqzhHgbMqMwGF3zCqS"                   ← URI
 */

/** Extract just the track ID from any Spotify URL / URI / bare ID */
function parseTrackId(value: string): string {
  const urlMatch = value.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  const uriMatch = value.match(/spotify:track:([A-Za-z0-9]+)/);
  if (uriMatch) return uriMatch[1];
  return value.split("?")[0].trim();
}

export function useSpotifyTracks(
  accessToken: string | null,   // plain token string from useSpotifyToken
  sunsets: SunsetData[]
) {
  // Pre-populate synchronously from hardcoded IDs — instant, no network call
  const [trackIds, setTrackIds] = useState<Map<number, string>>(() => {
    const map = new Map<number, string>();
    for (const s of sunsets) {
      if (s.spotifyTrackId) map.set(s.id, parseTrackId(s.spotifyTrackId));
    }
    return map;
  });

  useEffect(() => {
    // Only search for sunsets that don't have a hardcoded ID
    const needsSearch = sunsets.filter((s) => !s.spotifyTrackId);
    if (needsSearch.length === 0 || !accessToken) return;

    const controller = new AbortController();

    Promise.all(
      needsSearch.map(async (s) => {
        const q = encodeURIComponent(
          `track:"${s.songTitle}" artist:"${s.artist}"`
        );
        const res = await fetch(
          `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          }
        );
        const data = (await res.json()) as {
          tracks?: { items?: Array<{ id: string }> };
        };
        const trackId = data.tracks?.items?.[0]?.id ?? null;
        return [s.id, trackId] as [number, string | null];
      })
    )
      .then((results) => {
        setTrackIds((prev) => {
          const map = new Map(prev);
          for (const [sunsetId, id] of results) {
            if (id) map.set(sunsetId, id);
          }
          return map;
        });
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          console.error("[Spotify] Track search failed:", err.message);
        }
      });

    return () => controller.abort();
  }, [accessToken, sunsets]);

  return { trackIds };
}
