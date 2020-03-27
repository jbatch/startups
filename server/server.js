const express = require('express');
const http = require('http');

const { routes } = require('./routes');
const { configureSockets } = require('./sockets');

const app = express();
const server = http.createServer(app);

app.use(routes);
configureSockets(server);

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
