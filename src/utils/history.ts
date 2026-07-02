export interface HistoryItem {
  code: string;
  preview: string;
  timestamp: number;
  type: 'text' | 'file';
  fileName?: string | null;
  expiresIn: number;
  isOneTime: boolean;
}

const HISTORY_KEY = 'quickshare_history';

export function getHistory(): HistoryItem[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

export function addToHistory(item: HistoryItem): void {
  const history = getHistory();
  const filtered = history.filter((i) => i.code !== item.code);
  filtered.unshift(item);
  saveHistory(filtered.slice(0, 15)); // Keep last 15 items
}

export function removeFromHistory(code: string): void {
  const history = getHistory();
  saveHistory(history.filter((i) => i.code !== code));
}
