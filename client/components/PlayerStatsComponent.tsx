import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography, Grid, Avatar, Button, Badge } from '@material-ui/core';
import { getSocket } from '../sockets';
import { Startups, Company } from 'client/game-engine';
import Bar from './Bar';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
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
}
