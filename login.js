const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session'); //bura önemli

const app = express();
const PORT = 5500; // Portu 5500 olarak ayarladık

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Session için de middleware açtık
app.use(session({
  secret:'secret-key',
  resave: false,
  saveUninitialized: true
}))

// SQLite Veritabanı
const db = new sqlite3.Database(':memory:');

// Veritabanı Kurulumu
db.serialize(() => {
  db.run(`
      CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      name TEXT,
      surname TEXT,
      phone INTEGER,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      deskey TEXT NOT NULL
    )
  `);

  // Örnek Kullanıcı Verisi (Yeni veriler)
  db.run(`
    INSERT INTO users (username, password, deskey, type) VALUES
      ('admin', '1', '1', 'admin'),
      ('staff', '2', '2', 'staff'),
      ('student', '3', '3', 'student')
  `);
  db.each('SELECT * FROM users', (err, row) => {
    console.log('Veritabanı Kullanıcı:', row); // Veritabanındaki verileri kontrol edin
  });
});

// Log Sayfasını Gösterme
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Login Doğrulama
app.post('/login', (req, res) => {
  const { username, password, des_key } = req.body;

  // Zorunlu Alanlar Kontrolü
  if (!username || !password || !des_key) {
    return res.status(400).send('Lütfen tüm alanları doldurun.');
  }

  // Sessiondan hatalı girişleri çekmek için
  if (!req.session.failedAttempts) {
    req.session.failedAttempts = 0;
  }

  db.get(
    'SELECT * FROM users WHERE username = ? AND password = ? AND deskey = ?',
    [username, password, des_key],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Bir hata oluştu.');
      }

      // Kullanıcı doğrulama
      
      if (row) {
        req.session.failedAttempts = 0; // Başarılı girişte hatalı giriş sayacını sıfırlıyoruz
        // Kullanıcı türüne göre yönlendirme yapıyoruz
        if (row.type === 'admin') {
          res.redirect('http://localhost:4500/');//google
        } else if (row.type === 'staff') {
          res.redirect('http://localhost:3500/');//youtube
        } else if (row.type === 'student') {
          res.redirect('http://localhost:2500/');//translate
        } else {
          res.status(400).send('Geçersiz kullanıcı türü.');
        }
      } else {
        // Hatalı girişte failedAttempts'ı artırıyoruz
        req.session.failedAttempts += 1;

        // 3 hatalı girişten sonra yönlendirme
        if (req.session.failedAttempts >= 3) {
          //res.redirect('https://www.w3schools.com/jsref/met_win_alert.asp'); // 3. hatalı girişten sonra yönlendiriyoruz
          req.session.lockedUntil = Date.now() + 60000; // 60 saniye bekletme
          res.send('<script>alert("3 hatalı giriş yaptınız. Lütfen 60 saniye bekleyin.");</script>');
        } else {
          res.redirect('/?error=Kullanıcı adı veya şifre hatalı!&failedAttempts=' + req.session.failedAttempts);
        }
      }
    }
  );
});

// Sunucuyu Başlat
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
