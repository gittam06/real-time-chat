import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Message from './models/Message.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Database'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const app = express();
// We need to create an HTTP server manually to pass to Socket.io
const httpServer = createServer(app); 

// Configure CORS for Express
app.use(cors({
  origin: 'http://localhost:5173', // Your future Vite frontend URL
  methods: ['GET', 'POST']
}));

// Initialize Socket.io and attach it to the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());

// A simple test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend and Socket.io server is running!' });
});

// Store active parties in memory to validate joins
const activeParties = new Set();

// Listen for incoming Socket.io connections
io.on('connection', async (socket) => {
  console.log(`🔌 A user connected with ID: ${socket.id}`);

  socket.on('create_party', (partyId) => {
    activeParties.add(partyId);
    socket.join(partyId);
    console.log(`User ${socket.id} created and joined party: ${partyId}`);
    socket.emit('party_joined', partyId);
  });

  socket.on('join_party', async (partyId) => {
    // Validate if party exists (in memory, or if it has existing messages)
    const hasMessages = await Message.exists({ partyId });
    if (!activeParties.has(partyId) && !hasMessages) {
      socket.emit('party_error', 'Invalid Party Code or Party does not exist.');
      return;
    }

    // Add to active parties just in case it was loaded from DB
    activeParties.add(partyId);

    socket.join(partyId);
    console.log(`User ${socket.id} joined party: ${partyId}`);
    socket.emit('party_joined', partyId);
    try {
      // Fetch previous messages for this specific party
      const previousMessages = await Message.find({ partyId }).sort({ createdAt: -1 }).limit(50);
      socket.emit('load_history', previousMessages.reverse());
    } catch (err) {
      console.error("Error loading message history:", err);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      // 3. Save the new message to MongoDB
      const newMessage = new Message({
        text: data.text,
        senderId: data.senderId,
        senderName: data.senderName || 'Anonymous',
        partyId: data.partyId,
        timestamp: data.timestamp
      });
      await newMessage.save();

      // 4. Broadcast to EVERYONE in the party
      io.to(data.partyId).emit('receive_message', data); 
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// IMPORTANT: We use httpServer.listen, NOT app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});