const socketIo = require('socket.io');
const { v4: uuid } = require('uuid');
const randomstring = require('randomstring');

const { addUser, getUser, createRoom, getRoom, addUserToRoom } = require('./repository');

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

  const clientData = {};

  server.on('connection', (client) => {
    client.data = {};
    client.on('handshake', handshake);
    client.on('disconnect', disconnect);
    client.on('create-room', createRoom);

    async function handshake({ id }) {
      let exists = false;
      if (id) {
        exists = await getUser(id);
        console.log({ exists });
      }
      if (!exists) {
        id = uuid();
        clientData[id] = { secret: uuid() };
        await addUser(id);
        console.log(`New client, assiging id [${id}] data: [${JSON.stringify(clientData[id])}]`);
      } else {
        console.log(`Client [${id}] reconnected. Restoring data [${JSON.stringify(clientData[id])}]`);
      }
      client.id = id;
      client.data = clientData[id];
      client.emit('welcome', {
        id,
        nickName: exists ? exists.nickname : null,
        roomCode: exists ? exists.roomcode : null,
      });
    }

    function disconnect() {
      console.log(`Client [${client.id}] disconnected`);
    }

    async function createRoom() {
      const roomCode = randomstring.generate({ length: 5, charset: 'alphabetic' }).toUpperCase();
      await createRoom(roomCode);
      await addUserToRoom(client.id, roomCode);
      console.log(`Created a new room ${roomCode}`);

      client.emit('room-created', { roomCode });
    }
  });
}

module.exports = {
  configureSockets,
};
