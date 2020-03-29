import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import SearchIcon from '@material-ui/icons/Search';
import { Container, Typography, Button, Paper, Grid, Box, Avatar, Badge, AppBar, Toolbar } from '@material-ui/core';
import { getSocket } from '../sockets';
import { Startups, DRAW_MOVE, PLAY_MOVE, Move, companies, Company, Card, MarketCard } from '../game-engine';
import PlayingCard from '../components/PlayingCard';
import ActionBar, { ActionBarDrawer, DrawerType } from '../components/ActionBar';
import PlayerStatsComponent from '../components/PlayerStatsComponent';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
  },
  fabButton: {
    position: 'absolute',
    zIndex: 1,
    top: -30,
    left: 0,
    right: 0,
    margin: '0 auto',
  },
  spacer: {
    height: theme.spacing(4),
  },
}));

type PlayGameScreenProps = {
  playerId: string;
};

type Player = {
  id: string;
  nickName: string;
};

export default function PlayGameScreen(props: PlayGameScreenProps) {
  const { playerId } = props;
  const [handDrawerOpen, setHandDrawerOpen] = useState<boolean>(false);
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [startups, setStartups] = useState<Startups>(null);
  const [handOpen, setHandOpen] = useState<boolean>(false);
  const [openDrawerName, setOpenDrawerName] = useState<DrawerType>(null);

  const classes = useStyles();
  const socket = getSocket();

  const closeDrawer = () => setOpenDrawerName(null);
  const openPlayersDrawer = () => setOpenDrawerName('players');
  const openHandDrawer = () => setOpenDrawerName('hand');

  // Will only be called on first render
  useEffect(() => {
    socket.on(
      'game-state',
      ({ roomId, players, gameState }: { roomId: string; players: Array<Player>; gameState: string }) => {
        console.log('GAME-STATE');
        // console.log(gameState);
        setPlayers(players.filter((p) => p.nickName !== 'Host'));
        const s = new Startups({ state: gameState });
        (window as any).startups = s;
        console.log(s);
        setStartups(s);
      }
    );
    socket.emit('player-loaded-game');

    // make sure we clean up listeners to avoid memory leaks
    return function cleanUp() {
      socket.off('game-state');
    };
  }, []);

  const handleActionClicked = (move: Move) => {
    console.log('Action clicked: ', move);
    socket.emit('player-move', { move });
  };

  const DrawingView = () => {
    const mapDrawDeckMove = (move: DRAW_MOVE, index: number) => {
      if (!move) {
        return (
          <PlayingCard
            name={`Can't draw from deck`}
            color="grey"
            number={0}
            coins={0}
            height={150}
            key={'draw-deck-action-' + index}
          />
        );
      }
      if (move.src !== 'DECK') {
        throw new Error('Impossible');
      }
      let text;
      if (move.cost > 0) {
        text = `Draw from deck (${move.cost} coins)`;
      } else {
        text = 'Draw from deck';
      }
      return (
        <PlayingCard
          name={text}
          color="grey"
          number={0}
          coins={0}
          height={150}
          onClick={() => handleActionClicked(move)}
          key={'draw-deck-action-' + index}
        />
      );
    };
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
    const deckDrawMove = (
      <Grid container alignItems="center" justify="center">
        <Grid item>
          {mapDrawDeckMove(
            startups
              .moves()
              .map((m) => m as DRAW_MOVE)
              .filter((m) => m.src === 'DECK')[0],
            0
          )}
        </Grid>
      </Grid>
    );
    const marketCards = startups.state.market;
    const marketMoves = startups
      .moves()
      .map((m) => m as DRAW_MOVE)
      .filter((m) => m.src === 'MARKET');
    const marketDrawMoves = (
      <Grid container direction="row" justify="space-between">
        {marketCards.map((card, i) => mapDrawMarketMove(card, marketMoves as any, i))}
      </Grid>
    );
    return (
      <div>
        <Typography>Draw</Typography>
        {deckDrawMove}
        {marketDrawMoves}
        <ActionBar openHandDrawer={openHandDrawer} openPlayersDrawer={openPlayersDrawer} />

        <ActionBarDrawer
          startups={startups}
          playerId={playerId}
          openDrawerName={openDrawerName}
          onClose={closeDrawer}
          handleCardClickedFromHand={() => {}}
        />
      </div>
    );
  };

  const WaitingView = ({ curPlayer }: { curPlayer: string }) => (
    <Container maxWidth="md">
      <Typography variant="h5">Waiting for other players</Typography>
      <Typography variant="h4" align="center" style={{ marginTop: '12px' }}>
        {curPlayer}
      </Typography>
      <ActionBar openHandDrawer={openHandDrawer} openPlayersDrawer={openPlayersDrawer} />

      <ActionBarDrawer
        startups={startups}
        playerId={playerId}
        openDrawerName={openDrawerName}
        onClose={closeDrawer}
        handleCardClickedFromHand={() => {}}
      />
    </Container>
  );
  const PlayingView = () => (
    <Container maxWidth="md">
      <Typography variant="h5" align="center">
        Play the game already: "AAAA"
      </Typography>
      <PlayerStatsComponent startups={startups} companies={companies} />
      <Typography variant="h5" align="center">
        Actions
      </Typography>

      <ActionBar openHandDrawer={openHandDrawer} openPlayersDrawer={openPlayersDrawer} />

      <ActionBarDrawer
        startups={startups}
        playerId={playerId}
        openDrawerName={openDrawerName}
        onClose={closeDrawer}
        handleCardClickedFromHand={handleActionClicked}
      />
    </Container>
  );
  const GameOverView = () => <div>GameOver View</div>;
  const LoadingView = () => <div>Loading...</div>;

  const loading = !startups;
  if (loading) return <LoadingView />;

  const phase = startups.state.step;
  const curPlayerTurn = startups.state.players[startups.state.turn];
  const curPlayerName = (curPlayerTurn.info as any).nickName;
  const isMyTurn = (curPlayerTurn.info as any).id === playerId;

  if (phase === 'GAME_OVER') return <GameOverView />;
  if (!isMyTurn) return <WaitingView curPlayer={curPlayerName} />;
  if (phase === 'DRAW') return <DrawingView />;
  if (phase === 'PLAY') return <PlayingView />;
}
