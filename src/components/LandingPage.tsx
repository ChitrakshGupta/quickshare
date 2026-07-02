import { 
  Share2, Shield, Zap, Lock, EyeOff, Radio, 
  QrCode, ArrowRight, Check, Sparkles, FileText, History
} from 'lucide-react';

interface LandingPageProps {
  onStartSharing: () => void;
}

export default function LandingPage({ onStartSharing }: LandingPageProps) {
  return (
    <div className="space-y-24 pb-20 animate-slide-up">
      
      {/* 1. HERO SECTION */}
      <section className="text-center max-w-4xl mx-auto pt-10 space-y-6 relative">
        <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>

        {/* Promo Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-sm animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>QuickShare v1.0.0 is Live</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] bg-gradient-to-r from-slate-900 via-purple-700 to-indigo-850 dark:from-white dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
          Share Code & Text Snippets. <br />
          <span className="text-purple-600 dark:text-purple-450">Instantly. Securely.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-md sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          QuickShare is an enterprise-grade sharing platform. Paste your code, commands, or notes, lock them with passwords, and generate a unique 4-character code to share instantly across all devices.
        </p>

        {/* Action Button */}
        <div className="pt-6 flex justify-center space-x-4">
          <button
            onClick={onStartSharing}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-md shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 flex items-center space-x-2 group cursor-pointer"
          >
            <span>Start Sharing Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* App Preview Mockup */}
        <div className="pt-14 max-w-3xl mx-auto">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 p-3 shadow-2xl relative">
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none z-10"></div>
            
            {/* Fake Dashboard Layout */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800 text-left shadow-md">
              <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-250/50 dark:border-slate-800">
                <div className="flex space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-350 dark:bg-slate-700"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-350 dark:bg-slate-700"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-350 dark:bg-slate-700"></span>
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-400">quickshare.dev/workspace</div>
                <div className="w-8"></div>
              </div>
              <div className="p-6 space-y-4">
                <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
                <div className="space-y-2 font-mono text-xs text-slate-400">
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-900 rounded"></div>
                  <div className="h-4 w-4/6 bg-slate-100 dark:bg-slate-900 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Workflow</h2>
          <p className="text-2xl font-black text-slate-850 dark:text-slate-100">Three Steps. Instant Retrieve.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-3 relative">
            <span className="text-5xl font-black text-purple-500/10 dark:text-purple-500/5 absolute right-4 top-4">01</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Paste Your Content</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drag in text files, paste passwords, codes, logs, notes or configurations directly into the editor workspace.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-3 relative">
            <span className="text-5xl font-black text-purple-500/10 dark:text-purple-500/5 absolute right-4 top-4">02</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Set Expiry & Locks</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Configure snippet expiry timers (1 min to 1 day), encrypt with AES keys, or toggle "Burn after reading" views.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-3 relative">
            <span className="text-5xl font-black text-purple-500/10 dark:text-purple-500/5 absolute right-4 top-4">03</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Instant Access Code</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate a 4-digit code and a QR code. Input the short code on another device to fetch and display the content.
            </p>
          </div>

        </div>
      </section>

      {/* 3. PRODUCT FEATURES */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Capabilities</h2>
          <p className="text-2xl font-black text-slate-850 dark:text-slate-100">Powerful sharing tools</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 space-y-2">
            <Shield className="w-6 h-6 text-purple-500" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Secure AES Cryptography</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Lock your shares with passwords. Payloads are checked and verified using industry standard hashing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 space-y-2">
            <EyeOff className="w-6 h-6 text-purple-500" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Burn After Reading</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enable one-time access view. The backend deletes the share from storage immediately after it is opened once.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 space-y-2">
            <Zap className="w-6 h-6 text-purple-500" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Configurable Expiration</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Set snippets to self-destruct. Displays live ticking countdown timers before closing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 space-y-2">
            <FileText className="w-6 h-6 text-purple-500" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">P2P File Transfer</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload documents, logs, images or spreadsheets up to 5MB. Images are previewed directly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 space-y-2">
            <Radio className="w-6 h-6 text-purple-500" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Live WebSocket Sync</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Open a collaborative workspace. Changes synchronize instantly between all connected devices.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 space-y-2">
            <History className="w-6 h-6 text-purple-500" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Recent History Logs</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Stores previously shared and retrieved snippet lists in your local browser cache for ease.
            </p>
          </div>

        </div>
      </section>

      {/* 4. PRICING PLANS */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Plans</h2>
          <p className="text-2xl font-black text-slate-850 dark:text-slate-100">Simple, transparent pricing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Free Tier */}
          <div className="glass-panel rounded-3xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-md relative">
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-bold text-slate-850 dark:text-slate-250">Standard Core</h4>
                <p className="text-[10px] text-slate-450 mt-0.5">Great for quick local transfers</p>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">
                $0 <span className="text-xs text-slate-500 font-normal">/ forever</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-650 dark:text-slate-350 border-t border-slate-200 dark:border-slate-850 pt-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Uncapped text snippets sharing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>4-digit short sharing codes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Up to 5MB file uploads</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>In-Memory database fallback</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={onStartSharing}
              className="w-full mt-8 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="glass-panel rounded-3xl p-8 border-2 border-purple-500 flex flex-col justify-between shadow-lg relative bg-purple-500/5">
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-purple-500 text-white font-bold text-[9px] uppercase tracking-wider">
              Popular
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-bold text-slate-850 dark:text-slate-250">Enterprise Pro</h4>
                <p className="text-[10px] text-slate-450 mt-0.5">Advanced sharing & analytics</p>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">
                $5 <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-650 dark:text-slate-350 border-t border-slate-200 dark:border-slate-850 pt-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Persistent database (Redis Cluster)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Longer TTL limits (up to 30 days)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Usage analytics & clicks tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Custom vanity URLs & short links</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={onStartSharing}
              className="w-full mt-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-md shadow-purple-500/10 cursor-pointer"
            >
              Unlock Pro Features
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
