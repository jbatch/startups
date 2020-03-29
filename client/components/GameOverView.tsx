import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography, Grid, Avatar, Button, Badge } from '@material-ui/core';
import { getSocket } from '../sockets';
import { Startups, companies } from 'client/game-engine';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

type GameOverViewProps = {
  startups: Startups;
  playerId: string;
};

export default function PlayingCard(props: GameOverViewProps) {
  const classes = useStyles();
  const { startups, playerId } = props;
  const { companiesShown, setCompaniesShown } = useState<number>(0);

  const isHost = (startups.state.players[startups.state.turn].info as any).id === playerId;
  const handleNextClicked = () => {
    setCompaniesShown(companiesShown + 1);
  };
  return (
    <Container>
      {isHost && (
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Typography>Press next to reveal the step in score calculations</Typography>
          <Button type="button" variant="contained" color="primary" onClick={handleNextClicked}>
            {'Next'}
          </Button>
        </Box>
      )}
    </Container>
  );
}
