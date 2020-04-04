import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@material-ui/core';
import { getSocket } from '../sockets';
import { Startups, Move, Card } from '../game-engine';
import ActionBar, { ActionBarDrawer, DrawerType } from '../components/ActionBar';
import { Deck, Market } from '../components/DeckAndMarket';
import GameOverView from '../components/GameOverView';
import HostView from '../components/HostView';
import PlayingCard from '../components/PlayingCard';

type PlayGameScreenProps = {
  playerId: string;
};

type Player = {
  id: string;
  nickName: string;
};

type LastMove = {
  playerName: string;
  card: Card;
  dest: 'FIELD' | 'MARKET';
};
type GameState = {
  roomCode: string;
  players: Array<Player>;
  gameState: string;
  hostId: string;
};
export default function PlayGameScreen(props: PlayGameScreenProps) {
  const { playerId } = props;
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [startups, setStartups] = useState<Startups>(null);
  const [openDrawerName, setOpenDrawerName] = useState<DrawerType>(null);
  const [flipDeck, setFlipDeck] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>(null);
  const [hostId, setHostId] = useState<string>(null);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);

  const socket = getSocket();

  const closeDrawer = () => setOpenDrawerName(null);
  const openPlayersDrawer = () => setOpenDrawerName('players');
  const openHandDrawer = () => setOpenDrawerName('hand');

  // Will only be called on first render
  useEffect(() => {
    socket.on('game-state', ({ roomCode, players, gameState, hostId }: GameState) => {
      setPlayers(players.filter((p) => p.nickName !== 'Host'));
      setRoomId(roomCode);
      setHostId(hostId);

      const s = new Startups({ state: gameState });
      (window as any).startupsD = s;
      console.log(s); // keep this till final release

      // if we recieve an update for a play move that was not our own, display it and wait before
      // setting the new state
      if (
        s.state.lastPlayedMove &&
        (s.state.players[s.state.lastPlayedMove.player].info as any).id !== playerId &&
        s.state.step === 'DRAW'
      ) {
        const playerName = (s.state.players[s.state.lastPlayedMove.player].info as any).nickName as string;
        const { card, dest } = s.state.lastPlayedMove;
        setLastMove({ playerName, card, dest });

        setTimeout(() => {
          setStartups(s);
          setLastMove(null);
        }, 2000);
      } else {
        setStartups(s);
      }

      // Auto-open/close the hand drawer
      const isMyTurn = (s.state.players[s.state.turn].info as any).id === playerId;
      if (isMyTurn && s.state.step === 'PLAY') {
        openHandDrawer();
      } else {
        closeDrawer();
      }
    });
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
    const { name, color, number } = topOfDeck.company;

    return (
      <Container maxWidth="sm">
        <Typography variant="h6">It's your turn to draw a card!</Typography>
        {!flipDeck && <Deck startups={startups} handleActionClicked={handleActionClicked} playerId={playerId} />}
        {flipDeck && <PlayingCard name={name} color={color} number={number} coins={0} height={150} />}
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

  const WaitingView = ({ curPlayer }: { curPlayer: string }) => {
    if (lastMove) {
      const { playerName, card, dest } = lastMove;
      const destStr = dest === 'FIELD' ? 'their field' : 'The Market™';
      const { name, color, number } = card.company;
      return (
        <Container maxWidth="sm">
          <Typography variant="h5">
            <strong>{playerName}</strong> played a "{card.company.name}" to {destStr}
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="center" height={150}>
            <PlayingCard name={name} color={color} number={number} coins={0} />
          </Box>
        </Container>
      );
    }
    return (
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
  };
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

  const isHost = hostId === playerId;
  const isPlayer = startups.state.players.some((player) => (player.info as any).id === playerId);

  if (isHost && !isPlayer && phase !== 'GAME_OVER') return <HostView startups={startups} playerId={playerId} />;
  if (phase === 'GAME_OVER')
    return <GameOverView startups={startups} playerId={playerId} isHost={isHost} isPlayer={isPlayer} />;
  if (!isMyTurn) return <WaitingView curPlayer={curPlayerName} />;
  if (phase === 'DRAW') return <DrawingView />;
  if (phase === 'PLAY') return <PlayingView />;
}
