import React, { useState, Dispatch, SetStateAction } from 'react';
// @ts-ignore react-dom types seem to be super buggy, not importing them
import ReactDom from 'react-dom';
import { CssBaseline, AppBar, Toolbar, Typography, makeStyles, Box } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Views, StartScreen, JoinGameScreen, HostGameScreen, LobbyScreen } from './views';

const useStyles = makeStyles((theme) => ({
  main: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  appBarSpacer: theme.mixins.toolbar,
}));

function shouldShowBackButton(curView: Views) {
  return [Views.HostGameScreen, Views.JoinGameScreen, Views.LobbyScreen].includes(curView);
}

type HostMode = 'Host' | 'Player' | null;

export default function App() {
  const classes = useStyles();
  const [curView, setCurView] = useState<Views>(Views.StartScreen);
  const [hostMode, setHostMode] = useState<HostMode>(null);
  const [hostRoomCode, setHostRoomCode] = useState<string>(null);
  const [roomCode, setRoomCode] = useState<string>(null);
  const [nickName, setNickName] = useState<string>(null);

  function onBackButtonPressed() {
    if (curView === Views.JoinGameScreen) {
      if (hostRoomCode) setHostRoomCode(null);
      setCurView(Views.StartScreen);
    }
    if (curView === Views.HostGameScreen) setCurView(Views.StartScreen);
    if (curView === Views.JoinGameScreen) setCurView(Views.StartScreen);
    if (curView === Views.LobbyScreen) {
      if (hostRoomCode) setHostRoomCode(null);
      setCurView(Views.StartScreen);
    }
  }
  const onHostModeChange = (hostMode: HostMode) => {
    setHostMode(hostMode);
    if (hostMode === 'Host') {
      setNickName('Host');
      setCurView(Views.LobbyScreen);
    }
    if (hostMode === 'Player') setCurView(Views.JoinGameScreen);
  };
  const onHostRoomCodeChange = (roomCode: string) => {
    // hostRoomCode is only used to override the users ability to set a room code
    // so that we can re-use the
    setHostRoomCode(roomCode);
    setRoomCode(roomCode);
  };
  const onJoinGame = (nickName: string, roomCode: string) => {
    setNickName(nickName);
    setRoomCode(roomCode);
    setCurView(Views.LobbyScreen);
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          {shouldShowBackButton && (
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={onBackButtonPressed}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box flexGrow={1}>
            <Typography variant="h5" noWrap align="center">
              Startups
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <main className={classes.main}>
        <div className={classes.appBarSpacer} />
        {curView === Views.StartScreen && <StartScreen setCurView={setCurView} />}
        {curView === Views.JoinGameScreen && <JoinGameScreen hostRoomCode={hostRoomCode} onJoinGame={onJoinGame} />}
        {curView === Views.HostGameScreen && (
          <HostGameScreen
            setCurView={setCurView}
            onHostModeChange={onHostModeChange}
            onHostRoomCodeChange={onHostRoomCodeChange}
          />
        )}
        {curView === Views.LobbyScreen && <LobbyScreen nickName={nickName} roomCode={roomCode} hostMode={hostMode} />}
      </main>
    </div>
  );
}

ReactDom.render(<App></App>, document.getElementById('root'));
