document.addEventListener('DOMContentLoaded', () => {
  let cs_new = localStorage.getItem('session');       // conseguir código de sesión del cliente
  console.log('Valor de cs_new:', cs_new);            // Verificar el valor de 'cs_new
  let path = `uploads/${cs_new}`;                     // Ruta de la carpeta donde se encuentra el PDF (ajustar según cs) 
  console.log('Ruta de la carpeta cliente:', path);   // Imprimir la ruta de la carpeta en la consola
  socket.emit('getPdfFile', { path: path });          // Emitimos una solicitud con la ruta de la carpeta
});

 // Escuchar la respuesta del servidor (la ruta del archivo)
 socket.on('pdfFilePath', (pdfUrl) => {
  console.log('Ruta del archivo PDF:', pdfUrl);

  // Usamos la URL recibida para cargar el PDF
  let pdfDoc = null;
  let currentPage = 1;
  let totalPages = 0;

  // Configuración de PDF.js
  pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
    pdfDoc = pdf;
    totalPages = pdf.numPages;
    document.getElementById('page-count').textContent = totalPages;

    // Renderizar la primera página
    renderPage(currentPage);
  }).catch((error) => {
    console.error('Error al cargar el PDF:', error);
    alert('Error al cargar el PDF. Revisa la consola para más detalles.');
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

  // Manejo del botón "Anterior"
  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
    }
  });

  // Manejo del botón "Siguiente"
  document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage(currentPage);
    }
  });
});