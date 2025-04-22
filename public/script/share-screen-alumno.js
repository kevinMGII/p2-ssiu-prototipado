
/* ZONA DE VISUALIZACIÓN DEL PDF DEL PONENTE */

// EVENTO DE SOCKET PARA RENDERIZAR EL PDF, ESTO SE ACTIVA UNA VEZ EL PONENTE TIENE SU PDF CARGADO Y LO COMPARTE
 // Escuchar la respuesta del servidor (la ruta del archivo)
 socket.on('pdfFilePath', (pdfUrl) => {
  console.log('Ruta del archivo PDF:', pdfUrl);

  // Por si acaso
  if (pdfUrl == 'No se encontraron archivos PDF') {
    console.log("No se recibió una URL válida para el PDF. Se reintentará");
    return;
  }

  // LIMPIAR EL CANVAS ANTES DE CARGAR UN NUEVO PDF, NO SOLAPEN
  const canvas = document.getElementById('pdf-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 0;
  canvas.height = 0;

  // Usamos la URL recibida para cargar el PDF
  let pdfDoc = null;
  let currentPage = 1;
  let totalPages = 0;

  // Configuración de PDF.js
  pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
    pdfDoc = pdf;
    totalPages = pdf.numPages;
    document.getElementById('page-count').textContent = totalPages;

    // Renderizar la primera página si no ha habido ningun problema en obtener el PDF de la ruta
    renderPage(currentPage);
  }).catch((error) => {
    console.error('Error al cargar el PDF:', error);
    // Aqui es necesario comprobar errores, por si acaso el ponente CAMBIA EL PDF, antes de que el cliente lo consiga
    return;
  });
  
  // Función para renderizar una página
  function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then((page) => {
      const scale = 2.0;
      const viewport = page.getViewport({ scale: scale });

      const canvas = document.getElementById('pdf-canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      page.render(renderContext).promise.then(() => {
        document.getElementById('page-num').textContent = currentPage;
      });
    });
  }

  const pdfContainer = document.getElementById('pdf-container'); // Contenedor del PDF
  // Manejo del botón "Anterior" (por si acaso)
  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
      pdfContainer.scrollTop = 0; // Reiniciar el desplazamiento al inicio del contenedor
    }
  });

  // Manejo del botón "Siguiente" (por si acaso)
  document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage(currentPage);
      pdfContainer.scrollTop = 0; // Reiniciar el desplazamiento al inicio del contenedor
    }
  });

  // Manejo del evento de pasar diapositivas (izquierda/derecha)

  socket.on('pasar_diapo_pc', (data) => {
    console.log('Cambio de diapositiva recibido:', data.tipo); // Verificar el tipo de cambio
    if (data.tipo === "giro-derecha") {
      if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
        pdfContainer.scrollTop = 0; // Reiniciar el desplazamiento al inicio del contenedor
      }
    } else if (data.tipo === "giro-izquierda") {
      if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        pdfContainer.scrollTop = 0; // Reiniciar el desplazamiento al inicio del contenedor
      }
    }
  });

  // Manejo del evento de desplazamiento (scroll) para el PDF
  socket.on('scroll_pc', (data) => {
    console.log('Deslizamiento recibido:', data.desliz); // Verificar el valor de desliz
    const pdfContainer = document.getElementById('pdf-container'); // Contenedor del PDF
    if (data.desliz === "arriba") {
      pdfContainer.scrollBy(0, 150);  // Mueve el contenedor del PDF 200px hacia arriba
    } else if (data.desliz === "abajo") {
      pdfContainer.scrollBy(0, -150);   // Mueve el contenedor del PDF 200px hacia abajo
    }
  });

});






/* ZONA DE REPRODUCCIÓN DE AUDIO DEL PONENTE */

socket.on("audio-chunk", ( { texto, cs, idioma_p }) => {
  console.log("Texto recibido:", texto); // Verificar el texto recibido
  console.log("CS Ponente recibido:", cs); // Verificar el CS recibido
  if (idioma_p == "es") { // Si el idioma es español, reproducir el texto en español
    leerTexto(texto, "es-ES"); // Leer el texto recibido en español
  }
  else {
    leerTexto(texto, "en-US"); // Leer el texto recibido en ingles
  }
  
});


function leerTexto(text, idioma) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    speech.lang = idioma;

    window.speechSynthesis.speak(speech);
}


/* EVENTO QUE INDICA LA FINALIZACIÓN DE LA SESIÓN PARA EL CLIENTE (Se acaba el timeout) */

socket.on("session-ended", () => {
  alert('La sesión ha terminado');       // Alerta al usuario de que la sesión ha terminado
  window.location.replace('index.html'); // Redirige a la página de inicio
});