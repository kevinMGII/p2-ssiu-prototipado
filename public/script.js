const socket = io();

socket.on('connect', () => {
  document.getElementById('status').textContent = "Conexión establecida correctamente.";
});

socket.on('disconnect', () => {
  document.getElementById('status').textContent = "Desconectado del servidor.";
});
