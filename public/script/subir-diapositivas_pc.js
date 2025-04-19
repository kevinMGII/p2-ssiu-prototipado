
// para cambiar la interfaz, a otra pagina
socket.on('actualizarInterfaz', ruta => {
    console.log('[PC] actualizarInterfaz →', ruta);
    window.location.href = ruta;
  });