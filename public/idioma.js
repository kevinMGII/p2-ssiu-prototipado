// |--------------------------------------------------------------------|
// | Este script se encarga de reproducir el mensaje de voz             |
// | "Has escogido el idioma: Español" cuando se carga la pantalla de   |
// | selección de idioma.                                               |
// |--------------------------------------------------------------------|

document.addEventListener("DOMContentLoaded", () => {  // Ejecutamos cuando el DOM ya se ha cargado del todo

  const utterance = new SpeechSynthesisUtterance("Has escogido el idioma: Español");    // Instancia de SpeechSynthesisUtterance con la frase que va a decir el TTS.
  
  utterance.lang = "es-ES";                                   // Ponemos el idioma de la síntesis de voz a español (de España).
  
  utterance.rate = 1;                                         // Ponemos la velocidad de reproducción del mensaje a 1, la velocidad normal.
  
  utterance.pitch = 1;                                        // Ponemos el tono de reproducción del mensaje a 1, el tono normal.

  window.speechSynthesis.speak(utterance);                    // Reproducimos el mensaje con la API de Speech Synthesis, mandamos el mensaje al método .speak.
});
