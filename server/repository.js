const Database = require('sqlite-async');

const db = Database.open('startups.sqlite');

async function createInitialTables() {
  try {
    await (await db).exec(
      `CREATE TABLE IF NOT EXISTS rooms 
    (
      _id INTEGER PRIMARY KEY AUTOINCREMENT, 
      roomCode VARCHAR(5) UNIQUE,
      inGame Boolean DEFAULT false
      )`
    );
    console.log('Created rooms table');
    await (await db).exec(
      `CREATE TABLE IF NOT EXISTS users 
      (
        _id INTEGER PRIMARY KEY AUTOINCREMENT, 
        id VARCHAR(255) UNIQUE, 
        nickname VARCHAR(255), 
        roomcode VARCHAR(5) REFERENCES rooms(id)
      )`
    );
    console.log('Created user table');
  } catch (err) {
    console.log('Error ', err);
  }
}

async function addUser(userId) {
  try {
    return (await db).run('INSERT INTO users (id) VALUES (?)', [userId]);
  } catch (error) {
    console.log('Error ', error);
  }
}

async function createRoom(roomId) {
  try {
    return (await db).run('INSERT INTO rooms (roomCode) VALUES (?)', [roomId]);
  } catch (error) {
    console.log('Error ', error);
  }
}

async function getUser(userId) {
  try {
    return (await db).get('SELECT * FROM users where id = ?', [userId]);
  } catch (error) {
    console.log('Error', err);
  }
}

async function getRoom(roomId) {
  try {
    return (await db).get('SELECT * FROM rooms where roomCode = ?', [roomId]);
  } catch (error) {
    console.log('Error', err);
  }
}

async function addUserToRoom(roomCode, userId, nickName) {
  try {
    return (await db).run('UPDATE users set roomCode = ?, nickname = ? WHERE id = ?', [roomCode, nickName, userId]);
  } catch (error) {
    console.log('Error ', error);
  }
}

async function getUsersInRoom(roomCode) {
  try {
    return (await db).all('SELECT id, nickname as nickName FROM users WHERE roomCode = ?', [roomCode]);
  } catch (error) {
    console.log('Error ', error);
  }
}

async function removeRoomFromUser(userId) {
  try {
    return (await db).run('UPDATE users set roomCode = null WHERE id = ?', [userId]);
  } catch (error) {
    console.log('Error ', error);
  }
}

async function startGameForRoom(roomCode) {
  try {
    return (await db).run('UPDATE rooms set inGame = True WHERE roomCode = ?', [roomCode]);
  } catch (error) {
    console.log('Error ', error);
  }
}

module.exports = {
  createInitialTables,
  addUser,
  getUser,
  createRoom,
  getRoom,
  addUserToRoom,
  getUsersInRoom,
  removeRoomFromUser,
  startGameForRoom,
};
