const express = require('express');
const http = require('http');
const path = require('path');

const { routes } = require('./routes');
const { configureSockets } = require('./sockets');
const { createInitialTables } = require('./repository');

const app = express();
const server = http.createServer(app);

app.use(routes);
configureSockets(server);

// If not matched anything yet server from dist
app.use(express.static(path.join(__dirname, '..', 'dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
// });

async function main() {
  await createInitialTables();
  const port = process.env.PORT || 8080;
  return server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.log('Fatal error: ', err);
});
