const { Startups } = require('./client/startups');

const startups = new Startups(2);

function moves() {
  return startups.moves();
}

function move(i) {
  startups.move(startups.moves()[i]);
}

const p1 = startups.state.players[0];
const p2 = startups.state.players[1];
const market = startups.state.market;
const state = startups.state;
