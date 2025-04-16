/* |---------------------------------------------------------------------|
   | Este módulo se encarga de:                                          |
   | - Inicializar la conexión con Socket.IO.                            |
   | - Configurar la detección de gestos de giro (deviceorientation)     |
   |   para emitir eventos hacia el servidor.                            |
   | - Escuchar el evento "actualizarInterfaz" para redirigir según la   |
   |   ruta indicada.                                                    |
   |---------------------------------------------------------------------|
 */


function initializeSocketIO() {                                               // Inicializamos Socket.IO y configuramos los listeners.
    var scriptElement = document.createElement('script');                     // Crear un elemento <script> para cargar la librería Socket.IO desde el CDN.
    scriptElement.src = "https://cdn.socket.io/4.5.4/socket.io.min.js";       // Asignamos la URL del script de Socket.IO al atributo "src" del elemento script, para que el nav sepa.

    
    scriptElement.onload = function() {       // Cuando el script se cargue, configuramos la conexión y metemos los listeners.
      var socket = io();                      // La función "io()" inicializa la conexión con el servidor de Socket.IO.
      
      window.addEventListener("deviceorientation", function(event) {                   // Registramos el listener para el evento deviceorientation.
        var gamma = event.gamma;                                                       // Extraemos la propiedad "gamma", que nos da la inclinación lateral
        if (gamma > 45) {                                                              // Si el valor gamma es mayor a 45, se interpreta como un giro a la derecha.
          console.log("[DEBUG] Gesto detectado: girar a la derecha");                  // Imprimimos en la consola que se ha detectado el gesto de girar a la derecha. 
          socket.emit("gesto", { tipo: "giro-derecha" });                              // Mandamos al server a través de Socket.IO el evento "gesto" y propiedad "tipo" como "giro-derecha".
        }
      });
      
      socket.on("actualizarInterfaz", function(ruta) {                                        // Escuchar el evento "actualizarInterfaz" para redirigir según la ruta recibida.
        console.log("[DEBUG] Recibido actualizarInterfaz:", ruta);                            // Imprimimos en la consola que se ha detectado la peticion de actualizar interfaz.
        window.location.href = ruta;                                                          // Redirigimos el navegador a la nueva ruta indicada por el servidor.
      });
    };
    
    document.body.appendChild(scriptElement);                                                 // Metemos el elemento <script> al final del <body> para que se ejecute.
  }
  
// Función que determina si se debe inicializar Socket.IO.
  function initSocketForSpecialScreens() {      // Actualmente se inicializará solo si la ruta actual es "language-screen.html" o "error-screen.html".
    var currentPath = window.location.pathname;                                           // Obtenemos la ruta actual del documento.
    var isLanguageScreen = (currentPath.indexOf("language-screen.html") !== -1);          // Verificamos si la página es la de idioma.
    
    if (isLanguageScreen) {                                                              // Si la página es de lenguaje o de error...
      initializeSocketIO();                                                              // Llamamos a la función que inicializa Socket.IO.
    }
  }
  
