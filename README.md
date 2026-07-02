# QuickShare — High-Performance, Multi-Device Text & File Sharing Platform

QuickShare is a secure, developer-focused, real-time code snippet and file-sharing platform. Built using a modern monorepo architecture with a **React 19 frontend** and an **Express.js API backend**, the platform offers 4-character sharing codes, zero-knowledge encryption options, one-time read access, and live document collaboration rooms synchronized via WebSockets.

The system features a **hybrid database layer** that automatically interfaces with a Redis cluster or falls back to a custom-written self-cleaning in-memory Map structure, allowing it to deploy 100% free of charge.

---

## 📐 System Architecture & Flow Sequence

The following diagram illustrates the lifecycle of a shared snippet from sender creation to receiver retrieval, including database synchronization and password validation:

```mermaid
sequenceDiagram
    autonumber
    actor Sharer as Sender Client
    actor Receiver as Receiver Client
    participant API as Express API Server
    participant DB as Redis / In-Memory Store

    %% Creation Sequence
    Note over Sharer,DB: 1. Creation & Storage Sequence
    Sharer->>API: POST /api/share (Text/File payload, TTL, Hashed Password)
    API->>API: Generate 4-character base-56 unique code key
    API->>API: Hash lock password if set (bcryptjs 10-rounds salt)
    API->>DB: SETEX [code] [TTL] [Payload JSON]
    DB-->>API: Command Acknowledged (OK)
    API-->>Sharer: Return share metadata (code, expireTime)

    %% Retrieval Sequence
    Note over Receiver,DB: 2. Secure Retrieval Sequence
    Receiver->>API: GET /api/share/[code]
    API->>DB: GET [code] & TTL [code]
    DB-->>API: Return Raw JSON String
    alt Paste is Password Locked
        API-->>Receiver: Return requiresPassword: true (Hide content)
        Receiver->>API: POST /api/share/[code]/verify (Password)
        API->>API: Compare bcrypt hashes
        alt Hash matches
            API-->>Receiver: Return decrypted snippet & content
        else Hash fails
            API-->>Receiver: Return 401 Unauthorized Error
        end
    else Paste is Public
        API-->>Receiver: Return full snippet payload
    end

    %% One-Time Access Cleanup
    opt One-Time Read enabled
        API->>DB: DEL [code] (Immediate database destruction)
    end
```

---

## 🛠️ Subsystems & Technical Deep-Dive

### 1. Hybrid Storage Engine (`backend/services/storageService.js`)
To support free deployment tiers with zero setup, the storage engine implements a custom dual-mode wrapper:
* **Redis Mode**: Standard client interface using node-redis `createClient`. Employs Redis native `SETEX` commands to manage automated TTL expiration in-memory.
* **In-Memory Fallback Mode**: If connection to the Redis URL fails or times out (configured with an 8-second handshake limit to mitigate free-tier container network lag), the server instantiates an `InMemoryStorage` class. This class uses a JavaScript `Map` store and runs an automated **30-second garbage collection loop** (`setInterval`) to delete expired keys, preventing memory leaks in production.

---

### 2. Real-Time Collaborative Sync (`backend/services/socketService.js`)
QuickShare features dynamic "Live Collaboration Rooms". Using WebSockets (`socket.io`):
* **Collab Rooms**: Users join dynamic namespaces (`L-XXXX`) where typing edits, cursor coordinates, and copy-paste buffers are broadcasted bi-directionally.
* **Cursor Tracking**: Real-time cursor coordinates of connected peers are streamed and rendered dynamically as colored highlights on other screens.
* **P2P Transfer Mock**: Files dropped into active collaborative spaces are read as base64 data blobs, chunked, and pushed to active rooms for receiver-side memory rendering.

---

### 3. Dynamic CORS origin Reflector (`backend/server.js`)
To avoid strict Cross-Origin Resource Sharing (CORS) failures when deploying to dynamic hosting providers (like Vercel preview branches) or testing over local IP addresses (like scanned QR codes on mobile devices), the server implements a dynamic origin resolver:
```javascript
app.use(cors({
  origin: (origin, callback) => callback(null, true), // Dynamic origin reflector
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
```
This echos back the request's exact origin header on preflight OPTIONS checks, allowing cross-device communication across any domain or local network subnet.

---

### 4. Synchronous-First Clipboard Utility (`src/utils/clipboard.ts`)
Standard clipboard APIs (`navigator.clipboard.writeText`) require a **Secure Context (HTTPS)** and are blocked by Safari and Chrome if executed after asynchronous ticks (like an API fetch microtask). QuickShare bypasses this block using a synchronous-first fallback mechanism:
1. Instantiates a temporary, off-screen `<textarea>` element.
2. Focuses and selects its value in the current execution thread.
3. Invokes `document.execCommand('copy')` synchronously.
4. Falls back to `navigator.clipboard` only if the browser blocks the execution command.
This guarantees copying shared codes, links, and snippets works 100% of the time on all mobile devices and unencrypted IP networks.

---

## 📂 Repository Directory Tree

```text
├── backend/                       # Express Node.js Server Application
│   ├── controllers/               # Route endpoint handlers (Create, Retrieve, Verify)
│   ├── routes/                    # Express routing paths definitions
│   ├── services/                  # Socket.io collab sync & Redis database wrappers
│   ├── utils/                     # 4-character code key generator
│   ├── server.js                  # App Entry Point & Middleware routing
│   └── package.json               # Backend dependency configurations
│
├── src/                           # React Frontend Client Application
│   ├── components/                # UI Panels (Landing Page, Editor, Retriever, History)
│   ├── services/                  # Fetch REST clients & socket handlers
│   ├── utils/                     # Crypto algorithms, compression, clipboard fallbacks
│   ├── App.tsx                    # Layout View Router
│   └── main.tsx                   # React DOM Entry
│
├── package.json                   # Root package manager & concurrently execution script
└── vite.config.ts                 # React development bundle builder config
```

---

## 🚀 Execution & Setup Instructions

### Local Development
To launch the entire stack concurrently (both frontend client and backend server) in one terminal:
1. Clone the repository and navigate to root:
   ```bash
   cd quickshare
   ```
2. Install packages for the root workspace and subfolders:
   ```bash
   npm install && cd backend && npm install && cd ..
   ```
3. Boot the environment:
   ```bash
   npm run dev-all
   ```
   *Vite exposes your client locally on [http://localhost:5173](http://localhost:5173) and displays your WiFi Network IP for local mobile testing.*

### Production Deployment (100% Free Stack)
1. **Database**: Spin up a free serverless Redis cluster on **Upstash** and copy the connection string.
2. **Backend**: Host the `/backend` folder on **Render** (as a Free Web Service). Set environment variables:
   * `REDIS_URL` = `rediss://default:YOUR_PASSWORD@your-db.upstash.io:6379` *(Use `rediss` to force secure TLS)*
   * `FRONTEND_URL` = `https://your-app.vercel.app`
3. **Frontend**: Host the root folder on **Vercel** or **Netlify**. Set the build command to `npm run build` and add environment variable:
   * `VITE_API_URL` = `https://your-api.onrender.com/api/share`
