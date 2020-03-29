const { Startups } = require('./client/game-engine');

function moves() {
  return startups.moves();
}

function move(i) {
  startups.move(startups.moves()[i]);
}

const tie = `{"deck":[],"cardsInDeck":45,"players":[{"hand":[{"company":{"name":"Elephant Mars Travel","symbol":"E","number":10}},{"company":{"name":"Flamingosoft","symbol":"F","number":7}}],"field":[],"cardsInHand":3,"tokens":[],"coins":[{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1}]},{"hand":[{"company":{"name":"Flamingosoft","symbol":"F","number":7}},{"company":{"name":"Flamingosoft","symbol":"F","number":7}},{"company":{"name":"Elephant Mars Travel","symbol":"E","number":10}},{"company":{"name":"Elephant Mars Travel","symbol":"E","number":10}}],"field":[],"cardsInHand":4,"tokens":[],"coins":[]}],"market":[],"turn":1,"step":"PLAY","lastDrawnCompany":{"name":"Bow Wow Game","symbol":"B","number":6}}`;
const tie2 = `{"deck":[],"cardsInDeck":45,"players":[{"hand":[{"company":{"name":"Elephant Mars Travel","symbol":"E","number":10}},{"company":{"name":"Flamingosoft","symbol":"F","number":7}}],"field":[],"cardsInHand":3,"tokens":[],"coins":[{"value":1}]},{"hand":[{"company":{"name":"Flamingosoft","symbol":"F","number":7}},{"company":{"name":"Elephant Mars Travel","symbol":"E","number":10}}],"field":[],"cardsInHand":4,"tokens":[],"coins":[{"value":1}]}],"market":[],"turn":1,"step":"PLAY","lastDrawnCompany":{"name":"Bow Wow Game","symbol":"B","number":6}}`;
const startups = new Startups({ state: tie2 });
const p1 = startups.state.players[0];
const p2 = startups.state.players[1];
const market = startups.state.market;
let state = startups.state;
