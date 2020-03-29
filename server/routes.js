const express = require('express');

const routes = express.Router();

// routes.get('/', (req, res) => {
//   res.sendFile('./index.html', { root: __dirname });
// });

routes.get('/api/heartbeat', (req, res) => {
  res.send('ba-bum');
});

module.exports = {
  routes,
};
