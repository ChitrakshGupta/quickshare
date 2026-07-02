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

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: [frontendUrl, 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://localhost:3000'],
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
