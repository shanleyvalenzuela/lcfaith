import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronDown, Info, Maximize2, Minimize2, Table2 } from 'lucide-react';
import type { Discussion, Selection, Statistic } from '../types';

export const number = (n: number) => new Intl.NumberFormat('en-PH').format(n);
export const percent = (n: number, d: number) => `${(n / d * 100).toFixed(1)}%`;

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: 0.45 }}>{children}</motion.div>;
}

export function Disclosure({ label, children, className = '' }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <details className={`disclosure ${className}`}>
      <summary>{label}<ChevronDown className="disclosure-chevron" size={16} aria-hidden="true" /></summary>
      <div className="disclosure-content">{children}</div>
    </details>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <div className="note"><Info size={15} aria-hidden="true" /><div><strong>Data note</strong><div>{children}</div></div></div>;
}

export function DiscussionBlock({ item }: { item: Discussion }) {
  return (
    <div className="discussion">
      <div className="eyebrow">Discussion &amp; context</div>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
      <div className="discussion-limit">
        <h4>How to read this</h4>
        <p>{item.limit}</p>
      </div>
    </div>
  );
}

export function SelectionDetail({ selection }: { selection: Selection | null }) {
  return (
    <div className="selection-detail">
      <div aria-live="polite" aria-atomic="true">
        {selection ? <>
          <h4>{selection.label}</h4>
          <strong>{number(selection.value)} <small>{selection.unit}</small></strong>
          <p>{selection.period}</p>
          {selection.denominator && <p>{percent(selection.value, selection.denominator)} of {number(selection.denominator)}</p>}
          {selection.note && <p className="selection-note">{selection.note}</p>}
        </> : <span className="selection-hint"><Info size={14} aria-hidden="true" /> Select a value for details</span>}
      </div>
      {selection?.sourceLink && <p><a href={selection.sourceLink}>Read the DOH surveillance report</a></p>}
    </div>
  );
}

export function PhotoTile({ file, alt, caption, className = '' }: { file: string; alt: string; caption: string; className?: string }) {
  const path = `${import.meta.env.BASE_URL}photos/${file}`;
  return (
    <figure className={`photo-tile ${className}`}>
      <figcaption>{caption}</figcaption>
      <details className="photo-details">
        <summary>
          <img src={path} alt={alt} loading="lazy" />
          <span className="photo-expand"><Maximize2 size={14} aria-hidden="true" /> View full photo</span>
          <span className="photo-collapse"><Minimize2 size={14} aria-hidden="true" /> Collapse photo</span>
        </summary>
      </details>
    </figure>
  );
}

export function DataTable({ rows, onSelect, caption }: { rows: Statistic[]; onSelect?: (s: Statistic) => void; caption: string }) {
  return <div className="table-scroll" tabIndex={0} role="region" aria-label={`${caption} table`}><table><caption>{caption}</caption><thead><tr><th scope="col">Category</th><th scope="col">Value</th><th scope="col">Period / notes</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><th scope="row">{onSelect && r.value !== null ? <button onClick={() => onSelect(r)}>{r.label}</button> : r.label}</th><td>{r.value === null ? 'Not provided' : `${number(r.value)} ${r.unit}`}{r.denominator && r.value !== null && <small>{percent(r.value, r.denominator)} of {number(r.denominator)}</small>}</td><td>{r.period}{r.status === 'conflicting' && <span className="status-label">Source discrepancy</span>}{r.note && <small>{r.note}</small>}</td></tr>)}</tbody></table></div>;
}

export function ChartCard({ title, subtitle, children, rows, onSelect, tools, detail }: {
  title: string; subtitle: string; children: ReactNode; rows: Statistic[]; onSelect?: (s: Statistic) => void; tools?: ReactNode; detail?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`chart-card${expanded ? ' is-expanded' : ''}`}>
      <div className="chart-heading">
        <div><h3>{title}</h3><p>{subtitle}</p></div>
        <button className="icon-button" aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
      <div className="chart-tools">{tools}</div>
      {children}
      {detail}
      <Disclosure className="data-disclosure" label={<><Table2 size={15} aria-hidden="true" /> View data table</>}>
        <DataTable rows={rows} onSelect={onSelect} caption={title} />
      </Disclosure>
    </div>
  );
}

export function Toggle({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string }) {
  return <div className="segmented" role="group" aria-label={label}>{options.map(o => <button key={o.value} aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>)}</div>;
}
