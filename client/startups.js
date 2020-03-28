// Companies

const ELEPHANT_MARS_TRAVEL = {
  name: 'Elephant Mars Travel',
  symbol: 'E',
  number: 10,
};

const HIPPO_POWER_TECH = {
  name: 'Hippo Power Tech',
  symbol: 'H',
  number: 9,
};

const OCTO_COFFEE = {
  name: 'Octocoffee',
  symbol: 'O',
  number: 8,
};

const FLAMINGOSOFT = {
  name: 'Flamingosoft',
  symbol: 'F',
  number: 7,
};

const BOW_WOW_GAMES = {
  name: 'Bow Wow Game',
  symbol: 'B',
  number: 6,
};

const GIRAFFE_BEER = {
  name: 'Giraffe Beer',
  symbol: 'G',
  number: 5,
};

const FULL_DECK = [
  ...repeat({ company: ELEPHANT_MARS_TRAVEL }, 10),
  ...repeat({ company: HIPPO_POWER_TECH }, 9),
  ...repeat({ company: OCTO_COFFEE }, 8),
  ...repeat({ company: FLAMINGOSOFT }, 7),
  ...repeat({ company: BOW_WOW_GAMES }, 6),
  ...repeat({ company: GIRAFFE_BEER }, 5),
];

const DEFAULT_STATE = {
  deck: FULL_DECK,
  cardsInDeck: 45,
  players: [],
  market: [],
  turn: 0,
  step: 'DRAW',
};

const PLAYER_TEMPLATE = {
  hand: [],
  field: [],
  cardsInHand: 0,
  tokens: [],
  coins: repeat({ value: 1 }, 10),
};

class Startups {
  state;

  constructor(numberPlayers) {
    this.state = DEFAULT_STATE;
    this.state.players = repeat(PLAYER_TEMPLATE, numberPlayers);
    this.init();
  }

  init() {
    // Shuffle deck
    this.shuffleDeck();
    // Burn 3 cards;
    this.draw();
    this.draw();
    this.draw();
    // Give each player 3 cards
    for (let p = 0; p < this.state.players.length; p++) {
      for (let i = 0; i < 3; i++) {
        this.state.players[p].hand.push(this.draw());
        this.state.players[p].cardsInHand++;
      }
    }
  }

  // in-place using Durstenfeld shuffle algorithm
  shuffleDeck() {
    const deck = this.state.deck;
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i - 1));
      let temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
  }

  draw() {
    return this.state.deck.shift();
  }

  currentPlayer() {
    return this.state.players[this.state.turn];
  }

  nextPlayer() {
    this.state.turn = (this.state.turn + 1) % this.state.players.length;
  }

  loadState(state) {
    this.state = JSON.parse(state);
  }

  dumpState() {
    return JSON.stringify(this.state);
  }

  move(move) {
    const validMoves = this.moves();
    if (validMoves.includes(move)) {
      return 'INVALID_MOVE';
    }
    switch (move.action) {
      case 'DRAW':
        this.doDrawMove(move);
        break;
      case 'PLAY':
        this.doPlayMove(move);
    }
  }

  doPlayMove(move) {
    const cardIndex = move.card;
    const card = this.currentPlayer().hand.splice(cardIndex, 1)[0];
    switch (move.dest) {
      case 'FIELD':
        this.currentPlayer().field.push(card);
        break;
      case 'MARKET':
        this.state.market.push(card);
        break;
    }
    this.currentPlayer().cardsInHand--;
    this.state.step = 'DRAW';
    this.nextPlayer();
  }

  doDrawMove(move) {
    switch (move.src) {
      case 'DECK':
        const card = this.draw();
        this.currentPlayer().hand.push(card);
        this.currentPlayer().cardsInHand++;
        this.state.step = 'PLAY';
        break;
      case 'MARKET':
        break;
    }
  }

  moves() {
    switch (this.state.step) {
      case 'DRAW':
        return [
          { action: 'DRAW', src: 'DECK' },
          { action: 'DRAW', src: 'MARKET' },
        ];
      case 'PLAY':
        return [
          ...this.currentPlayer().hand.reduce(
            (acc, c, i) => [
              ...acc,
              { action: 'PLAY', dest: 'FIELD', card: i },
              { action: 'PLAY', dest: 'MARKET', card: i },
            ],
            []
          ),
        ];
      case 'GAME_OVER':
        return [];
    }
  }
}

function repeat(thingToRepeat, timesToRepeat) {
  const r = [];
  for (let i = 0; i < timesToRepeat; i++) {
    r.push(JSON.parse(JSON.stringify(thingToRepeat)));
  }
  return r;
}

module.exports = {
  Startups,
};
