// SA Verify - Client-side JavaScript

function getToken() {
    return localStorage.getItem('token');
}

function getRole() {
    return localStorage.getItem('role');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    window.location.href = '/login';
}

function requireAuth(expectedRole) {
    const token = getToken();
    const role = getRole();
    if (!token) {
        window.location.href = '/login';
        return;
    }
    if (expectedRole && role !== expectedRole) {
        window.location.href = '/login';
        return;
    }
    updateNav();
}

function updateNav() {
    const navUser = document.getElementById('navUser');
    const navLinks = document.getElementById('navLinks');
    const token = getToken();

    if (token) {
        navUser.style.display = 'flex';
        document.getElementById('userName').textContent = localStorage.getItem('fullName') || '';

        const role = getRole();
        if (role === 'candidate') {
            navLinks.innerHTML = '<a href="/candidate/dashboard">Dashboard</a>';
        } else if (role === 'employer') {
            navLinks.innerHTML = '<a href="/employer/dashboard">Dashboard</a>';
        } else if (role === 'admin') {
            navLinks.innerHTML = '<a href="/admin/dashboard">Dashboard</a>';
        }
    }
}

async function apiGet(url) {
    const resp = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    if (resp.status === 401) {
        logout();
        return;
    }
    if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || 'Request failed');
    }
    return resp.json();
}

async function apiPost(url, body) {
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
    });
    if (resp.status === 401) {
        logout();
        return;
    }
    if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || 'Request failed');
    }
    return resp.json();
}

function showAlert(message, type) {
    const container = document.getElementById('alertContainer');
    if (!container) return;
    const alert = document.createElement('div');
    alert.className = `alert-msg ${type}`;
    alert.textContent = message;
    container.prepend(alert);
    setTimeout(() => alert.remove(), 5000);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-ZA', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// Auto-update nav on page load
document.addEventListener('DOMContentLoaded', updateNav);
