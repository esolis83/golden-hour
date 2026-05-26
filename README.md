# Golden Hour

A personal sunset photography gallery with ambient Spotify audio.
Hover any photo to read the moment — and hear the song that lived there.

**Live:** [golden-hour.enriquesolis.me](https://golden-hour.enriquesolis.me)

---

## Overview

Golden Hour is a curated collection of sunset photographs presented as an interactive mosaic gallery. Each card reveals a handwritten quote and plays a paired song on hover — no user login required. The Spotify integration connects silently on page load using a server-side Client Credentials flow, keeping credentials secure and the experience frictionless.

---

## Features

- **Masonry gallery** — 4-column grid (≥ 1400 px) → 3 columns → 2 columns on mobile, built with CSS columns
- **Hover interactions** — quote drifts up word-by-word with blur reveal (Framer Motion), sun-orange overlay floods the photo, animated EQ bars appear
- **Ambient audio** — each card pairs with a Spotify track that plays automatically on hover and fades out on leave; auto-stops at 25 seconds
- **Spotify Connected badge** — lights up green on page load via silent server-side auth; no user login prompt
- **Warm design system** — Cormorant Garamond italic + Syne + Dancing Script; amber/coral/silhouette-black palette sampled from the hero photo

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 18 + TypeScript (strict mode) |
| **Build** | Vite 5 |
| **Animations** | Framer Motion 11 |
| **Styling** | CSS Modules |
| **Audio** | Spotify iFrame Embed API |
| **Auth** | Spotify Client Credentials (PHP proxy) + PKCE OAuth (reference) |
| **Hosting** | Hostinger Business Shared Hosting |

---

## Spotify Integration

Two OAuth flows are implemented and documented in the codebase:

**Client Credentials (production)** — A PHP proxy on the server exchanges the app's Client ID + Secret for an access token. The secret never touches the browser. The React app fetches the token silently on load and the badge connects automatically.

**PKCE Authorization Code (reference / local dev)** — Full user-level OAuth 2.0 with PKCE verifier/challenge generation, token exchange, and localStorage persistence. Preserved in `src/hooks/useSpotifyAuth.ts` as a portfolio reference demonstrating knowledge of the complete user auth flow.

```
Browser                  Hostinger Server         Spotify API
  │                            │                       │
  │── GET /api/spotify-token.php ──▶│                  │
  │                            │── POST /api/token ──▶ │
  │                            │◀─ { access_token } ── │
  │◀── { access_token } ───────│                       │
  │                            │                       │
  │── Embed: loadUri(trackId) + play() ──────────────▶ │
  │◀── Audio stream ──────────────────────────────────  │
```

---

## Project Structure

```
src/
├── components/
│   ├── Hero.tsx          # Title, Spotify badge, hero image
│   ├── Gallery.tsx       # CSS-columns masonry wrapper
│   └── SunsetCard.tsx    # Card — hover animations + audio trigger
├── hooks/
│   ├── useSpotifyToken.ts   # Client Credentials — silent auto-connect
│   ├── useSpotifyAuth.ts    # PKCE OAuth — reference / local dev
│   ├── useSpotifyTracks.ts  # Track ID resolution (hardcoded + search fallback)
│   ├── useSpotifyEmbed.ts   # iFrame Embed API controller
│   ├── useSpotifyPlayer.ts  # Web Playback SDK (reference)
│   └── useAudioPlayer.ts    # HTML5 Audio fallback (reference)
├── data/
│   └── sunsets.ts        # Photo metadata, quotes, song pairings
└── types/
    └── index.ts          # Shared TypeScript interfaces
public/
└── api/
    └── spotify-token.php # Server-side token proxy
```

---

## Local Development

```bash
# 1. Clone and install
npm install

# 2. Copy env template
cp .env.example .env.local
# Add your Spotify Client ID to .env.local

# 3. Start dev server
# Use 127.0.0.1 — Spotify no longer accepts localhost as a redirect URI
npm run dev -- --host 127.0.0.1

# Open http://127.0.0.1:5173
```

---

## Adding Photos

1. Export as `.webp`, drop in `public/images/` as `sunset-N.webp`
2. Add an entry to `src/data/sunsets.ts`:

```ts
{
  id: N,
  image: "/images/sunset-N.webp",
  location: "Location, Country",
  date: "Mon YYYY",
  quote: "Your quote.",
  songTitle: "Song Name",
  artist: "Artist",
  accent: "#E8621A",      // warm hex colour from the photo
  tall: true,             // portrait (2:3) or landscape (3:2)
  spotifyTrackId: "ABC",  // from open.spotify.com/track/ABC
}
```

---

## Skills Reference

| Skill | File |
|---|---|
| React 18 hooks + TypeScript strict | `src/hooks/` |
| Framer Motion — stagger, blur, layout animations | `SunsetCard.tsx` |
| CSS Modules + responsive masonry | `Gallery.module.css` |
| Spotify OAuth 2.0 PKCE | `useSpotifyAuth.ts` |
| Spotify Client Credentials + PHP proxy | `useSpotifyToken.ts`, `spotify-token.php` |
| Spotify iFrame Embed API | `useSpotifyEmbed.ts` |
| Spotify Web Playback SDK | `useSpotifyPlayer.ts` |
| Environment variable security | `.env.example`, PHP constants |
| Vite static build + Hostinger deploy | `vite.config.ts`, `dist/` |

---

## License

Personal portfolio project — photos and content © Enrique Solis.
