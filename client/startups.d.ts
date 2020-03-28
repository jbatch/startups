export class Startups {
  state: State;
  constructor();
  constructor(state: State);

  loadState(state: string): void;

  move(move: Move): void;

  moves(): [Move];
}

export type Move = DRAW_MOVE | PLAY_MOVE;
export type DRAW_MOVE = { action: 'DRAW'; src: 'DECK' | 'MARKET' };
export type PLAY_MOVE = { action: 'PLAY'; card: Card };

export type Company = {
  name: string;
  symbol: string;
  number: number;
};

export type State = {
  deck: [Card];
  cardsInDeck: number;
  players: [Player];
  market: [MarketCard];
  turn: number;
  step: string;
};

export type Player = {
  hand: [Card];
  field: [Card];
  cardsInHand: number;
  tokens: [Token];
  coins: [Coin];
};

export type MarketCard = {
  card: Card;
  coins: [Coin];
};

export type Card = {
  company: Company;
};

export type Token = {
  company: Company;
};

export type Coin = {
  value: number;
};
