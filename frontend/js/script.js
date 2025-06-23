// Login logic for index.html
// Handles redirect based on username/password/des key

(function() {
    // Helper: get current page
    function getPage() {
        const path = window.location.pathname;
        if (path.endsWith('admin.html')) return 'admin';
        if (path.endsWith('staff.html')) return 'staff';
        if (path.endsWith('student.html')) return 'student';
        if (path.endsWith('index.html') || path.endsWith('/')) return 'login';
        return '';
    }

    // On protected pages: check backend session
    const protectedPages = ['admin', 'staff', 'student', 'teacher'];
    const page = getPage();
    if (protectedPages.includes(page)) {
        checkBackendSession(page);
    }

    // Replace sessionStorage logic with backend session check
    function checkBackendSession(expectedRole) {
        return fetch('/session').then(res => res.json()).then(data => {
            if (!data.loggedIn || data.user.role !== expectedRole) {
                window.location.replace('login.html');
                return false;
            }
            return true;
        });
    }

    // Login form logic
    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const errorMsg = document.getElementById('error-message');
                errorMsg.textContent = '';
                try {
                    const res = await fetch('/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const data = await res.json();
                    if (data.success) {
                        // Redirect based on role
                        if (data.role === 'admin') window.location.href = 'admin.html';
                        else if (data.role === 'student') window.location.href = 'student.html';
                        else if (data.role === 'staff') window.location.href = 'staff.html';
                        else if (data.role === 'teacher') window.location.href = 'teacher.html';
                        else window.location.href = 'index.html';
                    } else {
                        errorMsg.textContent = data.error || 'Login failed';
                    }
                } catch (err) {
                    errorMsg.textContent = 'Server error';
                }
            });
        }

        // On logout, call backend
        if (protectedPages.includes(page)) {
            let logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.classList.add('show');
                logoutBtn.onclick = async function() {
                    await fetch('/logout', { method: 'POST' });
                    window.location.replace('login.html');
                };
            }
        }
    });
})();
