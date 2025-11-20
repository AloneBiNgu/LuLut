import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import cron from 'node-cron';
import app from './app';
import connectDB from './config/db';
import { crawlSheetData } from './jobs/sheetCrawler';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
  console.log('Database connected, starting initial crawl...');
  crawlSheetData();
});

// Schedule Crawler Job (Every 10 minutes)
cron.schedule('*/10 * * * *', () => {
  crawlSheetData();
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
console.log('Attempting to start server on port', PORT);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

server.on('error', (e) => {
  console.error('Server error:', e);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
