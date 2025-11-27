document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#gradesTable tbody');
  const refreshBtn = document.getElementById('refresh');
  const logoutBtn = document.getElementById('logout');

  async function loadGrades() {
    tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
    try {
      const res = await fetch('/grades');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Unexpected data');

      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">No students found</td></tr>';
        return;
      }

      tbody.innerHTML = data.map(s => {
        const avg = (s.grades && s.grades.length) ? (s.grades.reduce((a,b)=>a+b,0)/s.grades.length).toFixed(1) : '—';
        const gradesText = (s.grades || []).join(', ');
        return `<tr><td>${escapeHtml(s.name)}</td><td style="text-align:center">${gradesText}</td><td style="text-align:center">${avg}</td></tr>`;
      }).join('');

    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="3">Error loading grades</td></tr>';
    }
  }

  refreshBtn.addEventListener('click', loadGrades);
  logoutBtn.addEventListener('click', () => { window.location.href = '/'; });

  function escapeHtml(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  loadGrades();
});
