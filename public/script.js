// | -----------------------------------------------------------------------|
// | Este archivo es el punto de entrada principal para la aplicación.      |
// | Ejecuta la inicialización de Socket.IO (si corresponde) y la detección |
// | de eventos táctiles.                                                   |
// |------------------------------------------------------------------------|

const type = (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) ? "mobile" : "pc";
const urlParams = new URLSearchParams(window.location.search);

if (type === "mobile" && urlParams.size > 0) {
  // Obtener el valor de 'cs'
  localStorage.setItem('session', urlParams.get('cs'));
}

const cs = localStorage.getItem('session'); // conseguir código de sesión

const socket = io();
console.log("[SOCKET.IO] Conectando al servidor de Socket.IO...");

socket.on("connect", () => {
  console.log("[SOCKET.IO] Conexión establecida con el servidor:", socket.id);
  if (cs) {
    socket.emit("session", { cs: cs, type: type });
    socket.on("session", (ok) => {
      if (ok == "true"){
        console.log("[SOCKET.IO] Sesión reestablecida (", ok, "): ", cs, "; ", type);
      } else {
        console.log("[SOCKET.IO] Solicitando nueva sesión...");
        socket.emit("new_session", { type: type });
        socket.on("new_session", (i) => {
          localStorage.setItem('session', i);
          console.log("[SOCKET.IO] Nueva sesión obtenida: ", i);
          if (type === "pc") {
            window.location.href = "index.html";
          } else {
            window.location.href = "error.html";
          }
        });
      }
    });
  } else {
    console.log("[SOCKET.IO] Solicitando nueva sesión...");
    socket.emit("new_session", { type: type });
    socket.on("new_session", (i) => {
      localStorage.setItem('session', i);
      console.log("[SOCKET.IO] Nueva sesión obtenida: ", i);
      if (type === "pc") {
        window.location.href = "index.html";
      } else {
        window.location.href = "error.html";
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function() {

  /*try {
    initSocketForSpecialScreens();    // Inicializar la conexión con Socket.IO en las pantallas especiales.  
  } catch (error) { ; }
  try {
    initializeTouchEvents();          // Escuchamos la detección de eventos táctiles (doble tap y doble clic).
  } catch (error) { ; }*/
  try {
    generateQr();          // Escuchamos la detección de eventos táctiles (doble tap y doble clic).
  } catch (error) { ; }

});

window.addEventListener("beforeunload", function (event) {
  // Mensaje de advertencia (algunos navegadores lo ignoran o usan un mensaje predeterminado)
  event.preventDefault();
  socket.emit("abandono", cs);
  console.log("[DEBUG] El usuario intentó recargar o salir de la página.");
});