import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static('public'));

// Conexión de WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');
  socket.on('disconnect', () => console.log('Cliente desconectado'));
});

// Iniciar servidor en todas las interfaces de red
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
