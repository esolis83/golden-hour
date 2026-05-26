import type { SunsetData } from "../types";
import SunsetCard from "./SunsetCard";
import styles from "./Gallery.module.css";

interface Props {
  sunsets: SunsetData[];
  trackIds: Map<number, string>;
  onPlay: (trackId: string, sunset: SunsetData) => void;
  onStop: () => void;
}

export default function Gallery({ sunsets, trackIds, onPlay, onStop }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.mosaic}>
        {sunsets.map((sunset) => (
          <SunsetCard
            key={sunset.id}
            sunset={sunset}
            trackId={trackIds.get(sunset.id)}
            onPlay={onPlay}
            onStop={onStop}
          />
        ))}
      </div>
    </section>
  );
}
