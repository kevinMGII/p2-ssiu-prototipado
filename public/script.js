// | -----------------------------------------------------------------------|
// | Este archivo es el punto de entrada principal para la aplicación.      |
// | Ejecuta la inicialización de Socket.IO (si corresponde) y la detección |
// | de eventos táctiles.                                                   |
// |------------------------------------------------------------------------|

document.addEventListener("DOMContentLoaded", function() {

  initSocketForSpecialScreens();    // Inicializar la conexión con Socket.IO en las pantallas especiales.
  
  initializeTouchEvents();          // Escuchamos la detección de eventos táctiles (doble tap y doble clic).
});
