import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography, Grid, Avatar, Button, Badge } from '@material-ui/core';
import { getSocket } from '../sockets';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

type PlayingCardProps = {
  name: string;
  color: string;
  number: number;
};

export default function PlayingCard(props: PlayingCardProps) {
  // const classes = useStyles();
  const { name, color, number } = props;
  return (
    <Card style={{ minHeight: '200px', maxWidth: '150px', display: 'flex' }}>
      <Grid container direction="column">
        <Box flex="0 0 auto" style={{ backgroundColor: color, minHeight: '40px' }}>
          <Badge badgeContent={number} color="secondary">
            {' '}
          </Badge>
        </Box>
        <Box flex="1 0 auto">middle</Box>
        <Box flex="0 0 auto" style={{ backgroundColor: color, minHeight: '40px' }}>
          foo
        </Box>
      </Grid>
    </Card>
  );
}
