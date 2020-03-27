const socketIo = require('socket.io');
const { v4: uuid } = require('uuid');

function configureSockets(appServer) {
  const server = socketIo(appServer);

const clientData = {};
const clients = [];

  server.on('connection', client => {
    client.data = {};
    client.on('handshake', handshake);
    client.on('disconnect', disconnect);

    function handshake({ id }) {
      let exists = false;
      if (id) {
        exists = clients.includes(id);
      }
      if(!exists) {
        id = uuid();
        clientData[id] = {'secret': uuid()};
        clients.push(id);
        console.log(`New client, assiging id [${id}] data: [${JSON.stringify(clientData[id])}]`);
      } else {
        console.log(`Client [${id}] reconnected. Restoring data [${JSON.stringify(clientData[id])}]`);
      }
      client.id = id;
      client.data = clientData[id];
      client.emit('welcome', { id });
    }

    function disconnect() {
      console.log(`Client [${client.id}] disconnected`);
    }
  });
}

module.exports = {
  configureSockets
};
