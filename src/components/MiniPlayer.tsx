import { type RefObject } from "react";
import { motion } from "framer-motion";
import type { SunsetData } from "../types";
import styles from "./MiniPlayer.module.css";

interface Props {
  containerRef : RefObject<HTMLDivElement>;
  activeSunset : SunsetData | null;
  isUnlocked   : boolean;
  onUnlock     : () => void;
}

export default function MiniPlayer({ containerRef, activeSunset, isUnlocked, onUnlock }: Props) {
  return (
    <motion.div
      className={styles.bar}
      // translateY only — no opacity — so the iframe audio context is never
      // throttled by Chrome treating opacity:0 elements as background.
      animate={{ y: activeSunset ? 0 : 120 }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
    >
      {/* Warm accent line */}
      <div className={styles.accentLine} />

      {/* Song + location metadata */}
      <div className={styles.meta}>
        <span className={styles.location}>{activeSunset?.location ?? ""}</span>
        <span className={styles.divider}>·</span>
        <span className={styles.song}>{activeSunset?.songTitle ?? ""}</span>
        <span className={styles.divider}>·</span>
        <span className={styles.artist}>{activeSunset?.artist ?? ""}</span>
      </div>

      {/* Spotify embed — always in DOM so the SDK can initialise */}
      <div className={styles.embedWrap}>
        <div ref={containerRef} className={styles.embed} />

        {/* Unlock overlay — shown once until the user clicks to enable audio */}
        {!isUnlocked && (
          <button className={styles.unlockBtn} onClick={onUnlock} aria-label="Enable music">
            <span className={styles.unlockIcon}>▶</span>
            <span className={styles.unlockText}>Enable Music</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
