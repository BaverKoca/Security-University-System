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

    // Session timeout settings
    const SESSION_DURATION = 2 * 60 * 1000; // 2 minutes
    const INACTIVITY_LIMIT = 2 * 60 * 1000; // 2 minutes

    // Set session and activity timers
    function setSession(role) {
        const now = Date.now();
        sessionStorage.setItem('userRole', role);
        sessionStorage.setItem('sessionStart', now);
        sessionStorage.setItem('lastActivity', now);
    }
    function clearSession() {
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('sessionStart');
        sessionStorage.removeItem('lastActivity');
    }
    function updateActivity() {
        sessionStorage.setItem('lastActivity', Date.now());
    }
    function checkSession() {
        const role = sessionStorage.getItem('userRole');
        const start = parseInt(sessionStorage.getItem('sessionStart'), 10);
        const last = parseInt(sessionStorage.getItem('lastActivity'), 10);
        const now = Date.now();
        if (!role || !start || !last) return false;
        if (now - start > SESSION_DURATION) return false;
        if (now - last > INACTIVITY_LIMIT) return false;
        return true;
    }

    // On login page: clear session
    if (getPage() === 'login') {
        clearSession();
    }

    // On protected pages: check session
    const protectedPages = ['admin', 'staff', 'student'];
    const page = getPage();
    if (protectedPages.includes(page)) {
        if (!checkSession() || sessionStorage.getItem('userRole') !== page) {
            clearSession();
            window.location.replace('index.html');
        } else {
            // Update activity on any user action
            ['click', 'keydown', 'mousemove', 'scroll'].forEach(evt => {
                window.addEventListener(evt, updateActivity, {passive:true});
            });
            // Check session every 5 seconds
            setInterval(function() {
                if (!checkSession()) {
                    clearSession();
                    window.location.replace('index.html');
                }
            }, 5000);
        }
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
                        else window.location.href = 'index.html';
                    } else {
                        errorMsg.textContent = data.error || 'Login failed';
                    }
                } catch (err) {
                    errorMsg.textContent = 'Server error';
                }
            });
        }

        // Add logout button to protected pages
        if (protectedPages.includes(page)) {
            let logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.classList.add('show');
                logoutBtn.onclick = async function() {
                    clearSession();
                    // Call backend to destroy session
                    await fetch('/logout', { method: 'POST', credentials: 'include' });
                    window.location.replace('index.html');
                };
            }
        }
    });
})();
