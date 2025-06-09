const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

let waitingUsers = [];
let activeChats = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  if (waitingUsers.length > 0) {
    const partnerSocketId = waitingUsers.pop();
    activeChats.set(socket.id, partnerSocketId);
    activeChats.set(partnerSocketId, socket.id);

    io.to(socket.id).emit('partner_found', { partnerId: partnerSocketId });
    io.to(partnerSocketId).emit('partner_found', { partnerId: socket.id });
  } else {
    waitingUsers.push(socket.id);
  }

  socket.on('send_message', (data) => {
    const partnerId = activeChats.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('receive_message', data);
    }
  });

  socket.on('disconnect', () => {
    const partnerId = activeChats.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('partner_left');
      activeChats.delete(partnerId);
    }
    activeChats.delete(socket.id);
    waitingUsers = waitingUsers.filter(id => id !== socket.id);
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});