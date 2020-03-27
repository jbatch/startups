const socketIo = require('socket.io');

function configureSockets(appServer) {
  const server = socketIo(appServer);

  server.on('connection', client => {
    console.log('Client connect');
    client.emit('news', { hello: 'world' });
    client.on('my other event', function(data) {
      console.log(data);
    });
  });
}

module.exports = {
  configureSockets
};
