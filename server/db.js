const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

// Create users table if not exists
const init = () => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )`);
};

// Add a user (admin only, for setup)
const addUser = (username, password, role) => {
    return new Promise(async (resolve, reject) => {
        const hash = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};

// Get user by username
const getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

init();

module.exports = { addUser, getUserByUsername };
