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
  if (!videoState.isPlaying) { // Only broadcast if the state is different
    videoState.isPlaying = true;
    videoState.currentTime = time;
    socket.broadcast.emit('play', time);
  }
});

socket.on('pause', (time) => {
  if (videoState.isPlaying) { // Only broadcast if the state is different
    videoState.isPlaying = false;
    videoState.currentTime = time;
    socket.broadcast.emit('pause', time);
  }
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

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
