// |------------------------------------------------------------|
// | Este módulo se encarga de:                                 |
// | - Iniciar el reconocimiento de voz al cargar movil.html    |
// | - Mostrar el texto reconocido debajo del micrófono         |
// | - Redirigir a la pantalla correcta según el mensaje dicho  |
// |------------------------------------------------------------|

document.addEventListener("DOMContentLoaded", () => {                                      // Esperamos a que el contenido del DOM esté completamente cargado
    
    const transcriptElement = document.getElementById("transcript");                       // Obtenemos el elemento donde se mostrará el texto reconocido
    const micImg = document.getElementById("mic-img");                                     // Obtenemos el microfono
  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;  // Verificamos compatibilidad con el navegador
  
    if (!SpeechRecognition) {                                                           // Si no hay soporte, muestra un mensaje y detiene la ejecución
      console.error("[DEBUG] SpeechRecognition no es compatible con este navegador.");  // Muestra error en consola
      transcriptElement.textContent = "El reconocimiento de voz no está disponible.";   // Informa al usuario
      return;                                                                           // Sale de la función
    }
  
    const recognition = new SpeechRecognition();    // Crea una nueva instancia de reconocimiento de voz
    recognition.lang = "es-ES";                     // Idioma español
    recognition.continuous = false;                 // Solo una frase
    recognition.interimResults = false;             // Solo resultados finales
  
    recognition.onstart = () => {                                                // Evento que se dispara cuando inicia el reconocimiento
      console.log("[DEBUG] Reconocimiento de voz iniciado.");                    // Mensaje de depuración
      var tiempo_verde = 300;                                                    // Esperamos 300ms antes de poner el micro verde
      setTimeout(function() {                                                    // Esperamos y luego cambiamos a la imagen, que se vea el cambio bien
        micImg.src = "images/microfono-nivel-verde.png";
      }, tiempo_verde);
    };
  
    recognition.onerror = (event) => {                                           // Evento que se dispara si ocurre un error durante el reconocimiento
      console.error("[DEBUG] Error en el reconocimiento de voz:", event.error);  // Muestra el error en consola
      transcriptElement.textContent = "Error al reconocer la voz.";              // Informa al usuario
    };
  
    recognition.onresult = function(event) {

      var textoReconocido = event.results[0][0].transcript.trim();   // Extrae el texto reconocido
      console.log("[DEBUG] Texto reconocido:", textoReconocido);     // Lo muestra en consola
      transcriptElement.textContent = textoReconocido;               // Muestra el texto en pantalla
    
      var tiempoDeEspera = 1200;                                      // Variable para cuanto queremos esperar (1200 milisegundos)
    
      if (textoReconocido.toLowerCase() === "buenos días") {          // Comprobamos si el usuario dice "buenos días"
        sessionStorage.setItem("selectedLanguage", "es");
        setTimeout(function() {                                       // Si es "buenos días", esperamos y luego vamos a language-screen.html
          window.location.href = "language-screen.html";
        }, tiempoDeEspera);
      } else if (textoReconocido === "good morning") {                // Comprobamos si el usuario dice "good morning"
        sessionStorage.setItem("selectedLanguage", "en");             // Establecemos el idioma elegido como inglés
        setTimeout(function() {                                       // Si es "good morning", esperamos y luego vamos a language-screen.html
          window.location.href = "language-screen.html";  
        }, tiempoDeEspera);
      } else {
        setTimeout(function() {                                       // Si es otra cosa, esperamos y luego vamos a error-screen.html
          window.location.href = "error-screen.html";
        }, tiempoDeEspera);
      }
    };    
  
    recognition.onend = () => {                                                  // Evento que se dispara al finalizar el reconocimiento
      console.log("[DEBUG] Reconocimiento de voz finalizado.");                  // Mensaje de depuración
      micImg.src = "images/microfono-nivel.png";
    };
    
    recognition.start();                                                         // Iniciar el reconocimiento una vez cargue la página
  });
  
