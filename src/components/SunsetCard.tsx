import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { SunsetData } from "../types";
import styles from "./SunsetCard.module.css";

interface Props {
  sunset: SunsetData;
  trackId?: string;
  onPlay: (trackId: string, sunset: SunsetData) => void;
  onStop: () => void;
}

// ── Word-by-word reveal ───────────────────────────────────────────────────────

const quoteContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
};

const wordVariant = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function SunsetCard({ sunset, trackId, onPlay, onStop }: Props) {
  const [hovered, setHovered] = useState(false);
  const words = sunset.quote.split(" ");

  const handleEnter = useCallback(() => {
    setHovered(true);
    if (trackId) onPlay(trackId, sunset);
  }, [trackId, onPlay]);

  const handleLeave = useCallback(() => {
    setHovered(false);
    onStop();
  }, [onStop]);

  return (
    <div
      className={`${styles.card} ${sunset.tall ? styles.tall : styles.short}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* ── Photo ── */}
      <motion.img
        className={styles.photo}
        src={sunset.image}
        alt={`Sunset at ${sunset.location}`}
        loading="lazy"
        animate={{ scale: hovered ? 1.07 : 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* ── Warm colour wash ── */}
      <motion.div
        className={styles.accentOverlay}
        style={{ backgroundColor: sunset.accent }}
        animate={{ opacity: hovered ? 0.2 : 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* ── Persistent bottom scrim ── */}
      <div className={styles.scrimBase} />

      {/* ── Sun-orange veil on hover ── */}
      <motion.div
        className={styles.hoverVeil}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.45 }}
      />

      {/* ── Content ── */}
      <div className={styles.content}>

        {/* Default: location + date */}
        <motion.div
          className={styles.metaLayer}
          animate={{ opacity: hovered ? 0 : 1, y: hovered ? 6 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <p className={styles.location}>{sunset.location}</p>
          <span className={styles.date}>{sunset.date}</span>
        </motion.div>

        {/* Hover: big script quote */}
        <motion.div
          className={styles.quoteWrap}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.p
            className={styles.quote}
            variants={quoteContainer}
            initial="hidden"
            animate={hovered ? "visible" : "hidden"}
          >
            {words.map((word, i) => (
              <motion.span key={i} className={styles.word} variants={wordVariant}>
                {word}{i < words.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </motion.p>
        </motion.div>

        {/* Hover: music row — bars only animate when audio is available */}
        <motion.div
          className={styles.musicRow}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          transition={{ duration: 0.4, delay: hovered ? 0.22 : 0 }}
        >
          <EqBars accent={sunset.accent} active={hovered && !!trackId} />
          <div className={styles.songPill}>
            <span className={styles.songTitle}>{sunset.songTitle}</span>
            <span className={styles.artistName}>{sunset.artist}</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// ── Animated EQ bars ──────────────────────────────────────────────────────────

function EqBars({ accent, active }: { accent: string; active: boolean }) {
  return (
    <div className={styles.eqBars} aria-hidden>
      {(["0.65s", "0.9s", "0.5s"] as const).map((dur, i) => (
        <span
          key={i}
          className={`${styles.bar} ${active ? styles.barActive : ""}`}
          style={
            {
              "--accent": accent,
              "--dur": dur,
              "--delay": `${i * 0.11}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
