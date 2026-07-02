# QuickShare — 100% Client-Side, Zero-Knowledge Text & File Sharing

QuickShare is a high-performance, premium web application built to instantly share text, code snippets, notes, or files without requiring any backend servers or databases.

The entire application runs **100% inside the browser** as a static website, making it free, private, serverless, and highly secure.

---

## ⚡ How It Works (Backendless Architecture)

1. **Storage in URL Hash**: Since there is no backend database, the entire snippet content, file, language, and expiration metadata are packed together into a single JSON object.
2. **Native Compression**: The JSON payload is compressed using the browser-native `CompressionStream` API (utilizing GZIP) to shrink its size, converted to base64, and appended to the URL hash (e.g., `/#data/H4sIAAAAA...`). The URL is your database!
3. **Zero-Knowledge Encryption**: If password protection is enabled, the snippet is encrypted inside your browser using **256-bit AES-GCM (PBKDF2 key derivation)** before compression. The password never travels over the internet; only someone who knows the password can decrypt the URL payload.
4. **URL Shortening**: To turn the long hash URLs into short shareable links, the app integrates with the free `is.gd` shortener API directly from the client using **JSONP** (which natively bypasses CORS).
5. **Auto-Expiration (TTL)**: Expiration timestamps are baked into the payload. The client decodes the expiration time and displays a live countdown timer. If the current time exceeds the expiration, the UI blocks access.

---

## 🛠️ Tech Stack & Utilities

- **Core**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Qrcode.react, Canvas Confetti.
- **Cryptography**: [src/utils/crypto.ts](file:///Users/chitrakshgupta/code/quickshare/src/utils/crypto.ts) — AES-GCM 256-bit encryption.
- **Compression**: [src/utils/compression.ts](file:///Users/chitrakshgupta/code/quickshare/src/utils/compression.ts) — GZIP CompressionStream pipes.
- **Shortener**: [src/services/shortener.ts](file:///Users/chitrakshgupta/code/quickshare/src/services/shortener.ts) — JSONP script injection hook.

---

## 🚀 Setup & Execution Instructions

Since this is a static React application, setting it up is quick and easy.

### Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Launch the local development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

### Deployment
Because the project is 100% static, you can host it for free on any static web host:
1. Generate the production build:
   ```bash
   npm run build
   ```
2. Upload the resulting `dist/` directory to **GitHub Pages**, **Netlify**, **Vercel**, **Cloudflare Pages**, or **Amazon S3**.

---

## ⚠️ Important Browser Limits & Constraints
- **File Sharing Size**: Because browser URL length is practically limited to ~100KB–200KB depending on the browser (with iOS Safari having the tightest constraints), file attachments are capped at **60KB** in this backendless version.
- **One-Time Access (Burn After Reading)**: While the app marks one-time views as opened (saving a flag in the reader's local storage), it cannot strictly block others from copying the link and decoding the hash manually. For absolute one-time data destruction, a database backend is recommended.
