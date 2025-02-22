import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store active sessions
const activeSessions = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-exam', (examId) => {
    socket.join(`exam:${examId}`);
    activeSessions.set(socket.id, examId);
  });

  socket.on('suspicious-activity', (data) => {
    const examId = activeSessions.get(socket.id);
    if (examId) {
      io.to(`exam:${examId}`).emit('activity-alert', {
        type: data.type,
        message: data.message,
        timestamp: new Date()
      });
    }
  });

  socket.on('disconnect', () => {
    activeSessions.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});