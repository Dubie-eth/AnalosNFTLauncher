import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Import routes
import collectionRoutes from './routes/collections';
import mintRoutes from './routes/mint';
import metadataRoutes from './routes/metadata';
import uploadRoutes from './routes/upload';
import nftGeneratorRoutes from './routes/nftGenerator';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { validateEnv } from './utils/env';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://analos-nft-launcher-uz4a.vercel.app',
    'https://*.vercel.app',
    'https://launchonlos.fun',
    'https://www.launchonlos.fun'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/collections', collectionRoutes);
app.use('/api/mint', mintRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/nft-generator', nftGeneratorRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Analos NFT Launcher API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      collections: '/api/collections',
      mint: '/api/mint',
      metadata: '/api/metadata',
      upload: '/api/upload',
      nftGenerator: '/api/nft-generator'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received WebSocket message:', data);
      
      // Handle different message types
      switch (data.type) {
        case 'subscribe':
          // Subscribe to collection updates
          ws.collectionId = data.collectionId;
          ws.send(JSON.stringify({
            type: 'subscribed',
            collectionId: data.collectionId
          }));
          break;
        case 'subscribe_session':
          // Subscribe to session updates
          ws.sessionId = data.sessionId;
          ws.send(JSON.stringify({
            type: 'session_subscribed',
            sessionId: data.sessionId
          }));
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type'
          }));
      }
    } catch (error) {
      console.error('WebSocket message parsing error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast function for WebSocket updates
export const broadcastToCollection = (collectionId: string, data: any) => {
  wss.clients.forEach((client) => {
    if (client.collectionId === collectionId && client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Broadcast function for session updates
export const broadcastToSession = (sessionId: string, data: any) => {
  wss.clients.forEach((client) => {
    if (client.sessionId === sessionId && client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Analos NFT Launcher API server running on port ${PORT}`);
  console.log(`📡 WebSocket server available at ws://localhost:${PORT}/ws`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 RPC URL: ${process.env.RPC_URL}`);
  console.log(`🔍 Explorer URL: ${process.env.EXPLORER_URL}`);
});

export default app;
