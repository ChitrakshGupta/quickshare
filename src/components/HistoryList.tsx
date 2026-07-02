import { useState, useEffect } from 'react';
import { 
  Clipboard, Check, Trash2, ExternalLink, History, 
  Flame, Terminal, Clock 
} from 'lucide-react';
import { getHistory, removeFromHistory } from '../utils/history';
import type { HistoryItem } from '../utils/history';
import { copyTextToClipboard } from '../utils/clipboard';

interface HistoryListProps {
  onSelectCode: (code: string) => void;
}

export default function HistoryList({ onSelectCode }: HistoryListProps) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadHistory = () => {
    setHistoryItems(getHistory());
  };

  useEffect(() => {
    loadHistory();
    // Also sync if another tab/action modifies localStorage
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, []);

  const handleDelete = (code: string) => {
    removeFromHistory(code);
    loadHistory();
  };

  const handleCopy = (code: string) => {
    const link = `${window.location.origin}?code=${code}`;
    const success = copyTextToClipboard(link);
    if (success) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
        <History className="w-5 h-5 text-purple-500" />
        <h2 className="text-md font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Recent Share History
        </h2>
      </div>

      {historyItems.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 border border-slate-200 dark:border-slate-800 animate-slide-up shadow-md">
          <Terminal className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="font-semibold text-sm">No recent shares found</p>
          <p className="text-xs text-slate-400 mt-1">Snippets you generate or view on this device will be listed here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
          {historyItems.map((item) => (
            <div 
              key={item.code} 
              className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-4 shadow-sm relative group"
            >
              {/* Header: Code & Type Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-black text-xs">
                    {item.code.toUpperCase()}
                  </span>
                  {item.isOneTime && (
                    <span className="flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[10px] font-bold">
                      <Flame className="w-3 h-3" />
                      <span>One-time</span>
                    </span>
                  )}
                </div>
                
                <span className="text-[10px] font-medium text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(item.timestamp)}</span>
                </span>
              </div>

              {/* Body: Preview Content */}
              <div className="text-sm font-mono text-slate-650 dark:text-slate-350 bg-slate-100/30 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200/30 dark:border-slate-850 line-clamp-2 min-h-[50px] overflow-hidden break-all">
                {item.preview}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-850 pt-3">
                <button
                  onClick={() => onSelectCode(item.code)}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View paste</span>
                </button>

                <div className="flex space-x-1.5">
                  {/* Copy Link */}
                  <button
                    onClick={() => handleCopy(item.code)}
                    className={`p-2 rounded-xl border transition-colors ${
                      copiedCode === item.code 
                        ? 'bg-green-500/10 border-green-500 text-green-500' 
                        : 'bg-white dark:bg-slate-800 hover:bg-purple-500/10 hover:text-purple-500 border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400'
                    }`}
                    title="Copy Share Link"
                  >
                    {copiedCode === item.code ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>

                  {/* Remove from list */}
                  <button
                    onClick={() => handleDelete(item.code)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-red-500/10 text-slate-550 dark:text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-750 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
