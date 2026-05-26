# Sunset Images

Drop your `.webp` photos here. Vite serves this folder at the root, so
`/images/golden-hour-hero.webp` → `public/images/golden-hour-hero.webp`.

No restarts needed — just drop a file in and refresh the browser.

## Expected filenames

| File                      | Used by                 | Orientation  |
|---------------------------|-------------------------|--------------|
| golden-hour-hero.webp     | Hero header             | Landscape    |
| malibu.webp               | Card 1 — Malibu, CA     | Portrait     |
| santorini.webp            | Card 2 — Santorini, GR  | Landscape    |
| big-sur.webp              | Card 3 — Big Sur, CA    | Landscape    |
| oregon-coast.webp         | Card 4 — Oregon Coast   | Portrait     |
| amalfi.webp               | Card 5 — Amalfi Coast   | Landscape    |
| bali.webp                 | Card 6 — Bali, ID       | Portrait     |
| joshua-tree.webp          | Card 7 — Joshua Tree    | Landscape    |
| reykjavik.webp            | Card 8 — Reykjavik, IS  | Portrait     |

## Tips
- Hero: aim for >= 1600 px wide so it fills the header without upscaling.
- Cards: >= 800 px wide is plenty; the mosaic displays them small.
- Portrait shots (taller than wide) look best on tall: true cards.
- Landscape shots (wider than tall) look best on tall: false cards.
- To add more cards, duplicate an entry in src/data/sunsets.ts and
  add your .webp file here with a matching filename.
