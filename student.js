const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 2500;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  // Frontend için statik dosyaları sunma

// SQLite Veritabanı Bağlantısı
const db = new sqlite3.Database('student_dashboard.db', (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'student.html')); // 'student.html' dosyanızın bulunduğu yol
});


// Veritabanı Tabloyu Kontrol Et ve Oluştur
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY AUTOINCREMENT, document_type TEXT, status TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, document_id INTEGER, amount REAL, status TEXT, FOREIGN KEY (document_id) REFERENCES documents(id))");
});

// Belgeleri Listele
app.get('/api/documents', (req, res) => {
    db.all("SELECT * FROM documents", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ documents: rows });
        }
    });
});

// Yeni Belge Talebi Oluştur
app.post('/api/documents', (req, res) => {
    const { document_type } = req.body;
    const stmt = db.prepare("INSERT INTO documents (document_type, status) VALUES (?, ?)");
    stmt.run(document_type, 'Pending', function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, document_type, status: 'Pending' });
        }
    });
});

// Faturaları Listele
app.get('/api/invoices', (req, res) => {
    db.all("SELECT * FROM invoices", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ invoices: rows });
        }
    });
});

// Fatura Oluştur
app.post('/api/invoices', (req, res) => {
    const { document_id, amount, status } = req.body;
    const stmt = db.prepare("INSERT INTO invoices (document_id, amount, status) VALUES (?, ?, ?)");
    stmt.run(document_id, amount, status, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, document_id, amount, status });
        }
    });
});

// Fatura Durumunu Güncelle
app.put('/api/invoices/:id', (req, res) => {
    const { status } = req.body;
    const stmt = db.prepare("UPDATE invoices SET status = ? WHERE id = ?");
    stmt.run(status, req.params.id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: req.params.id, status });
        }
    });
});

// Sunucuyu Başlat
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
