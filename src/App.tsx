import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { Activity, BookOpen, Check, ChevronDown, Heart, HeartHandshake, Leaf, Minus, Plus, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Sparkles, Users, X } from 'lucide-react';
import type { EChartsOption } from 'echarts';
import Chart, { colors, horizontalOption } from './charts/Chart';
import { ChartCard, DataTable, DiscussionBlock, Disclosure, Note, number, percent, Reveal, SelectionDetail, PhotoTile, SourceLinks, sourceUrl, Toggle } from './components/Primitives';
import RegionMap from './components/RegionMap';
import { useUrlState } from './hooks/useUrlState';
import annualJson from './data/annual-cases.json';
import quarterlyJson from './data/quarterly-cases.json';
import demographics from './data/demographics.json';
import regions from './data/regions.json';
import transmission from './data/transmission.json';
import transmissionPeriods from './data/transmission-periods.json';
import careJson from './data/care-cascade.json';
import careTargets from './data/care-targets.json';
import mortality from './data/mortality.json';
import discussionsJson from './data/discussions.json';
import initiatives from './data/initiatives.json';
import sources from './data/sources.json';
import type { Discussion, Selection, Statistic } from './types';

const annual = annualJson as Statistic[];
const quarterly = quarterlyJson as Statistic[];
const care = careJson as Statistic[];
const discussion = (id: string) => (discussionsJson as Discussion[]).find(d => d.id === id)!;
const toSelection = (s: Statistic): Selection => ({ label: s.label, value: s.value ?? 0, unit: s.unit, period: s.period, page: s.sourcePage, note: s.note, sourceLink: s.sourceLink, denominator: s.denominator });

function SectionHeading({ eyebrow, title, text, icon, light = false }: { eyebrow: string; title: ReactNode; text: string; icon: ReactNode; light?: boolean }) {
  return <Reveal className={`section-heading ${light ? 'heading-light' : ''}`}><div><div className="eyebrow"><span className="section-icon">{icon}</span>{eyebrow}</div><h2>{title}</h2><p>{text}</p></div></Reveal>;
}

function Trends() {
  const [startRaw, setStartRaw] = useUrlState('from', '2016', annual.map(x => x.label));
  const [endRaw, setEndRaw] = useUrlState('to', '2025', annual.map(x => x.label));
  const start = Math.min(Number(startRaw), Number(endRaw));
  const end = Math.max(Number(startRaw), Number(endRaw));
  const changeRange = (first: number, last: number) => {
    setStartRaw(String(first));
    setEndRaw(String(last));
  };
  const [selected, setSelected] = useState<Selection | null>(toSelection(annual[9]));
  const [selectedQuarter, setSelectedQuarter] = useState<Selection | null>(null);
  const shown = annual.filter(r => Number(r.label) >= start && Number(r.label) <= end);
  const option: EChartsOption = {
    grid: { left: 12, right: 18, top: 48, bottom: 30, containLabel: true },
    xAxis: { type: 'category', data: shown.map(r => r.label), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: colors.ink, fontSize: 14, interval: 0, rotate: shown.length > 6 ? 35 : 0 } },
    yAxis: { type: 'value', min: 0, max: 22000, interval: 5000, splitLine: { lineStyle: { type: 'dashed', color: colors.grid } }, axisLabel: { color: colors.muted, formatter: (n: number) => `${n / 1000}k` } },
    series: [{ type: 'bar', barMaxWidth: 44, data: shown.map(r => ({ value: r.value, itemStyle: { color: selected?.label === r.label ? colors.orange : colors.teal, borderRadius: [5, 5, 0, 0] } })), label: { show: shown.length <= 6, position: 'top', color: colors.ink, formatter: p => number(Number(p.value)) }, emphasis: { itemStyle: { color: colors.orange } } }],
  };
  const reset = () => changeRange(2016, 2025);
  return <section className="section section-trends" aria-label="The national picture"><div className="content-width">
    <SectionHeading eyebrow="The national picture" icon={<Activity size={18} />} title="A decade of reported diagnoses" text="Annual totals cover 2016–2025. The 2026 figures cover January through June." />
    <Reveal className="chart-story"><ChartCard title="Reported diagnoses by year" subtitle="Philippines · complete years, 2016–2025 · cases" rows={shown} pages={[1]} detail={<SelectionDetail selection={selected} />} onSelect={r => setSelected(toSelection(r))}>
      <Chart option={option} description={`Reported annual diagnoses, ${start} through ${end}. ${shown.map(r => `${r.label}: ${r.value}`).join('; ')}.`} height={340} onSelect={p => setSelected(toSelection(shown[p.dataIndex]))} />
      <div className="range-controls"><div className="range-title"><span><SlidersHorizontal size={16} /> Slide to focus</span><strong>{start} — {end}</strong><button className="text-button" onClick={reset}><RotateCcw size={14} /> Reset</button></div>
        <div className="range-pair"><label>From <output>{start}</output><input type="range" min="2016" max={end} value={start} onChange={e => changeRange(Number(e.target.value), end)} aria-label="First year shown" /></label><label>To <output>{end}</output><input type="range" min={start} max="2025" value={end} onChange={e => changeRange(start, Number(e.target.value))} aria-label="Last year shown" /></label></div>
        <div className="range-actions"><button onClick={() => { if (end - start > 2) changeRange(start + 1, end - 1); }} disabled={end - start <= 2}><Plus size={14} /> Zoom in</button><button onClick={() => { changeRange(Math.max(2016, start - 1), Math.min(2025, end + 1)); }} disabled={start === 2016 && end === 2025}><Minus size={14} /> Zoom out</button></div>
      </div>
    </ChartCard><aside><DiscussionBlock item={discussion('trends')} /></aside></Reveal>
    <Reveal className="quarter-block"><div><span className="eyebrow">A separate snapshot</span><h3>2026 quarterly diagnoses</h3><p className="muted">Partial-year figures are not directly compared with complete annual totals.</p></div><div className="quarters">{quarterly.map(q => <button key={q.id} className={`quarter ${q.value === null ? 'quarter-missing' : ''}`} disabled={q.value === null} aria-pressed={selectedQuarter?.period === q.period} onClick={() => setSelectedQuarter(toSelection(q))}><span>{q.label}</span><strong>{q.value === null ? '—' : number(q.value)}</strong><small>{q.value === null ? 'Outside this report’s coverage' : 'reported cases'}</small>{q.status === 'conflicting' && <span className="status-label">Source discrepancy</span>}</button>)}</div>{selectedQuarter && <div className="quarter-detail"><SelectionDetail selection={selectedQuarter} /></div>}</Reveal>
    <Note>DOH reports 2,994 diagnoses for Q2. The research PDF labels 7,624 as Q2, which matches the sum of the January–June monthly counts in the DOH Q2 report.</Note>
  </div></section>;
}

function Age() {
  const [pair, setPair] = useUrlState('age', 'june', ['june', 'december']);
  const [view, setView] = useState('count');
  const [snapshotPosition, setSnapshotPosition] = useState(1);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [sex, setSex] = useState(0);
  const [selectedAge, setSelectedAge] = useState<Selection | null>(null);
  const june = pair === 'june';
  const before = demographics.snapshots.map(r => june ? r.jun2021 : r.dec2020);
  const after = demographics.snapshots.map(r => june ? r.jun2026 : r.dec2025);
  const beforeTotal = before.reduce((a, b) => a + b, 0);
  const afterTotal = after.reduce((a, b) => a + b, 0);
  const beforePeriod = june ? 'June 2021' : 'December 2020';
  const afterPeriod = june ? 'June 2026' : 'December 2025';
  const snapshots = [
    { period: beforePeriod, counts: before, total: beforeTotal, color: colors.light, className: 'snapshot-earlier' },
    { period: afterPeriod, counts: after, total: afterTotal, color: colors.ink, className: 'snapshot-later' },
  ].map(snapshot => ({
    ...snapshot,
    values: snapshot.counts.map(count => view === 'percent' ? count / snapshot.total * 100 : count),
    rows: demographics.snapshots.map((group, index): Statistic => ({
      id: `${snapshot.period}-${index}`, label: group.label, value: snapshot.counts[index],
      unit: 'cases', period: snapshot.period, sourcePage: june ? 5 : 2,
      status: 'transcribed', denominator: snapshot.total,
    })),
  }));
  const visibleSnapshots = snapshots.filter((_, index) => snapshotPosition === 1 || index * 2 === snapshotPosition);
  const snapshotLabels = [beforePeriod, 'Both snapshots', afterPeriod];
  const rows = visibleSnapshots.flatMap(snapshot => snapshot.rows);
  const axisStep = view === 'percent' ? 10 : 20000;
  const axisMax = Math.ceil(Math.max(...snapshots.flatMap(snapshot => snapshot.values)) / axisStep) * axisStep;
  const chartOption: EChartsOption = {
    grid: { left: 8, right: 26, top: 20, bottom: 26, containLabel: true },
    xAxis: { type: 'value', max: axisMax, interval: axisStep, axisLabel: { color: colors.muted, formatter: (v: number) => view === 'percent' ? `${v}%` : `${v / 1000}k` }, splitLine: { lineStyle: { color: colors.grid, type: 'dashed' } } },
    yAxis: { type: 'category', inverse: true, data: demographics.snapshots.map(r => r.label), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: colors.ink, fontSize: 14 } },
    series: visibleSnapshots.map(snapshot => ({
      type: 'bar', name: snapshot.period, data: snapshot.values,
      itemStyle: { color: snapshot.color, borderRadius: [0, 3, 3, 0] }, barMaxWidth: 18,
    })),
  };
  const quarter = demographics.ageQuarter as Statistic[];
  const sexRecord = demographics.sex[sex] as Statistic;
  return <section className="section section-age" aria-label="Age and sex distribution"><div className="content-width">
    <SectionHeading eyebrow="People behind the numbers" icon={<Users size={18} />} title="Age and sex at diagnosis" text="Diagnoses by age group and sex, including the latest quarter covered here." />
    <Reveal className="age-lead"><div className="age-big"><strong>28<span>years</span></strong><p>Median age at diagnosis<br /><small>Overview through December 2025 · p. 1</small></p></div><div className="age-lead-copy"><span className="eyebrow">The largest reported age group</span><h3>25–34</h3><p>Ages 25–34 accounted for 1,294 of the 2,994 diagnoses reported in April–June 2026.</p></div></Reveal>
    <Reveal className="chart-story"><ChartCard title="Compare cumulative age snapshots" subtitle="Two recorded points in time; counts are cumulative, not annual incidence." rows={rows} pages={[2, 5]} detail={<SelectionDetail selection={selection} />} onSelect={r => setSelection(toSelection(r))} tools={<><Toggle label="Comparison period" value={pair} onChange={v => { setPair(v); setSelection(null); }} options={[{ value: 'june', label: '2021 / 2026' }, { value: 'december', label: '2020 / 2025' }]} /><Toggle label="Age chart units" value={view} onChange={setView} options={[{ value: 'count', label: 'Count' }, { value: 'percent', label: 'Share' }]} /></>}>
      <div className="snapshot-compare">
        <label className="compare-label">
          Show in age chart: <strong>{snapshotLabels[snapshotPosition]}</strong>
          <input type="range" min="0" max="2" step="1" value={snapshotPosition}
            aria-label="Age snapshots shown" aria-valuetext={snapshotLabels[snapshotPosition]}
            onChange={event => { setSnapshotPosition(Number(event.target.value)); setSelection(null); }} />
        </label>
        <div className="snapshot-label" aria-hidden="true">
          {snapshotLabels.map(label => <span key={label}>{label}</span>)}
        </div>
        <div className="snapshot-totals">
          {visibleSnapshots.map(snapshot => (
            <div key={snapshot.period} className={`snapshot-total ${snapshot.className}`}>
              <span>{snapshot.period} · Total by age</span>
              <strong>{number(snapshot.total)}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-legend">{visibleSnapshots.map(snapshot => <span key={snapshot.period}><i style={{ background: snapshot.color }} />{snapshot.period}</span>)}</div>
      <Chart option={chartOption} description={`Age distribution for ${visibleSnapshots.map(snapshot => snapshot.period).join(' and ')}. Exact values and snapshot denominators are in the data table.`} height={340} onSelect={p => {
        const row = visibleSnapshots[p.seriesIndex]?.rows[p.dataIndex];
        if (row) setSelection(toSelection(row));
      }} />
    </ChartCard><aside><DiscussionBlock item={discussion('age')} /><Note>The original DOH table confirms a 104.80% increase in cumulative diagnoses for ages 15–24. The research PDF’s +302% claim is unsupported by that comparison.</Note></aside></Reveal>
    <Reveal className="demographic-grid"><div className="sex-panel"><span className="eyebrow">Sex distribution · 1984–2025</span><h3>94% male · 6% female</h3><div className="people-grid" aria-hidden="true">{Array.from({ length: 100 }, (_, i) => <span key={i} className={i < 94 ? 'person person-primary' : 'person person-secondary'}><svg viewBox="0 0 12 24"><circle cx="6" cy="4" r="3" /><path d="M2 9h8v8H8v7H4v-7H2z" /></svg></span>)}</div><p className="micro">Each symbol represents one percentage point, using the rounded shares reported in the PDF.</p><div className="sex-choices">{demographics.sex.map((r, i) => <button key={r.id} aria-pressed={i === sex} onClick={() => setSex(i)}><i style={{ background: i ? '#ffb7ae' : colors.ink }} /><span>{r.label}</span><strong>{i ? '6%' : '94%'}</strong></button>)}</div><p><strong>{number(sexRecord.value ?? 0)}</strong> {sexRecord.label.toLowerCase()} cases reported.</p><Note>{sexRecord.note}</Note><SourceLinks pages={[1]} /></div>
    <div className="quarter-age"><h3>Quarterly age figures</h3><p className="muted">Q2 2026 · 2,994 diagnoses, including 182 with no age recorded.</p><div className="mini-bars">{quarter.map(r => <button key={r.id} aria-pressed={selectedAge?.label === r.label} onClick={() => setSelectedAge(toSelection(r))}><span>{r.label}</span><div><i style={{ width: `${(r.value ?? 0) / 1294 * 100}%` }} /></div><strong>{number(r.value ?? 0)}</strong></button>)}</div>{selectedAge && <SelectionDetail selection={selectedAge} />}<p className="micro">The five known age groups total 2,812. DOH reports 182 more diagnoses with no age recorded.</p><SourceLinks pages={[4]} /><Disclosure label={<><BookOpen size={15} aria-hidden="true" /> Historical age-share figure</>}><p>Share of reported diagnoses by age group, 1984–June 2026. Individual percentages are unavailable.</p><img className="source-preview" src={`${import.meta.env.BASE_URL}source-pages/page-4.webp`} alt="Research report page 4 showing the share of diagnoses by age group from 1984 through June 2026." loading="lazy" /><a className="button" href={sourceUrl(4)}>Open original PDF</a></Disclosure></div></Reveal>
  </div></section>;
}

function Geography() {
  const [region, updateRegion] = useUrlState('region', 'ncr', regions.map(r => r.id));
  const selected = regions.find(r => r.id === region)!;
  return <section className="section section-geography"><div className="content-width">
    <SectionHeading eyebrow="The regional picture" icon={<Leaf size={18} />} title="Where diagnoses are reported" text="Cumulative diagnoses by region of residence and the distribution of newly reported diagnoses in late 2025." />
    <Reveal className="geography-grid"><div className="map-panel"><RegionMap selected={region} onSelect={updateRegion} /><SourceLinks pages={[2]} /></div><div className="region-ranking"><span className="eyebrow">Five regions in the source</span><h3>Where reported counts are concentrated</h3><p className="micro">Cumulative diagnoses by region of residence · January 1984–December 2025.</p><div className="region-rows">{regions.map((r, i) => <button key={r.id} className={r.id === region ? 'active' : ''} aria-pressed={r.id === region} onClick={() => updateRegion(r.id)}><span className="region-rank">{String(i + 1).padStart(2, '0')}</span><span className="region-name">{r.label}<i><b style={{ width: `${r.value / regions[0].value * 100}%` }} /></i></span><strong>{number(r.value)}</strong>{r.id === region && <Check size={16} />}</button>)}</div><SelectionDetail selection={toSelection(selected as Statistic)} /></div></Reveal>
    <Reveal className="region-discussion"><div className="sixty"><strong>60<span>%</span></strong><p>of Q4 2025 newly reported cases<br />across these five regions</p><small>2,562 cases · separate from the regional table</small></div><DiscussionBlock item={discussion('regions')} /></Reveal>
    <details className="data-disclosure"><summary>View the regional data table<ChevronDown size={15} /></summary><DataTable rows={regions as Statistic[]} caption="Five-region counts · January 1984–December 2025" onSelect={r => updateRegion(r.id)} /></details>
  </div></section>;
}

function Transmission() {
  const [mode, setMode] = useState('all');
  const [view, setView] = useState('count');
  const [periodId, setPeriodId] = useState('1984-2025');
  const [selection, setSelection] = useState<Selection | null>(null);
  const period = transmissionPeriods.find(p => p.id === periodId)!;
  const totalSexual = period.sexual[0] + period.sexual[1];
  const counts = mode === 'sexual' ? [period.maleMale, period.both, period.maleFemale[0] + period.maleFemale[1]] : [totalSexual, period.needles[0] + period.needles[1], period.motherChild[0] + period.motherChild[1], period.blood[0] + period.blood[1], period.needlestick[0] + period.needlestick[1]];
  const templates = mode === 'sexual' ? transmission.sexualBreakdown : transmission.summary;
  const rows: Statistic[] = templates.map((r, i) => ({ ...r, id: `${periodId}-${r.id}`, value: counts[i], period: period.label, denominator: mode === 'sexual' ? totalSexual : period.total, sourcePage: 3, status: 'transcribed' }));
  const values = rows.map(r => view === 'percent' ? (r.value ?? 0) / (r.denominator ?? 1) * 100 : r.value ?? 0);
  const sexTable = [
    { label: 'Sexual contact (all)', male: period.sexual[0], female: period.sexual[1] },
    { label: '↳ Male–male', male: period.maleMale, female: null },
    { label: '↳ Both males & females', male: period.both, female: null },
    { label: '↳ Male–female', male: period.maleFemale[0], female: period.maleFemale[1] },
    { label: 'Sharing of infected needles', male: period.needles[0], female: period.needles[1] },
    { label: 'Mother-to-child', male: period.motherChild[0], female: period.motherChild[1] },
    { label: 'Blood products', male: period.blood[0], female: period.blood[1] },
    { label: 'Needlestick injury', male: period.needlestick[0], female: period.needlestick[1] },
  ];
  return <section className="section section-transmission"><div className="content-width">
    <SectionHeading eyebrow="Transmission, with context" icon={<ShieldCheck size={18} />} title="Reported modes of transmission" text="Transmission categories describe recorded routes of exposure." />
    <Reveal className="chart-story"><ChartCard title={mode === 'sexual' ? 'Sexual-contact subcategories' : 'Reported modes of transmission'} subtitle={`${period.label} · denominator: ${number(mode === 'sexual' ? totalSexual : period.total)} ${mode === 'sexual' ? 'sexual-contact cases' : 'reported cases'}`} rows={rows} pages={[2, 3]} detail={<SelectionDetail selection={selection} />} onSelect={r => setSelection(toSelection(r))} tools={<><label className="service-filter"><span className="sr-only">Transmission reporting period</span><select value={periodId} onChange={e => { setPeriodId(e.target.value); setSelection(null); }}>{transmissionPeriods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select><ChevronDown size={14} /></label><Toggle value={mode} onChange={v => { setMode(v); setSelection(null); }} label="Transmission breakdown" options={[{ value: 'all', label: 'All listed modes' }, { value: 'sexual', label: 'Sexual contact details' }]} /><Toggle value={view} onChange={setView} label="Transmission units" options={[{ value: 'count', label: 'Count' }, { value: 'percent', label: 'Share' }]} /></>}>
      <Chart option={horizontalOption(rows.map(r => r.label), values, selection?.label, view === 'percent' ? '%' : 'cases')} description={`Reported transmission categories, ${period.label}. Denominator ${mode === 'sexual' ? totalSexual : period.total}. Listed modes do not exhaust the overall total.`} onSelect={p => setSelection(toSelection(rows[p.dataIndex]))} height={330} />
    </ChartCard><aside><div className="transmission-stat"><strong>{percent(totalSexual, period.total).slice(0, -1)}<span>%</span></strong><p>reported under sexual contact<br /><small>{period.label} · {number(totalSexual)} of {number(period.total)} cases in the transmission table</small></p></div><DiscussionBlock item={discussion('transmission')} /></aside></Reveal>
    <details className="data-disclosure transmission-detail"><summary>Explore the source table by sex<ChevronDown size={15} /></summary><p className="micro">{period.label} · period total {number(period.total)} · source table reports {number(period.male)} male and {number(period.female)} female cases. Subcategory rows are nested and must not be added again to the sexual-contact parent total. A dash means not applicable in the original table.</p><div className="table-scroll" tabIndex={0} role="region" aria-label="Transmission by sex"><table><caption>Transmission by sex · {period.label} · p. 3</caption><thead><tr><th scope="col">Mode of transmission</th><th scope="col">Male</th><th scope="col">Female</th></tr></thead><tbody>{sexTable.map(r => <tr key={r.label}><th scope="row">{r.label}</th><td>{number(r.male)}</td><td>{r.female === null ? '—' : number(r.female)}</td></tr>)}</tbody></table></div></details>
  </div></section>;
}

function Care() {
  const [selected, setSelected] = useState<Selection | null>(toSelection(care[4]));
  const reduced = useReducedMotion();
  return <section className="section section-care"><div className="content-width">
    <SectionHeading light eyebrow="From diagnosis to care" icon={<Heart size={18} />} title="The path from diagnosis to care" text="The national care cascade tracks diagnosis, treatment, viral load testing, and viral suppression." />
    <Reveal><ChartCard title="The national care cascade" subtitle="June 2026 · people · columns use the same count scale" rows={care} pages={[3]} onSelect={r => setSelected(toSelection(r))}>
      <div className="cascade">{care.map((r, i) => <button key={r.id} className={`cascade-stage ${selected?.label === r.label ? 'selected' : ''}`} aria-pressed={selected?.label === r.label} onClick={() => setSelected(toSelection(r))}><span className="cascade-value">{number(r.value ?? 0)}</span><span className="cascade-track"><motion.span className="cascade-bar" initial={false} animate={{ height: `${(r.value ?? 0) / 288000 * 100}%` }} style={{ background: [colors.light, '#98b9a0', colors.teal, '#68a084', colors.ink][i] }} transition={{ duration: reduced ? 0 : 0.4 }} /></span><strong>{r.label}</strong><span className="cascade-share">{r.denominator ? percent(r.value ?? 0, r.denominator) : 'Base estimate'}</span><small>{r.denominator ? `of ${i === 1 ? 'estimated PLHIV' : i === 2 ? 'diagnosed' : i === 3 ? 'people on ART' : 'those tested'}` : 'People living with HIV'}</small></button>)}</div>
    </ChartCard></Reveal>
    <Reveal className="care-story"><div className="care-highlight"><div className="suppression-ring"><span>97<small>%</small></span><Check size={24} /></div><div><span className="eyebrow">A critical distinction</span><h3>Suppression among<br />those tested.</h3><p>63,850 of 65,630 tested people were virally suppressed. This does not describe all people living with HIV.</p></div></div><SelectionDetail selection={selected} /></Reveal>
    <div className="care-context"><DiscussionBlock item={discussion('care')} /><PhotoTile file="testing-awareness.jpeg" alt="A gloved worker taking a small blood sample from a seated person wearing a red awareness ribbon." caption="Testing & awareness" /><PhotoTile file="community-testing.jpeg" alt="A gloved healthcare worker taking a blood sample from a seated person in a clinic." caption="Community testing" /></div>
    <details className="care-targets"><summary>95–95–95 targets<ChevronDown size={17} /></summary><p>The 95–95–95 targets describe a goal. They are separate from the observed cascade above.</p><div className="target-grid">{careTargets.targets.map(t => <div key={t.label}><span>{t.label}</span><strong>{number(t.value)}</strong><small>{t.note}</small></div>)}</div><div className="target-annotations">{careTargets.figureAnnotations.map(a => <p key={a.label}><span>{a.label}</span><strong>{number(a.value)}</strong></p>)}</div><p className="micro">{careTargets.note}</p><SourceLinks pages={[3]} /></details>
  </div></section>;
}

function Mortality() {
  const [selectedSummary, setSelectedSummary] = useState<Selection | null>(null);
  const [period, setPeriod] = useState('quarter');
  const [view, setView] = useState('count');
  const [selection, setSelection] = useState<Selection | null>(null);
  const rows = (period === 'quarter' ? mortality.quarter : mortality.cumulative) as Statistic[];
  const values = rows.map(r => view === 'percent' ? (r.value ?? 0) / (r.denominator ?? 1) * 100 : r.value ?? 0);
  return <section className="section section-mortality"><div className="content-width">
    <SectionHeading eyebrow="Reported outcomes" icon={<HeartHandshake size={18} />} title="Reported deaths and outcomes" text="Deaths from all causes among people diagnosed with HIV." />
    <Reveal className="mortality-top"><div className="mortality-main"><strong>352</strong><div><h3>reported deaths</h3><p>April–June 2026</p><SourceLinks pages={[3, 4]} /></div></div><p>Reported deaths fell by 9% compared with April–June 2025.</p></Reveal>
    <Reveal className="chart-story"><ChartCard title="Reported deaths by age" subtitle={period === 'quarter' ? 'Q2 2026 · denominator: 352 reported deaths' : 'January 1984–June 2026 · denominator: 11,069 reported deaths'} rows={rows} pages={[3, 4]} detail={<SelectionDetail selection={selection} />} onSelect={r => setSelection(toSelection(r))} tools={<><Toggle value={period} onChange={v => { setPeriod(v); setSelection(null); }} label="Mortality reporting period" options={[{ value: 'quarter', label: 'Q2 2026' }, { value: 'cumulative', label: 'Cumulative' }]} /><Toggle value={view} onChange={setView} label="Mortality chart units" options={[{ value: 'count', label: 'Count' }, { value: 'percent', label: 'Share' }]} /></>}>
      <Chart option={horizontalOption(rows.map(r => r.label), values, selection?.label, view === 'percent' ? '%' : 'deaths', colors.burgundy)} description={`Reported deaths by age, ${period === 'quarter' ? 'Q2 2026' : 'cumulative from January 1984 through June 2026'}. These are counts, not mortality rates.`} onSelect={p => setSelection(toSelection(rows[p.dataIndex]))} height={330} />
    </ChartCard><aside><DiscussionBlock item={discussion('mortality')} /></aside></Reveal>
    <PhotoTile file="hospital-care.jpeg" alt="A person receiving bedside care while lying on a bed with an oxygen mask and tubing visible." caption="Bedside care" className="outcomes-photo" /><Reveal className="mortality-summaries">{mortality.summaries.map(r => <button key={r.id} aria-pressed={selectedSummary?.label === r.label} onClick={() => setSelectedSummary(toSelection(r as Statistic))}><span>{r.label}</span><strong>{number(r.value)}</strong><small>{r.period}</small>{r.id === 'ahd' && <span className="status-label">Source reports 32%; denominator unclear</span>}{r.id === 'ahd-deaths' && <small>47% as rounded in source</small>}</button>)}</Reveal>
    {selectedSummary && <SelectionDetail selection={selectedSummary} />}
  </div></section>;
}

function Response() {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('All');
  const [service, setService] = useState('All services');
  const filtered = initiatives.filter(r => (kind === 'All' || r.kind === kind) && (service === 'All services' || r.services.includes(service)) && `${r.name} ${r.focus} ${r.detail} ${r.services.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const reset = () => { setQuery(''); setKind('All'); setService('All services'); };
  return <section className="section section-response"><div className="content-width">
    <SectionHeading eyebrow="The response is collective" icon={<Sparkles size={18} />} title="Treatment and community programs" text="Public programs and community organizations working on HIV prevention, testing, treatment, and support." />
    <Reveal className="benefit-panel"><div className="benefit-title"><span className="eyebrow">Treatment coverage</span><h3>PhilHealth outpatient HIV benefit</h3><p>PhilHealth’s December 2025 update expanded annual coverage for antiretroviral therapy and outpatient HIV care.</p><SourceLinks pages={[5]} /></div><div className="benefit-graphic"><div className="benefit-amount"><span>Previous benefit</span><strong>₱30,000</strong><i style={{ width: '51.3%' }} /></div><div className="benefit-amount benefit-current"><span>Enhanced annual benefit</span><strong>₱58,500</strong><i style={{ width: '100%' }} /></div><span className="benefit-badge">+95%</span><p className="micro">Annual benefit amounts · <a href="https://www.philhealth.gov.ph/news/up/article/2025/news_692e3134d8786.php">PhilHealth coverage details</a></p></div></Reveal>
    <PhotoTile file="community-walk.jpeg" alt="A street procession carrying a rainbow flag and a banner reading A Walk to End AIDS by 2030." caption="Community action · A Walk to End AIDS" className="community-photo" /><Reveal><div className="initiatives-header"><div><h3>Government and community initiatives</h3></div><span className="leaf-symbol" aria-hidden="true"><HeartHandshake size={38} /></span></div>
    <div className="initiative-filters"><label className="search-box"><Search size={18} /><span className="sr-only">Search initiatives</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search programs, services, organizations…" />{query && <button className="icon-button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}</label><Toggle value={kind} onChange={setKind} label="Organization type" options={[{ value: 'All', label: 'All' }, { value: 'Government', label: 'Government' }, { value: 'Community', label: 'Community' }]} /><label className="service-filter"><span className="sr-only">Filter by service</span><select value={service} onChange={e => setService(e.target.value)}>{['All services', 'Testing', 'Treatment', 'Prevention', 'Education', 'Rights', 'Support'].map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={14} /></label></div>
    <p className="results-count" role="status">{filtered.length} {filtered.length === 1 ? 'initiative' : 'initiatives'} shown</p>
    <div className="initiative-grid">{filtered.map(r => <details className="initiative-card" key={r.id}><summary className="initiative-toggle"><span className="initiative-kind">{r.kind}</span><span className="initiative-name">{r.name}</span><span className="initiative-focus">{r.focus}</span><span className="initiative-expand">Initiative details<ChevronDown size={16} aria-hidden="true" /></span></summary><div className="initiative-detail"><p>{r.detail}</p><div className="tags">{r.services.map(s => <span key={s}>{s}</span>)}</div><SourceLinks pages={[r.page]} /></div></details>)}</div>
    {!filtered.length && <div className="empty-results"><Search size={26} /><h4>No matching initiatives</h4><p>Try a different name or service.</p><button className="button" onClick={reset}>Clear filters</button></div>}
    </Reveal>
  </div></section>;
}

function SourceNotes() {
  return <section className="section section-sources"><div className="content-width"><div className="board-source-strip"><span><BookOpen size={16} /> LCFAITH research document · 7 pages</span><a href={sourceUrl()}>Open original PDF</a></div><div className="source-notes"><div className="source-heading"><BookOpen size={24} aria-hidden="true" /><h2>Sources, definitions &amp; data notes</h2></div><p className="source-intro">Research reference: <em>{sources.title}</em>. References include surveillance reports from the Philippine Department of Health and PhilHealth’s benefit announcement.</p>
    <div className="source-reference-grid">{sources.references.map(r => <div key={r.title}><h3>{r.title}</h3><p>{r.detail}</p><small>Source document · pp. {r.pages}</small>{'url' in r && r.url && <a href={r.url}>Read {r.title}</a>}</div>)}</div>
    <section className="source-audit"><h3>Data notes &amp; source discrepancies</h3><div>{sources.discrepancies.map(d => <article key={d.title}><h4>{d.title}</h4><p>{d.detail}</p><small>Source pages {d.pages}</small></article>)}</div></section>
    <section className="source-audit"><h3>Definitions</h3><div className="definitions"><p><strong>PLHIV:</strong> people living with HIV. <strong>ART:</strong> antiretroviral therapy. <strong>AHD:</strong> advanced HIV disease. <strong>PrEP / PEP:</strong> pre-exposure / post-exposure prophylaxis.</p><p><strong>Counts and shares:</strong> values are shown in their original reporting periods. Calculated shares identify their denominator and are rounded to one decimal place. Source-reported percentages may differ due to rounding or unresolved discrepancies.</p><p><strong>Regional counts:</strong> totals by region of residence. Comparisons of prevalence require regional population figures.</p></div></section>
    </div></div></section>;
}

export default function App() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 130, damping: 28 });
  const reduced = useReducedMotion();
  return <><motion.div className="reading-progress" style={{ scaleX: reduced ? scrollYProgress : smooth }} aria-hidden="true" />
    <a className="skip-link" href="#story">Skip introduction</a>
    <main>
      <header className="board-header"><div className="board-credit"><span className="brand"><span className="brand-mark" aria-hidden="true">✳</span> LCFAITH</span><span>PHILIPPINES · AN INTERACTIVE RESEARCH INFOGRAPHIC</span></div><div className="board-title-row"><div><h1>HIV diagnoses in the Philippines</h1><p className="board-caveat">National trends, demographics, transmission, and access to HIV care through June 2026.</p></div><div className="board-stickers"><div className="stat-sticker sticker-teal"><span>2025 reported diagnoses</span><strong>19,764</strong><SourceLinks pages={[1]} /></div><div className="stat-sticker sticker-peach"><span>Median age at diagnosis</span><strong>28 <small>years</small></strong><SourceLinks pages={[1]} /></div></div></div></header>
      <div id="story" tabIndex={-1}><Trends /><Age /><Geography /><Transmission /><Care /><Mortality /><Response /><SourceNotes /></div>
    </main><footer className="footer"><div className="content-width"><span className="brand">LCFAITH</span><p>Philippine HIV surveillance and community response</p></div></footer>
  </>;
}
