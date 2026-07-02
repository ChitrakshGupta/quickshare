import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Users, Copy, Check, LogOut, 
  FileText, Download, RefreshCw, Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

interface User {
  socketId: string;
  username: string;
}

interface SharedFile {
  name: string;
  type: string;
  size: number;
  content: string; // Base64
  sender: string;
}

export default function LiveRoom() {
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [content, setContent] = useState('');
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // Connection states
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isIncomingChange = useRef(false);

  // Generate unique room code
  const generateLiveRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'L-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = () => {
    const code = generateLiveRoomCode();
    setRoomCode(code);
  };

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setIsConnecting(true);
    setError(null);

    // Initialize Socket Connection
    const newSocket = io(SOCKET_URL);

    newSocket.on('connect', () => {
      setIsConnecting(false);
      setIsJoined(true);
      
      const finalUsername = username.trim() || `User #${newSocket.id?.substring(0, 4)}`;
      setUsername(finalUsername);

      // Join room
      newSocket.emit('join-room', { 
        roomCode: roomCode.toUpperCase(), 
        username: finalUsername 
      });

      // Delight effect on join
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    });

    newSocket.on('connect_error', () => {
      setIsConnecting(false);
      setError('Failed to connect to WebSocket server. Make sure the backend is running.');
      newSocket.close();
    });

    // Listeners
    newSocket.on('room-users', (userList: User[]) => {
      setUsers(userList);
    });

    newSocket.on('text-update', (newText: string) => {
      isIncomingChange.current = true;
      setContent(newText);
      // Wait for React to apply state update, then reset flag
      setTimeout(() => {
        isIncomingChange.current = false;
      }, 50);
    });

    newSocket.on('file-transfer', (file: SharedFile) => {
      setSharedFiles(prev => [file, ...prev]);
    });

    newSocket.on('user-joined', (_user: User) => {
      // Highlight toast or list info if needed
    });

    setSocket(newSocket);
  };

  // Emit changes when typing
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    
    if (socket && !isIncomingChange.current) {
      socket.emit('text-update', { 
        roomCode: roomCode.toUpperCase(), 
        content: val 
      });
    }
  };

  // Device-to-device file transfer
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && socket) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5MB WebSockets transfer limit.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const filePayload: SharedFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          content: event.target?.result as string || '',
          sender: username
        };
        
        // Emit to room
        socket.emit('file-transfer', {
          roomCode: roomCode.toUpperCase(),
          file: filePayload
        });

        // Add to local list
        setSharedFiles(prev => [filePayload, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadSharedFile = (file: SharedFile) => {
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLeave = () => {
    if (socket) {
      socket.disconnect();
    }
    setIsJoined(false);
    setSocket(null);
    setContent('');
    setUsers([]);
    setSharedFiles([]);
  };

  const copyRoomLink = async () => {
    const link = `${window.location.origin}?tab=live&room=${roomCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      // Failed to copy
    }
  };

  // Auto clean socket connection on unmount
  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      {!isJoined ? (
        /* Setup / Join View */
        <form onSubmit={handleJoin} className="max-w-md mx-auto space-y-6 animate-slide-up">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mx-auto mb-2 animate-pulse">
              <Radio className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">Live Sync Room</h2>
            <p className="text-xs text-slate-500">Edit code and transfer files in real-time with other users.</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            {/* Display name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Your Display Name</label>
              <input 
                type="text" 
                placeholder="e.g. Developer #42 (Optional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl p-3 text-sm glass-input text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            {/* Room Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Room Sharing Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Room Code (e.g. L-X4P9)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-xl p-3 text-sm font-mono font-bold glass-input text-slate-800 dark:text-slate-200 uppercase outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-750"
                >
                  Generate Room
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Connect button */}
            <button
              type="submit"
              disabled={isConnecting || !roomCode.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-400/50 disabled:to-slate-400/50 text-white font-semibold text-sm shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  <span>Join Live Sync Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Joined Room Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-slide-up">
          
          {/* Col 1-3: Collaborative Editor */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Header toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Live Session: <span className="font-mono text-purple-600 dark:text-purple-400">{roomCode.toUpperCase()}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {users.length} connected user{users.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={copyRoomLink}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                    isCopied 
                      ? 'bg-green-500/10 border-green-500 text-green-500' 
                      : 'bg-white dark:bg-slate-800 hover:bg-purple-500/10 hover:text-purple-500 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Link Copied!' : 'Copy Room Link'}</span>
                </button>

                <button
                  onClick={handleLeave}
                  className="px-3.5 py-1.5 rounded-xl bg-red-500/15 border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/25 transition-colors flex items-center space-x-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave Room</span>
                </button>
              </div>
            </div>

            {/* Collab Text Area */}
            <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Collaborative Workspace
                </span>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 italic">
                  Changes sync instantly as you type
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextChange}
                placeholder="Start typing here... anyone in this room will see edits in real-time."
                className="w-full h-[400px] p-6 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 custom-scrollbar caret-purple-500"
              />
            </div>
          </div>

          {/* Col 4: Sidebar info & transfers */}
          <div className="space-y-6">
            
            {/* Connected users list */}
            <div className="glass-panel rounded-2xl p-4 shadow-md space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-850 pb-2.5">
                <Users className="w-4 h-4 text-purple-500" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Active Users ({users.length})
                </h4>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {users.map(u => (
                  <div key={u.socketId} className="flex items-center space-x-2 text-sm text-slate-650 dark:text-slate-350">
                    <span className={`w-2 h-2 rounded-full ${u.socketId === socket?.id ? 'bg-purple-500' : 'bg-slate-400 dark:bg-slate-600'}`}></span>
                    <span className="truncate">
                      {u.username} {u.socketId === socket?.id ? '(You)' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WebSockets direct file share */}
            <div className="glass-panel rounded-2xl p-4 shadow-md space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-850 pb-2.5">
                <FileText className="w-4 h-4 text-purple-500" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  P2P File Transfer
                </h4>
              </div>

              {/* Upload trigger */}
              <div className="relative border border-dashed border-slate-300 dark:border-slate-850 hover:border-purple-500 dark:hover:border-purple-500 p-4 text-center rounded-xl transition-colors cursor-pointer group">
                <input 
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-purple-500">
                  Send File to Room
                </span>
                <p className="text-[9px] text-slate-400 mt-1">Direct stream (5MB Limit)</p>
              </div>

              {/* Shared file logs */}
              <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
                {sharedFiles.length === 0 ? (
                  <p className="text-[10px] text-center text-slate-400 italic">No files transferred yet</p>
                ) : (
                  sharedFiles.map((file, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-250 dark:border-slate-850 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-850 dark:text-slate-250 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          From: {file.sender}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadSharedFile(file)}
                        className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 hover:text-purple-600 transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
