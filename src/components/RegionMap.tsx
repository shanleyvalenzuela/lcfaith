import { useRef, useState } from 'react';
import { Minus, Plus, RotateCcw, Move } from 'lucide-react';
import regions from '../data/regions.json';

const mapUrl = `${import.meta.env.BASE_URL}philippines-regions.svg`;
const labelPositions: Record<string, { label: string; dx: number; dy: number }> = {
  ncr: { label: 'NCR', dx: -24, dy: 4 },
  calabarzon: { label: 'Calabarzon', dx: 23, dy: 16 },
  'central-luzon': { label: 'Central Luzon', dx: 18, dy: -10 },
  'central-visayas': { label: 'Central Visayas', dx: -20, dy: 6 },
  davao: { label: 'Davao', dx: 18, dy: 4 },
};

const clampPan = (value: number, axisLength: number, zoom: number) => {
  const limit = axisLength * (zoom - 1) / 2;
  return Math.max(-limit, Math.min(limit, value));
};

export default function RegionMap({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const activeRegion = regions.find(region => region.id === selected);
  return <div className="map-wrap"><div className="map-controls" role="group" aria-label="Map zoom and pan controls">
    <button className="icon-button" aria-label="Zoom map in" disabled={zoom >= 2.5} onClick={() => setZoom(z => Math.min(2.5, z + 0.25))}><Plus size={18} /></button>
    <span aria-live="polite">{Math.round(zoom * 100)}%</span>
    <button className="icon-button" aria-label="Zoom map out" disabled={zoom <= 1} onClick={() => { setZoom(z => Math.max(1, z - 0.25)); setPan({ x: 0, y: 0 }); }}><Minus size={18} /></button>
    <button className="icon-button" aria-label="Reset map view" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><RotateCcw size={17} /></button>
  </div>
  <svg ref={svg} viewBox="0 0 440 530" className={`region-map ${zoom > 1 ? 'can-pan' : ''}`} style={{ touchAction: zoom > 1 ? 'none' : 'pan-y' }} role="group" aria-label="Philippine regional locator using 2023 boundaries. Select region markers. Use the zoom buttons and arrow keys to pan when zoomed." tabIndex={0}
    onKeyDown={e => { if (zoom <= 1 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return; e.preventDefault(); setPan(p => ({ x: clampPan(p.x + (e.key === 'ArrowLeft' ? 20 : e.key === 'ArrowRight' ? -20 : 0), 440, zoom), y: clampPan(p.y + (e.key === 'ArrowUp' ? 20 : e.key === 'ArrowDown' ? -20 : 0), 530, zoom) })); }}
    onPointerDown={e => { if (zoom <= 1 || (e.target as Element).closest('[data-region]')) return; drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; e.currentTarget.setPointerCapture(e.pointerId); }}
    onPointerMove={e => { const d = drag.current; if (!d) return; const scale = svg.current?.getScreenCTM()?.a || 1; setPan({ x: clampPan(d.px + (e.clientX - d.x) / scale, 440, zoom), y: clampPan(d.py + (e.clientY - d.y) / scale, 530, zoom) }); }}
    onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
    <defs><pattern id="sea-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#d8eeeb" /></pattern></defs>
    <rect width="440" height="530" fill="url(#sea-dots)" />
    <g transform={`translate(${220 + pan.x} ${265 + pan.y}) scale(${zoom}) translate(-220 -265)`}>
      <g stroke="#fff" strokeWidth="1" strokeLinejoin="round" fillRule="evenodd" aria-hidden="true">
        <use href={`${mapUrl}#regions`} fill="#b8e1dd" />
        {activeRegion && <use href={`${mapUrl}#region-${activeRegion.boundaryCode}`} fill="#eab19a" stroke="#ad593b" />}
      </g>
      {regions.map(r => {
        const { label, dx, dy } = labelPositions[r.id];
        return <g key={r.id} data-region={r.id} className={`map-marker ${selected === r.id ? 'selected' : ''}`} role="button" tabIndex={0} aria-label={`${r.label}: ${r.value.toLocaleString()} cases${selected === r.id ? ', selected' : ''}`} aria-pressed={selected === r.id} onClick={() => onSelect(r.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(r.id); } }}>
          <line x1={r.x} y1={r.y} x2={r.x + dx * 0.82} y2={r.y + dy - 3} stroke="#4e6a62" aria-hidden="true" />
          <circle cx={r.x} cy={r.y} r="8" fill="transparent" />
          <circle cx={r.x} cy={r.y} r="4.5" fill={selected === r.id ? '#b64e30' : '#00796f'} stroke="white" strokeWidth="1.4" />
          <text x={r.x + dx} y={r.y + dy} textAnchor={dx < 0 ? 'end' : 'start'}>{label}</text>
        </g>;
      })}
    </g>
  </svg>
  <p className="map-caption"><Move size={14} /> {zoom > 1 ? 'Drag or use arrow keys to pan.' : 'Select a region. Zoom in to pan.'}</p>
  <p className="map-caption">Boundaries: NAMRIA (November 2023) and PSA PSGC (October 2023), via <a href="https://github.com/GeoCeff/philippine-demographic-mapper">Philippine Demographic Mapper</a>. Administrative regions follow the 2023 snapshot.</p>
  </div>;
}
