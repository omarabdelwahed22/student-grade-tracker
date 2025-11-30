document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const msg = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        msg.textContent = 'Account created. Redirecting to login...';
        setTimeout(() => window.location.href = '/login.html', 1000);
      } else {
        msg.textContent = data.message || 'Signup failed';
      }
    } catch (err) {
      msg.textContent = 'Network error';
    }
  });
});
