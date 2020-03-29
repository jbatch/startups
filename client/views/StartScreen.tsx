import React, { Dispatch, SetStateAction } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Button, Grid, Box, Link, Typography } from '@material-ui/core';
import { Views } from './views';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
  },
}));

type StartScreenProps = {
  setCurView: Dispatch<SetStateAction<Views>>;
  onInstructionsClick: () => void;
};

export default function StartScreen(props: StartScreenProps) {
  const classes = useStyles();
  const { setCurView, onInstructionsClick } = props;

  const setViewHostGame = () => setCurView(Views.HostGameScreen);
  const setViewJoinGame = () => setCurView(Views.JoinGameScreen);

  return (
    <Container maxWidth="lg" style={{ justifyContent: 'center' }}>
      <Paper className={classes.paper}>
        <Typography>
          Startups is an online multiplayer game where you and your friends compete to gain monopoly control of one of 5
          startups
        </Typography>
        <Typography>
          Lorem ipsum flavor text, Lorem ipsum flavor text, Lorem ipsum flavor text, Lorem ipsum flavor text, Lorem
          ipsum flavor text
        </Typography>
      </Paper>
      <Box mt={3}>
        <Grid container justify="space-evenly">
          <Button type="button" variant="contained" color="primary" onClick={setViewHostGame}>
            Host a game
          </Button>
          <Button type="button" variant="contained" color="primary" onClick={setViewJoinGame}>
            Join a game
          </Button>
        </Grid>
      </Box>
      <Box mt={3} textAlign="center">
        <Link href="#" variant="body2" onClick={onInstructionsClick}>
          {'Instructions'}
        </Link>
      </Box>
    </Container>
  );
}
