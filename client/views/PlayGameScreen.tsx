import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import { Container, Typography, Button, Paper, Grid, Box, Avatar, Badge } from '@material-ui/core';
import { getSocket } from '../sockets';
import { Startups, DRAW_MOVE, PLAY_MOVE, Move, companies, Company, Card, MarketCard } from '../game-engine';
import PlayingCard from '../components/PlayingCard';
import Bar from '../components/Bar';
import { ClickableCard } from '../components/ClickableCard';
import { access } from 'fs';

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
  const handleActionClicked = (move: Move) => {
    console.log('Action clicked: ', move);
    socket.emit('player-move', { move });
  };

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
              const moves = startups
                .moves()
                .filter((m) => m.action === 'PLAY')
                .map((m) => m as PLAY_MOVE)
                .filter((m) => m.card === i);
              return <ClickableCard card={card} moves={moves} key={'cc' + i} onMoveSelected={handleActionClicked} />;
            })}
      </Grid>
    </div>
  );

  const DrawingView = () => {
    const mapDrawDeckMove = (move: DRAW_MOVE, index: number) => {
      if (!move) {
        return (
          <PlayingCard
            name={`Can't draw from deck`}
            color="grey"
            number={0}
            coins={0}
            height={150}
            key={'draw-deck-action-' + index}
          />
        );
      }
      if (move.src !== 'DECK') {
        throw new Error('Impossible');
      }
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
          key={'draw-deck-action-' + index}
        />
      );
    };
    const mapDrawMarketMove = (
      card: MarketCard,
      moves: Array<{ action: 'DRAW'; src: 'MARKET'; card: number }>,
      index: number
    ) => {
      const move = moves.find((m) => m.card === index);
      return (
        <PlayingCard
          name={card.company.name}
          color={move ? card.company.color : 'grey'}
          number={card.company.number}
          coins={card.coins.length}
          height={150}
          onClick={move ? () => handleActionClicked(move) : undefined}
          key={'draw-deck-action-' + index}
        />
      );
    };
    const deckDrawMove = (
      <Grid container alignItems="center" justify="center">
        <Grid item>
          {mapDrawDeckMove(
            startups
              .moves()
              .map((m) => m as DRAW_MOVE)
              .filter((m) => m.src === 'DECK')[0],
            0
          )}
        </Grid>
      </Grid>
    );
    const marketCards = startups.state.market;
    const marketMoves = startups
      .moves()
      .map((m) => m as DRAW_MOVE)
      .filter((m) => m.src === 'MARKET');
    const marketDrawMoves = (
      <Grid container direction="row" justify="space-between">
        {marketCards.map((card, i) => mapDrawMarketMove(card, marketMoves as any, i))}
      </Grid>
    );
    return (
      <div>
        <Typography>Draw</Typography>
        {deckDrawMove}
        {marketDrawMoves}
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
  }) => {
    const companiesCountMap: Record<string, number> = companies
      .map((c) => c.name)
      .reduce((acc, a) => ({ ...acc, [a]: 0 }), {});
    startups.state.players.forEach((player) => player.field.forEach((c) => companiesCountMap[c.company.name]++));
    return (
      <Grid container spacing={1}>
        {startups.state.players.map((player, i) => {
          return (
            <Grid item xs={6} key={'player' + i}>
              <Paper className={classes.paper}>
                <Box display="flex" flexDirection="row" alignItems="center">
                  {/* <Avatar alt={player.nickName} className={classes.small}>
              {player.nickName[0].toUpperCase()}
            </Avatar> */}
                  <Typography variant="h6" style={{ fontStyle: '' }}>
                    {(player.info as any).nickName}
                  </Typography>
                </Box>
                <hr />
                <Box>
                  {companies.map((company, ii) => {
                    const player = startups.state.players[i];
                    const count = player.field.filter((card) => card.company.name === company.name).length;
                    const width =
                      count === 0 || companiesCountMap[company.name] == 0
                        ? 0
                        : (count / companiesCountMap[company.name]) * 100;
                    const isMonopoly = startups.playerHasMonopolyToken(i, company);
                    return (
                      <Box display="flex" key={'company-bar-' + ii}>
                        <Badge
                          badgeContent={
                            isMonopoly ? (
                              <img src={process.env.BASE_URL + '/crown2.png'} className={classes.xsmall} />
                            ) : null
                          }
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
  };
  const WaitingView = ({ curPlayer }: { curPlayer: string }) => (
    <Container maxWidth="md">
      <Typography variant="h5">Waiting for other players</Typography>
      <Typography variant="h4" align="center" style={{ marginTop: '12px' }}>
        {curPlayer}
      </Typography>
      <PlayersComponent startups={startups} players={players} companies={companies} />
    </Container>
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
  const curPlayerTurn = startups.state.players[startups.state.turn];
  const curPlayerName = (curPlayerTurn.info as any).nickName;
  const isMyTurn = (curPlayerTurn.info as any).id === playerId;

  if (phase === 'GAME_OVER') return <GameOverView />;
  if (!isMyTurn) return <WaitingView curPlayer={curPlayerName} />;
  if (phase === 'DRAW') return <DrawingView />;
  if (phase === 'PLAY') return <PlayingView />;
}
