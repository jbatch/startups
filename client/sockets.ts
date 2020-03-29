import socketIO from 'socket.io-client';

type WelcomeData = {
  id: string;
  roomCode?: string;
  nickName?: string;
  inGame: boolean;
};

// our single instance of socket that everyone will use
let socket: SocketIOClient.Socket;

function getSocket() {
  if (!socket) {
    throw Error('Attempted to load socket before it was initialised');
  }
  return socket;
}

function initialiseSocket(welcomeCallback: (welcomeData: WelcomeData) => void) {
  socket = socketIO.connect(process.env.BASE_URL, { path: '/startups/socket.io' });

  socket.on('connect', () => {
    console.log('Connected to server');
    const id = localStorage.getItem('id');
    socket.emit('handshake', { id });
  });

  socket.on('welcome', welcomeCallback);

  return socket;
}

export { initialiseSocket, getSocket };
