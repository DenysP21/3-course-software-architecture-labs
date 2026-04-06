const API = 'http://localhost:3000';
const $ = id => document.getElementById(id);

let isLogin = true;

$('tab-login').onclick = () => {
  isLogin = true;
  $('tab-login').classList.add('active');
  $('tab-register').classList.remove('active');
  $('auth-error').classList.add('hidden');
};

$('tab-register').onclick = () => {
  isLogin = false;
  $('tab-register').classList.add('active');
  $('tab-login').classList.remove('active');
  $('auth-error').classList.add('hidden');
};

$('auth-form').onsubmit = async (e) => {
  e.preventDefault();
  const email = $('email').value;
  const password = $('password').value;
  const endpoint = isLogin ? '/users/login' : '/users/register';
  
  try {
    const res = await fetch(API + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    if (isLogin) {
      localStorage.setItem('token', data.token);
      $('email').value = '';
      $('password').value = '';
      $('auth-error').classList.add('hidden');
      showBoard();
    } else {
      alert('Registration successful! Please sign in.');
      $('tab-login').click();
    }
  } catch (err) {
    $('auth-error').textContent = err.message;
    $('auth-error').classList.remove('hidden');
  }
};

$('logout-btn').onclick = () => {
  localStorage.removeItem('token');
  $('board-screen').classList.add('hidden');
  $('auth-screen').classList.remove('hidden');
};

function showBoard() {
  $('auth-screen').classList.add('hidden');
  $('board-screen').classList.remove('hidden');
  fetchTasks();
}

async function fetchAPI(path, method = 'GET', body = null) {
  const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : null });
  if (res.status === 401) {
    $('logout-btn').click();
    throw new Error('Unauthorized');
  }
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function fetchTasks() {
  try {
    const tasks = await fetchAPI('/tasks');
    renderTasks(tasks);
  } catch (e) {}
}

$('task-form').onsubmit = async (e) => {
  e.preventDefault();
  const title = $('task-title').value;
  const description = $('task-desc').value;
  const date = $('task-date').value;
  const dueDate = date ? new Date(date).toISOString() : null;
  
  try {
    await fetchAPI('/tasks', 'POST', { title, description, dueDate });
    $('task-form').reset();
    fetchTasks();
  } catch (err) {
    alert(err.message);
  }
};

window.updateStatus = async (id, status) => {
  await fetchAPI(`/tasks/${id}`, 'PUT', { status });
  fetchTasks();
};

window.deleteTask = async (id) => {
  await fetchAPI(`/tasks/${id}`, 'DELETE');
  fetchTasks();
};

function renderTasks(tasks) {
  const cols = { PENDING: $('col-pending'), IN_PROGRESS: $('col-in-progress'), COMPLETED: $('col-completed') };
  const counts = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 };
  
  Object.values(cols).forEach(col => col.innerHTML = '');
  
  tasks.forEach(t => {
    counts[t.status]++;
    const div = document.createElement('div');
    div.className = 'task-card';
    div.dataset.status = t.status;
    const dateStr = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No deadline';
    
    div.innerHTML = `
      <h4>${t.title}</h4>
      ${t.description ? `<p>${t.description}</p>` : ''}
      <div class="task-actions">
        <span style="font-size: 12px; color: #6b7280; flex: 1; font-weight: 600;">${dateStr}</span>
        <select onchange="updateStatus(${t.id}, this.value)">
          <option value="PENDING" ${t.status === 'PENDING' ? 'selected' : ''}>Pending</option>
          <option value="IN_PROGRESS" ${t.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
          <option value="COMPLETED" ${t.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
        </select>
        <button class="delete-btn" onclick="deleteTask(${t.id})">Delete</button>
      </div>
    `;
    cols[t.status].appendChild(div);
  });
  
  $('count-pending').textContent = counts.PENDING;
  $('count-progress').textContent = counts.IN_PROGRESS;
  $('count-completed').textContent = counts.COMPLETED;
}

if (localStorage.getItem('token')) showBoard();


