import { useState, useEffect } from 'react';
import { 
  PlusCircle, Search, Radio, History, 
  Moon, Sun, Share2, Terminal, ArrowRight 
} from 'lucide-react';
import CreatePaste from './components/CreatePaste';
import RetrievePaste from './components/RetrievePaste';
import LiveRoom from './components/LiveRoom';
import HistoryList from './components/HistoryList';
import LandingPage from './components/LandingPage';

type Tab = 'create' | 'retrieve' | 'live' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Default to dark mode for rich premium aesthetic
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Handle URL deep links: e.g. /?code=X4P9 or /?tab=live&room=L-ROOM
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const tabParam = params.get('tab');

    if (codeParam) {
      setSelectedCode(codeParam);
      setActiveTab('retrieve');
      setShowWorkspace(true);
    } else if (tabParam === 'live') {
      setActiveTab('live');
      setShowWorkspace(true);
    }
  }, []);

  const handleSelectCode = (code: string) => {
    setSelectedCode(code);
    setActiveTab('retrieve');
    const newUrl = `${window.location.origin}?code=${code}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleClearCode = () => {
    setSelectedCode(null);
    const newUrl = window.location.origin;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab !== 'retrieve') {
      handleClearCode();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 bg-grid-pattern transition-colors duration-300 relative overflow-x-hidden pb-12">
      
      {/* Premium background glowing circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => { setShowWorkspace(false); handleClearCode(); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
              <Share2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350 bg-clip-text text-transparent">
                QuickShare
              </h1>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                Instant Share Core
              </p>
            </div>
          </div>

          {/* Central Navigation Tabs (Only in Workspace mode) */}
          {showWorkspace ? (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-850">
              <button
                onClick={() => handleTabChange('create')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'create'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                    : 'text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Share paste</span>
              </button>
              <button
                onClick={() => handleTabChange('retrieve')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'retrieve'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                    : 'text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Retrieve clip</span>
              </button>
              <button
                onClick={() => handleTabChange('live')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'live'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                    : 'text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Live Sync</span>
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                    : 'text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>My History</span>
              </button>
            </nav>
          ) : (
            <button
              onClick={() => { setShowWorkspace(true); setActiveTab('create'); }}
              className="hidden md:flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-purple-500/10"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Right Header Toolbar: Dark/Light Mode, Github Link */}
          <div className="flex items-center space-x-2">
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-850"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-850"
            >
              <Terminal className="w-5 h-5" />
            </a>
          </div>

        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-6xl mx-auto px-4 pt-10">
        
        {!showWorkspace ? (
          <LandingPage onStartSharing={() => { setShowWorkspace(true); setActiveTab('create'); }} />
        ) : (
          <>
            {/* Mobile Navigation Bar */}
            <div className="md:hidden flex justify-around items-center bg-white/80 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-905 p-2 rounded-2xl mb-8 shadow-md animate-slide-up">
              <button 
                onClick={() => handleTabChange('create')}
                className={`flex flex-col items-center p-2 rounded-xl text-[10px] font-bold ${activeTab === 'create' ? 'text-purple-500' : 'text-slate-500'}`}
              >
                <PlusCircle className="w-5 h-5 mb-1" />
                <span>Create</span>
              </button>
              <button 
                onClick={() => handleTabChange('retrieve')}
                className={`flex flex-col items-center p-2 rounded-xl text-[10px] font-bold ${activeTab === 'retrieve' ? 'text-purple-500' : 'text-slate-500'}`}
              >
                <Search className="w-5 h-5 mb-1" />
                <span>Retrieve</span>
              </button>
              <button 
                onClick={() => handleTabChange('live')}
                className={`flex flex-col items-center p-2 rounded-xl text-[10px] font-bold ${activeTab === 'live' ? 'text-purple-500' : 'text-slate-500'}`}
              >
                <Radio className="w-5 h-5 mb-1 animate-pulse" />
                <span>Live Sync</span>
              </button>
              <button 
                onClick={() => handleTabChange('history')}
                className={`flex flex-col items-center p-2 rounded-xl text-[10px] font-bold ${activeTab === 'history' ? 'text-purple-500' : 'text-slate-500'}`}
              >
                <History className="w-5 h-5 mb-1" />
                <span>History</span>
              </button>
            </div>

            {/* Render Active Tab Component */}
            <div className="min-h-[450px]">
              {activeTab === 'create' && (
                <CreatePaste onSuccess={handleSelectCode} />
              )}

              {activeTab === 'retrieve' && (
                <RetrievePaste 
                  initialCode={selectedCode} 
                  onClearCode={handleClearCode} 
                />
              )}

              {activeTab === 'live' && (
                <LiveRoom />
              )}

              {activeTab === 'history' && (
                <HistoryList onSelectCode={handleSelectCode} />
              )}
            </div>
          </>
        )}

      </main>

      {/* Footer Info */}
      <footer className="mt-16 text-center text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto space-y-2">
        <div className="flex justify-center space-x-2 items-center text-slate-500">
          <Terminal className="w-4 h-4" />
          <span className="font-mono">QuickShare Engine v1.0.0</span>
        </div>
        <p>Built with React, WebSockets, Express and Redis.</p>
      </footer>

    </div>
  );
}
