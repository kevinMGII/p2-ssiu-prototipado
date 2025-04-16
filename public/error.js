// |---------------------------------------------------------------------|
// | Este script se encarga de reproducir el mensaje de voz              |
// | "No se ha detectado el idioma" cuando se carga la pantalla de error.|
// |---------------------------------------------------------------------|

document.addEventListener("DOMContentLoaded", () => {  // Ejecutamos cuando el DOM ya se ha cargado del todo

  const utterance = new SpeechSynthesisUtterance("No se ha detectado el idioma"); // Instancia de SpeechSynthesisUtterance con la frase que va a decir el TTS.
  
  utterance.lang = "es-ES";                                                       // Ponemos el idioma de la síntesis de voz a español (de España).
  
  utterance.rate = 1;                                                             // Ponemos la velocidad de reproducción del mensaje a 1, la velocidad normal.
  
  utterance.pitch = 1;                                                           // Ponemos el tono de reproducción del mensaje a 1, el tono normal.
  
  window.speechSynthesis.speak(utterance);                                       // Reproducimos el mensaje con la API de Speech Synthesis, mandamos el mensaje al .speak
});

