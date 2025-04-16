// | ------------------------------------------------------------ |
// | Este archivo se encarga de enviar mensajes de log al servidor|
// | mediante una petición POST a la ruta /log.                   |
// | ------------------------------------------------------------ |

/**
 * Envía un mensaje de log al servidor.
 * @param {string} message - El mensaje a enviar.
 */
function logToServer(message) {                   // Función que manda un mensaje de log al servidor, el que recibe por parámetro.
    fetch('https://localhost:3000/log', {         // Usamos la función fetch para enviar una petición HTTP al servidor con el localhost
      method: 'POST',                             // Especificamos el método HTTP a utilizar, en este caso "POST".
      headers: {
        'Content-Type': 'application/json'        // Definimos las cabeceras de la petición.
      },
      body: JSON.stringify({ mensaje: message })  // El cuerpo de la petición es un objeto JSON con la propiedad 'mensaje'.
    })
      .then(function(response) {                                   // 'then' se ejecuta cuando la petición se resuelve satisfactoriamente.
        console.log("[DEBUG] Log enviado al servidor:", message);  // Imprimimos en la consola un mensaje indicando que el log se envió correctamente.
      })
      .catch(function(err) {                                       // 'catch' se ejecuta si ocurre algún error durante la petición.
        console.error("[DEBUG] Error al enviar log:", err);        // Mostramos en la consola el error ocurrido durante el envío del log.
      });
  }
  
