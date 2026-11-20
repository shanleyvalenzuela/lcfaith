# LCFAITH — HIV diagnoses in the Philippines

A single-page, frontend-only interactive infographic based on the supplied seven-page research PDF and the original DOH reports used to check selected figures. There is no navigation bar, application server, database, login, or runtime API.

## Requirements

Install Node.js 22 LTS (or a newer compatible version) with npm. Run the following in **Windows Command Prompt (CMD)**:

```cmd
cd /d "C:\Users\Shanley Valenzuela\OneDrive\Documents\ChatGPT\lcfaith"
npm install
npm run dev
```

Open the localhost URL printed by Vite (normally `http://127.0.0.1:5173`). Press Ctrl+C in CMD to stop it.

Optional TypeScript and production checks:

```cmd
npm run typecheck
npm run build
npm run preview
```

Open the preview URL printed by Vite (normally `http://127.0.0.1:4173`). Preview requires a completed build. No automated test suite is included.

## Implemented scope

- Structured local datasets with reporting periods, source pages, missing values, and discrepancy notes.
- One continuous infographic: introduction, annual and quarterly cases, demographics, regional locator, transmission, treatment, mortality, initiatives, and source notes.
- ECharts SVG charts with exact-value tables, keyboard selection, expandable views, and contextual discussion.
- Annual year-range sliders and zoom controls; age-snapshot comparison slider; selectable sex pictogram; pan/zoom regional locator.
- Shareable URL parameters for the annual range, age-comparison period, and selected region.
- Responsive layouts, touch controls, visible focus states, keyboard-friendly inline disclosures, accessible alternatives to pointer-only charts, and reduced-motion support.
- Searchable, filterable government and community program cards.
- Direct links to pages in the local PDF and an inline historical figure preview. Browser charts do not fetch data from remote services.

The page uses Syabil and Gravitica when installed locally. It falls back to system fonts. See `public/fonts/README.md` for webfont setup. The figures, source previews, and photos are served locally.

## Source and data handling

The supplied research document is `public/source.pdf`; `public/source-pages/` holds its previews. The source notes link to the original DOH reports and explain the corrections to the Q2 count, age breakdown, regional period, and cumulative death coverage.

Data files live in `src/data/`. Discussions refer to statistic IDs; source discrepancies are in `sources.json`. Missing quarters remain `null`. Incompatible reporting periods and denominators are not merged. Death counts are not labeled mortality rates. Generation names are discussed without attributing causation.

The regional locator uses the [PSA/NAMRIA 2023 boundary snapshot pinned by GeoCeff’s Philippine Demographic Mapper](https://github.com/GeoCeff/philippine-demographic-mapper/blob/839c805f19aa07c96012197c717c2029c06fe835/data/source_metadata.json). The five markers show the infographic’s cumulative counts. Regional shapes reflect the historical snapshot. To regenerate the local SVG, download the pinned [regions.geojson](https://github.com/bendlikeabamboo/barangay-boundaries-repository/releases/download/v2026.4.13.0/regions.geojson) and run `node scripts/build-region-map.mjs <path-to-regions.geojson>`. The original historical age-share chart is offered as an image because its exact numeric series is unavailable.

## Main files

- `src/App.tsx`: the continuous infographic and section interactions.
- `src/charts/Chart.tsx`: ECharts lifecycle, resizing, reduced motion, and chart options.
- `src/components/Primitives.tsx`: reusable chart cards, source previews, tables, discussion panels, and controls.
- `src/components/RegionMap.tsx`: accessible regional boundary map, marker selection, zoom and pan.
- `src/hooks/useUrlState.ts`: URL-backed selections.
- `src/styles.css`: visual system, mobile layouts, print styles, and reduced-motion rules.

## Manual exploration checklist

1. Scroll the whole page: there should be no navigation bar or page changes.
2. Click annual bars and use the From/To sliders and zoom/reset controls.
3. Switch age snapshots and count/share views; move the snapshot slider and verify that the age chart and data table show the selected periods.
4. Select sex categories, quarterly age counts, regions, and transmission marks.
5. Zoom and pan the map; select the same regions using the ranked list.
6. Select care-cascade stages; inspect the changing denominator notes.
7. Switch quarterly/cumulative mortality and count/share views.
8. Search/filter initiatives and expand their details.
9. Expand charts, use data-table buttons, and follow the source links to their PDF pages.
10. Use Tab, Enter/Space, and range arrow keys. Try a narrow mobile viewport, browser zoom, and reduced-motion settings.

## Static deployment

Run `npm ci` and `npm run build`, then upload the contents of `dist/` to a static host. Serve that directory over HTTP with `index.html` as the default file. The relative asset base supports a site root or a subdirectory. Keep all files and folders from `dist/` together so the source PDF, page previews, and photos remain accessible. Use `npm run preview` to check the build locally before uploading.
