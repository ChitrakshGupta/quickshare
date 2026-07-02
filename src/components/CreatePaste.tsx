import { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { 
  Clipboard, Check, Lock, Shield, Flame, 
  FileText, Upload, X, QrCode, Sparkles, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { createShare } from '../services/api';
import { addToHistory } from '../utils/history';
import { copyTextToClipboard } from '../utils/clipboard';

interface CreatePasteProps {
  onSuccess: (code: string) => void;
}

const LANGUAGES = [
  { value: 'text', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'cpp', label: 'C++' },
  { value: 'sql', label: 'SQL' },
];

const EXPIRATIONS = [
  { value: 60, label: '1 Minute' },
  { value: 300, label: '5 Minutes' },
  { value: 600, label: '10 Minutes' },
  { value: 3600, label: '1 Hour' },
  { value: 14400, label: '4 Hours' },
  { value: 43200, label: '12 Hours' },
  { value: 86400, label: '1 Day' },
];

export default function CreatePaste({ onSuccess }: CreatePasteProps) {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('text');
  const [expiresIn, setExpiresIn] = useState(600);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [isOneTime, setIsOneTime] = useState(false);
  
  // File upload state
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results state
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lineCount = content.split('\n').length;
  const lineNumbersArray = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB database limit.');
      return;
    }

    setError(null);
    setFileName(file.name);
    setFileType(file.type);
    setFileSize(file.size);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext) {
      const match = LANGUAGES.find(l => l.value === ext || (ext === 'js' && l.value === 'javascript') || (ext === 'ts' && l.value === 'typescript') || (ext === 'py' && l.value === 'python'));
      if (match) {
        setLanguage(match.value);
      }
    }

    const reader = new FileReader();
    const isText = file.type.startsWith('text/') || 
                   ['.json', '.js', '.ts', '.py', '.rs', '.go', '.cpp', '.sql', '.md', '.css', '.html'].some(ext => file.name.endsWith(ext));
                   
    if (isText) {
      reader.onload = (e) => {
        setContent(e.target?.result as string || '');
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        setContent(e.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const removeFile = () => {
    setFileName(null);
    setFileType(null);
    setFileSize(null);
    setContent('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await createShare({
      content,
      expiresIn,
      password: hasPassword ? password : undefined,
      isOneTime,
      language,
      fileName,
      fileType
    });

    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.code) {
      setGeneratedCode(res.code);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#06b6d4', '#10b981']
      });

      const preview = fileName 
        ? `📄 File: ${fileName}` 
        : content.substring(0, 60) + (content.length > 60 ? '...' : '');

      addToHistory({
        code: res.code,
        preview,
        timestamp: Date.now(),
        type: fileName ? 'file' : 'text',
        fileName,
        expiresIn: res.expiresIn || expiresIn,
        isOneTime
      });

      onSuccess(res.code);
    }
  };

  const shareUrl = `${window.location.origin}?code=${generatedCode}`;

  const copyToClipboard = () => {
    if (!shareUrl) return;
    const success = copyTextToClipboard(shareUrl);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      setError('Failed to copy share link');
    }
  };

  const handleReset = () => {
    setGeneratedCode(null);
    setContent('');
    setPassword('');
    setHasPassword(false);
    setIsOneTime(false);
    setFileName(null);
    setFileType(null);
    setFileSize(null);
    setShowQR(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {!generatedCode ? (
        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          <div className="flex flex-col lg:flex-row gap-6">
            
            <div className="flex-1 space-y-4">
              
              <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center px-4 py-3 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {fileName ? 'Attached File' : 'Paste workspace'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {content.length} chars | {content.split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>

                <div className="flex relative h-96 font-mono text-sm leading-relaxed">
                  <div 
                    ref={lineNumbersRef}
                    id="line-numbers"
                    className="w-12 select-none py-4 text-right pr-3 text-slate-400/55 dark:text-slate-655 bg-slate-100/30 dark:bg-slate-950/30 border-r border-slate-200/50 dark:border-slate-850 overflow-hidden"
                  >
                    {lineNumbersArray.map(n => (
                      <div key={n} className="h-6">{n}</div>
                    ))}
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onScroll={handleScroll}
                    placeholder={
                      fileName 
                        ? 'Loading file...' 
                        : 'Paste your code, notes, URL, OTP or drag-and-drop a file here...'
                    }
                    className="flex-1 h-full py-4 px-4 bg-transparent outline-none resize-none overflow-y-auto custom-scrollbar text-slate-800 dark:text-slate-200 caret-purple-500"
                    style={{ lineHeight: '1.5rem' }}
                  />
                </div>
              </div>

              {!fileName ? (
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl p-6 text-center transition-colors cursor-pointer relative group"
                >
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-500 dark:text-slate-400">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    <p className="text-sm font-medium">
                      <span className="text-purple-600 dark:text-purple-400">Upload a file</span> or drag & drop here
                    </p>
                    <p className="text-xs text-slate-400">
                      Supports files, text, images, and documents up to 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-300 animate-slide-up">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="text-sm font-semibold max-w-xs truncate">{fileName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {fileType || 'Unknown format'} • {fileSize ? formatSize(fileSize) : ''}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={removeFile}
                    className="p-1 rounded-full hover:bg-purple-500/20 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="w-full lg:w-80 space-y-6">
              
              <div className="glass-panel rounded-2xl p-6 shadow-md space-y-6">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
                  Snippet Options
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Syntax Highlighting
                  </label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl p-3 text-sm glass-input text-slate-800 dark:text-slate-200 outline-none"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.value} value={l.value} className="bg-slate-100 dark:bg-slate-900">
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Expiration Duration
                  </label>
                  <select 
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(Number(e.target.value))}
                    className="w-full rounded-xl p-3 text-sm glass-input text-slate-800 dark:text-slate-200 outline-none"
                  >
                    {EXPIRATIONS.map(exp => (
                      <option key={exp.value} value={exp.value} className="bg-slate-100 dark:bg-slate-900">
                        {exp.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <Flame className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Burn after reading</p>
                      <p className="text-[10px] text-slate-400">Delete once viewed</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isOneTime}
                      onChange={(e) => setIsOneTime(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-4 after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Password Lock</p>
                        <p className="text-[10px] text-slate-400">Restrict access</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasPassword}
                        onChange={(e) => setHasPassword(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-4 after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  {hasPassword && (
                    <div className="relative animate-slide-up">
                      <input 
                        type="password"
                        placeholder="Enter password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl p-3 pr-10 text-sm glass-input text-slate-800 dark:text-slate-200 outline-none"
                        required
                      />
                      <Shield className="w-4 h-4 text-purple-500 absolute right-3 top-3.5" />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !content.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-400/50 disabled:to-slate-400/50 text-white font-semibold text-sm shadow-lg hover:shadow-purple-500/20 disabled:shadow-none transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed group"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>{isLoading ? 'Storing Snippet...' : 'Generate Share Code'}</span>
                </button>
              </div>

            </div>
          </div>
        </form>
      ) : (
        /* SUCCESS VIEW */
        <div className="glass-panel rounded-2xl p-8 max-w-xl mx-auto shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-slide-up space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Snippet Shared!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your code will automatically expire in <span className="font-semibold text-slate-700 dark:text-slate-300">{EXPIRATIONS.find(e => e.value === expiresIn)?.label}</span>
            </p>
          </div>

          <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Share Code</span>
              <span className="text-3xl font-black text-purple-600 dark:text-purple-400 tracking-wider font-mono">{generatedCode}</span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowQR(!showQR)}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-500/10 hover:text-purple-500 border border-slate-200 dark:border-slate-750 transition-colors shadow-sm"
                title="Show QR Code"
              >
                <QrCode className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <button 
                onClick={copyToClipboard}
                className={`p-3 rounded-xl border transition-all shadow-sm flex items-center space-x-2 ${
                  isCopied 
                    ? 'bg-green-500/10 border-green-500 text-green-500' 
                    : 'bg-white dark:bg-slate-800 hover:bg-purple-500/10 hover:text-purple-500 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300'
                }`}
              >
                {isCopied ? <Check className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />}
                <span className="text-xs font-semibold">{isCopied ? 'Copied URL!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {showQR && (
            <div className="bg-white p-6 rounded-2xl inline-block shadow-lg animate-slide-up border border-slate-200 mx-auto">
              <QRCodeSVG 
                value={shareUrl} 
                size={160}
                bgColor={"#ffffff"}
                fgColor={"#1e293b"}
                level={"M"}
                includeMargin={false}
              />
              <p className="text-[10px] text-slate-400 mt-3 font-semibold uppercase tracking-wider">Scan to Open</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-center space-x-4">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors"
            >
              Share Another Snippet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
