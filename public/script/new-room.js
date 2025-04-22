// |-------------------------------------------------|
// | Este módulo se encarga de:                      |
// | - Conseguir sala para presentaciones            |
// |-------------------------------------------------|

function getNewRoom() {
    if (type == "mobile") {
      setTimeout(() => {
        socket.emit('new_room', {
          duracion: localStorage.getItem('duracion'),
          ponente: cs,
          old_room: localStorage.getItem("room")
        });
      }, 1000); // Espera 1 segundo (1000 ms)
    }
  
    console.log("[DEBUG] Esperar nuevo código (con setTimeout)");
  
    socket.on('new_room', (data) => {
      console.log("[DEBUG] Recibido código de sala:", data);
      localStorage.setItem("room", parseInt(data));
      generateQrInvitacion();
    });
}
  