
// para cambiar la interfaz, a otra pagina
socket.on('actualizarInterfaz', ruta => {
  console.log('[PC] actualizarInterfaz →', ruta);
  window.location.href = ruta;
});

// --- Funcionalidad ---- -> Detectamos el click cuando se de al icono del archivo
document.querySelector('.upload-icon').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/pdf'; // Esto ya restringe la selección a archivos PDF, pero también validamos el tipo MIME

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    // Validación del tipo MIME para asegurarse de que sea un PDF
    if (file.type !== 'application/pdf') {
      alert('Por favor, selecciona un archivo PDF.');
      return;
    }

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

