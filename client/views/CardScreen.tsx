import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography, Grid, Avatar, Button } from '@material-ui/core';
import { getSocket } from '../sockets';
import PlayingCard from '../components/PlayingCard';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

type LobbyScreenProps = {};

export default function LobbyScreen(props: LobbyScreenProps) {
  // const classes = useStyles()

  return (
    <Container maxWidth="md">
      <Typography variant="h5" align="center">
        Responsive Card
      </Typography>
      <PlayingCard name="Hippo Powertech" color="green" number={4}></PlayingCard>
    </Container>
  );
}
