// Companies

const ELEPHANT_MARS_TRAVEL = {
  name: 'Elephant Mars Travel',
  symbol: 'E',
  number: 10,
  color: 'red',
};

const HIPPO_POWER_TECH = {
  name: 'Hippo Power Tech',
  symbol: 'H',
  number: 9,
  color: 'green',
};

const OCTO_COFFEE = {
  name: 'Octocoffee',
  symbol: 'O',
  number: 8,
  color: 'blue',
};

const FLAMINGOSOFT = {
  name: 'Flamingosoft',
  symbol: 'F',
  number: 7,
  color: 'yellow',
};

const BOW_WOW_GAMES = {
  name: 'Bow Wow Game',
  symbol: 'B',
  number: 6,
  color: 'magenta',
};

const GIRAFFE_BEER = {
  name: 'Giraffe Beer',
  symbol: 'G',
  number: 5,
  color: 'grey',
};

const companies = [ELEPHANT_MARS_TRAVEL, HIPPO_POWER_TECH, OCTO_COFFEE, FLAMINGOSOFT, BOW_WOW_GAMES, GIRAFFE_BEER];

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
  lastDrawnCompany: null,
  results: null,
};

const PLAYER_TEMPLATE = {
  hand: [],
  field: [],
  cardsInHand: 0,
  tokens: [],
  coins: repeat({ value: 1 }, 10),
  info: null,
};

class Startups {
  state;

  constructor({ state, numberPlayers, players }) {
    if (state) {
      this.loadState(state);
    } else if (numberPlayers) {
      this.state = DEFAULT_STATE;
      this.state.players = repeat(PLAYER_TEMPLATE, numberPlayers);
      this.init();
    } else if (players) {
      this.state = DEFAULT_STATE;
      this.state.players = players.map((p) => ({ ...this.clone(PLAYER_TEMPLATE), info: p }));
      this.init();
    } else {
      throw new Error('Have to supply oneof [state, numberPlayers]');
    }
  }

  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
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

  updateMonopolies() {
    for (let company of companies) {
      this.updateMonopoly(company);
    }
  }

  updateMonopoly(company) {
    let existingMonopolyIndex = null;
    let maxCount = 0;
    let maxCountIndex = null;
    for (let i = 0; i < this.state.players.length; i++) {
      const player = this.state.players[i];
      if (player.tokens.find((t) => t.company.symbol === company.symbol)) {
        existingMonopolyIndex = i;
      }
      const count = player.field.filter((c) => c.company.symbol === company.symbol).length;
      // If you are higher than the current highest count or equal but already have the monopoly
      if (count > maxCount || (count === maxCount && i === existingMonopolyIndex)) {
        maxCount = count;
        maxCountIndex = i;
      }
    }
    // Take token from existing token holder
    if (existingMonopolyIndex !== null) {
      this.state.players[existingMonopolyIndex].tokens = this.state.players[existingMonopolyIndex].tokens.filter(
        (t) => t.company.symbol !== company.symbol
      );
    }
    if (maxCountIndex !== null) {
      // give token to player with monopoly
      this.state.players[maxCountIndex].tokens.push({ company });
    }
  }

  currentPlayer() {
    return this.state.players[this.state.turn];
  }

  nextPlayer() {
    this.state.turn = (this.state.turn + 1) % this.state.players.length;
    if (this.state.deck.length === 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.state.step = 'GAME_OVER';
    console.log(this.state.step);

    // All players play their hands onto their field
    this.state.players.forEach((player) => {
      const cards = player.hand.splice(0, player.hand.length);
      player.cardsInHand = 0;
      player.field.push(...cards);

      // Take away all previously held tokens
      player.tokens = [];
    });

    // Calculate new monopolies
    const companyResults = [];
    companies.forEach((company) => {
      let maxCount = -1;
      let maxCountIndex = null;
      const playersWithCards = [];
      this.state.players.forEach((player, i) => {
        const count = player.field.filter((c) => c.company.symbol === company.symbol).length;
        if (count > 0) {
          playersWithCards.push({ player: i, count });
        }
        if (count > maxCount) {
          maxCount = count;
          maxCountIndex = i;
        } else if (count === maxCount) {
          // If drawn with current highest there's no current leader
          maxCountIndex = null;
        }
      });
      if (maxCountIndex) {
        companyResults.push({
          company,
          monopolyPlayer: maxCountIndex,
          // Player is owed coins by all the other players that had cards for this company.
          owedCoins: [...playersWithCards.filter((p) => p.player !== maxCountIndex)],
        });
      } else {
        // No one gets any coins for this company because there was a draw.
        companyResults.push({ company, monopolyPlayer: null, owedCoins: null });
      }
    });

    // Update player coins based on results. Each coin transferred is now worth 3.
    companyResults.forEach((result) => {
      if (result.monopolyPlayer && result.owedCoins) {
        result.owedCoins.forEach((o) => {
          console.log(`Player ${o.player} paying ${o.count} to player ${result.monopolyPlayer}. O: ${o}`);
          const coins = this.state.players[o.player].coins.splice(0, o.count).map((c) => ({ value: 3 }));
          this.state.players[result.monopolyPlayer].coins.push(...coins);
        });
      }
    });

    let currHigh = 0;
    let currHighPlayers = [];
    this.state.players.forEach((player, i) => {
      const score = player.coins.reduce((acc, c) => acc + c.value, 0);
      console.log(`${i}: ${score}`);
      if (score > currHigh) {
        currHigh = score;
        currHighPlayers = [{ player: i, score }];
      } else if (score == currHigh) {
        currHighPlayers.push({ player: i, score });
      }
    });

    let winner;
    console.log('currHighPlayers ', currHighPlayers);
    if (currHighPlayers.length == 1) {
      winner = currHighPlayers[0];
    } else {
      // TODO tiebreaker Get player with least number of cards
    }

    this.state.results = {
      companyResults,
      winner,
    };
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
        this.state.market.push({ ...card, coins: [] });
        break;
    }
    this.currentPlayer().cardsInHand--;
    this.state.step = 'DRAW';
    this.state.lastDrawnCompany = null;
    this.updateMonopolies();
    this.nextPlayer();
  }

  doDrawMove(move) {
    let card;
    switch (move.src) {
      case 'DECK':
        card = this.draw();
        if (move.cost) {
          this.payCostToDraw();
        }
        break;
      case 'MARKET':
        card = this.state.market.splice(move.card, 1)[0];
        if (card.coins) {
          const coins = card.coins.splice(0, card.coins.length);
          this.currentPlayer().coins.push(...coins);
          delete card.coins;
          this.state.lastDrawnCompany = card.company;
        }
        break;
    }
    this.currentPlayer().hand.push(card);
    this.currentPlayer().cardsInHand++;
    this.state.step = 'PLAY';
  }

  moves() {
    switch (this.state.step) {
      case 'DRAW':
        return this.getDrawMoveOptions();
      case 'PLAY':
        return this.getPlayMoveOptions();
      case 'GAME_OVER':
        return [];
    }
  }

  getDrawMoveOptions() {
    const options = [];
    // Don't let players draw from deck if they don't have enough coins
    if (this.calcDrawCost() <= this.currentPlayer().coins.length) {
      options.push({ action: 'DRAW', src: 'DECK', cost: this.calcDrawCost() });
    }
    const marketDrawOptions = this.state.market
      .map((c, i) => ({ action: 'DRAW', src: 'MARKET', card: i }))
      // Don't allow player to draw a card from markplace if they have a token for that company
      .filter((a) => !this.hasMonopolyToken(this.state.market[a.card].company));

    return [...options, ...marketDrawOptions];
  }

  getPlayMoveOptions() {
    const options = [];

    this.currentPlayer().hand.forEach((card, i) => {
      // All cards can always be played to the field
      options.push({ action: 'PLAY', dest: 'FIELD', card: i });
      // Don't allow a play to play a card into the market if they just picked up that same company.
      if (!this.state.lastDrawnCompany || card.company.symbol != this.state.lastDrawnCompany.symbol) {
        options.push({ action: 'PLAY', dest: 'MARKET', card: i });
      }
    });
    return options;
  }

  calcDrawCost() {
    return this.state.market.filter((c) => !this.hasMonopolyToken(c.company)).length;
  }

  payCostToDraw() {
    this.state.market.forEach((card) => {
      if (!this.hasMonopolyToken(card.company)) {
        const coin = this.currentPlayer().coins.splice(0, 1)[0];
        card.coins.push(coin);
      }
    });
  }

  hasMonopolyToken(company) {
    return this.currentPlayer().tokens.find((t) => t.company.symbol === company.symbol);
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
  companies,
};
