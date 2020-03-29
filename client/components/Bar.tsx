import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography, Grid, Avatar, Button, Badge } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

type BarProps = {
  width: number;
  color: string;
};

export default function PlayingCard(props: BarProps) {
  // const classes = useStyles();
  const { width = 0, color } = props;

  return <div style={{ width: `${width}%`, height: '20px', backgroundColor: color }}></div>;
}
