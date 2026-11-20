import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { AriaComponent, GridComponent, DataZoomComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import { useReducedMotion } from 'motion/react';

echarts.use([BarChart, AriaComponent, GridComponent, DataZoomComponent, SVGRenderer]);

export type ChartClick = { dataIndex: number; seriesIndex: number; name: string };
export default function Chart({ option, onSelect, description, height = 340 }: { option: EChartsOption; onSelect?: (p: ChartClick) => void; description: string; height?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const instance = useRef<ReturnType<typeof echarts.init> | null>(null);
  const handler = useRef(onSelect);
  handler.current = onSelect;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!root.current) return;
    const chart = echarts.init(root.current, undefined, { renderer: 'svg' });
    instance.current = chart;
    chart.on('click', params => handler.current?.({ dataIndex: params.dataIndex, seriesIndex: params.seriesIndex ?? 0, name: params.name }));
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(root.current);
    return () => { observer.disconnect(); chart.dispose(); instance.current = null; };
  }, []);
  useEffect(() => {
    instance.current?.setOption({ ...option, animation: !reduced, animationDuration: 500, animationDurationUpdate: 350, textStyle: { fontFamily: 'Gravitica, Segoe UI, sans-serif', fontSize: 14 }, aria: { enabled: true, description } }, { notMerge: true });
  }, [option, description, reduced]);
  return <div ref={root} className="echart" style={{ height }} role="img" aria-label={`${description} Use the data table below for keyboard selection and exact values.`} />;
}

export const colors = { ink: '#283d42', teal: '#00a99a', light: '#b8e1dd', lime: '#cdc884', orange: '#f47e55', muted: '#69777a', grid: '#e5eceb', burgundy: '#f16a73' };

export function horizontalOption(labels: string[], values: number[], selected = '', unit = 'cases', color = colors.teal): EChartsOption {
  const percentages = unit === '%';
  return {
    grid: { left: 10, right: 65, top: 12, bottom: 26, containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: colors.muted, formatter: (v: number) => percentages ? `${v}%` : v >= 1000 ? `${v / 1000}k` : `${v}` }, splitLine: { lineStyle: { color: colors.grid, type: 'dashed' } } },
    yAxis: { type: 'category', inverse: true, data: labels, axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: colors.ink, width: 130, overflow: 'break', fontSize: 14 } },
    series: [{ type: 'bar', barMaxWidth: 27, itemStyle: { borderRadius: [0, 5, 5, 0] }, data: values.map((value, i) => ({ value, itemStyle: { color: selected === labels[i] ? colors.orange : color, opacity: selected && selected !== labels[i] ? 0.5 : 1 } })), label: { show: true, position: 'right', color: colors.ink, fontSize: 14, formatter: p => percentages ? `${Number(p.value).toFixed(1)}%` : Number(p.value).toLocaleString('en-PH') }, emphasis: { itemStyle: { color: colors.orange } } }],
  };
}
