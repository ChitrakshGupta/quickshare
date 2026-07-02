import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { initStorage } from './services/storageService.js';
import { initSocket } from './services/socketService.js';
import shareRoutes from './routes/shareRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
if (frontendUrl.endsWith('/')) {
  frontendUrl = frontendUrl.slice(0, -1);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server or script requests with no origin
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin);
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.use('/api/share', shareRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await initStorage();
    initSocket(server);
    server.listen(PORT, () => {
      console.log(`========================================`);
      console.log(`🚀 QuickShare backend running on port ${PORT}`);
      console.log(`========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
