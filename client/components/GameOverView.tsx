import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Startups } from '../game-engine';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  GridList,
  GridListTile,
  GridListTileBar,
  Avatar,
  Paper,
} from '@material-ui/core';

import { getSocket } from '../sockets';

const useStyles = makeStyles((theme) => ({
  large: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    fontSize: '36px',
  },
  medium: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    fontSize: 'larger',
  },
  paper: {
    padding: theme.spacing(1),
  },
  coin: {
    height: theme.spacing(5),
    width: theme.spacing(5),
  },
  tilebar: {
    height: 'initial',
    paddingBottom: '10px',
    paddingTop: '5px',
  },
}));

type GameOverViewProps = {
  startups: Startups;
  playerId: string;
  isHost: boolean;
  isPlayer: boolean;
};

const cardUrlMap: Record<string, string> = {
  'Dog and Pwn': 'dog_and_pwn.png',
  'Bright Cats': 'bright_cats.png',
  'Happy Otter': 'happy_otter.png',
  'Penta Eagle': 'penta_eagle.png',
  'Sly Fox': 'sly_fox.png',
  Turtledove: 'turtledove.png',
};

export default function GameOverView(props: GameOverViewProps) {
  const { startups, isHost, isPlayer } = props;
  const classes = useStyles();

  const socket = getSocket();

  const onNextClicked = () => {
    socket.emit('next-game-over-step');
    // setGameOverStep(gameOverStep + 1);
  };

  // const [gameOverStep, setGameOverStep] = useState<number>(0);
  const results = startups.state.results;
  const gameOverStep = results.gameOverStepIndex;
  const winner = startups.state.players[results.winner.player];
  const winnerName = (winner as any).info.nickName;
  const players = startups.state.players;
  const companies = startups.state.results.companyResults.map((c) => c.company);

  const startingSteps = 2;
  const stepsPerCompany = 5;
  const showPlayers = gameOverStep >= 1;
  const showCompanies = gameOverStep >= 2;
  const showShareHolders = (gameOverStep - startingSteps) % stepsPerCompany >= 1;
  const showMonopoly = (gameOverStep - startingSteps) % stepsPerCompany >= 2;
  const showUpdatedScore = (gameOverStep - startingSteps) % stepsPerCompany >= 3;
  const rehideCompany = (gameOverStep - startingSteps) % stepsPerCompany >= 4;

  const companyIndex = Math.min(
    Math.max(Math.floor((gameOverStep - startingSteps) / stepsPerCompany), 0),
    companies.length - 1
  );
  const companyInfo = companies[companyIndex];
  const displayWinner = gameOverStep >= companies.length * stepsPerCompany + 2;
  const majorityShareholder = players[
    (startups.state.results.companyResults[companyIndex].monopolyPlayer as unknown) as number
  ] || {
    info: { nickName: 'None' },
  };
  const shareholders = startups.state.results.companyResults[companyIndex].owedCoins || [];
  const numCompaniesScoresUpdated = Math.max(
    Math.floor((gameOverStep - startingSteps) / stepsPerCompany) +
      ((gameOverStep - startingSteps) % stepsPerCompany >= 3 ? 1 : 0),
    0
  );

  const monopolyGainedThisCompany = (startups.state.results.companyResults[companyIndex].owedCoins || []).reduce(
    (cur, next) => cur + next.count * 3,
    0
  );
  const payedThisCompany = startups.state.results.companyResults[companyIndex].owedCoins || [];
  const monopolyMap = startups.state.results.companyResults.map((companyResult) => {
    const player = players[(companyResult.monopolyPlayer as unknown) as number];
    const coins = companyResult.owedCoins.reduce((total, next) => total + next.count * 3, 0);
    return {
      nickName: (player.info as any).nickName,
      coins: coins,
    };
  });
  const playerScores = startups.state.playersPreGameOver.map((player, playerIdx) => {
    const receieved = startups.state.results.companyResults
      // remove results that havent been tallied up yet
      .filter((c, idx) => idx < numCompaniesScoresUpdated)
      // get results where we wont
      .filter((c) => ((c.monopolyPlayer as unknown) as number) === playerIdx)
      // map over them getting the totals owed to us
      .map((monopolyCompany) => monopolyCompany.owedCoins.reduce((total, owing) => total + owing.count, 0))
      // sum totals of all the totals
      .reduce((total, next) => total + next, 0);
    const payed = startups.state.results.companyResults
      // remove results that havent been tallied up yet
      .filter((c, idx) => idx < numCompaniesScoresUpdated)
      // get all results where we owe money
      .map((company) => (company.owedCoins || []).find((owing) => owing.player === playerIdx))
      // remove undefined values
      .filter(Boolean)
      // sum total payed
      .reduce((total, nextOwing) => total + nextOwing.count, 0);
    return player.coins.length + receieved * 3 - payed;
  });
  console.log('playerScores', playerScores, numCompaniesScoresUpdated);

  const topText = displayWinner ? `${winnerName}  wins!` : 'Game Over!';
  const isBigScreen = isHost && !isPlayer;

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" height="100%">
        <Typography variant="h3" align="center">
          {topText}
        </Typography>
        <Box mt={3} />
        {showPlayers && (
          <Paper className={classes.paper}>
            <Grid container justify="center">
              {players.map((player, idx) => {
                const name = (player.info as any).nickName;
                return (
                  <Box
                    flexDirection="column"
                    display="flex"
                    p={0}
                    justifyContent="center"
                    alignItems="center"
                    key={'p-' + idx}
                  >
                    <Avatar alt={name} className={classes.large}>
                      {name[0].toUpperCase()}
                    </Avatar>
                    <Box display="flex" alignItems="center" fontSize="26px">
                      <img src={process.env.BASE_URL + '/coin.png'} className={classes.coin}></img>
                      <Box>
                        <Typography style={{ fontSize: 'larger' }}>{playerScores[idx]}</Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Grid>
          </Paper>
        )}
        <Box mt={2} style={{ borderTop: '1px solid black' }} />
        <Box flex="1 0 auto">
          {!displayWinner && showCompanies && !rehideCompany && (
            <Box>
              <Box mt={2} display="flex" alignItems="center">
                <Avatar alt={companyInfo.name} style={{ backgroundColor: companyInfo.color }} className={classes.large}>
                  {companyInfo.symbol}
                </Avatar>
                <Box ml={2} />
                <Typography variant="h5">{companyInfo.name}</Typography>
              </Box>
              <Box mt={4} style={{ borderTop: '1px solid black' }} />
              {showShareHolders && (
                <Box mt={2} display="flex" flexDirection="column">
                  <Typography variant="h6">Shareholders:</Typography>
                  <Box ml={4} display="flex" flexDirection="column">
                    {shareholders.map((shareholder, idx) => {
                      const player = players[shareholder.player];
                      return (
                        <Box display="flex" alignItems="center" key={'share-' + idx} style={{ color: 'red' }}>
                          <Typography variant="h6">{(player.info as any).nickName} loses: </Typography>
                          <img src={process.env.BASE_URL + '/coin.png'} className={classes.coin}></img>
                          <Typography variant="h6">{shareholder.count}</Typography>
                        </Box>
                      );
                    })}
                    {shareholders.length === 0 && (
                      <Box display="flex" alignItems="center" style={{ color: 'grey' }}>
                        <Typography variant="h6">None</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
              {showMonopoly && (
                <Box mt={2} display="flex" flexDirection="column">
                  <Typography variant="h6">Monopoly:</Typography>
                  <Box ml={4} display="flex" flexDirection="column">
                    <Box display="flex" alignItems="center" style={{ color: 'green' }}>
                      <Typography variant="h6">{(majorityShareholder.info as any).nickName} gains</Typography>
                      <img src={process.env.BASE_URL + '/coin.png'} className={classes.coin}></img>
                      <Typography variant="h6">{monopolyGainedThisCompany}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          {displayWinner && (
            <Container maxWidth="lg">
              <Box mt={4} />
              <GridList cols={isBigScreen ? 3 : 2}>
                {companies.map((company, idx) => (
                  <GridListTile key={company.name}>
                    <img src={process.env.BASE_URL + '/' + cardUrlMap[company.name]} alt={company.name} />
                    <GridListTileBar
                      title={company.name}
                      subtitle={monopolyMap[idx].nickName}
                      classes={{ rootSubtitle: classes.tilebar }}
                      actionIcon={
                        <Box display="flex" alignItems="center" ml="auto">
                          <img src={process.env.BASE_URL + '/coin.png'} style={{ height: '30px', width: '30px' }}></img>
                          <Typography style={{ marginRight: '5px', color: 'white' }}>
                            {monopolyMap[idx].coins}
                          </Typography>
                        </Box>
                      }
                    />
                  </GridListTile>
                ))}
              </GridList>
            </Container>
          )}
        </Box>

        <Box flex="0 1 auto" display="flex" justifyContent="center">
          {isHost && (
            <Button type="button" variant="contained" color="primary" onClick={onNextClicked}>
              Show Scores
            </Button>
          )}{' '}
        </Box>
      </Box>
    </Container>
  );
}
