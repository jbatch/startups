import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Card, Box, Typography } from '@material-ui/core';
import { Views } from './views';
import { getSocket } from '../sockets';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
  },
}));

type HostGameScreenProps = {
  setCurView: Dispatch<SetStateAction<Views>>;
  onHostModeChange: (hostMode: 'Host' | 'Player') => void;
  onHostRoomCodeChange: (roomCode: string) => void;
};

export default function HostGameScreen(props: HostGameScreenProps) {
  const { onHostModeChange, onHostRoomCodeChange } = props;
  const classes = useStyles();
  const socket = getSocket();

  useEffect(() => {
    socket.on('room-created', ({ roomCode }: { roomCode: string }) => {
      onHostRoomCodeChange(roomCode);
    });
    socket.emit('create-room');
  }, []);

  const setHostModeHost = () => onHostModeChange('Host');
  const setHostModePlayer = () => onHostModeChange('Player');

  return (
    <Container maxWidth="md">
      <Paper className={classes.paper}>
        <Typography>Are you using this device to play the game as well, or just to host?</Typography>
      </Paper>
      <Box m={4}>
        <Card onClick={setHostModeHost}>
          <img src="/HostMode.png" style={{ width: '100%' }}></img>
        </Card>
      </Box>
      <Box m={4}>
        <Card onClick={setHostModePlayer}>
          <img src="/PlayerMode.png" style={{ width: '100%' }}></img>
        </Card>
      </Box>
    </Container>
  );
}
