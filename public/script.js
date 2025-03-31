// Conectar al servidor HTTPS
const socket = io({
  secure: true // Forzar conexión segura
});

socket.on('connect', () => {
  document.getElementById('status').textContent = "Conexión segura establecida correctamente.";
  document.getElementById('status').style.color = "green";
});

socket.on('disconnect', () => {
  document.getElementById('status').textContent = "Desconectado del servidor.";
  document.getElementById('status').style.color = "red";
});
