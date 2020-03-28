const Database = require('sqlite-async');

const db = Database.open('startups.sqlite');

async function createInitialTables() {
  try {
    (await db).exec(
      'CREATE TABLE IF NOT EXISTS users (_id INTEGER PRIMARY KEY AUTOINCREMENT, id VARCHAR(255) UNIQUE, nickname VARCHAR(255), roomcode VARCHAR(5))'
    );
    console.log('Created user table');
  } catch (err) {
    console.log('Error ', err);
  }
}

async function addUser(userId) {
  try {
    (await db).run('INSERT INTO users (id) VALUES (?)', [userId]);
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

module.exports = {
  createInitialTables,
  addUser,
  getUser,
};
