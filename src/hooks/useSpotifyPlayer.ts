import { useState, useEffect, useRef, useCallback } from "react";
import type { SpotifyToken, SpotifyPlayerInstance } from "../types";

const FADE_STEPS = 20;

export function useSpotifyPlayer(token: SpotifyToken | null) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const playerRef = useRef<SpotifyPlayerInstance | null>(null);
  const tokenRef = useRef(token);
  const fadeRef = useRef<number | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  // Keep tokenRef in sync so getOAuthToken always has the latest token
  tokenRef.current = token;

  // ── Init SDK ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;

    const initPlayer = () => {
      const player = new window.Spotify.Player({
        name: "Golden Hour Gallery",
        getOAuthToken: (cb) => cb(tokenRef.current?.access_token ?? ""),
        volume: 0,
      });

      player.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        setReady(true);
      });

      player.addListener("not_ready", ({ device_id: _id }) => {
        setDeviceId(null);
        setReady(false);
      });

      player.addListener("initialization_error", ({ message }) =>
        console.error("[Spotify] Init error:", message)
      );
      player.addListener("authentication_error", ({ message }) =>
        console.error("[Spotify] Auth error:", message)
      );
      player.addListener("account_error", ({ message }) =>
        console.error("[Spotify] Account error:", message)
      );

      player.connect();
      playerRef.current = player;
    };

    // If SDK already loaded (e.g. hot-reload), init immediately
    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
      if (!document.getElementById("spotify-sdk")) {
        const script = document.createElement("script");
        script.id = "spotify-sdk";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        document.body.appendChild(script);
      }
    }

    return () => {
      playerRef.current?.disconnect();
      playerRef.current = null;
      setDeviceId(null);
      setReady(false);
    };
  }, [token]); // re-init if token changes

  // ── Helpers ────────────────────────────────────────────────────────────────

  const clearTimers = useCallback(() => {
    if (fadeRef.current !== null) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
    if (stopTimerRef.current !== null) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  }, []);

  // ── playTrack ──────────────────────────────────────────────────────────────

  const playTrack = useCallback(
    async (trackId: string) => {
      if (!token || !deviceId || !playerRef.current) return;
      clearTimers();

      // Mute before starting — we fade in manually
      await playerRef.current.setVolume(0);

      // Tell Spotify to play this track on our SDK device
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [`spotify:track:${trackId}`],
            position_ms: 0,
          }),
        }
      );

      // Fade in over 1.5 s → 70% volume
      const TARGET = 0.7;
      const INTERVAL = 1500 / FADE_STEPS;
      const STEP = TARGET / FADE_STEPS;
      let vol = 0;

      fadeRef.current = window.setInterval(() => {
        vol = Math.min(vol + STEP, TARGET);
        playerRef.current?.setVolume(vol);
        if (vol >= TARGET - 0.001) {
          clearInterval(fadeRef.current!);
          fadeRef.current = null;
        }
      }, INTERVAL);

      // Auto-stop after 30 s
      stopTimerRef.current = window.setTimeout(() => {
        stopPlayback();
      }, 30_000);
    },
    [token, deviceId, clearTimers] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── stopPlayback ───────────────────────────────────────────────────────────

  const stopPlayback = useCallback(() => {
    if (!playerRef.current) return;
    clearTimers();

    // Fade out over 0.8 s from current vol
    const INTERVAL = 800 / FADE_STEPS;
    let vol = 0.7; // assume we're at target; race condition is inaudible
    const STEP = vol / FADE_STEPS;

    fadeRef.current = window.setInterval(() => {
      vol = Math.max(vol - STEP, 0);
      playerRef.current?.setVolume(vol);
      if (vol <= 0.001) {
        clearInterval(fadeRef.current!);
        fadeRef.current = null;
        playerRef.current?.pause();
      }
    }, INTERVAL);
  }, [clearTimers]);

  return { ready, deviceId, playTrack, stopPlayback };
}
