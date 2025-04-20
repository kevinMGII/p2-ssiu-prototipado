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

socket.on("actualizarInterfaz", function(ruta) { // Escuchar el evento "actualizarInterfaz"
  console.log("[DEBUG] Recibido actualizarInterfaz:", ruta);
  window.location.href = ruta; // Redirige la página a la ruta recibida desde el servidor
});



/* ZONA DE SCREEN RECORDING */
const cs_ponente = localStorage.getItem("session"); // ID de sesión

const peerConnections = {}; // Si algún día quieres varios PC por cliente

async function startScreenShare() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true
  });

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  // Añadir todos los tracks (pantalla + audio)
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
  console.log(stream.getTracks());

  // Enviar ICE candidates al servidor
  pc.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("webrtc-ice", {
        cs: cs_ponente,
        candidate: event.candidate
      });
    }
  };

  // Crear offer
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // Enviar offer al servidor (este la reenviará a cada cliente)
  socket.emit("webrtc-offer", {
    cs: cs_ponente,
    offer: offer
  });

  // Buffer para almacenar ICE candidates que llegan antes de setRemoteDescription()
  const pendingCandidates = [];

  // Recibir answer de los clientes
  socket.on("webrtc-answer", ({ from, answer }) => {
    console.log("[PONENTE] Recibida answer de", from);
    pc.setRemoteDescription(new RTCSessionDescription(answer)).then(() => {
      // Añadir candidatos acumulados
      pendingCandidates.forEach(candidate => pc.addIceCandidate(candidate));
      pendingCandidates.length = 0;
    });
  });

  // Recibir ICE de los clientes
  socket.on("webrtc-ice", ({ from, candidate }) => {
    console.log("[PONENTE] Recibido ICE de", from);
    const iceCandidate = new RTCIceCandidate(candidate);

    // Si ya hay remoteDescription, añadimos directamente
    if (pc.remoteDescription && pc.remoteDescription.type) {
      pc.addIceCandidate(iceCandidate);
    } else {
      // Si no, almacenamos para más tarde
      pendingCandidates.push(iceCandidate);
    }
  });
}

// Iniciar al cargar
startScreenShare().catch(console.error);
