import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Box, Typography, Grid, Avatar, Button } from '@material-ui/core';
import { getSocket } from '../sockets';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

type LobbyScreenProps = {
  nickName: string;
  roomCode: string;
  hostMode: 'Player' | 'Host';
  onStartGame: () => void;
};

type Player = {
  id: string;
  nickName: string;
};

export default function LobbyScreen(props: LobbyScreenProps) {
  const { nickName, roomCode, hostMode, onStartGame } = props;
  const [players, setPlayers] = useState<Array<Player>>([]);
  const classes = useStyles();
  const socket = getSocket();

  // Will only be called on first render
  useEffect(() => {
    socket.emit('player-join-room', { roomCode, nickName, hostMode });
    socket.on('room-status', ({ roomId, players }: { roomId: string; players: Array<Player> }) => {
      setPlayers(players.filter((p) => p.nickName !== 'Host'));
    });
    socket.on('start-game', () => {
      onStartGame();
    });

    // make sure we clean up listeners to avoid memory leaks
    return function cleanUp() {
      socket.off('room-status');
    };
  }, []);

  const onAllPlayersReady = () => {
    socket.emit('all-players-ready', { roomCode });
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" align="center">
        Room Code: {roomCode}
      </Typography>
      <Typography variant="h5" align="center">
        Nick name: {nickName}
      </Typography>
      <Box mt={3}>
        <Paper className={classes.paper}>
          <Grid>
            {players.length === 0 && (
              <Box pt={3} pb={3}>
                <Typography>Waiting for players to join...</Typography>
              </Box>
            )}
            {players.map((player) => (
              <Box display="flex" flexDirection="row" alignItems="center" key={player.id}>
                <Avatar alt={player.nickName}>{player.nickName[0].toUpperCase()}</Avatar>
                <Box padding={3}>
                  <Typography variant="h6">{player.nickName}</Typography>
                </Box>
              </Box>
            ))}
          </Grid>
        </Paper>
        {hostMode !== null && (
          <Box mt={3}>
            <Button
              type="submit"
              disabled={players.length < 2}
              fullWidth
              variant="contained"
              color="primary"
              onClick={onAllPlayersReady}
            >
              All Players Ready
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
