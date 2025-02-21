const socket = io();

class VideoSyncApp extends React.Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.isSyncing = false; // Flag to prevent event loops
  }

  componentDidMount() {
    const video = this.videoRef.current;

    // Listen for server events
    socket.on('initialState', (state) => {
      this.isSyncing = true;
      video.currentTime = state.currentTime;
      setTimeout(() => {
        if (state.isPlaying) {
          if (video.paused) {
            video.play().catch((error) => {
              console.log('Autoplay blocked. Click to start.');
            });
          }
        } else {
          video.pause();
        }
        this.isSyncing = false;
      }, 500); 
    });

socket.on('play', (time) => {
  if (!video.paused) return;
  this.isSyncing = true;
  video.currentTime = time; 
  video.play();
  setTimeout(() => (this.isSyncing = false), 500);
});

socket.on('pause', (time) => {
  if (video.paused) return;
  this.isSyncing = true;
  video.currentTime = time;
  video.pause();
  setTimeout(() => (this.isSyncing = false), 500);
});
      

      socket.on('seek', (time) => {
        this.isSyncing = true;
        if (Math.abs(video.currentTime - time) > 0.5) {
          video.currentTime = time;
        }
        this.isSyncing = false;
      });
      

    // Emit events to the server
    video.addEventListener('play', () => {
        if (!this.isSyncing) {
          socket.emit('play', video.currentTime);
        }
      });

      video.addEventListener('pause', () => {
        if (!this.isSyncing) {
          socket.emit('pause', video.currentTime);
        }
      });

      video.addEventListener('seeked', () => {
        if (!this.isSyncing) {
          socket.emit('seek', video.currentTime);
        }
      });

    video.addEventListener('ended', () => {
        socket.emit('videoEnded');
      });
      

    // Periodically update the server with current time (every 5 seconds)
    setInterval(() => {
        if (!this.isSyncing && !video.paused) {
          socket.emit('updateState', {
            isPlaying: true,
            currentTime: video.currentTime,
          });
        }
      }, 5000);
      
  }

  render() {
    return (
      <div>
        <video
          ref={this.videoRef}
          width="640"
          height="360"
          controls
          src="https://cgjnf.com/movies/disk3/disk3_2/md/Aashiqui%202.mp4"
        ></video>
      </div>
    );
  }
}

ReactDOM.render(<VideoSyncApp />, document.getElementById('root'));
