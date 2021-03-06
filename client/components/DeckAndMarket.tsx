import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { DRAW_MOVE, Startups, Move } from '../game-engine';
import PlayingCard from './PlayingCard';

type DeckProps = {
  startups: Startups;
  playerId: string;
  handleActionClicked: (move: Move) => void;
};

export function Deck(props: DeckProps) {
  const { startups, playerId, handleActionClicked } = props;
  const isMyTurn = (startups.state.players[startups.state.turn].info as any).id === playerId;

  let cardText = 'Deck';
  const drawMove = startups.moves().find((move) => move.action === 'DRAW' && move.src === 'DECK') as any;
  if (isMyTurn && startups.state.step === 'DRAW') {
    if (!drawMove) {
      cardText = "Can't draw from deck";
    } else {
      cardText = drawMove.cost > 0 ? `Draw from deck (${drawMove.cost} coins)` : 'Draw from deck';
    }
  }

  return (
    <PlayingCard
      name={cardText}
      color="blue"
      number={0}
      coins={0}
      height={150}
      onNoOnClickMessage="You cannot afford to pick up this card!"
      onClick={drawMove ? () => handleActionClicked(drawMove as Move) : undefined}
    />
  );
}

type MarketProps = {
  startups: Startups;
  handleActionClicked: (move: Move) => void;
  playerId: string;
};

export function Market(props: MarketProps) {
  const { handleActionClicked, startups, playerId } = props;
  const isPlayerTurn = (startups.state.players[startups.state.turn].info as any).id === playerId;

  const marketCards = startups.state.market;
  const marketMoves = startups
    .moves()
    .map((m) => m as DRAW_MOVE)
    .filter((m) => m.src === 'MARKET');

  const cardsToRender = marketCards.map((card, idx) => ({
    card,
    idx,
    move: marketMoves.find((m: any) => m.card === idx),
  }));
  return (
    <div>
      <Typography variant="h5">Market</Typography>
      <Grid container direction="row" justify="space-around">
        {cardsToRender.length === 0 && <Typography>Market is empty</Typography>}
        {cardsToRender.map(({ card, move, idx }) => (
          <PlayingCard
            name={card.company.name}
            color={move || !isPlayerTurn ? card.company.color : 'grey'}
            number={card.company.number}
            coins={card.coins.length}
            height={150}
            onNoOnClickMessage="You already have a monopoly on this company!"
            onClick={move ? () => handleActionClicked(move) : undefined}
            key={'draw-deck-action-' + idx}
          />
        ))}
      </Grid>
    </div>
  );
}
