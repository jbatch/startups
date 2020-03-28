import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography, Grid, Avatar } from '@material-ui/core';
import { getSocket } from '../sockets';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
  },
}));

type LobbyScreenProps = {
  nickName: string;
  roomCode: string;
  hostMode: 'Player' | 'Host';
};

type Player = {
  id: string;
  nickName: string;
};

export default function LobbyScreen(props: LobbyScreenProps) {
  const { nickName, roomCode, hostMode } = props;
  const [players, setPlayers] = useState<Array<Player>>([]);
  const classes = useStyles();
  const socket = getSocket();
  console.log(players);

  // Will only be called on first render
  useEffect(() => {
    socket.emit('player-join-room', { roomCode, nickName });
    socket.on('room-status', ({ roomId, players }: { roomId: string; players: Array<Player> }) => {
      setPlayers(players.filter((p) => p.nickName !== 'Host'));
    });

    // make sure we clean up listeners to avoid memory leaks
    return function cleanUp() {
      socket.off('room-status');
    };
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h5" align="center">
        Room Code: {roomCode}
      </Typography>
      <Typography variant="h5" align="center">
        Nick name: {nickName}
      </Typography>
      <Box mt={3}>
        <Paper className={classes.paper}>
          <Grid>
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
      </Box>
    </Container>
  );
}
