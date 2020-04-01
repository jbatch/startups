export class Startups {
  state: State;
  constructor({ state, numberPlayers, players }: { state?: string; numberPlayers?: number; players?: Array<Object> });
  init(): void;
  shuffleDeck(): void;
  draw(): Card;
  updateMonopolies(): void;
  updateMonopoly(company: Company): void;
  currentPlayer(): Player;
  nextPlayer(): void;
  gameOver(): void;
  nextGameOverStep(): void;
  dumpState(): string;
  loadState(state: string): void;
  move(move: Move): void;
  doPlayMove(move: PLAY_MOVE): void;
  doDrawMove(move: DRAW_MOVE): void;
  moves(): Array<Move>;
  getDrawMoveOptions(): Array<DRAW_MOVE>;
  getPlayMoveOptions(): Array<PLAY_MOVE>;
  calcDrawCost(): number;
  payCostToDraw(): void;
  hasMonopolyToken(company: Company): boolean;
  playerHasMonopolyToken(playerIndex: number, company: Company): boolean;
}

export type Move = DRAW_MOVE | PLAY_MOVE;
export type DRAW_MOVE = { action: 'DRAW'; src: 'DECK'; cost: number } | { action: 'DRAW'; src: 'MARKET'; card: number };
export type PLAY_MOVE =
  | { action: 'PLAY'; dest: 'FIELD'; card: number }
  | { action: 'PLAY'; dest: 'MARKET'; card: number };

export type Company = {
  name: string;
  symbol: string;
  number: number;
  color: string;
};

export type State = {
  deck: Array<Card>;
  cardsInDeck: number;
  players: Array<Player>;
  market: Array<MarketCard>;
  turn: number;
  step: 'DRAW' | 'PLAY' | 'GAME_OVER';
  lastDrawnCompany: Company | null;
  results: GameResult | null;
  playersPreGameOver: Array<Player>;
};

export type GameResult = {
  companyResults: Array<CompanyResult>;
  winner: { player: number; score: number };
  tie?: Array<{ player: number; score: number }>;
  gameOverStepIndex: number;
};

export type CompanyResult = {
  company: Company;
  monopolyPlayer: Player | null;
  owedCoins: Array<{ player: number; count: number }> | null;
};

export type Player = {
  hand: Array<Card>;
  field: Array<Card>;
  cardsInHand: number;
  tokens: Array<Token>;
  coins: Array<Coin>;
  info?: Object;
};

export type MarketCard = Card & {
  coins: Array<Coin>;
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

export const companies: Array<Company>;
