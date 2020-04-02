import React from 'react';
import { Container, Typography, Grid } from '@material-ui/core';
import { getSocket } from '../sockets';
import PlayingCard from '../components/PlayingCard';

type LobbyScreenProps = {};

export default function LobbyScreen(props: LobbyScreenProps) {
  // const classes = useStyles()

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" align="center">
        Responsive Card
      </Typography>
      <Grid container justify="space-between">
        <PlayingCard name="Hippo Powertech" color="green" number={4} coins={5}></PlayingCard>
        <PlayingCard name="Hippo Powertech" color="green" number={4} coins={5} height={150}></PlayingCard>
        <PlayingCard name="Hippo Powertech" color="green" number={4} coins={5} height={100}></PlayingCard>
      </Grid>
    </Container>
  );
}
