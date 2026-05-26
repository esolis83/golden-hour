import { useState, useRef, useCallback } from "react";
import Hero from "./components/Hero";
import Gallery from "./components/Gallery";
import MiniPlayer from "./components/MiniPlayer";
import { SUNSETS } from "./data/sunsets";
import { useSpotifyToken } from "./hooks/useSpotifyToken";
import { useSpotifyTracks } from "./hooks/useSpotifyTracks";
import { useSpotifyEmbed } from "./hooks/useSpotifyEmbed";
import type { SunsetData } from "./types";

const LEAVE_MS = 3_000; // mirror of the value in useSpotifyEmbed

export default function App() {
  const { accessToken }                  = useSpotifyToken();
  const { trackIds }                     = useSpotifyTracks(accessToken, SUNSETS);
  const { play: embedPlay, stop: embedStop, unlock, isUnlocked, containerRef } = useSpotifyEmbed();

  // Which sunset is currently active — drives the MiniPlayer display
  const [activeSunset, setActiveSunset] = useState<SunsetData | null>(null);
  const leaveTimerRef = useRef<number | null>(null);

  const play = useCallback((trackId: string, sunset: SunsetData) => {
    // Cancel any pending leave-timer so a quick card switch keeps music going
    if (leaveTimerRef.current) { clearTimeout(leaveTimerRef.current); leaveTimerRef.current = null; }
    embedPlay(trackId);
    setActiveSunset(sunset);
  }, [embedPlay]);

  const stop = useCallback(() => {
    embedStop();
    // Mirror the same grace period so the bar stays visible while music fades
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = window.setTimeout(() => {
      setActiveSunset(null);
      leaveTimerRef.current = null;
    }, LEAVE_MS);
  }, [embedStop]);

  return (
    <>
      <Hero />

      <Gallery
        sunsets={SUNSETS}
        trackIds={trackIds}
        onPlay={play}
        onStop={stop}
      />

      {/*
        MiniPlayer slides up from the bottom when a card is hovered.
        The Spotify SDK iframe lives inside it — always visible so Chrome
        never suppresses the audio context.
      */}
      <MiniPlayer
        containerRef={containerRef}
        activeSunset={activeSunset}
        isUnlocked={isUnlocked}
        onUnlock={unlock}
      />
    </>
  );
}
