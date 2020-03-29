import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import { Container, Typography, Button, Paper, Grid, Box, Avatar, Badge } from '@material-ui/core';
import { getSocket } from '../sockets';
import { Startups, DRAW_MOVE, Move, companies, Company } from '../game-engine';
import PlayingCard from '../components/PlayingCard';
import Bar from '../components/Bar';
import MailIcon from '@material-ui/icons/Mail';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    fontSize: 'larger',
  },
  xsmall: {
    width: theme.spacing(2),
    height: theme.spacing(2),
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
        (window as any).startups = s;
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
  const showHandButtonClicked = () => {
    setHandDrawerOpen(true);
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
  const handleActionClicked = (move: Move) => {
    console.log('Action clicked: ', move);
    socket.emit('player-move', { move });
  };

  const WaitingView = ({ curPlayer }: { curPlayer: string }) => (
    <Container maxWidth="md">
      <Typography variant="h5">Waiting for other players</Typography>
      <Typography variant="h4" align="center" style={{ marginTop: '12px' }}>
        {curPlayer}
      </Typography>
    </Container>
  );

  const DrawingView = () => {
    const mapDrawMove = (move: DRAW_MOVE, index: number) => {
      switch (move.src) {
        case 'DECK':
          let text;
          if (move.cost > 0) {
            text = `Draw from deck (${move.cost} coins)`;
          } else {
            text = 'Draw from deck';
          }
          return (
            <PlayingCard
              name={text}
              color="grey"
              number={0}
              coins={0}
              height={150}
              onClick={() => handleActionClicked(move)}
              key={'draw-action-' + index}
            />
          );
        case 'MARKET':
          const card = startups.state.market[move.card];
          return (
            <PlayingCard
              name={card.company.name}
              color="green"
              number={card.company.number}
              coins={card.coins.length} // TODO (Update this to take in an array of coins instead of number)
              height={150}
              onClick={() => handleActionClicked(move)}
              key={'draw-action-' + index}
            />
          );
      }
    };
    return (
      <div>
        <Typography>Draw</Typography>
        <Grid container>
          {startups
            .moves()
            .map((m) => m as DRAW_MOVE)
            .map(mapDrawMove)}
        </Grid>
      </div>
    );
  };
  const PlayersComponent = ({
    startups,
    players,
    companies,
  }: {
    startups: Startups;
    players: Array<Player>;
    companies: Array<Company>;
  }) => (
    <Grid container spacing={1}>
      {players.map((player, i) => {
        return (
          <Grid item xs={6} key={'player' + i}>
            <Paper className={classes.paper}>
              <Box display="flex" flexDirection="row" alignItems="center">
                {/* <Avatar alt={player.nickName} className={classes.small}>
              {player.nickName[0].toUpperCase()}
            </Avatar> */}
                <Typography variant="h6" style={{ fontStyle: '' }}>
                  {player.nickName}
                </Typography>
              </Box>
              <hr />
              <Box>
                {companies.map((company) => {
                  const count = startups.state.players[i].field.filter((card) => card.company.name === company.name)
                    .length;
                  const width = Math.random() * 100;
                  const isMonopoly = width > 45;
                  return (
                    <Box display="flex">
                      <Badge
                        badgeContent={isMonopoly ? <img src="/crown2.png" className={classes.xsmall} /> : null}
                        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                      >
                        <Avatar alt={company.name} color={company.color} className={classes.small}>
                          {company.symbol}
                        </Avatar>
                      </Badge>
                      <Box flexGrow={1} ml={1}>
                        <Bar color={company.color} width={width}></Bar>
                      </Box>
                      <Typography>{count}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
  const PlayingView = () => (
    <Container maxWidth="md">
      <Typography variant="h5" align="center">
        Play the game already: "AAAA"
      </Typography>
      <PlayersComponent startups={startups} players={players} companies={companies} />
      <Typography variant="h5" align="center">
        Actions
      </Typography>
      <Grid container spacing={1}>
        {startups &&
          startups.moves().map((m, i) => {
            return (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                key={'action' + i}
                onClick={() => handleActionClicked(m)}
              >
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
  const GameOverView = () => <div>GameOver View</div>;
  const LoadingView = () => <div>Loading...</div>;

  const loading = !startups;
  if (loading) return <LoadingView />;

  const phase = startups.state.step;
  const curPlayerTurn = players[startups.state.turn];
  const curPlayerName = curPlayerTurn.nickName;
  const isMyTurn = curPlayerTurn.id === playerId;

  if (phase === 'GAME_OVER') return <GameOverView />;
  if (!isMyTurn) return <WaitingView curPlayer={curPlayerName} />;
  if (phase === 'DRAW') return <PlayingView />;
  if (phase === 'PLAY') return <PlayingView />;
}
