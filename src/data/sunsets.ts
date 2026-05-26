import type { SunsetData } from "../types";

// ── Hero ──────────────────────────────────────────────────────────────────────
export const HERO_IMAGE = "/images/golden-hour-hero.webp";

// ── Gallery cards ─────────────────────────────────────────────────────────────
// For each card, grab the Spotify track ID from any share link:
//   open.spotify.com/track/‹TRACK_ID›
// Paste it into spotifyTrackId — skips the search API entirely.
//
// tall: true  → portrait 2:3   tall: false → landscape 3:2

export const SUNSETS: SunsetData[] = [
  {
    id: 1,
    image: "/images/sunset-1.webp",
    location: "Huntington Beach, CA",
    date: "Aug 2025",
    quote: "Every sunset is a reminder that endings can be breathtaking.",
    songTitle: "I'm Fine",
    artist: "Ciara Blue",
    accent: "#E8621A",
    tall: true,
    spotifyTrackId: "2kcFvqzhHgbMqMwGF3zCqS",
  },
  {
    id: 2,
    image: "/images/sunset-2.webp",
    location: "Santorini, GR",
    date: "Jun 2023",
    quote: "Chase the light. It always finds a way back to you.",
    songTitle: "The Matches",
    artist: "Jude Black",
    accent: "#F0830D",
    tall: false,
    spotifyTrackId: "0ttXDx86y64n33dChT0Shp", // 🎵 paste ID here
  },
  {
    id: 3,
    image: "/images/sunset-3.webp",
    location: "Big Sur, CA",
    date: "Oct 2023",
    quote: "Stand still. The world is painting just for you.",
    songTitle: "Faded memories, broken dreams",
    artist: "The Velvet Singer",
    accent: "#D4603A",
    tall: false,
    spotifyTrackId: "6tHgsQKcUP2hnaGStaJq6c", // 🎵 paste ID here
  },
  {
    id: 4,
    image: "/images/sunset-4.webp",
    location: "Oregon Coast",
    date: "Mar 2024",
    quote: "Breathe. The horizon is closer than you think.",
    songTitle: "Red Silk",
    artist: "Noa Bitter",
    accent: "#C44A08",
    tall: true,
    spotifyTrackId: "22MwcznyOeOJzLKhtdbm73", // 🎵 paste ID here
  },
  {
    id: 5,
    image: "/images/sunset-5.webp",
    location: "Amalfi Coast, IT",
    date: "Sep 2023",
    quote: "You were made for moments like this.",
    songTitle: "Hollow Quiet",
    artist: "Kaia North",
    accent: "#E8781A",
    tall: true,
    spotifyTrackId: "1yIjJJtjapMeiUGm3PQp0e", // 🎵 paste ID here
  },
  {
    id: 6,
    image: "/images/sunset-6.webp",
    location: "Bali, ID",
    date: "Jan 2024",
    quote: "Beauty is never permanent — that's why it's perfect.",
    songTitle: "Stale Smoke",
    artist: "The Velvet Singer",
    accent: "#F07020",
    tall: false,
    spotifyTrackId: "1wxLpvvcgbS0p9trKjYSRt", // 🎵 paste ID here
  },
  {
    id: 7,
    image: "/images/sunset-7.webp",
    location: "Joshua Tree, CA",
    date: "Dec 2023",
    quote: "Some silences are too loud to ignore.",
    songTitle: "Maybe",
    artist: "Janis Joplin",
    accent: "#D45818",
    tall: false,
    spotifyTrackId: "0xGSeBsG4V8Scc5YqpZQ66", // 🎵 paste ID here
  },
  {
    id: 8,
    image: "/images/sunset-8.webp",
    location: "Reykjavik, IS",
    date: "Jul 2023",
    quote: "The sky at midnight is its own kind of gold.",
    songTitle: "This Bottle Stays",
    artist: "The Velvet Singer",
    accent: "#E8901A",
    tall: true,
    spotifyTrackId: "5PksL4J4Wbx0YxEipvkfCY", // 🎵 paste ID here
  },
];
