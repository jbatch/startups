const socketIo = require('socket.io');
const { v4: uuid } = require('uuid');
const randomstring = require('randomstring');

const { addUser, getUser, createRoom, getRoom, addUserToRoom, getUsersInRoom } = require('./repository');

// ToDo - check the code isnt existing already
function generateRoomCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return code;
}

function configureSockets(appServer) {
  const server = socketIo(appServer);

  server.on('connection', (client) => {
    client.data = {};
    client.on('handshake', handshake);
    client.on('disconnect', disconnect);
    client.on('create-room', createNewRoom);
    client.on('player-join-room', addPlayer);

    async function handshake({ id }) {
      let exists = false;
      if (id) {
        exists = await getUser(id);
      }
      if (!exists) {
        id = uuid();
        await addUser(id);
        console.log(`New client, assigning id [${id}]`);
      } else {
        console.log(`Player ${id} reconnected with nickname ${exists.nickname} and room ${exists.roomcode}.`);
      }
      client.playerId = id;
      client.emit('welcome', {
        id,
        nickName: exists ? exists.nickname : null,
        roomCode: exists ? exists.roomcode : null,
      });
      if (exists) {
        await addPlayer({ roomCode: exists.roomcode });
      }
    }

    function disconnect() {
      console.log(`Player [${client.playerId}] disconnected`);
    }

    async function createNewRoom() {
      const roomCode = randomstring.generate({ length: 5, charset: 'alphabetic' }).toUpperCase();
      await createRoom(roomCode);
      console.log(`Created a new room ${roomCode}`);
      addPlayer({ roomCode });
      client.emit('room-created', { roomCode });
    }

    async function addPlayer({ roomCode, nickName }) {
      await addUserToRoom(roomCode, client.playerId, nickName);
      const usersInRoom = await getUsersInRoom(roomCode);
      client.join(roomCode);
      console.log('sending room status ', JSON.stringify({ roomCode, players: usersInRoom }));
      server.to(roomCode).emit('room-status', { roomCode, players: usersInRoom });
      console.log(`Player ${client.playerId} joined room ${roomCode}`);
    }
  });
}

module.exports = {
  configureSockets,
};
