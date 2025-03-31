import express from 'express';
import { Server } from 'socket.io';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Necesario para usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Cargar certificados SSL
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

// Crear servidor HTTPS
const server = https.createServer(sslOptions, app);
const io = new Server(server);

app.use(express.static('public'));

// Conexión de WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');
  socket.on('disconnect', () => console.log('Cliente desconectado'));
});

// Iniciar servidor en todas las interfaces de red
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
});
