import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Startups, Company, companies } from '../game-engine';
import { Container, Typography, Box } from '@material-ui/core';
import { Market } from './DeckAndMarket';
import ActionBar, { ActionBarDrawer } from './ActionBar';
import PlayerStatsComponent from './PlayerStatsComponent';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

type HostViewProps = {
  startups: Startups;
  playerId: string;
};

export default function HostView(props: HostViewProps) {
  // const classes = useStyles();
  const { startups, playerId } = props;
  const currentPlayer = startups.state.players[startups.state.turn];
  const playerName = (currentPlayer.info as any).nickName;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" align="center">
        {playerName}'s turn
      </Typography>
      <Box mt={2} mb={2} />

      <Market startups={startups} handleActionClicked={() => {}} playerId={playerId} />

      <Box mt={4} />
      <PlayerStatsComponent startups={startups} companies={companies} />
    </Container>
  );
}
