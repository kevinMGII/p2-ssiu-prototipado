
// Consigo lugar donde apareceran los subtitulos
const textArea = document.getElementById('contenido');

socket.on("subtitulos-chunk", ( { texto, cs, origin, dest}) => {
    console.log("Texto recibido:", texto); // Verificar el texto recibido
    console.log("CS Ponente recibido:", cs); // Verificar el CS recibido
    alert(`OR: ${origin} DT: ${dest}, texto recibido: ${texto}`); // Verificar el texto recibido
    traducirYMostrar(texto, origin, dest); // Llama a la función de traducción
  });

async function traducirYMostrar(textoOriginal, origin, dest) {
  try {
    const res = await fetch("https://translate.argosopentech.com/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: textoOriginal,
        source: origin,     // ← idioma de origen especificado
        target: dest,    // ← idioma al que quieres traducir
        format: "text"
      })
    });

    const data = await res.json();
    const textoTraducido = data.translatedText;

    // Añadir subtítulo traducido al área de texto
    textArea.innerHTML += `${textoTraducido}<br><br>`;
  } catch (error) { // Sino lo traduce, pues que se imprima el texto original tal cual y ya
    console.error("Error al traducir:", error);
    textArea.innerHTML += `${textoOriginal}<br><br>`;
  }
}


/* Socket que solicita al servidor que idioma se habla en la presentación. Es decir, idioma del ponente */
// Da un poco igual que sea asincrono, mientras llegue a la reunion, pues chill
