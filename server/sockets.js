const socketIo = require('socket.io');
const { v4: uuid } = require('uuid');
const { addUser, getUser } = require('./repository');

function configureSockets(appServer) {
  const server = socketIo(appServer);

  const clientData = {};

  server.on('connection', (client) => {
    client.data = {};
    client.on('handshake', handshake);
    client.on('disconnect', disconnect);

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
      client.emit('welcome', { id, nickName: exists && exists.nickname, roomCode: exists && exists.roomcode });
    }

    function disconnect() {
      console.log(`Client [${client.id}] disconnected`);
    }
  });
}

module.exports = {
  configureSockets,
};
