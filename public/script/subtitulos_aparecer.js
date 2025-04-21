
// Consigo lugar donde apareceran los subtitulos
const textArea = document.getElementById('contenido');

socket.on("subtitulos-chunk", ( { texto, cs }) => {
    console.log("Texto recibido:", texto); // Verificar el texto recibido
    console.log("CS Ponente recibido:", cs); // Verificar el CS recibido
    add_subtitulos(texto); // Leer el texto recibido
  });


function add_subtitulos(text) {    
    // Añadir subtitulos al area de texto
    textArea.innerHTML += `${text}<br>`;
}


/* Socket que solicita al servidor que idioma se habla en la presentación. Es decir, idioma del ponente */
// Da un poco igual que sea asincrono, mientras llegue a la reunion, pues chill
