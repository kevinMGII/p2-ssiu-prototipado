import https from 'https';
import fs from 'fs';
import express from 'express';
import { Server } from 'socket.io';

const app = express();
const PORT = 3000;

// Servir contenido estático desde carpeta /public
app.use(express.static('public'));

// Crear el servidor HTTPS
const httpsServer = https.createServer({
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}, app);

// Crear instancia de socket.io y asociarla al servidor HTTPS
const io = new Server(httpsServer, {
  cors: {
    origin: "*"
  }
});

io.on('connection', (socket) => {
  console.log('[SOCKET.IO] Cliente conectado:', socket.id);

  socket.on('gesto', (data) => {
    console.log('[SOCKET.IO] Gesto recibido:', data);
    if (data.tipo === 'giro-derecha') {
      console.log('[SOCKET.IO] Emitiendo cambio a undefined.html');
      io.emit('actualizarInterfaz', 'undefined.html');
    }
  });

  socket.on('disconnect', () => {
    console.log('[SOCKET.IO] Cliente desconectado:', socket.id);
  });
});

httpsServer.listen(PORT, () => {
  console.log(`Servidor escuchando en https://localhost:${PORT}`);
});
