const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Track the video state globally
let videoState = {
  isPlaying: false,
  currentTime: 0,
};

// Serve static files
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send current state to the new user
  socket.emit('initialState', videoState);

  // Listen for video control events
  socket.on('play', (time) => {
    videoState.isPlaying = true;
    videoState.currentTime = time;
    socket.broadcast.emit('play', time);
  });

  socket.on('pause', (time) => {
    videoState.isPlaying = false;
    videoState.currentTime = time;
    socket.broadcast.emit('pause', time);
  });

  socket.on('seek', (time) => {
    videoState.currentTime = time;
    socket.broadcast.emit('seek', time);
  });

  // Update server state when a user seeks or pauses
  socket.on('updateState', (state) => {
    videoState = state;
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

<<<<<<< HEAD
const port = process.env.PORT || 8080;
=======
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
>>>>>>> 1fa805867df51a0b6879b57c9f59ff73f2855f1d

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
