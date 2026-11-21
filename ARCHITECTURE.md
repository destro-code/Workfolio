# ARCHITECTURE.md

## Data & Presentation Separation
- `src/types/portfolio.ts`: Zod schemas (`PortfolioDocumentSchema`, `PortfolioContentSchema`, `PresentationSettingsSchema`, `ProjectSchema`) keep `content` completely independent of `presentation`.
- `src/utils/portfolioLogic.ts`: Pure immutable transformation utilities including `switchTemplateSafely`, section reordering/visibility/layout updates, and project CRUD.

## State Management & Persistence
- `src/store/studioStore.ts`: Zustand vanilla/React store managing active portfolio state, debounced typing snapshots (600ms), Undo/Redo stacks (up to 40 snapshots), viewport/mat state, and asset URL cache.
- `src/db/workfolioDb.ts`: Dexie IndexedDB database (`WorkfolioStudioDB`) storing `portfolios` and binary/data-URL `assets` separately.
- `src/utils/imagePipeline.ts`: Client-side File API + `<canvas>` image pipeline resizing uploads up to `1600px` at `0.86` quality before saving to Dexie.

## Static Export
- `src/utils/exporter.ts`: Compiles standalone `index.html`, `styles.css`, `script.js`, bundled `assets/*` (both IndexedDB user images and local sample assets), and `README.txt` into a downloadable `.zip` archive using JSZip.
