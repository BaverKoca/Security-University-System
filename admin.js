const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 4500;

// SQLite veritabanını oluşturuyoruz
const db = new sqlite3.Database('./admin-dashboard.db');

app.use(cors());

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express session middleware
app.use(session({
    secret: 'admin-dashboard-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Eğer HTTPS kullanıyorsanız, secure: true yapmanız gerekebilir
}));

// Veritabanı tablolarını oluşturuyoruz (eğer henüz yoksa)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        phone TEXT,
        department TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS student (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId TEXT,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        phone TEXT,
        department TEXT
    )`);
});

// Formu gösterecek bir rota (Static HTML)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html')); // Formu barındıracak admin.html dosyasının yolu
});

// Add Staff API
app.post('/api/staff', (req, res) => {
    const { firstName, lastName, email, phone, department } = req.body;

    if (!firstName || !lastName || !email || !phone || !department) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    const stmt = db.prepare('INSERT INTO staff (firstName, lastName, email, phone, department) VALUES (?, ?, ?, ?, ?)');
    stmt.run(firstName, lastName, email, phone, department, function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error adding staff', error: err });
        }
        res.status(201).json({ message: 'Staff added successfully', staffId: this.lastID });
    });
    stmt.finalize();
});

// Add Student API
app.post('/api/student', (req, res) => {
    const { studentId, firstName, lastName, email, phone, department } = req.body;

    if (!studentId || !firstName || !lastName || !email || !phone || !department) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    const stmt = db.prepare('INSERT INTO student (studentId, firstName, lastName, email, phone, department) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(studentId, firstName, lastName, email, phone, department, function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error adding student', error: err });
        }
        res.status(201).json({ message: 'Student added successfully', studentId: this.lastID });
    });
    stmt.finalize();
});

// Kullanıcı oturumu yönetimi için örnek bir rota
app.get('/session', (req, res) => {
    if (req.session.isAuthenticated) {
        res.send('You are logged in!');
    } else {
        res.send('Please log in first!');
    }
});

// Sunucuyu başlatıyoruz
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
