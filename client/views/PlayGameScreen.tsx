import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography, Grid, Avatar } from '@material-ui/core';
import { getSocket } from '../sockets';

// const useStyles = makeStyles((theme) => ({
//   paper: {
//     padding: theme.spacing(3),
//   },
// }));

type PlayGameScreenProps = {};

type Player = {
  id: string;
  nickName: string;
};

export default function PlayGameScreen(props: PlayGameScreenProps) {
  // const { nickName, roomCode, hostMode } = props;
  // const [players, setPlayers] = useState<Array<Player>>([]);
  // const classes = useStyles();
  // const socket = getSocket();
  // console.log(players);

  // Will only be called on first render
  useEffect(() => {}, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h5" align="center">
        Play the game already: "AAAA"
      </Typography>
    </Container>
  );
}
