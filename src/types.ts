export type Status = 'transcribed' | 'conflicting' | 'missing';
export type Statistic = {
  id: string; label: string; value: number | null;
  unit: string; period: string; denominator?: number;
  sourcePage: number; status: Status; note?: string; sourceLink?: string;
};
export type Discussion = {
  id: string; title: string; text: string; limit: string;
  statisticIds: string[]; pages: number[];
};
export type Selection = {
  label: string; value: number; unit: string;
  period: string; note?: string; sourceLink?: string; denominator?: number;
};
