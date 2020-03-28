import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography, Grid, Avatar, Button, Badge } from '@material-ui/core';
import { getSocket } from '../sockets';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  badge: {
    height: '20px',
    display: 'flex',
    padding: '0 6px',
    'z-index': '1',
    position: 'absolute',
    'flex-wrap': 'wrap',
    'font-size': '0.75rem',
    'min-width': '20px',
    'box-sizing': 'border-box',
    transition: 'transform 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    'align-items': 'center',
    'font-family': '"Roboto", "Helvetica", "Arial", sans-serif',
    'font-weight': '500',
    'line-height': '1',
    'align-content': 'center',
    'border-radius': '10px',
    'flex-direction': 'row',
    'justify-content': 'center',
    color: '#fff',
    'background-color': '#f50057',
  },
}));

type PlayingCardProps = {
  name: string;
  color: string;
  number: number;
  height?: number;
};

export default function PlayingCard(props: PlayingCardProps) {
  const classes = useStyles();
  const { name, color, number, height = 200 } = props;
  const heightStr = `${height}px`;
  const widthStr = `${height * 0.75}px`;
  const topBarHeight = `${height * 0.2}px`;
  const boxPadding = `${height * 0.05}px`;

  return (
    <Card style={{ minHeight: heightStr, minWidth: widthStr, display: 'flex', marginTop: '10px' }}>
      <Grid container direction="column">
        <Box
          display="flex"
          alignItems="center"
          flex="0 0 auto"
          justifyContent="flex-end"
          paddingRight={boxPadding}
          style={{ backgroundColor: color, minHeight: topBarHeight }}
        >
          <div className={classes.badge}>{number}</div>
        </Box>
        <Box flex="1 0 auto" maxWidth={widthStr} textAlign="center" padding={boxPadding}>
          {name}
        </Box>
        <Box flex="0 0 auto" style={{ backgroundColor: color, minHeight: topBarHeight }}></Box>
      </Grid>
    </Card>
  );
}
