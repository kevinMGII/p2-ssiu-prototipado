// |-------------------------------------------------|
// | Este módulo se encarga de:                      |
// | - Generar una imagen a partir del div del QR    |
// | - Descargar esa imagen                          |
// |-------------------------------------------------|

function DownloadInvitation() {
    html2canvas(document.querySelector("#download-qr"))
        .then(canvas => {
            // copiloto: Convertir el canvas a una URL de datos en formato PNG
            const imageData = canvas.toDataURL("image/png");

            // Crear un enlace temporal para descargar la imagen
            const link = document.createElement("a");
            link.href = imageData;
            link.download = "invitacion.png"; // Nombre del archivo descargado
            link.click(); // Simular un clic para iniciar la descarga
        });
}

function detectDownloadInvitation() {                             //  Inicializamos la detección de eventos táctiles y de clic.

    document.addEventListener("touchend", function(e) {          // Agregar listener para el evento "touchend" (cuando se deja de tocar la pantalla).
      var now = Date.now();                                      // Obtenemos el tiempo actual en milisegundos usando Date.now().
      var timeSinceLastTap = now - lastTap;                      // Calculamos el tiempo transcurrido desde el último toque almacenado en "lastTap".
      
  
      if (timeSinceLastTap > 0 && timeSinceLastTap < 300) {      // Si el intervalo entre toques es menor a 300 milisegundos, se considera un doble toque.
        console.log("[DEBUG] Double tap detectado (touchend). Redirigiendo a movil.html.");  // Imprimimos en la consola un mensaje de depuración indicando que se detectó un doble toque.
        DownloadInvitation();                                                 // Redirigimos la ventana a "movil.html".
      }
      lastTap = now;                                             // Actualizamos la variable "lastTap" con el tiempo actual para poder comparar en futuros toques. 
    });
    
    document.addEventListener("dblclick", function(e) {                                         // Metemos un listener para el evento "dblclick" (doble clic).
      console.log("[DEBUG] Doble clic detectado (dblclick). Redirigiendo a movil.html.");       // Imprimimos en la consola un mensaje de depuración indicando que se detectó un doble clic.
      DownloadInvitation();                                                    // Redirigimos la ventana a "movil.html".
    });
  }