// Login logic for index.html
// Handles redirect based on username/password/des key

document.addEventListener('DOMContentLoaded', function() {
    // URL'deki error ve failed parametrelerini al
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const failedAttempts = parseInt(urlParams.get('failedAttempts') || '0');
    const errorMessageElement = document.getElementById('error-message');

    // Eğer error parametresi varsa, formun içine hata mesajını göster
    if (error) {
        errorMessageElement.textContent = error;
    }

    // Eğer 3 hatalı giriş yapılmışsa, bekleme mesajını göster
    if (failedAttempts >= 3) {
        const timeLeft = parseInt(urlParams.get('lockedUntil') - Date.now()) / 1000;
        if (timeLeft > 0) {
            alert(`Too many failed attempts. Please wait ${timeLeft.toFixed(0)} seconds before trying again.`);
        }
    }

    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const desKey = document.getElementById('des_key').value.trim();
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = '';

        if (!username || !password || !desKey) {
            errorMessageElement.textContent = 'Please fill in all fields.';
            return;
        }

        if (username === '1' && password === '1' && desKey === '1') {
            window.location.href = 'admin.html';
        } else if (username === '2' && password === '2' && desKey === '2') {
            window.location.href = 'staff.html';
        } else if (username === '3' && password === '3' && desKey === '3') {
            window.location.href = 'student.html';
        } else {
            errorMessageElement.textContent = 'Invalid credentials. Please try again.';
        }
    });
});
