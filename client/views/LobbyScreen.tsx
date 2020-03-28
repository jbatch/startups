import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography, Grid, Avatar } from '@material-ui/core';

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
  nickName: string;
};

export default function HostGameScreen(props: LobbyScreenProps) {
  const { nickName, roomCode, hostMode } = props;
  const [players, setPlayers] = useState<Array<Player>>([]);
  const classes = useStyles();
  console.log(players);

  // Will only be called on first render
  useEffect(() => {
    if (hostMode === 'Player' || !hostMode) setPlayers([...players, { nickName: nickName }]);
    (window as any).addPlayer = (name: string) => {
      setPlayers([...players, { nickName: name }]);
      console.log(players);
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
              <Box display="flex" flexDirection="row" alignItems="center">
                <Avatar alt={nickName}>{nickName[0].toUpperCase()}</Avatar>
                <Box padding={3}>
                  <Typography variant="h6">{nickName}</Typography>
                </Box>
              </Box>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}
