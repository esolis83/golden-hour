# Golden Hour — Claude Project Context

Personal sunset photography gallery with ambient Spotify audio.
Built as a portfolio piece to demonstrate modern front-end and API integration skills.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build tool | Vite 5 |
| Animations | Framer Motion 11 |
| Styling | CSS Modules (no Tailwind) |
| Audio | Spotify iFrame Embed API |
| Auth | Spotify PKCE OAuth 2.0 (preserved in codebase) |
| Token proxy | PHP (Client Credentials flow, server-side secret) |
| Hosting | Hostinger Business Shared Hosting |
| Domain | enriquesolis.me |

---

## Project Structure

```
golden-hour/
├── public/
│   ├── api/
│   │   └── spotify-token.php   # PHP Client Credentials proxy (fill in credentials)
│   └── images/                 # Drop .webp photos here
│       ├── golden-hour-hero.webp
│       ├── sunset-1.webp … sunset-N.webp
│       └── README.md           # Naming guide
├── src/
│   ├── components/
│   │   ├── Hero.tsx / .module.css       # Header with title + Spotify badge
│   │   ├── Gallery.tsx / .module.css    # CSS-columns masonry grid
│   │   └── SunsetCard.tsx / .module.css # Card with hover animations + audio
│   ├── data/
│   │   └── sunsets.ts          # ← Edit this to add/update cards
│   ├── hooks/
│   │   ├── useSpotifyToken.ts  # Silent Client Credentials fetch (production)
│   │   ├── useSpotifyAuth.ts   # PKCE user OAuth (portfolio reference, local dev)
│   │   ├── useSpotifyTracks.ts # Track ID resolution (hardcoded IDs + search fallback)
│   │   ├── useSpotifyEmbed.ts  # iFrame Embed API controller (play/pause/seek)
│   │   ├── useSpotifyPlayer.ts # Web Playback SDK (Premium, preserved for reference)
│   │   └── useAudioPlayer.ts   # HTML5 Audio fallback (preserved for reference)
│   ├── types/
│   │   └── index.ts            # SunsetData, SpotifyToken, player interfaces
│   ├── App.tsx                 # Root — wires all hooks, renders Hero + Gallery
│   ├── main.tsx                # React entry point
│   └── index.css               # Global reset + dark warm background
├── .env.local                  # Local secrets (gitignored)
├── .env.example                # Template — copy to .env.local
└── CLAUDE.md                   # ← You are here
```

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SPOTIFY_CLIENT_ID` | `.env.local` + Hostinger | Spotify app Client ID (public, safe in JS bundle) |
| `VITE_SPOTIFY_TOKEN_URL` | `.env.local` + Hostinger | Path to PHP token proxy |
| `VITE_REDIRECT_URI` | `.env.local` only | PKCE redirect URI for local dev (`http://127.0.0.1:5173/`) |

Secrets (`SPOTIFY_CLIENT_SECRET`) live **only** inside `public/api/spotify-token.php` on the server — never in the JS bundle.

---

## Dev Workflow

```bash
# Install
npm install

# Start dev server (use 127.0.0.1 not localhost — Spotify redirect URI requirement)
npm run dev -- --host 127.0.0.1

# Type check
node_modules/.bin/tsc --noEmit

# Production build
npm run build
# → dist/ contains everything to upload to Hostinger
```

> **Port conflict:** if another Vite project (e.g. Frameshift) is on 5173, kill it first.
> `lsof -i :5173` to check, then kill the PID.

---

## Adding / Updating Photos

1. Export your photo as `.webp`
2. Drop it in `public/images/` named `sunset-N.webp`
3. Open `src/data/sunsets.ts` and add or update an entry:

```ts
{
  id: N,
  image: "/images/sunset-N.webp",
  location: "Your Location",
  date: "Mon YYYY",
  quote: "Your quote for this moment.",
  songTitle: "Song Name",
  artist: "Artist Name",
  accent: "#HEX",           // warm colour sampled from the photo
  tall: true,               // true = portrait 2:3 | false = landscape 3:2
  spotifyTrackId: "ABC123", // paste bare ID or full share URL
}
```

**Getting a Spotify track ID:**
1. Find the song on Spotify → ··· → Share → Copy song link
2. URL: `https://open.spotify.com/track/`**`ABC123`**`?si=...`
3. Paste the full URL or just the ID — the hook parses both

---

## Spotify Integration Architecture

```
Page load
  └─ useSpotifyToken
       └─ GET /api/spotify-token.php  (same-origin, no CORS in prod)
            └─ PHP sends Client Credentials grant to Spotify
            └─ Returns { access_token }
       └─ token stored in React state → "Spotify Connected" badge shows

Hover a card
  └─ SunsetCard.onMouseEnter
       └─ useSpotifyEmbed.play(trackId)
            └─ controller.loadUri("spotify:track:ID")
            └─ controller.play()
            └─ auto-stop timer: 25 s
  └─ SunsetCard.onMouseLeave
       └─ useSpotifyEmbed.stop()
            └─ controller.pause() + clear timer
```

**Why two OAuth flows in the codebase?**
- `useSpotifyAuth` (PKCE) — demonstrates user-level OAuth, used for local dev. Preserved as a portfolio reference showing knowledge of the full PKCE flow including verifier/challenge generation, token exchange, and localStorage persistence.
- `useSpotifyToken` (Client Credentials via PHP) — production flow. No user login, secret stays server-side, auto-connects on page load.

---

## Hostinger Deploy Checklist

- [ ] Fill in `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `public/api/spotify-token.php`
- [ ] Update CORS `$allowed` array in PHP file to match your live domain
- [ ] Run `npm run build` → uploads `dist/` to Hostinger document root
- [ ] Set `VITE_SPOTIFY_TOKEN_URL=/api/spotify-token.php` in Hostinger env (or leave as-is if same domain)
- [ ] Confirm `golden-hour.enriquesolis.me` subdomain points to the upload folder
- [ ] Test: page load → badge turns green → hover card → audio plays

---

## Skills Demonstrated (for portfolio context)

See `README.md` for the recruiter-facing summary.

| Skill | Where |
|---|---|
| React 18 + TypeScript strict | All `src/` files |
| Custom hooks | `src/hooks/` — 6 hooks covering auth, playback, state |
| Framer Motion animations | `SunsetCard.tsx` — word-by-word blur reveal, scale, veil |
| CSS Modules + responsive layout | All `.module.css` files |
| CSS columns masonry | `Gallery.module.css` |
| Spotify OAuth PKCE flow | `useSpotifyAuth.ts` |
| Spotify Client Credentials flow | `useSpotifyToken.ts` + PHP |
| Spotify iFrame Embed API | `useSpotifyEmbed.ts` |
| Spotify Web Playback SDK | `useSpotifyPlayer.ts` (reference) |
| PHP server-side proxy | `public/api/spotify-token.php` |
| Environment variable security | `.env.local`, `.env.example`, PHP constants |
| Vite build tooling | `vite.config.ts` |
