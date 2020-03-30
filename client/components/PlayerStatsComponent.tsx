import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography, Grid, Avatar, Button, Badge, GridList } from '@material-ui/core';
import { getSocket } from '../sockets';
import { Startups, Company } from 'client/game-engine';
import Bar from './Bar';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginRight: theme.spacing(2),
    width: '200px',
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

type PlayerStatsProps = {
  startups: Startups;
  companies: Array<Company>;
};

export default function PlayerStats(props: PlayerStatsProps) {
  const classes = useStyles();
  const { startups, companies } = props;
  const companiesCountMap: Record<string, number> = companies
    .map((c) => c.name)
    .reduce((acc, a) => ({ ...acc, [a]: 0 }), {});

  startups.state.players.forEach((player) => player.field.forEach((c) => companiesCountMap[c.company.name]++));

  return (
    <GridList cellHeight="auto" cols={3} style={{ flexWrap: 'nowrap', transform: 'translateZ(0)' }}>
      {startups.state.players.map((player, i) => {
        return (
          <Box mr={2} ml={2} minWidth="200px" key={'player-stats-' + i}>
            <Paper className={classes.paper}>
              <Box display="flex" flexDirection="row" alignItems="center">
                <Typography variant="h6" style={{ fontStyle: '' }}>
                  {(player.info as any).nickName}
                </Typography>
                <Box display="flex" alignItems="center" ml="auto">
                  <img src={process.env.BASE_URL + '/coin.png'} style={{ height: '30px', width: '30px' }}></img>
                  <Typography>{player.coins.length}</Typography>
                </Box>
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
                        badgeContent={isMonopoly ? 'M' : 0}
                        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                        variant="dot"
                        color="error"
                      >
                        <Avatar alt={company.name} color={company.color} className={classes.small}>
                          {company.symbol}
                        </Avatar>
                      </Badge>
                      <Box flexGrow={1} ml={1}>
                        <Bar color={company.color} width={width}></Bar>
                      </Box>
                      <Box ml={1}>
                        <Typography>{count}</Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>
        );
      })}
    </GridList>
  );
}
