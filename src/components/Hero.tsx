import { HERO_IMAGE } from "../data/sunsets";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <header className={styles.hero}>

      {/* ── Full-bleed sunset photo ── */}
      <img
        className={styles.bg}
        src={HERO_IMAGE}
        alt="Golden hour — palm silhouettes at sunset"
      />

      {/* Dark-left vignette */}
      <div className={styles.vignette} />

      {/* 1400 px row */}
      <div className={styles.inner}>

        {/* Left: stacked title */}
        <div className={styles.left}>
          <p className={styles.eyebrow}>A Personal Collection</p>
          <h1 className={styles.title}>
            <span className={styles.white}>Golden</span>
            <span className={styles.coral}>Hour</span>
          </h1>
          <div className={styles.rule} />
        </div>

        {/* Right: hint text */}
        <div className={styles.right}>
          <p className={styles.hint}>
            Hover any photo to feel<br />the moment
          </p>
        </div>

      </div>
    </header>
  );
}
