

socket.on("audio-chunk", ( { texto, cs }) => {
  console.log("Texto recibido:", texto); // Verificar el texto recibido
  console.log("CS Ponente recibido:", cs); // Verificar el CS recibido
  leerTexto(texto); // Leer el texto recibido
});


function leerTexto(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.volume = 1;
    speech.rate = 0.5;
    speech.pitch = 0.4;
    speech.lang = 'es-ES'

    window.speechSynthesis.speak(speech);
}