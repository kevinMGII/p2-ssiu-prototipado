// public/script/ponente_opciones.js
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const type = 'mobile';
    const cs = localStorage.getItem('session');
  
    // Asociar esta pestaña móvil a la sesión
    socket.on('connect', () => {
      if (cs) {
        socket.emit('session', { cs, type });
        console.log('[MÓVIL] sesión enviada →', cs);
      } else {
        console.warn('[MÓVIL] No hay session en localStorage');
      }
    });
  
    // Cuando el servidor pide cambio de interfaz, redirigir
    socket.on('actualizarInterfaz', ruta => {
      console.log('[MÓVIL] actualizarInterfaz →', ruta);
      window.location.href = ruta;
    });
  
    // Detectar click en el icono de archivo
    const uploadIcon = document.querySelector('.upload-icon');
    if (!uploadIcon) {
      console.warn('[MÓVIL] No se encontró elemento .upload-icon');
      return;
    }
  
    uploadIcon.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf';
      input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          // reader.result = "data:application/pdf;base64,<...>"
          const b64 = reader.result.split(',')[1];
          console.log('[MÓVIL] enviando upload_slides →', file.name);
          socket.emit('upload_slides', {
            cs,
            file: { name: file.name, content: b64 }
          });
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  });
  
