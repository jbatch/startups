import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@material-ui/core';
import { getSocket } from '../sockets';
import { Startups, Move } from '../game-engine';
import ActionBar, { ActionBarDrawer, DrawerType } from '../components/ActionBar';
import { Deck, Market } from '../components/DeckAndMarket';
import GameOverView from '../components/GameOverView';
import { ClickableCard } from '../components/ClickableCard';

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
  const [flipDeck, setFlipDeck] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>(null);

  const socket = getSocket();

  const closeDrawer = () => setOpenDrawerName(null);
  const openPlayersDrawer = () => setOpenDrawerName('players');
  const openHandDrawer = () => setOpenDrawerName('hand');

  // Will only be called on first render
  useEffect(() => {
    socket.on(
      'game-state',
      ({ roomCode, players, gameState }: { roomCode: string; players: Array<Player>; gameState: string }) => {
        // console.log(gameState);
        setPlayers(players.filter((p) => p.nickName !== 'Host'));
        setRoomId(roomCode);
        const s = new Startups({ state: gameState });
        (window as any).startups = s;
        setStartups(s);

        const isMyTurn = (s.state.players[s.state.turn].info as any).id === playerId;
        if (isMyTurn && s.state.step === 'PLAY') {
          openHandDrawer();
        } else {
          closeDrawer();
        }
      }
    );
    socket.on('host-disconnected', () => {
      alert('Host Disconnected');
      socket.emit('player-leave-room', { roomCode: roomId });
    });
    socket.emit('player-loaded-game');

    // make sure we clean up listeners to avoid memory leaks
    return function cleanUp() {
      socket.off('game-state');
    };
  }, []);

  const handleActionClicked = (move: Move) => {
    console.log('Action clicked: ', move);
    if (move.action === 'DRAW' && move.src === 'DECK') {
      setFlipDeck(true);
      setTimeout(() => {
        socket.emit('player-move', { move });
        setFlipDeck(false);
      }, 1000);
    } else {
      socket.emit('player-move', { move });
      setFlipDeck(false);
    }
  };

  const DrawingView = () => {
    const topOfDeck = startups.state.deck[0];
    return (
      <Container maxWidth="sm">
        <Typography variant="h6">It's your turn to draw a card!</Typography>
        {!flipDeck && <Deck startups={startups} handleActionClicked={handleActionClicked} playerId={playerId} />}
        {flipDeck && <ClickableCard card={topOfDeck} moves={[]} onMoveSelected={() => {}} />}
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
  };

  const WaitingView = ({ curPlayer }: { curPlayer: string }) => (
    <Container maxWidth="sm">
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
    <Container maxWidth="sm">
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

  const LoadingView = () => <div>Loading...</div>;

  const loading = !startups;
  if (loading) return <LoadingView />;

  const phase = startups.state.step;
  const curPlayerTurn = startups.state.players[startups.state.turn];
  const curPlayerName = (curPlayerTurn.info as any).nickName;
  const isMyTurn = (curPlayerTurn.info as any).id === playerId;

  if (phase === 'GAME_OVER') return <GameOverView startups={startups} playerId={playerId} />;
  if (!isMyTurn) return <WaitingView curPlayer={curPlayerName} />;
  if (phase === 'DRAW') return <DrawingView />;
  if (phase === 'PLAY') return <PlayingView />;
}
