const socket = io();

// nos metemos como pc
const cs = localStorage.getItem('session');
socket.emit('session', { cs, type: 'pc' });

// para cambiar la interfaz, a otra pagina
socket.on('actualizarInterfaz', ruta => {
  console.log('[PC] actualizarInterfaz →', ruta);
  window.location.href = ruta;
});

// --- Funcionalidad ---- -> Detectamos el click cuando se de al icono del archivo
document.querySelector('.upload-icon').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/pdf';
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result.split(',')[1];
      console.log('[PC] enviando upload_slides', file.name);
      socket.emit('upload_slides', {
        cs,
        file: { name: file.name, content: b64 }
      });
    };
    reader.readAsDataURL(file);
  };
  input.click();
});
