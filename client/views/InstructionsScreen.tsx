import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Typography, Grid, Button } from '@material-ui/core';
import { ArrowBack, ArrowForward } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
  },
  bodyText: {
    marginBottom: theme.spacing(2),
  },
}));

type InstructionsScreenProps = {
  onDoneClicked: () => void;
};

export default function InstructionsScreen(props: InstructionsScreenProps) {
  const { onDoneClicked } = props;
  const classes = useStyles();
  const [page, setPage] = useState<number>(0);

  const page0 = (
    <div>
      <Typography variant="h4" align="center">
        How to Play
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        There are six companies that will change the world as we know it! You can be part of their success and be a
        investor.
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        Try to become rich by making the right decisions! Only the one biggest investor can get money out of each
        company. You must try to read the next steps of your rivals and use your capital and your three hidden cards to
        win against them and become the biggest shareholder!
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        You have to be lucky in this game but you must also think about your moves and analyze your rivals! You can play
        this card game with only a few players but also with many!
      </Typography>
    </div>
  );

  const page1 = (
    <div>
      <Typography variant="h4" align="center">
        How to Play
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        At the start of the game all players will get 10 coins and 3 company cards. On each turn each player will take
        two actions.
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        1. Draw a card
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        2. Play a card
      </Typography>
      <Typography variant="h5" align="left">
        Draw a card
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        You can either draw a card from the deck or from the open market (if there is a card there). You cannot draw a
        card from the open market if you currently hold the anti-monopoly chip for that company (explained in next
        section).
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        If you draw from the deck and there are cards in the open market that you are able to draw you must pay a coin
        to each card you didn't pick up.
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        If a card you draw from the market has coins on it, you collect them as well.
      </Typography>
    </div>
  );

  const page2 = (
    <div>
      <Typography variant="h4" align="center">
        How to Play
      </Typography>
      <Typography variant="h5" align="left">
        Play a card
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        You play a card from your hand to your field (investing in the company) or into the open market.
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        If, in this turn, you picked up a card from the open market you can't play a card of the same type into the
        market this turn.
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        If you play a card to your field and you now have the highest number of that company in your field then you also
        gain the anti-monopoly token for that company.
      </Typography>
    </div>
  );

  const page3 = (
    <div>
      <Typography variant="h4" align="center">
        How to Play
      </Typography>
      <Typography variant="h5" align="left">
        Finishing the game
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        The game ends when there are no cards left in the deck. When this happens all players play all their remaining
        cards to their field and scoring commences.
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        For each company determine who now has the monopoly for that company. Each player that does not have the
        monopoly but has cards for that company pays the monoply player a coin (this coin becomes worth three when
        paid).
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        If two or more players have a tie for the highest number of cards for a company, no one gets the monopoly and no
        one pays any coins for that company.
      </Typography>
      <Typography variant="body1" className={classes.bodyText}>
        At the end the player with the highest number of coins wins. In the case of a draw the player with the fewest
        cards in their field wins. If it is still a draw then it's a TIE.
      </Typography>
    </div>
  );

  const pages = [page0, page1, page2, page3];
  function onBackClick() {
    if (page === 0) {
      return;
    }
    setPage(page - 1);
  }
  function onNextClick() {
    if (page === pages.length - 1) {
      return onDoneClicked();
    }
    setPage(page + 1);
  }
  const nextButtonText = page !== pages.length - 1 ? 'Next' : 'Done';
  return (
    <Container maxWidth="sm">
      {pages[page]}
      <Grid container justify="space-between">
        {page !== 0 && (
          <Grid item>
            <Button variant="contained" color="primary" startIcon={<ArrowBack />} onClick={onBackClick}>
              Back
            </Button>
          </Grid>
        )}
        <Grid item>
          <Button variant="contained" color="primary" endIcon={<ArrowForward />} onClick={onNextClick}>
            {nextButtonText}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
