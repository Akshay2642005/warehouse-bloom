import { createApp } from './app.js';
import { config } from './config/index.js';
import prisma from './lib/prisma.js';
import http from 'http';
import { initSocket } from './lib/socket.js';
import cors from 'cors';

const app = createApp();
const server = http.createServer(app);

// CORS Configuration
app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:8080"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

// Initialize Socket.io
initSocket(server);

// Graceful shutdown handler
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`);

  // Close database connection
  await prisma.$disconnect();

  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
const PORT = config.PORT;

server.listen(PORT, () => {
  console.log(`
  🚀 Server ready at: http://localhost:${PORT}
  🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*
  📊 Environment: ${config.NODE_ENV}
  🌐 Client origin: ${config.CLIENT_ORIGIN}
  `);
});
