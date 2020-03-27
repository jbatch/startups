const express= require('express');

const routes = express.Router();

routes.get('/', (req, res) => {
  res.sendFile('./index.html', {root: __dirname});
});

module.exports = {
  routes
}