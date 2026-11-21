# DESIGN_SYSTEM.md

Workfolio enforces strict separation across three visual layers:

## Layer 1 — Template Gallery & Project Setup
- **Surfaces**: Warm archival paper (`--wf-gallery-bg: #F3F1EC`), elevated paper (`#FAF9F6`), hairline borders (`#DDDAD2`).
- **Ink**: Deep charcoal (`#161618`) and muted stone (`#5C5B57`).
- **Typography**: Editorial serif display (`Playfair Display`) paired with humanist sans (`Plus Jakarta Sans`) and tabular monospace (`IBM Plex Mono`).

## Layer 2 — Studio Workspace (Refined Split-Polarity)
- **Surfaces**: Matte dark graphite chrome (`#18181B` / `#202024`), input surface `#222227`, hairline `#2E2E35`.
- **Proofing Stage**: Warm neutral mat (`#E5E2DA`) toggleable to charcoal mat (`#121214`).
- **Accent & Actions**: Swiss Vermilion (`#D94E28`) reserved strictly for active section focus rings (`1.5px`) and active selection cues; stark high-contrast ivory (`#F4F3EF` background with `#161618` ink) for primary actions (`Export .zip`).

## Layer 3 — User Portfolio Templates (`--tpl-*` tokens)
Each template defines independent `--tpl-bg`, `--tpl-surface`, `--tpl-ink`, `--tpl-muted`, `--tpl-accent`, `--tpl-border`, `--tpl-hairline`, `--tpl-display-font`, `--tpl-body-font`, `--tpl-mono-font`, and `--tpl-section-pad` variables:
1. **Noir Collage**: Matte obsidian (`#141414`), vertical architectural column hairlines, condensed bold display + wireframe outline (`-webkit-text-stroke`), sharp `0px` collage plates.
2. **Atelier Index**: Gallery parchment (`#FAF8F3`), expressive serif display (`Fraunces` / `Playfair Display`), tabular monograph numbering, generous exhibition whitespace.
3. **Monolith Grid**: Architectural slate (`#F4F5F7` or dark graphite `#101216`), exposed structural border grid, geometric grotesk + monospace engineering metadata.
