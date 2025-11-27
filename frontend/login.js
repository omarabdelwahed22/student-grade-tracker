document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Redirect to dashboard page
        window.location.href = '/dashboard.html';
      } else {
        msg.textContent = data.message || 'Login failed';
      }
    } catch (err) {
      msg.textContent = 'Network error';
    }
  });
});
