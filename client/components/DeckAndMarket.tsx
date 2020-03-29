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
  if (!isMyTurn) {
    return (
      <Grid container alignItems="center" justify="center">
        <Grid item>
          <PlayingCard name={``} color="grey" number={0} coins={0} height={150} />
        </Grid>
      </Grid>
    );
  }
  const validMove: any = startups.moves().find((move) => move.action === 'DRAW' && move.src === 'DECK') as any;
  if (!validMove) {
    return (
      <Grid container alignItems="center" justify="center">
        <Grid item>
          <PlayingCard name={"Can't draw from deck"} color="grey" number={0} coins={0} height={150} />
        </Grid>
      </Grid>
    );
  }
  const cardText = validMove.cost > 0 ? `Draw from deck (${validMove.cost} coins)` : 'Draw from deck';
  return (
    <PlayingCard
      name={cardText}
      color="grey"
      number={0}
      coins={0}
      height={150}
      onClick={() => handleActionClicked(validMove as Move)}
    />
  );
}

type MarketProps = {
  startups: Startups;
  handleActionClicked: (move: Move) => void;
  playerId: string;
};

export function Market(props: MarketProps) {
  // const classes = useStyles();
  const { handleActionClicked, startups, playerId } = props;
  const mapDrawMarketMove = (
    card: MarketCard,
    moves: Array<{ action: 'DRAW'; src: 'MARKET'; card: number }>,
    index: number
  ) => {
    const move = moves.find((m) => m.card === index);
    return (
      <PlayingCard
        name={card.company.name}
        color={move ? card.company.color : 'grey'}
        number={card.company.number}
        coins={card.coins.length}
        height={150}
        onClick={move ? () => handleActionClicked(move) : undefined}
        key={'draw-deck-action-' + index}
      />
    );
  };

  const marketCards = startups.state.market;
  const marketMoves = startups
    .moves()
    .map((m) => m as DRAW_MOVE)
    .filter((m) => m.src === 'MARKET');
  const marketDrawMoves = (
    <Grid container direction="row" justify="space-between">
      {marketCards.length === 0 && (
        <Box>
          <Typography>Market is empty</Typography>
        </Box>
      )}
      {marketCards.map((card, i) => mapDrawMarketMove(card, marketMoves as any, i))}
    </Grid>
  );
  return (
    <div>
      <Typography variant="h5">Market</Typography>
      {marketDrawMoves}
    </div>
  );
}
