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
    const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes
    const INACTIVITY_LIMIT = 30 * 1000; // 30 seconds (change to 30*60*1000 for 30 minutes)

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
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value.trim();
                const desKey = document.getElementById('des_key').value.trim();
                let redirect = null;
                let role = null;
                if (username === '1' && password === '1' && desKey === '1') {
                    redirect = 'admin.html';
                    role = 'admin';
                } else if (username === '2' && password === '2' && desKey === '2') {
                    redirect = 'staff.html';
                    role = 'staff';
                } else if (username === '3' && password === '3' && desKey === '3') {
                    redirect = 'student.html';
                    role = 'student';
                } else {
                    document.getElementById('error-message').textContent = 'Invalid credentials!';
                    return;
                }
                setSession(role);
                window.location.replace(redirect);
            });
        }

        // Add logout button to protected pages
        if (protectedPages.includes(page)) {
            let logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.classList.add('show');
                logoutBtn.onclick = function() {
                    clearSession();
                    window.location.replace('index.html');
                };
            }
        }
    });
})();
