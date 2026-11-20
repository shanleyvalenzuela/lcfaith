# Requested typefaces

The site uses Syabil for titles and paragraphs, and Gravitica for subtext, chart labels, controls, and metadata.

The repository does not include font binaries. The stylesheet uses locally installed copies when available. To serve the typefaces to all visitors, obtain web-licensed copies of these styles:

- `syabil-regular.woff2` (400)
- `syabil-bold.woff2` (700)
- `gravitica-regular.woff2` (400)
- `gravitica-bold.woff2` (700)

Add the WOFF2 files to `src/fonts/` and append `url('./fonts/<file>.woff2') format('woff2')` after the local sources in each matching `@font-face` rule in `src/whiteboard.css`. Vite will bundle those assets. Until then, visitors without local copies see the system sans-serif fallback.

Publisher listings: [Syabil by Eko Bimantara](https://www.myfonts.com/collections/syabil-font-eko-bimantara?tab=licensing) and [Gravitica by Ckhans Fonts](https://www.myfonts.com/collections/gravitica-font-ckhans-fonts).
