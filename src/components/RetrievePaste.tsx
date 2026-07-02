import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { 
  Search, Clipboard, Check, Lock, Shield, Flame, 
  FileText, Download, Timer, AlertCircle, RefreshCw, QrCode
} from 'lucide-react';
import { getShare, verifyPassword } from '../services/api';
import { addToHistory } from '../utils/history';
import { copyTextToClipboard } from '../utils/clipboard';
import { QRCodeSVG } from 'qrcode.react';

interface RetrievePasteProps {
  initialCode?: string | null;
  onClearCode?: () => void;
}

export default function RetrievePaste({ initialCode, onClearCode }: RetrievePasteProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [retrievedContent, setRetrievedContent] = useState<string | null>(null);
  const [language, setLanguage] = useState('text');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isOneTime, setIsOneTime] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  
  // Password lock state
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isCopied, setIsCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (expiresIn !== null && expiresIn > 0) {
      countdownTimerRef.current = setInterval(() => {
        setExpiresIn(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownTimerRef.current!);
            setRetrievedContent(null);
            setError('This snippet has expired');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [expiresIn]);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      fetchPaste(initialCode);
    }
  }, [initialCode]);

  const fetchPaste = async (searchCode: string) => {
    if (!searchCode.trim()) return;

    setIsLoading(true);
    setError(null);
    setRetrievedContent(null);
    setRequiresPassword(false);
    setPasswordError(null);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    const res = await getShare(searchCode);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.requiresPassword) {
      setRequiresPassword(true);
      setExpiresIn(res.expiresIn || null);
      setFileName(res.fileName || null);
      setFileType(res.fileType || null);
    } else if (res.content) {
      setRetrievedContent(res.content);
      setLanguage(res.language || 'text');
      setFileName(res.fileName || null);
      setFileType(res.fileType || null);
      setIsOneTime(res.isOneTime || false);
      setExpiresIn(res.expiresIn || null);

      const preview = res.fileName 
        ? `📄 File: ${res.fileName}` 
        : res.content.substring(0, 60) + (res.content.length > 60 ? '...' : '');

      addToHistory({
        code: searchCode,
        preview,
        timestamp: Date.now(),
        type: res.fileName ? 'file' : 'text',
        fileName: res.fileName,
        expiresIn: res.expiresIn || 0,
        isOneTime: res.isOneTime || false
      });
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    setIsLoading(true);
    setPasswordError(null);

    const res = await verifyPassword(code, password);
    setIsLoading(false);

    if (res.error) {
      setPasswordError(res.error);
    } else if (res.content) {
      setRequiresPassword(false);
      setRetrievedContent(res.content);
      setLanguage(res.language || 'text');
      setFileName(res.fileName || null);
      setFileType(res.fileType || null);
      setIsOneTime(res.isOneTime || false);
      setExpiresIn(res.expiresIn || null);

      const preview = res.fileName 
        ? `📄 File: ${res.fileName}` 
        : res.content.substring(0, 60) + (res.content.length > 60 ? '...' : '');

      addToHistory({
        code,
        preview,
        timestamp: Date.now(),
        type: res.fileName ? 'file' : 'text',
        fileName: res.fileName,
        expiresIn: res.expiresIn || 0,
        isOneTime: res.isOneTime || false
      });
    }
  };

  const copyToClipboard = () => {
    if (!retrievedContent) return;
    const textToCopy = fileType && retrievedContent.startsWith('data:') 
      ? `[File Share] ${fileName}` 
      : retrievedContent;

    const success = copyTextToClipboard(textToCopy);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      setError('Failed to copy content to clipboard');
    }
  };

  const downloadFile = () => {
    if (!retrievedContent) return;
    
    const link = document.createElement('a');
    if (retrievedContent.startsWith('data:')) {
      link.href = retrievedContent;
    } else {
      const blob = new Blob([retrievedContent], { type: fileType || 'text/plain' });
      link.href = URL.createObjectURL(blob);
    }
    
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (sec: number | null) => {
    if (sec === null) return 'unknown';
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const getHighlightedCodeHtml = (raw: string, lang: string) => {
    if (lang === 'text') return escapeHtml(raw);

    const keywords = {
      javascript: /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|import|export|from|class|extends|new|this|async|await|try|catch|finally|throw)\b/g,
      typescript: /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|import|export|from|class|extends|new|this|async|await|try|catch|finally|throw|type|interface|any|string|number|boolean|void|never|unknown|as)\b/g,
      python: /\b(def|return|if|elif|else|for|while|in|import|from|as|class|try|except|finally|raise|and|or|not|is|None|True|False|lambda|with|assert|pass|break|continue)\b/g,
      rust: /\b(fn|let|mut|pub|use|mod|impl|struct|enum|trait|return|if|else|match|for|while|loop|break|continue|async|await|const|static|type|ref|self|Self)\b/g,
      go: /\b(func|package|import|var|const|type|struct|interface|return|if|else|for|range|switch|case|select|chan|go|map|nil|defer|panic|recover)\b/g,
      cpp: /\b(int|float|double|char|bool|void|class|struct|public|private|protected|virtual|override|return|if|else|for|while|do|switch|case|break|continue|new|delete|const|static|namespace|using|include)\b/g,
      sql: /\b(SELECT|FROM|WHERE|INSERT|INTO|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|LIMIT|CREATE|TABLE|DROP|INDEX|ALTER)\b/ig,
      html: /\b(div|span|p|a|h1|h2|h3|h4|h5|h6|button|input|form|label|select|option|img|textarea|script|style|link|meta|head|body|html)\b/g,
      css: /\b(color|background|margin|padding|display|position|flex|grid|width|height|border|outline|border-radius|box-shadow|font-family|font-size|font-weight)\b/g,
      json: /\b(true|false|null)\b/g,
      markdown: /\b(true|false|null)\b/g,
    }[lang] || /\b(if|else|for|while|return|class|function)\b/g;

    let html = escapeHtml(raw);

    if (lang === 'python' || lang === 'sql') {
      html = html.replace(/(#.*)/g, '<span class="text-slate-400 dark:text-slate-500 italic">$1</span>');
    } else {
      html = html.replace(/(\/\/.*)/g, '<span class="text-slate-400 dark:text-slate-500 italic">$1</span>');
    }

    html = html.replace(/(['"`](.*?)['"`])/g, '<span class="text-emerald-600 dark:text-emerald-400">$1</span>');
    html = html.replace(/\b(\d+)\b/g, '<span class="text-cyan-600 dark:text-cyan-400">$1</span>');
    html = html.replace(keywords, '<span class="text-purple-600 dark:text-purple-400 font-bold">$1</span>');

    return html;
  };

  const handleReset = () => {
    setCode('');
    setRetrievedContent(null);
    setRequiresPassword(false);
    setPassword('');
    setError(null);
    setPasswordError(null);
    if (onClearCode) onClearCode();
  };

  const isImageFile = fileType && fileType.startsWith('image/');
  const shareUrl = `${window.location.origin}?code=${code}`;

  return (
    <div className="space-y-6">
      {!retrievedContent && !requiresPassword && (
        <form 
          onSubmit={(e) => { e.preventDefault(); fetchPaste(code); }} 
          className="max-w-md mx-auto space-y-4 animate-slide-up"
        >
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">Retrieve a Clip</h2>
            <p className="text-xs text-slate-500 font-mono">Enter the 4-digit code to get the shared snippet.</p>
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Enter Code (e.g. X4P9)"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              maxLength={10}
              className="w-full rounded-2xl p-4 pl-12 text-lg font-mono font-bold tracking-widest glass-input text-slate-800 dark:text-slate-200 uppercase outline-none"
              required
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4.5" />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center space-x-2 animate-slide-up">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-400/50 disabled:to-slate-400/50 text-white font-semibold shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span>Get Secret Clip</span>
            )}
          </button>
        </form>
      )}

      {requiresPassword && (
        <form 
          onSubmit={handlePasswordSubmit} 
          className="max-w-md mx-auto p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-slide-up"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-md font-bold text-slate-800 dark:text-slate-200">Password Required</h2>
            <p className="text-xs text-slate-500 font-mono">This clip code <span className="font-semibold">{code.toUpperCase()}</span> is password-locked.</p>
          </div>

          <div className="relative">
            <input 
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl p-3 pr-10 text-sm glass-input text-slate-800 dark:text-slate-200 outline-none"
              required
              autoFocus
            />
            <Shield className="w-4 h-4 text-purple-500 absolute right-3 top-3.5" />
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
              {passwordError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-850 dark:text-slate-200 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify</span>}
            </button>
          </div>
        </form>
      )}

      {retrievedContent && (
        <div className="space-y-4 animate-slide-up">
          
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-md">
            
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500/10 border border-purple-500/20 p-2 rounded-xl text-purple-500">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {fileName ? fileName : `Clip Code: ${code.toUpperCase()}`}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Syntax: {language}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {expiresIn !== null && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <Timer className="w-4 h-4" />
                  <span className="text-xs font-mono font-semibold">{formatTime(expiresIn)}</span>
                </div>
              )}

              <button 
                onClick={() => setShowQR(!showQR)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-500/10 hover:text-purple-500 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
                title="QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {fileName && (
                <button
                  onClick={downloadFile}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-md shadow-purple-500/10 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </button>
              )}

              {!isImageFile && (
                <button 
                  onClick={copyToClipboard}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                    isCopied 
                      ? 'bg-green-500/10 border-green-500 text-green-500' 
                      : 'bg-white dark:bg-slate-800 hover:bg-purple-500/10 hover:text-purple-500 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Clip'}</span>
                </button>
              )}

              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-350 text-xs font-bold transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {showQR && (
            <div className="bg-white p-6 rounded-2xl inline-block shadow-lg animate-slide-up border border-slate-200 mx-auto text-center block max-w-[200px]">
              <QRCodeSVG 
                value={shareUrl} 
                size={140}
                bgColor={"#ffffff"}
                fgColor={"#1e293b"}
                level={"M"}
                includeMargin={false}
              />
              <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Mobile scan code</p>
            </div>
          )}

          {isOneTime && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-750 dark:text-red-300 text-xs font-semibold flex items-start space-x-2">
              <Flame className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p>One-Time Access Activated!</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                  This clip has been deleted from the database. Make sure you copy it now, as it will be gone forever once you refresh or close this view.
                </p>
              </div>
            </div>
          )}

          {fileName && isImageFile && (
            <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
              <img 
                src={retrievedContent} 
                alt={fileName} 
                className="max-h-96 max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
          )}

          {!(fileName && isImageFile) && (
            <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                  {language} preview
                </span>
                <span className="text-[10px] text-slate-400">
                  {retrievedContent.length} characters
                </span>
              </div>
              <div className="p-4 overflow-x-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 max-h-[480px]">
                <pre className="whitespace-pre-wrap break-all custom-scrollbar">
                  <code 
                    dangerouslySetInnerHTML={{ 
                      __html: getHighlightedCodeHtml(
                        fileType && retrievedContent.startsWith('data:') 
                          ? `[Embedded Binary File - Download to View]\nFilename: ${fileName}\nType: ${fileType}` 
                          : retrievedContent, 
                        language
                      ) 
                    }} 
                  />
                </pre>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
