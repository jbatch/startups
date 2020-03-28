import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import { Container, Typography, Button, Paper, Grid } from '@material-ui/core';
import { getSocket } from '../sockets';
// import '../startups';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
  },
}));

type PlayGameScreenProps = {
  // players: Array<Player>;
};

type Player = {
  id: string;
  nickName: string;
};

export default function PlayGameScreen(props: PlayGameScreenProps) {
  const {} = props;
  const [handDrawerOpen, setHandDrawerOpen] = useState<boolean>(false);
  const [players, setPlayers] = useState<Array<Player>>([]);
  // console.log(Startups);
  // const startups = new Startups(2);
  const classes = useStyles();
  const socket = getSocket();

  // Will only be called on first render
  useEffect(() => {
    socket.on('game-state', ({ roomId, players }: { roomId: string; players: Array<Player> }) => {
      console.log('GAME-STATE');
      setPlayers(players.filter((p) => p.nickName !== 'Host'));
    });
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
      {handCard.map((card, i) => {
        return (
          <div key={'card' + i}>
            {card.name} {card.number}
          </div>
        );
      })}
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
      <Button type="submit" variant="contained" color="primary" onClick={showHandButtonClicked}>
        Show Hand
      </Button>
      <Drawer anchor="bottom" open={handDrawerOpen} onClose={toggleHandDraw(false)}>
        {hand}
      </Drawer>
    </Container>
  );
}
