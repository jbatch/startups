import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import { Container, Typography, Button, Paper, Grid } from '@material-ui/core';
import { getSocket } from '../sockets';
import { Startups, DRAW_MOVE } from '../game-engine';
import PlayingCard from '../components/PlayingCard';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
  },
}));

type PlayGameScreenProps = {
  playerId: string;
};

type Player = {
  id: string;
  nickName: string;
};

export default function PlayGameScreen(props: PlayGameScreenProps) {
  const { playerId } = props;
  const [handDrawerOpen, setHandDrawerOpen] = useState<boolean>(false);
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [startups, setStartups] = useState<Startups>(null);

  const classes = useStyles();
  const socket = getSocket();

  // const startups = new Startups({ numberPlayers: 1 });

  // Will only be called on first render
  useEffect(() => {
    socket.on(
      'game-state',
      ({ roomId, players, gameState }: { roomId: string; players: Array<Player>; gameState: string }) => {
        console.log('GAME-STATE');
        // console.log(gameState);
        setPlayers(players.filter((p) => p.nickName !== 'Host'));
        const s = new Startups({ state: gameState });
        console.log(s);
        setStartups(s);
      }
    );
    socket.emit('player-loaded-game');

    // make sure we clean up listeners to avoid memory leaks
    return function cleanUp() {
      socket.off('game-state');
    };
  }, []);

  const toggleHandDraw = (open: boolean) => (event: any) => {
    setHandDrawerOpen(open);
  };
  const handCard = [
    {
      name: 'Octocoffee',
      symbol: 'O',
      number: 8,
    },
    {
      name: 'Octocoffee',
      symbol: 'O',
      number: 8,
    },
    {
      name: 'Octocoffee',
      symbol: 'O',
      number: 8,
    },
  ];
  const hand = (
    <div>
      <Typography variant="h5" align="center">
        Hand
      </Typography>
      <Grid container direction="row" justify="space-between" style={{ padding: '10px' }}>
        {startups &&
          startups.state.players
            .find((p) => (p.info as Player).id === playerId)
            .hand.map((card, i) => {
              return (
                <PlayingCard
                  name={card.company.name}
                  color="green"
                  number={card.company.number}
                  coins={0}
                  key={'hand' + i}
                  height={150}
                />
              );
            })}
      </Grid>
    </div>
  );

  const showHandButtonClicked = () => {
    setHandDrawerOpen(true);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h5" align="center">
        Play the game already: "AAAA"
      </Typography>
      <Grid container spacing={1}>
        {players.map((player, i) => {
          return (
            <Grid item xs={6} key={'player' + i}>
              <Paper className={classes.paper}>{player.nickName}</Paper>
            </Grid>
          );
        })}
      </Grid>
      <Typography variant="h5" align="center">
        Actions
      </Typography>
      <Grid container spacing={1}>
        {startups &&
          startups.moves().map((m, i) => {
            return (
              <Button type="submit" variant="contained" color="primary" key={'action' + i}>
                {m.action}
              </Button>
            );
          })}
      </Grid>
      <Button type="submit" variant="contained" color="primary" onClick={showHandButtonClicked}>
        Show Hand
      </Button>
      <Drawer anchor="bottom" open={handDrawerOpen} onClose={toggleHandDraw(false)}>
        {hand}
      </Drawer>
    </Container>
  );
}
