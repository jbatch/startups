import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography, Grid, Avatar, Button, Badge, Drawer } from '@material-ui/core';
import { Startups, companies, PLAY_MOVE, Move } from '../game-engine';
import { ClickableCard } from './ClickableCard';
import PlayerStatsComponent from './PlayerStatsComponent';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

export type DrawerType = 'players' | 'hand' | null;

type ActionBarProps = {
  startups: Startups;
  playerId: string;
  openDrawerName: DrawerType;
  onClose: () => void;
  handleCardClickedFromHand: (move: Move) => void;
};

export default function ActionBar(props: ActionBarProps) {
  // const classes = useStyles();
  const { startups, playerId, openDrawerName, onClose, handleCardClickedFromHand } = props;

  return (
    <Drawer anchor="bottom" open={!!openDrawerName} onClose={onClose}>
      {openDrawerName === 'hand' && (
        <Box>
          <Typography variant="h5" align="center">
            Hand
          </Typography>
          <Grid container direction="row" justify="space-between" style={{ padding: '10px' }}>
            {startups &&
              startups.state.players
                .find((p) => (p.info as any).id === playerId)
                .hand.map((card, i) => {
                  const moves = startups
                    .moves()
                    .filter((m) => m.action === 'PLAY')
                    .map((m) => m as PLAY_MOVE)
                    .filter((m) => m.card === i);
                  return (
                    <ClickableCard
                      card={card}
                      moves={moves}
                      key={'cc' + i}
                      onMoveSelected={handleCardClickedFromHand}
                    />
                  );
                })}
          </Grid>
        </Box>
      )}
      {openDrawerName === 'players' && (
        <Box padding={2}>
          <Typography variant="h5" align="center">
            Players
          </Typography>

          <PlayerStatsComponent startups={startups} companies={companies} />
        </Box>
      )}
    </Drawer>
  );
}
