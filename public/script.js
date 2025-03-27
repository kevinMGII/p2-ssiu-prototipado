const apiUrl = '/api/tasks';
const socket = io();

// Cargar tareas
async function fetchTasks() {
  const response = await fetch(apiUrl);
  const tasks = await response.json();
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task.title;
    li.dataset.id = task.id;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.onclick = () => deleteTask(task.id);

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

// Agregar tarea
async function addTask(title) {
  await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
}

// Eliminar tarea
async function deleteTask(id) {
  await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
}

// Escuchar eventos de WebSocket
socket.on('task-updated', fetchTasks);

// Formulario
document.getElementById('task-form').addEventListener('submit', function(e) {
  e.preventDefault();
  addTask(document.getElementById('task-title').value);
  document.getElementById('task-title').value = '';
});

fetchTasks();

