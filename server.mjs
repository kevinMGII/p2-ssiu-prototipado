import https from 'https';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { Server } from 'socket.io';
import * as os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener la ruta absoluta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);  // Obtener el directorio donde se encuentra el archivo
//console.log('[SOCKET.IO] __dirname:', __dirname);  // Verificar la ruta de __dirname

const app = express();
const PORT = 3000;

const redirecciones = {
  'giro-derecha': {
    "/language-screen.html": {
      "mobile": 'duracion_sesion_movil.html',
      "pc": 'duracion_sesion.html'
    },
    "/menu_principal_movil.html": {
      "mobile": 'movil.html',
      "pc": 'idioma.html'
    },
    "/duracion_sesion_movil.html": {
      "mobile": 'compartir-invitacion-movil.html',
      "pc": 'compartir-invitacion.html'
    },
    "/compartir-invitacion-movil.html": {
      "mobile": 'ponente_opciones.html',
      "pc": 'subir-diapositivas.html'
    },
    "/subtitulos-elegidos-movil.html": {
      "mobile": 'subtitulos_presentacion.html',
      "pc": 'screen_share_alumno.html'
    }
  },
  'giro-izquierda': {
    "/menu_principal_movil.html": {
      "mobile": 'escaneo-movil.html',
      "pc": 'escaneo.html'
    }
  }
}

var sessions = JSON.parse(fs.readFileSync('./data/sessions.json', 'utf8'));
var sess_timeouts = [];

var rooms = JSON.parse(fs.readFileSync('./data/rooms.json', 'utf8'));
var room_timeouts = [];

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
                               
// |---------------------------------------------------------------------------|

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



  /* NUEVA SESIÓN */
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

  
  
  /* ASOCIAR SESIÓN */
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



  /* DETECTAR GESTOS */
  socket.on('gesto', (data) => {
    console.log('[SOCKET.IO] Gesto recibido:', data);
    console.log(`${sessions[data.cs].mobile_sock} == ${data.socket_des}`);
    if (sessions[data.cs].mobile_sock == data.socket_des) { // Si es el movil de verdad, y no otro dispositivo
      console.log('[SOCKET.IO] Emitiendo cambio en Movil a ' + redirecciones[data.tipo][data.url]["mobile"]);
      console.log('[SOCKET.IO] Emitiendo cambio en PC a ' + redirecciones[data.tipo][data.url]["pc"]);
      io.to(sessions[data.cs].mobile_sock).emit('actualizarInterfaz', redirecciones[data.tipo][data.url]["mobile"]);
      io.to(sessions[data.cs].pc_sock).emit('actualizarInterfaz', redirecciones[data.tipo][data.url]["pc"]);
    }
    else {
      console.log('[SOCKET.IO] El socket no corresponde a la sesión móvil. Ignorando gesto.');
    }

    /*
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
      else if (data.url.indexOf("menu_principal_movil.html") !== -1) {
        if (sessions[data.cs].mobile_sock == data.socket_des) {
          console.log('[SOCKET.IO] Emitiendo cambio a movil.html en Movil');
          console.log('[SOCKET.IO] Emitiendo cambio a idioma.html en PC');
          io.to(sessions[data.cs].mobile_sock).emit('actualizarInterfaz', 'movil.html');
          io.to(sessions[data.cs].pc_sock).emit('actualizarInterfaz', 'idioma.html');
        }
        else {
          console.log('[SOCKET.IO] El socket no corresponde a la sesión móvil. Ignorando gesto.');
        }
      }
      else if (data.url.indexOf("duracion_sesion_movil.html") !== -1) {
        if (sessions[data.cs].mobile_sock == data.socket_des) {
          console.log('[SOCKET.IO] Emitiendo cambio a compartir-invitacion-movil en Movil');
          console.log('[SOCKET.IO] Emitiendo cambio a compartir-invitacion en PC');
          io.to(sessions[data.cs].mobile_sock).emit('actualizarInterfaz', 'compartir-invitacion-movil.html');
          io.to(sessions[data.cs].pc_sock).emit('actualizarInterfaz', 'compartir-invitacion.html');
        }
        else {
          console.log('[SOCKET.IO] El socket no corresponde a la sesión móvil. Ignorando gesto.');
        }
      }
    }
    else if (data.tipo === 'giro-izquierda') {
      if (data.url.indexOf("menu_principal_movil.html") !== -1) {
        if (sessions[data.cs].mobile_sock == data.socket_des) {
          console.log('[SOCKET.IO] Emitiendo cambio a movil.html en Movil');
          console.log('[SOCKET.IO] Emitiendo cambio a index.html en PC');
          io.to(sessions[data.cs].mobile_sock).emit('actualizarInterfaz', 'index.html');
          io.to(sessions[data.cs].pc_sock).emit('actualizarInterfaz', 'index.html');
        }
        else {
          console.log('[SOCKET.IO] El socket no corresponde a la sesión móvil. Ignorando gesto.');
        }
      }
    }
      */
  });



  /* PEDIR DIRECCION IP */
  socket.on('ip', () => {
    const localIP = getLocalIP();
    console.log('[SOCKET.IO] IP local solicitada:', localIP);
    socket.emit('ip', localIP);
  });



  /* DETECTAR CAMBIOS EN HTML */
  socket.on('change-html', (data) => {  // data = {cs, html}
    console.log('[SOCKET.IO] Cambio de HTML enviado:', data, '(a recibir por', sessions[data.cs].pc_sock,')');
    io.to(sessions[data.cs].pc_sock).emit('actualizarInterfaz', data.html);
  });



  /* SUBIR DIAPOSITIVAS */
  socket.on('upload_slides', (data) => {
    const { cs, file } = data;
    console.log(`[upload_slides] recibido para sesión ${cs}:`, file.name);

    const dir = `./public/uploads/${cs}`;

    // 1. Verificar si el directorio existe y eliminar archivos previos
    if (fs.existsSync(dir)) {
      // 2. Leer los archivos en la carpeta y eliminarlos
      fs.readdirSync(dir).forEach((fileName) => {
        const filePath = path.join(dir, fileName);
        // Eliminar archivo
        fs.unlinkSync(filePath);
        console.log(`[upload_slides] archivo eliminado: ${filePath}`);
      });
    }

    // 3. Crear el directorio si no existe
    fs.mkdirSync(dir, { recursive: true });

    // 4. Definir la ruta del archivo y guardar el nuevo archivo
    const filePath = `${dir}/${file.name}`;
    
    fs.writeFile(filePath, file.content, 'base64', (err) => {
      if (err) {
        console.error('[upload_slides] error al guardar:', err);
        return;
      }
      console.log('[upload_slides] guardado en:', filePath);

      // Emitir solo al PC para que cargue la vista de mostrar-diapositivas
      const pcSock = sessions[cs]?.pc_sock;
      const movilSock = sessions[cs]?.mobile_sock;
      if (pcSock && movilSock) {
        console.log('[upload_slides] emitiendo actualizarInterfaz a movil → ponente_diapositivas.html');
        console.log('[upload_slides] emitiendo actualizarInterfaz a PC → mostrar-diapositivas.html');
        io.to(pcSock).emit('actualizarInterfaz', 'mostrar-diapositivas.html');
        io.to(movilSock).emit('actualizarInterfaz', 'ponente_diapositivas.html');
      } else {
        console.warn('[upload_slides] no hay pc_sock para sesión', cs);
      }
    });
  });

    /* DAR RUTA DEL PDF DEL PONENTE */
  socket.on('getPdfFile', (data) => {
    console.log('[SOCKET.IO] Ruta recibida del cliente:', data.path);
    const directoryPath = path.join(__dirname, 'public', data.path);  // Ruta de la carpeta 'uploads/cs'
    console.log('[SOCKET.IO] Ruta del Directorio:', directoryPath);  // Imprimir la ruta de la carpeta en la consola
    
    // Leer los archivos del directorio
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.log('Error al leer el directorio:', err);
      }

      // Filtrar archivos PDF (aunque siempre deberia haber uno)
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));

      // Si se encuentra al menos un archivo PDF, sino hay un problema:
      if (pdfFiles.length > 0) {
        const firstPdf = pdfFiles[0];
        const pdfFilePath = path.join(data.path, firstPdf);  // Generar la ruta relativa al archivo
        console.log('[SOCKET.IO] Ruta del primer archivo PDF:', pdfFilePath);

        // Emitir la ruta del primer archivo PDF al Ponente
        socket.emit('pdfFilePath', pdfFilePath);

        // Emitir la ruta del primer archivo PDF a todos los clientes de la sala
        const cs = data.path.split('/')[1];  // Obtener el CS del path, que es el del ponente
        let room = null;
        for (let roomID in rooms) {
          if (rooms[roomID].ponente === cs) {
            console.log(`[SOCKET.IO] Sesión ${roomID} encontrada para el ponente ${cs}`);
            room = roomID; // Guardar el ID de la sala, es decir, el numerito
            break;
          }
        }
        if (room !== null) {
          rooms[room].clientes.forEach(clienteCS => {
            try { // Por si un socket falla o algo por el estilo
              let clienteSock = sessions[clienteCS]?.pc_sock;
              if (clienteSock) {
                io.to(clienteSock).emit('pdfFilePath', pdfFilePath); // reenviamos el pdf path a cada cliente de la sala
                console.log(`[SOCKET.IO] ROOM ${room}. Enviado PDF a ${clienteCS} (${clienteSock})`);
              }
            } catch (error) { ; }
           });
        }
      } else {
        socket.emit('pdfFilePath', { error: 'No se encontraron archivos PDF' });
      }
    });
  });

  /* SCROLL DE DIAPOSITIVAS */
  socket.on('scroll_diapo', (data) => {
    console.log('[SOCKET.IO] Scroll de diapositivas recibido:', data);
    const cs = parseInt(data.cs);
    const movilSock = sessions[cs]?.mobile_sock;
    const pcSock = sessions[cs]?.pc_sock;
    
    if (movilSock && pcSock) {
      console.log('[SOCKET.IO] Enviando a movil y PC:', data.desliz);
      if (data.desliz == "izquierda") { // No seria cambiar diapositiva, sino cambiar HTML
        console.log('[SOCKET.IO] Actualizando interfaz:', data.desliz);
        io.to(movilSock).emit('actualizarInterfaz', 'ponente_opciones.html');
        io.to(pcSock).emit('actualizarInterfaz', 'subir-diapositivas.html');
      }
      else {
        // Enviamos a PC del Ponente
        console.log('[SOCKET.IO] Enviando scroll a PC correspondiente:', data.desliz);
        io.to(pcSock).emit('scroll_pc', {desliz: data.desliz});

        // Emitir SCROLL A CADA CLIENTE
        let room = null;
        for (let roomID in rooms) {
          if (rooms[roomID].ponente === cs.toString()) {
            console.log(`[SOCKET.IO] Sesión ${roomID} encontrada para el ponente ${cs.toString()}`);
            room = roomID; // Guardar el ID de la sala, es decir, el numerito
            break;
          }
        }
        if (room !== null) {
          rooms[room].clientes.forEach(clienteCS => {
            try { // Por si un socket falla o algo por el estilo
              let clienteSock = sessions[clienteCS]?.pc_sock;
              if (clienteSock) {
                io.to(clienteSock).emit('scroll_pc', {desliz: data.desliz}); // reenviamos SCROLL a cada cliente
                console.log(`[SOCKET.IO] ROOM ${room}. Scroll PC a ${clienteCS} (${clienteSock})`);
              }
            } catch (error) { ; }
           });
        }
      }
    } else {
      console.warn('[SOCKET.IO] No se encontraron sockets para la sesión', cs);
    }
  });

  /* PASAR DIAPOSITIVA */
  socket.on('pasar_diapo', (data) => {
    console.log('[SOCKET.IO] Pasar diapositiva recibido:', data);
    const cs = parseInt(data.cs);
    const movilSock = sessions[cs]?.mobile_sock;
    const pcSock = sessions[cs]?.pc_sock;
    
    if (movilSock && pcSock) {
      // ENVIAMOS PASO DIAPO AL PONENTE PC
      console.log('[SOCKET.IO] Enviando pasar diapositiva a PC correspondiente:', data.tipo);
      io.to(pcSock).emit('pasar_diapo_pc', {tipo: data.tipo});

      // Emitir PASO DIAPO a todos los clientes de la sala
      let room = null;
      for (let roomID in rooms) {
        if (rooms[roomID].ponente === cs.toString()) {
          console.log(`[SOCKET.IO] Sesión ${roomID} encontrada para el ponente ${cs.toString()}`);
          room = roomID; // Guardar el ID de la sala, es decir, el numerito
          break;
        }
      }
      if (room !== null) {
        rooms[room].clientes.forEach(clienteCS => {
          try { // Por si un socket falla o algo por el estilo
            let clienteSock = sessions[clienteCS]?.pc_sock;
            if (clienteSock) {
              io.to(clienteSock).emit('pasar_diapo_pc', {tipo: data.tipo}); // reenviamos PASAR DIAPO a cada cliente
              console.log(`[SOCKET.IO] ROOM ${room}. PASO DIAPO PC a ${clienteCS} (${clienteSock})`);
            }
          } catch (error) { ; }
          });
      }
    } else {
      console.warn('[SOCKET.IO] No se encontraron sockets para la sesión', cs);
    }
  });



  /* CREAR SALA */
  socket.on('new_room', (data) => {  // data = {duracion: tiempo (ms), ponente: cs, old_room: room}
    console.log('[SOCKET.IO] Creación de sala recibida: ', data);
    let room = -1;

    // revisar si old_room sigue siendo valido
    try{
      if (rooms[data.old_room]["ponente"] == data.ponente && room_timeouts[data.old_room] && room_timeouts[data.old_room] > Date.now()){
        room = parseInt(data.old_room);
      }
    } catch (error) { console.log(`[SOCKET.IO] Error en new_room: ${error}`); }
    
    // si no es valido
    if (room == -1){
      for (room = 0; room < room_timeouts.length; room++) {                            // mirar todas las sesiones creadas
        console.log(room, " < ", room_timeouts.length);
        console.log(room_timeouts[room], " != -1 && < ", Date.now());
        if (room_timeouts[room] === undefined || (room_timeouts[room] != -1 && room_timeouts[room] < Date.now())) {                                  // cuando encuentre una sesión caducada, usar esa
          console.log(`[SOCKET.IO] Sala ${room} caducada, reutilizando...`);
          break;
        }
      }
    }
    
    // asociar ponente y duración
    rooms[room] = { duracion: data.duracion, ponente: data.ponente, clientes: [] };
    fs.writeFile('./data/rooms.json', JSON.stringify(rooms), () => {
      console.log(`[SOCKET.IO] Sala ${room} para ponente ${data.ponente}`);
    });

    // reiniciar timeout
    room_timeouts[room] = -1;

    // enviar tanto a pc como a movil
    io.to(sessions[data.ponente].mobile_sock).emit('new_room', room.toString());
    io.to(sessions[data.ponente].pc_sock).emit('new_room', room.toString());
  });




  /* UNIRSE A SALA */
  socket.on('join_room', (data) => {  // data = {room, cliente: cs}
    console.log('[SOCKET.IO] Unión a sala recibida: ', data);
    
    // asociar cliente (si no estaba asociado antes)
    if (!rooms[data.room]["clientes"].includes(data.cliente)){
      rooms[data.room]["clientes"].push(data.cliente);
    }

    fs.writeFile('./data/rooms.json', JSON.stringify(rooms), () => {
      console.log(`[SOCKET.IO] Sala ${data.room} para cliente ${data.cliente}`);
    });

    // enviar a pc
    io.to(sessions[data.cliente].pc_sock).emit('join_room', data.room.toString());
  });



  /* INICIAR CONTADOR DE SALA */
  socket.on('start_room', (data) => {  // data = room
    console.log('[SOCKET.IO] Inicio de sala recibido: ', data);
    room_timeouts[parseInt(data)] = Date.now() + rooms[parseInt(data)]["duracion"];
  });


  /* ENVIAR VOZ y SUBTITULOS (TEXTO) DE PONENTE HACIA LOS CLIENTES */
  socket.on("audio-chunk", ({ texto, cs }) => {
    // Buscamos la sala donde esta el ponente
    let room = null;
    for (let roomID in rooms) {
      if (rooms[roomID].ponente === cs) {
        console.log(`[MEDIA] Sesión ${roomID} encontrada para el ponente ${cs}`);
        room = roomID; // Guardar el ID de la sala, es decir, el numerito
        break;
      }
    }
    if (room !== null) {
      rooms[room].clientes.forEach(clienteCS => {
        // Parte Voz
        let clienteSock = sessions[clienteCS]?.pc_sock;
        if (clienteSock) {
          io.to(clienteSock).emit("audio-chunk", { texto: texto, cs: cs }); // reenviamos el blob al cliente
          console.log(`[MEDIA] ROOM ${room}. Enviado Audio a ${clienteCS} (${clienteSock})`);
        }
        // Parte Subtitulos
        let clientMovilSock = sessions[clienteCS]?.mobile_sock;
        if (clientMovilSock) {
          io.to(clientMovilSock).emit("subtitulos-chunk", { texto: texto, cs: cs }); // reenviamos el blob al cliente
          console.log(`[MEDIA] ROOM ${room}. Enviado Subtitulos a ${clienteCS} (${clientMovilSock})`);
        }
      });
    }
  });
  

  /* ABANDONAR PÁGINA */
  socket.on('abandono', (data) => { // data = 'cs'
    console.log('[SOCKET.IO] Cliente abandonando: ', socket.id, "; ", data);
    
    const cs = parseInt(data);
    sess_timeouts[cs] = Date.now() + 5000;  // 5 mins;
  });



  /* DESCONECTAR */
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
