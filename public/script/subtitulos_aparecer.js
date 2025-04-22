const textArea = document.getElementById('contenido');

socket.on("subtitulos-chunk", ({ texto, cs, origin, dest }) => {
  console.log("Texto recibido:", texto);
  console.log("CS Ponente recibido:", cs);
  //alert(`OR: ${origin} DT: ${dest}, texto recibido: ${texto}`);
  traducirYMostrar(texto, origin, dest);
});

async function traducirYMostrar(textoOriginal, origin, dest) {
  if (origin == dest) { // La API no traducirá si el idioma de origen y destino son iguales
    textArea.innerHTML += `${textoOriginal}<br><br>`;
  }
  else {
    try {
      // Normaliza a códigos válidos para MyMemory (2 letras)
      origin = origin.slice(0, 2).toLowerCase(); // Controlar no llegen espacios ni nada por el estilo
      dest = dest.slice(0, 2).toLowerCase(); // Controlar no llegen espacios ni nada por el estilo
      
      // API de 1000 caracteres al dia en teoria
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textoOriginal)}&langpair=${dest}|${origin}`);
      const data = await res.json();

      const textoTraducido = data.responseData.translatedText;

      textArea.innerHTML += `${textoTraducido}<br><br>`;
    } catch (error) {
      console.error("Error al traducir:", error);
      //alert("Error al traducir: " + error.message);
      textArea.innerHTML += `${textoOriginal}<br><br>`;
    }
  }
}
