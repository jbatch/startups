import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Paper,
  Card,
  Box,
  Typography,
  Grid,
  Avatar,
  Button,
  Badge,
  Drawer,
  AppBar,
  Toolbar,
  GridList,
} from '@material-ui/core';
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

type ActionBarDrawerProps = {
  startups: Startups;
  playerId: string;
  openDrawerName: DrawerType;
  onClose: () => void;
  handleCardClickedFromHand: (move: Move) => void | null;
};

export function ActionBarDrawer(props: ActionBarDrawerProps) {
  // const classes = useStyles();
  const { startups, playerId, openDrawerName, onClose, handleCardClickedFromHand } = props;
  return (
    <Drawer anchor="bottom" open={!!openDrawerName} onClose={onClose}>
      {openDrawerName === 'hand' && (
        <Container maxWidth="sm">
          <Box>
            <Typography variant="h5" align="center">
              Hand
            </Typography>
            <GridList cols={3} style={{ flexWrap: 'nowrap', transform: 'translateZ(0)' }}>
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
                      <Box ml={1} mr={1} key={'cc' + i}>
                        <ClickableCard card={card} moves={moves} onMoveSelected={handleCardClickedFromHand} />
                      </Box>
                    );
                  })}
            </GridList>
          </Box>
        </Container>
      )}
      {openDrawerName === 'players' && (
        <Container maxWidth="sm">
          <Box padding={2}>
            <Typography variant="h5" align="center">
              Players
            </Typography>
            <PlayerStatsComponent startups={startups} companies={companies} />
          </Box>
        </Container>
      )}
    </Drawer>
  );
}

type ActionBarProps = {
  openHandDrawer: () => void;
  openPlayersDrawer: () => void;
};

export default function ActionBar(props: ActionBarProps) {
  const { openPlayersDrawer, openHandDrawer } = props;
  return (
    <AppBar position="fixed" color="primary" style={{ bottom: 0, top: 'auto' }}>
      <Container maxWidth="sm">
        <Toolbar>
          <Button type="button" fullWidth variant="contained" color="primary" onClick={openHandDrawer}>
            Show Hand
          </Button>
          <Button type="button" fullWidth variant="contained" color="primary" onClick={openPlayersDrawer}>
            Show Scores
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
