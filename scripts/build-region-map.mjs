import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/build-region-map.mjs <regions.geojson>');

const source = readFileSync(input);
const expectedHash = 'd4dc71356f1b29f90e4f2737becd9f5216c26d2567f815fd0b9f85f71243d86b';
if (createHash('sha256').update(source).digest('hex') !== expectedHash) {
  throw new Error('Input does not match the regional asset pinned by GeoCeff.');
}

const { features } = JSON.parse(source);
const rings = features.map(({ properties, geometry }) => ({
  code: properties.psgc_code,
  polygons: geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates,
}));
const coordinates = rings.flatMap(({ polygons }) => polygons.flat(2));
const lons = coordinates.map(([lon]) => lon);
const lats = coordinates.map(([, lat]) => lat);
const midLon = (Math.min(...lons) + Math.max(...lons)) / 2;
const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
const longitudeScale = Math.cos(midLat * Math.PI / 180);
const scale = Math.min(
  400 / ((Math.max(...lons) - Math.min(...lons)) * longitudeScale),
  488 / (Math.max(...lats) - Math.min(...lats)),
);
const round = value => Math.round(value * 10) / 10;
const project = ([lon, lat]) => [round(220 + (lon - midLon) * longitudeScale * scale), round(265 - (lat - midLat) * scale)];

function svgRing(ring) {
  const points = ring.slice(0, -1).map(point => project(point).join(' '));
  const distinct = points.filter((point, index) => point !== points[index - 1]);
  return new Set(distinct).size >= 3 ? `M${distinct.join(' ')}Z` : '';
}

const paths = rings.map(({ code, polygons }) =>
  `    <path id="region-${code}" d="${polygons.flatMap(polygon => polygon.map(svgRing)).join('')}"/>`,
);
const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 530">',
  '  <!-- NAMRIA boundaries (2023-11-06) and PSA PSGC (2023-10-24), via GeoCeff’s Philippine Demographic Mapper. -->',
  '  <g id="regions" fill-rule="evenodd">',
  ...paths,
  '  </g>',
  '</svg>',
  '',
].join('\n');
writeFileSync(new URL('../public/philippines-regions.svg', import.meta.url), svg);

// Markers are anchored at Manila, Calamba, San Fernando (Pampanga), Cebu City and Davao City.
const anchors = {
  ncr: { code: '1300000000', location: [120.9842, 14.5995] },
  calabarzon: { code: '0400000000', location: [121.1649, 14.2117] },
  'central-luzon': { code: '0300000000', location: [120.6898, 15.0343] },
  'central-visayas': { code: '0700000000', location: [123.8854, 10.3157] },
  davao: { code: '1100000000', location: [125.4553, 7.1907] },
};
const dataPath = new URL('../src/data/regions.json', import.meta.url);
const regions = JSON.parse(readFileSync(dataPath, 'utf8'));
const mappedRegions = regions.map(region => {
  const { code, location } = anchors[region.id];
  if (!rings.some(ring => ring.code === code)) throw new Error(`Missing boundary for ${region.id}`);
  const [x, y] = project(location);
  return { ...region, x, y, boundaryCode: code };
});
writeFileSync(dataPath, JSON.stringify(mappedRegions, null, 2) + '\n');
