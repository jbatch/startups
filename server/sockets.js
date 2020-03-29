const socketIo = require('socket.io');
const { v4: uuid } = require('uuid');
const randomstring = require('randomstring');

const {
  addUser,
  getUser,
  createRoom,
  getRoom,
  addUserToRoom,
  getUsersInRoom,
  removeRoomFromUser,
  startGameForRoom,
  setGameStateForRoom,
} = require('./repository');

const { Startups } = require('../client/game-engine');

function configureSockets(appServer) {
  const server = socketIo(appServer);

  server.on('connection', (client) => {
    client.data = {};
    client.on('handshake', handshake);
    client.on('disconnect', disconnect);
    client.on('create-room', createNewRoom);
    client.on('player-join-room', playerJoinsRoom);
    client.on('player-leave-room', playerLeavesRoom);
    client.on('all-players-ready', allPlayersReady);
    client.on('player-loaded-game', playerLoadedGame);
    client.on('player-move', playerMove);

    async function handshake({ id }) {
      let exists = false;
      let inGame = false;
      if (id) {
        exists = await getUser(id);
      }
      if (!exists) {
        id = uuid();
        await addUser(id);
        console.log(`New client, assigning id [${id}]`);
      } else {
        console.log(`Player ${id} reconnected with nickname ${exists.nickname} and room ${exists.roomcode}.`);
        if (exists.roomCode) {
          inGame = await getRoom(exists.roomcode).ingame;
          console.log('in game: ' + inGame);
        }
      }
      client.playerId = id;
      client.emit('welcome', {
        id,
        nickName: exists ? exists.nickname : null,
        roomCode: exists ? exists.roomcode : null,
        inGame,
      });
      if (exists && exists.nickname && exists.roomcode) {
        await playerJoinsRoom({ roomCode: exists.roomcode, nickName: exists.nickname });
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

    async function playerJoinsRoom({ roomCode, nickName }) {
      await addUserToRoom(roomCode, client.playerId, nickName);
      const usersInRoom = await getUsersInRoom(roomCode);
      client.join(roomCode);
      console.log('sending room status ', JSON.stringify({ roomCode, players: usersInRoom }));
      server.to(roomCode).emit('room-status', { roomCode, players: usersInRoom });
      console.log(`Player ${client.playerId} joined room ${roomCode}`);
    }

    async function playerLeavesRoom({ roomCode }) {
      await removeRoomFromUser(client.playerId);
      const usersInRoom = await getUsersInRoom(roomCode);
      client.leave(roomCode);
      console.log('sending room status ', JSON.stringify({ roomCode, players: usersInRoom }));
      server.to(roomCode).emit('room-status', { roomCode, players: usersInRoom });
      console.log(`Player ${client.playerId} left room ${roomCode}`);
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
      const usersInRoom = await getUsersInRoom(user.roomcode);
      const room = await getRoom(user.roomcode);
      // Only send once to each client
      console.log('Sending game-state to' + JSON.stringify({ user, roomCode: user.roomCode }));
      client.emit('game-state', { roomCode: user.roomCode, players: usersInRoom, gameState: room.gameState });
    }

    async function playerMove({ move }) {
      const user = await getUser(client.playerId);
      const room = await getRoom(user.roomcode);
      const startups = new Startups({ state: room.gameState });
      const validMove = startups.moves().includes(move);
      if (validMove) {
        startups.move(move);
        await setGameStateForRoom(user.roomcode, startups.dumpState());
      }
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

module.exports = {
  configureSockets,
};
