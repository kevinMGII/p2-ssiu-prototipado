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
    // La librería de Socket.IO ya está cargada en el HTML, así que ahora solo se configura la conexión.
    var socket = io(); // Inicializa la conexión con el servidor de Socket.IO.

    window.addEventListener("deviceorientation", function(event) { // Detecta cambios en la orientación del dispositivo.
        var gamma = event.gamma; // Extrae la inclinación lateral del dispositivo
        if (gamma > 45) { // Si el valor gamma es mayor a 45, interpretamos que se ha girado a la derecha
            console.log("[DEBUG] Gesto detectado: girar a la derecha");
            socket.emit("gesto", { tipo: "giro-derecha" }); // Enviar el evento "giro-derecha" al servidor.
        }
    });

    socket.on("actualizarInterfaz", function(ruta) { // Escuchar el evento "actualizarInterfaz"
        console.log("[DEBUG] Recibido actualizarInterfaz:", ruta);
        window.location.href = ruta; // Redirige la página a la ruta recibida desde el servidor
    });
}

  
// Función que determina si se debe inicializar Socket.IO.
  function initSocketForSpecialScreens() {      // Actualmente se inicializará solo si la ruta actual es "language-screen.html" o "error-screen.html".
    var currentPath = window.location.pathname;                                           // Obtenemos la ruta actual del documento.
    var isLanguageScreen = (currentPath.indexOf("language-screen.html") !== -1);          // Verificamos si la página es la de idioma.
    
    if (isLanguageScreen) {                                                              // Si la página es de lenguaje o de error...
      initializeSocketIO();                                                              // Llamamos a la función que inicializa Socket.IO.
    }
  }
  
