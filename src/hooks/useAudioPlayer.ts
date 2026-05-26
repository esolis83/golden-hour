import { useRef, useCallback } from "react";

const FADE_STEPS = 20;
const FADE_IN_MS  = 1200;
const FADE_OUT_MS = 700;
const TARGET_VOL  = 0.65;
// Auto-stop 2 s before the 30 s preview ends so it doesn't cut abruptly
const AUTO_STOP_MS = 28_000;

/**
 * Lightweight HTML5 Audio player with fade in / fade out.
 * Works with Spotify's public 30-second preview URLs — no Premium required.
 */
export function useAudioPlayer() {
  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const fadeRef      = useRef<number | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (fadeRef.current      !== null) { clearInterval(fadeRef.current);   fadeRef.current      = null; }
    if (stopTimerRef.current !== null) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
  }, []);

  // ── stop ──────────────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    clearTimers();
    const audio = audioRef.current;
    if (!audio) return;

    let vol  = audio.volume;
    const step     = vol / FADE_STEPS;
    const interval = FADE_OUT_MS / FADE_STEPS;

    fadeRef.current = window.setInterval(() => {
      vol = Math.max(vol - step, 0);
      if (audioRef.current) audioRef.current.volume = vol;
      if (vol <= 0.001) {
        clearInterval(fadeRef.current!);
        fadeRef.current = null;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
          audioRef.current = null;
        }
      }
    }, interval);
  }, [clearTimers]);

  // ── play ──────────────────────────────────────────────────────────────────

  const play = useCallback(
    (previewUrl: string) => {
      clearTimers();

      // Tear down any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      const audio = new Audio(previewUrl);
      audio.volume = 0;
      audioRef.current = audio;

      audio.play().catch(() => {});

      // Fade in to TARGET_VOL over FADE_IN_MS
      let vol  = 0;
      const step     = TARGET_VOL / FADE_STEPS;
      const interval = FADE_IN_MS / FADE_STEPS;

      fadeRef.current = window.setInterval(() => {
        vol = Math.min(vol + step, TARGET_VOL);
        if (audioRef.current) audioRef.current.volume = vol;
        if (vol >= TARGET_VOL - 0.001) {
          clearInterval(fadeRef.current!);
          fadeRef.current = null;
        }
      }, interval);

      // Auto-stop before the preview clip ends
      stopTimerRef.current = window.setTimeout(stop, AUTO_STOP_MS);
    },
    [clearTimers, stop]
  );

  return { play, stop };
}
