import React, { Dispatch, SetStateAction, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, TextField, Button, Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
  },
  form: {},
}));

type JoinGameScreenProps = {
  // Overrides the room code input if we are a host in player mode
  hostRoomCode: string | null;
  onJoinGame: (nickName: string, roomCode: string) => void;
};

export default function JoinGameScreen(props: JoinGameScreenProps) {
  const { hostRoomCode, onJoinGame } = props;
  const classes = useStyles();
  const [nickName, setNickName] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  // Todo: add error messages and invalid input checks
  const [nameError, setNameError] = useState<string | null>(null);
  // const [roomError, setRoomError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Todo: add error messages and invalid input checks
    const actualRoomCode = hostRoomCode || roomCode;
    onJoinGame(nickName, actualRoomCode.toUpperCase());
  };
  const allowedNickname = (nickName: string): boolean => {
    return !['Host'].includes(nickName);
  };
  const onNickNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nickName = e.target.value;
    setNickName(nickName);
    if (!allowedNickname(nickName)) {
      setNameError('That nickname is not allowed');
    } else {
      setNameError(null);
    }
  };
  const onRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => setRoomCode(e.target.value);
  const disableRoomCodeInput = hostRoomCode !== null;
  const roomCodeVal = hostRoomCode || roomCode;

  return (
    <Container maxWidth="sm">
      <form className={classes.form} noValidate onSubmit={onSubmit}>
        <TextField
          variant="outlined"
          fullWidth
          label="Nickname"
          value={nickName}
          onChange={onNickNameChange}
          error={nameError !== null}
          helperText={nameError}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="Room Code"
          value={roomCodeVal}
          disabled={disableRoomCodeInput}
          onChange={onRoomCodeChange}
          helperText="(four letter code given to you by your host)"
        />

        <Box mt={3}>
          <Button type="submit" fullWidth variant="contained" color="primary">
            Join Game
          </Button>
        </Box>
      </form>
    </Container>
  );
}
