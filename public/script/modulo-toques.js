/*  |--------------------------------------------------|
    | Este módulo se encarga de detectar:              |
    |   - Un doble toque (double tap) en la pantalla.  |
    |   - Un doble clic (dblclick).                    |
    |   En ambos casos, redirige a "movil.html",     |
    |   o a "eleccion-subtitulos-movil.html" si       |
    |   venimos de "subtitulos-elegidos-movil.html" |
    |--------------------------------------------------|
*/

var lastTap = 0;          // Ponemos una variable para almacenar el tiempo del último toque (para detectar doble tap).

function initializeTouchEvents() {                             //  Inicializamos la detección de eventos táctiles y de clic.

  const currentPage = window.location.pathname.split("/").pop(); // Obtenemos la página actual para decidir la redirección.

  document.addEventListener("touchend", function(e) {          // Agregar listener para el evento "touchend" (cuando se deja de tocar la pantalla).
    var now = Date.now();                                      // Obtenemos el tiempo actual en milisegundos usando Date.now().
    var timeSinceLastTap = now - lastTap;                      // Calculamos el tiempo transcurrido desde el último toque almacenado en "lastTap".
    
    if (timeSinceLastTap > 0 && timeSinceLastTap < 300) {      // Si el intervalo entre toques es menor a 300 milisegundos, se considera un doble toque.
      console.log("[DEBUG] Double tap detectado (touchend). Redirigiendo según la página actual.");  // Imprimimos en la consola un mensaje de depuración.
      if (currentPage === "subtitulos-elegidos-movil.html" || currentPage === "subtitulos-error-movil.html") {
        window.location.href = "eleccion-subtitulos-movil.html";  // Redirige a elección de subtítulos si venimos de la pantalla de subtítulos elegidos móvil
      } else {
        window.location.href = "movil.html";                  // Redirige a movil.html en cualquier otro caso
      }
    }
    lastTap = now;                                             // Actualizamos la variable "lastTap" con el tiempo actual para futuras detecciones.
  });
  
  document.addEventListener("dblclick", function(e) {       // Metemos un listener para el evento "dblclick" (doble clic).
    console.log("[DEBUG] Doble clic detectado (dblclick). Redirigiendo según la página actual.");       // Imprimimos en la consola un mensaje de depuración.
    if (currentPage === "subtitulos-elegidos-movil.html" || currentPage === "subtitulos-error-movil.html" || currentPage === "eleccion-subtitulos-movil.html") {
      window.location.href = "eleccion-subtitulos-movil.html"; // Redirige a elección de subtítulos si venimos de la pantalla de subtítulos elegidos móvil
    } else {
      window.location.href = "movil.html";                   // Redirige a movil.html en cualquier otro caso
    }
  });
}
