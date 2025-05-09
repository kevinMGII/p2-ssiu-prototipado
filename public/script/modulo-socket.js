/* |---------------------------------------------------------------------|
   | Este módulo se encarga de:                                          |
   | - Inicializar la conexión con Socket.IO.                            |
   | - Configurar la detección de gestos de giro (deviceorientation)     |
   |   para emitir eventos hacia el servidor.                            |
   | - Escuchar el evento "actualizarInterfaz" para redirigir según la   |
   |   ruta indicada.                                                    |
   |---------------------------------------------------------------------|
 */


function initializeSocketIO() {
    window.addEventListener("deviceorientation", function(event) { // Detecta cambios en la orientación del dispositivo.
      var currentPath = window.location.pathname; // Examina la ruta actual del documento. Saber adonde redirigir en cada caso.
      var gamma = event.gamma; // Extrae la inclinación lateral del dispositivo
      if (gamma > 45 ) { // Si el valor gamma es mayor a 45, interpretamos que se ha girado a la derecha (y no esta en languaje)
          // Obtengo el cs para saber que dispositivo es el que ha efectuado el gesto.
          if (gamma > 65 && (currentPath.indexOf("compartir-invitacion-movil.html") != -1)) {
            const cs = localStorage.getItem('session'); // conseguir código de sesión
            console.log("[DEBUG] Gesto detectado: girar a la derecha. Iniciando sala...");
            socket.emit("start_room", localStorage.getItem("room"), (response) => {
              alert("Sala disponible hasta: " + response);
              setTimeout(() => {
                socket.emit("gesto", { tipo: "giro-derecha", url: currentPath, cs: cs, socket_des: socket.id });  
              }, 1000);
            });
            // Le mandamos el descriptor por si acaso quire comprobar el socket_id y saber que es él
            // Enviar el evento "giro-derecha" al servidor. Y URL para que sepa a donde redirigir. 
          }
          else if (currentPath.indexOf("compartir-invitacion-movil.html") == -1) {
            const cs = localStorage.getItem('session'); // conseguir código de sesión
            console.log("[DEBUG] Gesto detectado: girar a la derecha");
            // Le mandamos el descriptor por si acaso quire comprobar el socket_id y saber que es él
            socket.emit("gesto", { tipo: "giro-derecha", url: currentPath, cs: cs, socket_des: socket.id });
            // Enviar el evento "giro-derecha" al servidor. Y URL para que sepa a donde redirigir. 
          }
      }
      else if (gamma < -45 && (currentPath.indexOf("language-screen.html") == -1) && (currentPath.indexOf("compartir-invitacion-movil.html") == -1)) {  // Si gamma es menor a -45, se interpreta como un giro a la izquierda
        const cs = localStorage.getItem('session');  // Obtener el código de sesión
        console.log("[DEBUG] Gesto detectado: girar a la izquierda");
        socket.emit("gesto", { tipo: "giro-izquierda", url: currentPath, cs: cs, socket_des: socket.id });
      }
  });
}

  
// Función que determina si se debe inicializar Socket.IO.
  function initSocketForSpecialScreens() {                           // Actualmente se inicializará solo si la ruta actual es "language-screen.html" o "error-screen.html".
    var currentPath = window.location.pathname;                      // Obtenemos la ruta actual del documento.
    // Verificamos si la página es de lenguaje o el menú principal del móvil.
    var isSpecialScreen = (currentPath.indexOf("subtitulos-elegidos-movil.html") !== -1) || (currentPath.indexOf("language-screen.html") !== -1) || (currentPath.indexOf("menu_principal_movil.html")) !== -1 || (currentPath.indexOf("ponente_opciones.html") !== -1) || (currentPath.indexOf("compartir-invitacion-movil.html") !== -1);
    
    if (isSpecialScreen) {                                           // Si es una de esas páginas:
      initializeSocketIO();                                          // Llamamos a la función que inicializa Socket.IO.
    }
    
    socket.on("actualizarInterfaz", function(ruta) { // Escuchar el evento "actualizarInterfaz"
      console.log("[DEBUG] Recibido actualizarInterfaz:", ruta);
      window.location.href = ruta; // Redirige la página a la ruta recibida desde el servidor
  }); 
  }
  
