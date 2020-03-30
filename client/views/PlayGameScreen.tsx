import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Typography, Box } from '@material-ui/core';
import { getSocket } from '../sockets';
import { Startups, Move } from '../game-engine';
import ActionBar, { ActionBarDrawer, DrawerType } from '../components/ActionBar';
import { Deck, Market } from '../components/DeckAndMarket';

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
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [startups, setStartups] = useState<Startups>(null);
  const [openDrawerName, setOpenDrawerName] = useState<DrawerType>(null);

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

        const isMyTurn = (s.state.players[s.state.turn].info as any).id === playerId;
        if (isMyTurn && s.state.step === 'PLAY') {
          openHandDrawer();
        } else {
          closeDrawer();
        }
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
    return (
      <div>
        <Typography variant="h6">It's your turn to draw a card!</Typography>
        <Deck startups={startups} handleActionClicked={handleActionClicked} playerId={playerId} />
        <Box mt={2} />
        <Market startups={startups} handleActionClicked={handleActionClicked} playerId={playerId} />
        <ActionBar openHandDrawer={openHandDrawer} openPlayersDrawer={openPlayersDrawer} />

        <ActionBarDrawer
          startups={startups}
          playerId={playerId}
          openDrawerName={openDrawerName}
          onClose={closeDrawer}
          handleCardClickedFromHand={null}
        />
      </div>
    );
  };

  const WaitingView = ({ curPlayer }: { curPlayer: string }) => (
    <Container maxWidth="md">
      <Typography variant="h5">
        Waiting for <strong>{curPlayer}</strong>...
      </Typography>

      <Box mt={2} />
      <Market startups={startups} handleActionClicked={handleActionClicked} playerId={playerId} />

      <ActionBar openHandDrawer={openHandDrawer} openPlayersDrawer={openPlayersDrawer} />

      <ActionBarDrawer
        startups={startups}
        playerId={playerId}
        openDrawerName={openDrawerName}
        onClose={closeDrawer}
        handleCardClickedFromHand={null}
      />
    </Container>
  );
  const PlayingView = () => (
    <Container maxWidth="md">
      <Typography>
        Play a card from your hand to your field or the <strong>Open Market™</strong>
      </Typography>
      <Box mt={2} />

      <Market startups={startups} handleActionClicked={handleActionClicked} playerId={playerId} />

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
  const GameOverView = () => {
    const winner = startups.state.players[startups.state.results.winner.player];
    const winnerName = (winner as any).info.nickName;
    const winnerPoints = startups.state.results.winner.score;
    return (
      <Container>
        <Typography variant="h2" align="center">
          And the winner is...
        </Typography>
        <Box mt={3} />
        <Typography variant="h2" align="center">
          {winnerName}!!
        </Typography>
        <Typography variant="h3" align="center">
          {winnerPoints}!!
        </Typography>
      </Container>
    );
  };
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
