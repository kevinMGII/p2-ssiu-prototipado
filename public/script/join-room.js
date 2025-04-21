// |----------------------------------------------------------|
// | Este módulo se encarga de:                               |
// | - Unirse a la sala si es el móvil que ha escaneado el QR |
// | - Conseguir el código de sala si es el PC                |
// |----------------------------------------------------------|

function joinRoom() {
    if (type === "pc") {
        console.log("[DEBUG] Esperando a recibir código de sala...", Date.now());
        socket.on('join_room', (room) => {
            console.log("[DEBUG] Recibido código de sala:", room);
            localStorage.setItem('room', room);
        });
    }
    if (type === "mobile" && urlParams.get('room')) {
        console.log("[DEBUG] Recibido código de sala:", urlParams.get('room'));
        setTimeout(() => {
            console.log("[DEBUG] Enviando a PC...", Date.now());
            socket.emit('join_room', {room: urlParams.get('room'), cliente: cs});
        }, 1000);
    }
}