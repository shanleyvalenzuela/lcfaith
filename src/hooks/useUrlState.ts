import { useCallback, useEffect, useState } from 'react';

export function useUrlState(key: string, fallback: string, allowed?: string[]) {
  const read = useCallback(() => {
    const value = new URLSearchParams(window.location.search).get(key);
    return value !== null && (!allowed || allowed.includes(value)) ? value : fallback;
  }, [key, fallback, allowed?.join('|')]);
  const [value, setValue] = useState(read);
  useEffect(() => { const listener = () => setValue(read()); window.addEventListener('popstate', listener); return () => window.removeEventListener('popstate', listener); }, [read]);
  const update = (next: string) => {
    setValue(next);
    const url = new URL(window.location.href);
    if (next === fallback) url.searchParams.delete(key); else url.searchParams.set(key, next);
    window.history.replaceState(null, '', url);
  };
  return [value, update] as const;
}
