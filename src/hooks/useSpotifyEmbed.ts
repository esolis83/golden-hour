import { useRef, useEffect, useCallback, useState } from "react";

// ── Spotify iFrame Embed API types ────────────────────────────────────────────

interface EmbedController {
  loadUri: (uri: string, options?: { autoplay?: boolean }) => void;
  play: () => void;
  pause: () => void;
  seek: (positionSeconds: number) => void;
  destroy: () => void;
  addListener: (event: string, cb: (...args: unknown[]) => void) => void;
}

interface IFrameAPI {
  createController: (
    element: HTMLElement,
    options: Record<string, unknown>,
    callback: (controller: EmbedController) => void
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
  }
}

const PREVIEW_MS = 25_000;
const LEAVE_MS   = 3_000;
const BUFFER_MS  = 1_500; // how long to wait for a track to buffer before forcing play

export function useSpotifyEmbed() {
  const controllerRef  = useRef<EmbedController | null>(null);
  const containerRef   = useRef<HTMLDivElement | null>(null);
  const lastIdRef      = useRef<string | null>(null);
  const timerRef       = useRef<number | null>(null);
  const bufferTimerRef = useRef<number | null>(null); // fallback play after buffering
  const hasPlayedRef   = useRef(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (!document.getElementById("spotify-iframe-api")) {
      const s   = document.createElement("script");
      s.id      = "spotify-iframe-api";
      s.src     = "https://open.spotify.com/embed-podcast/iframe-api/v1";
      s.async   = true;
      document.body.appendChild(s);
    }

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      if (!containerRef.current) return;
      IFrameAPI.createController(
        containerRef.current,
        { width: "100%", height: 80 },
        (ctrl) => {
          controllerRef.current = ctrl;
          ctrl.addListener("playback_update", (...args) => {
            const e = args[0] as { data?: { isPaused?: boolean } };
            if (e?.data?.isPaused === false) hasPlayedRef.current = true;
          });
        }
      );
    };

    return () => {
      if (timerRef.current)       clearTimeout(timerRef.current);
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const clearBufferTimer = useCallback(() => {
    if (bufferTimerRef.current) { clearTimeout(bufferTimerRef.current); bufferTimerRef.current = null; }
  }, []);

  const safePause = useCallback(() => {
    if (hasPlayedRef.current) controllerRef.current?.pause();
  }, []);

  // ── unlock ────────────────────────────────────────────────────────────────
  // Called from a click — transfers Chrome's user activation to the iframe.
  // After this ONE click, all hover-triggered play() calls work without clicking.

  const unlock = useCallback(() => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    ctrl.play();           // click-triggered: unlocks the iframe audio context
    setIsUnlocked(true);
    // Fallback: if a track was already loading, play it once it finishes buffering
    setTimeout(() => {
      if (!hasPlayedRef.current && lastIdRef.current) ctrl.play();
    }, BUFFER_MS);
  }, []);

  // ── stop ──────────────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    clearBufferTimer(); // cancel any pending buffer-play so it doesn't fire after leave
    if (!hasPlayedRef.current) return; // still buffering — don't interrupt
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      safePause();
      timerRef.current = null;
    }, LEAVE_MS);
  }, [clearTimer, clearBufferTimer, safePause]);

  // ── play ──────────────────────────────────────────────────────────────────

  const play = useCallback((trackId: string) => {
    clearTimer();
    clearBufferTimer();
    const ctrl = controllerRef.current;
    if (!ctrl) return;

    if (lastIdRef.current !== trackId) {
      lastIdRef.current    = trackId;
      hasPlayedRef.current = false;
      ctrl.loadUri(`spotify:track:${trackId}`, { autoplay: true });

      // Fallback: after BUFFER_MS, explicitly call play().
      // autoplay:true alone doesn't always trigger after mouseenter.
      // Once the audio context is unlocked (from a prior click), a setTimeout
      // play() works without needing a fresh user gesture.
      bufferTimerRef.current = window.setTimeout(() => {
        if (lastIdRef.current === trackId && !hasPlayedRef.current) {
          ctrl.play();
        }
        bufferTimerRef.current = null;
      }, BUFFER_MS);
    } else {
      // Same card again — cached, play from the start immediately
      ctrl.seek(0);
      ctrl.play();
    }

    timerRef.current = window.setTimeout(() => {
      safePause();
      timerRef.current = null;
    }, PREVIEW_MS);
  }, [clearTimer, clearBufferTimer, safePause]);

  return { play, stop, unlock, isUnlocked, containerRef };
}
