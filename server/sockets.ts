import socketIo from 'socket.io';
import { v4 as uuid } from 'uuid';
import randomstring from 'randomstring';
import isEqual from 'lodash.isequal';

import {
  addUser,
  getUser,
  createRoom,
  getRoom,
  addUserToRoom,
  getUsersInRoom,
  removeRoomFromUser,
  startGameForRoom,
  setGameStateForRoom,
  UserRecord,
  HostMode,
} from './repository';
import { Startups } from '../client/game-engine';

export function configureSockets(appServer) {
  const server = socketIo(appServer);

  server.on('connection', (client: socketIo.Socket & { playerId }) => {
    client.on('handshake', handshake);
    client.on('disconnect', disconnect);
    client.on('create-room', createNewRoom);
    client.on('player-join-room', playerJoinsRoom);
    client.on('player-leave-room', playerLeavesRoom);
    client.on('all-players-ready', allPlayersReady);
    client.on('player-loaded-game', playerLoadedGame);
    client.on('player-move', playerMove);
    client.on('next-game-over-step', nextGameOverStep);
    client.on('restart-game', restartGame);
    client.on('request-game-state', requestGameState);

    async function handshake({ id }) {
      let exists: UserRecord = null;
      let inGame = false;
      if (id) {
        exists = await getUser(id);
      }
      if (!exists) {
        id = uuid();
        await addUser(id);
        console.log(`New client, assigning id [${id}]`);
      } else {
        console.log(`Player ${id} reconnected with nickname ${exists.nickName} and room ${exists.roomCode}.`);
        if (exists.roomCode) {
          inGame = (await getRoom(exists.roomCode)).inGame;
          console.log(`${id} in game? : ${JSON.stringify(inGame)}`);
        }
      }
      client.playerId = id;
      client.emit('welcome', {
        id,
        nickName: exists ? exists.nickName : null,
        roomCode: exists ? exists.roomCode : null,
        hostMode: exists ? exists.hostMode : null,
        inGame,
      });
      if (exists && exists.nickName && exists.roomCode) {
        await playerJoinsRoom({ roomCode: exists.roomCode, nickName: exists.nickName, hostMode: exists.hostMode });
      }
    }

    function disconnect() {
      console.log(`Player [${client.playerId}] disconnected`);
    }

    async function createNewRoom() {
      const roomCode = randomstring.generate({ length: 5, charset: 'alphabetic' }).toUpperCase();
      await createRoom(roomCode);
      console.log(`Created a new room ${roomCode}`);
      client.emit('room-created', { roomCode });
    }

    async function playerJoinsRoom({
      roomCode,
      nickName,
      hostMode,
    }: {
      roomCode: string;
      nickName: string;
      hostMode: HostMode;
    }) {
      await addUserToRoom(roomCode, client.playerId, nickName, hostMode);
      const usersInRoom = await getUsersInRoom(roomCode);
      client.join(roomCode);
      console.log('sending room status ', JSON.stringify({ roomCode, players: usersInRoom }));
      server.to(roomCode).emit('room-status', { roomCode, players: usersInRoom });
      console.log(`Player ${client.playerId} joined room ${roomCode}`);
    }

    async function playerLeavesRoom({ roomCode }) {
      const user = await getUser(client.playerId);
      const wasHost = user.hostMode !== null;

      await removeRoomFromUser(client.playerId);
      const usersInRoom = await getUsersInRoom(roomCode);
      client.leave(roomCode);
      console.log('sending room status ', JSON.stringify({ roomCode, players: usersInRoom }));
      server.to(roomCode).emit('room-status', { roomCode, players: usersInRoom });
      if (wasHost) {
        server.to(roomCode).emit('host-disconnected');
      }
      console.log(`Player ${client.playerId} left room ${roomCode} (host: ${wasHost})`);
    }

    async function allPlayersReady({ roomCode }) {
      const usersInRoom = await getUsersInRoom(roomCode);
      const startups = new Startups({ players: shuffle(usersInRoom) });
      await startGameForRoom(roomCode, startups.dumpState());
      console.log(`Starting game in room ${roomCode}`);
      server.to(roomCode).emit('start-game');
    }

    async function playerLoadedGame() {
      const user = await getUser(client.playerId);
      const usersInRoom = await getUsersInRoom(user.roomCode);
      const room = await getRoom(user.roomCode);
      // Only send once to each client
      console.log('Sending game-state to' + JSON.stringify({ user, roomCode: user.roomCode }));
      client.emit('game-state', { roomCode: user.roomCode, players: usersInRoom, gameState: room.gameState });
    }

    async function playerMove({ move }) {
      console.log(`${client.playerId} trying to do move ${JSON.stringify(move)}`);
      const user = await getUser(client.playerId);
      const usersInRoom = await getUsersInRoom(user.roomCode);
      const room = await getRoom(user.roomCode);
      const startups = new Startups({ state: room.gameState });
      const validMove = startups.moves().find((m) => isEqual(m, move));
      console.log('Valid move ', validMove);
      console.log('Valid moves ', startups.moves());
      if (validMove) {
        startups.move(move);
        await setGameStateForRoom(user.roomCode, startups.dumpState());
      }
      server.to(user.roomCode).emit('game-state', {
        roomCode: user.roomCode,
        players: usersInRoom,
        gameState: startups.dumpState(),
        lastPlayerMove: { playerId: client.playerId, ...move },
      });
    }

    async function nextGameOverStep() {
      const user = await getUser(client.playerId);
      if (user.hostMode === null) {
        console.log('Ignoring nextGameOverStep request from non-host player ' + client.playerId);
        return;
      }
      const usersInRoom = await getUsersInRoom(user.roomCode);
      const room = await getRoom(user.roomCode);
      const startups = new Startups({ state: room.gameState });
      startups.nextGameOverStep();
      await setGameStateForRoom(user.roomCode, startups.dumpState());
      console.log(
        `Playing next game over step [${startups.state.results.gameOverStepIndex}] for room: ${user.roomCode}`
      );
      server
        .to(user.roomCode)
        .emit('game-state', { roomCode: user.roomCode, players: usersInRoom, gameState: startups.dumpState() });
    }

    async function restartGame() {
      const user = await getUser(client.playerId);
      if (user.hostMode === null) {
        console.log('Ignoring restartGame request from non-host player ' + client.playerId);
        return;
      }
      const usersInRoom = await getUsersInRoom(user.roomCode);
      const startups = new Startups({ players: shuffle(usersInRoom) });
      await setGameStateForRoom(user.roomCode, startups.dumpState());
      console.log(`Starting a new game in room ${user.roomCode}`);
      server.to(user.roomCode).emit('restart-game', { players: usersInRoom, gameState: startups.dumpState() });
    }

    async function requestGameState() {
      const user = await getUser(client.playerId);
      const usersInRoom = await getUsersInRoom(user.roomCode);
      const room = await getRoom(user.roomCode);
      const startups = new Startups({ state: room.gameState });
      console.log(`Sending state to player: ${client.playerId}`);
      client.send('game-state', { roomCode: user.roomCode, players: usersInRoom, gameState: startups.dumpState() });
    }
  });

  function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
      let index = Math.floor(Math.random() * counter);
      counter--;
      let temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }

    return array;
  }
}
