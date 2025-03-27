import express from 'express';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

app.use(express.json());
app.use(express.static('public'));

// Leer tareas
async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Escribir tareas
async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Endpoints API REST
app.get('/api/tasks', async (req, res) => {
  res.json(await readTasks());
});

app.post('/api/tasks', async (req, res) => {
  const newTask = req.body;
  if (!newTask.title) return res.status(400).json({ error: "El título es obligatorio" });

  let tasks = await readTasks();
  newTask.id = Date.now().toString();
  tasks.push(newTask);
  await writeTasks(tasks);
  
  io.emit('task-updated'); // Notifica a todos los clientes
  res.status(201).json(newTask);
});

app.delete('/api/tasks/:id', async (req, res) => {
  let tasks = await readTasks();
  const index = tasks.findIndex(task => task.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Tarea no encontrada" });

  const removedTask = tasks.splice(index, 1)[0];
  await writeTasks(tasks);
  
  io.emit('task-updated'); // Notifica a todos los clientes
  res.json(removedTask);
});

// Conexión de WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');
  socket.on('disconnect', () => console.log('Cliente desconectado'));
});

// Iniciar servidor en todas las interfaces de red
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

