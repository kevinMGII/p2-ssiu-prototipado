import https from 'https';
import fs from 'fs';
import express from 'express';
import { Server } from 'socket.io';
import * as os from 'os';

const app = express();
const PORT = 3000;
var sessions = JSON.parse(fs.readFileSync('./data/sessions.json', 'utf8'));
var sess_timeouts = [];

// |--------------------------- SESIÓN (MÓVIL + PC) ---------------------------|

// Conseguir IP del servidor
/*function getLocalIP() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const addresses = networkInterfaces[interfaceName];
        for (const address of addresses) {
            if (address.family === 'IPv4' && !address.internal) {
                return address.address;
            }
        }
    }
    return 'IP no encontrada';
}*/

function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  const platform = os.platform(); // Detectar sistema operativo

  let ethernetIP = null;

  for (const interfaceName in networkInterfaces) {
      const addresses = networkInterfaces[interfaceName];

      // Filtrar nombres de interfaces según el sistema operativo
      const isWiFiInterface = platform === 'win32'
          ? interfaceName.toLowerCase().includes('wi-fi') || interfaceName.toLowerCase().includes('wireless')
          : interfaceName.toLowerCase().includes('wlan') || interfaceName.toLowerCase().includes('wl');

      const isEthernetInterface = platform === 'win32'
          ? interfaceName.toLowerCase().includes('ethernet')
          : interfaceName.toLowerCase().startsWith('eth') || interfaceName.toLowerCase().startsWith('en');

      for (const address of addresses) {
          if (address.family === 'IPv4' && !address.internal) {
              if (isWiFiInterface) {
                  return address.address; // Priorizar Wi-Fi
              }
              if (!ethernetIP && isEthernetInterface) {
                  ethernetIP = address.address; // Guardar la primera IP Ethernet válida
              }
          }
      }
  }

  // Si no se encuentra Wi-Fi, devolver la IP de Ethernet (si existe)
  return ethernetIP || 'IP no encontrada';
}

/*
// Saber si un dispositivo ya tiene una sesión activa
function findSession(type, id) {
  if (sessions) {
    for (const session of sessions) {
      // Comprobar id según el tipo de dispositivo
      if (type === "pc_sock") {
        if (session["pc_sock"] === id) {
            return session["session_id"];
        }
      } else if (type === 'mobile_sock') {
        if (session["mobile_sock"] === id) {
          return session["session_id"];
        }
      }
    }
    // Si no ha encontrado la sesión, devolver -1
    return -1;
  }
  // Si no hay sesiones, devolver -1
  return -1;
}
  */

// |--------------------------- SESIÓN (MÓVIL + PC) ---------------------------|

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

// |--------------------------- SOCKET.IO ---------------------------|

io.on('connection', (socket) => {
  console.log('[SOCKET.IO] Cliente conectado:', socket.id);
  // Crear sesión para el cliente
  /*
  // 1. Detectar si es móvil o PC
  const userAgent = socket.request.headers['user-agent'];
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
  const deviceType = isMobile ? "mobile_sock" : "pc_sock";
  console.log(`[SOCKET.IO] Tipo de dispositivo: ${deviceType}`);
  // 2. Ver si ya tenía sesión
  const cs = findSession(deviceType, socket.id);
  if (cs != -1){
    sessions[cs][deviceType] = socket.id;
    fs.writeFile('./data/sessions.json', sessions);
  }
  */

  socket.on('new_session', (data) => {   // data = 'type: "mobile"/"pc"'
    console.log('[SOCKET.IO] Creación de sesión recibida');

    let cs = 0;
    for (cs = 0; cs < sess_timeouts.length; cs++) {                            // mirar todas las sesiones creadas
      console.log(cs, " < ", sess_timeouts.length);
      console.log(sess_timeouts[cs], " != -1 && < ", Date.now());
      if (sess_timeouts[cs] === undefined || (sess_timeouts[cs] != -1 && sess_timeouts[cs] < Date.now())) {                                  // cuando encuentre una sesión caducada, usar esa
        console.log(`[SOCKET.IO] Sesión ${cs} caducada, reutilizando...`);
        break;
      }
    }
    
    // asociar el socket a la nueva sesión
    console.log(`[SOCKET.IO] Actualizo el cs:${cs} y para socket:${socket.id}`);
    sessions[cs] = { [`${data.type}_sock`]: socket.id };
    fs.writeFile('./data/sessions.json', JSON.stringify(sessions), () => {
      console.log(`[SOCKET.IO] Sesión ${cs} usada por ${socket.id}`);
    });

    // reiniciar timeout
    sess_timeouts[cs] = -1;

    socket.emit('new_session', cs.toString());
  });

  // sólo se recible esta petición si el timestamp no ha pasado del tiempo establecido
  socket.on('session', (data) => {   // data = 'cs, type: "mobile"/"pc"'
    console.log('[SOCKET.IO] Unión a sesión recibida:', data);

    let response = false;
    if (sess_timeouts[parseInt(data.cs)] == -1 || sess_timeouts[parseInt(data.cs)] > Date.now()) {  // mirar si cs ha expirado
      sessions[data.cs][data.type + "_sock"] = socket.id;                                             // actualizar el socket
      sess_timeouts[parseInt(data.cs)] = -1;                                                        // actualizar el timeout
      fs.writeFile('./data/sessions.json', JSON.stringify(sessions), () => {                          // actualizar las sesiones
        console.log(`[SOCKET.IO] Sesión ${data.cs} usada por ${socket.id}`);
      });       
      response = true;
    }

    socket.emit('session', response.toString());
  });

  socket.on('gesto', (data) => {
    console.log('[SOCKET.IO] Gesto recibido:', data);

    if (data.tipo === 'giro-derecha') {
      console.log(`${sessions[data.cs].mobile_sock} == ${data.socket_des}`);
      if (data.url.indexOf("language-screen.html") !== -1) { 
        if (sessions[data.cs].mobile_sock == data.socket_des) { // Si es el movil de verdad, y no otro dispositivo
          console.log('[SOCKET.IO] Emitiendo cambio a duracion_sesion_movil.html en Movil');
          console.log('[SOCKET.IO] Emitiendo cambio a duracion_sesion.html en PC');
          io.to(sessions[data.cs].mobile_sock).emit('actualizarInterfaz', 'duracion_sesion_movil.html');
          io.to(sessions[data.cs].pc_sock).emit('actualizarInterfaz', 'duracion_sesion.html');
        }
        else {
          console.log('[SOCKET.IO] El socket no corresponde a la sesión móvil. Ignorando gesto.');
        }
      }
      else if (data.url.indexOf("menu_principal_movil.html") !== -1)
        if (sessions[data.cs].mobile_sock == data.socket_des) {
          console.log('[SOCKET.IO] Emitiendo cambio a movil.html en Movil');
          console.log('[SOCKET.IO] Emitiendo cambio a index.html en PC');
          io.to(sessions[data.cs].mobile_sock).emit('actualizarInterfaz', 'movil.html');
          io.to(sessions[data.cs].pc_sock).emit('actualizarInterfaz', 'index.html');
        }
        else {
          console.log('[SOCKET.IO] El socket no corresponde a la sesión móvil. Ignorando gesto.');
        }
    }
  });

  socket.on('ip', () => {
    const localIP = getLocalIP();
    console.log('[SOCKET.IO] IP local solicitada:', localIP);
    socket.emit('ip', localIP);
  });

  socket.on('abandono', (data) => { // data = 'cs'
    console.log('[SOCKET.IO] Cliente abandonando: ', socket.id, "; ", data);
    
    const cs = parseInt(data);
    sess_timeouts[cs] = Date.now() + 5000;  // 5 mins;
  });

  socket.on('disconnect', () => { 
    console.log('[SOCKET.IO] Cliente desconectado:', socket.id);
  });
});

// |--------------------------- SOCKET.IO ---------------------------|

// Iniciar servidor HTTPS
httpsServer.listen(PORT, () => {
  console.log(`Servidor escuchando en https://localhost:${PORT}`);
  console.log('Dirección IP local:', getLocalIP());
});
