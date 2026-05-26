// ── Data ─────────────────────────────────────────────────────────────────────

export interface SunsetData {
  id: number;
  image: string;
  heroImage?: string;
  location: string;
  date: string;
  quote: string;
  songTitle: string;
  artist: string;
  accent: string;
  tall: boolean;           // true → portrait 2:3 | false → landscape 4:3
  spotifyTrackId?: string; // optional — skips search and uses this ID directly
}

export interface EnrichedSunset extends SunsetData {
  trackId?: string; // resolved after Spotify search
}

// ── Spotify auth ──────────────────────────────────────────────────────────────

export interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  expires_at: number; // Date.now() + expires_in * 1000
}

// ── Spotify Web Playback SDK (ambient types) ──────────────────────────────────

export interface SpotifyPlayerConfig {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume: number;
}

export interface SpotifyPlayerInstance {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener(
    event: "ready" | "not_ready",
    cb: (state: { device_id: string }) => void
  ): void;
  addListener(
    event: "initialization_error" | "authentication_error" | "account_error",
    cb: (state: { message: string }) => void
  ): void;
  addListener(event: "player_state_changed", cb: (state: unknown) => void): void;
  removeListener: (event: string) => void;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  getVolume: () => Promise<number>;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (config: SpotifyPlayerConfig) => SpotifyPlayerInstance;
    };
  }
}
