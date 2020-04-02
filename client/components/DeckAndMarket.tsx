import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Box, Typography } from '@material-ui/core';
import { DRAW_MOVE, MarketCard, Startups, Move } from '../game-engine';
import PlayingCard from './PlayingCard';
import ActionBar, { ActionBarDrawer } from './ActionBar';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

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
      onClick={() => handleActionClicked(drawMove as Move)}
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
      <Grid container direction="row" justify="space-between">
        {cardsToRender.length === 0 && <Typography>Market is empty</Typography>}
        {cardsToRender.map(({ card, move, idx }) => (
          <PlayingCard
            name={card.company.name}
            color={move || !isPlayerTurn ? card.company.color : 'grey'}
            number={card.company.number}
            coins={card.coins.length}
            height={150}
            onClick={move ? () => handleActionClicked(move) : undefined}
            key={'draw-deck-action-' + idx}
          />
        ))}
      </Grid>
    </div>
  );
}
