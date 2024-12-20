const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // path modülünü ekliyoruz
const app = express();
const port = 3500;

// JSON verisini alabilmek için middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SQLite veritabanını açma
const db = new sqlite3.Database('./students.db', (err) => {
    if (err) {
        console.error('Veritabanı bağlanırken hata oluştu:', err.message);
    } else {
        console.log('Veritabanı başarıyla bağlandı.');
    }
});

// Veritabanında tablonun olup olmadığını kontrol etme ve gerekiyorsa oluşturma
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, student_number TEXT, gpa TEXT, cgpa TEXT)");
});

// Öğrenci verilerini güncelleme API'si
app.post('/update-student', (req, res) => {
    const { studentNumber, gpa, cgpa } = req.body;
    
    const query = `UPDATE students SET gpa = ?, cgpa = ? WHERE student_number = ?`;
    
    db.run(query, [gpa, cgpa, studentNumber], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Veri güncellenirken hata oluştu.');
        } else {
            res.json({ message: 'Bilgiler başarıyla güncellendi!' });
        }
    });
});

// Ana sayfa için route ekleme - statik HTML dosyasını döndürme
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'staff.html')); // staff.html dosyasını döndürüyoruz
});

// Sunucuyu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
