// |-------------------------------------------------|
// | Este módulo se encarga de:                      |
// | - Conseguir sala para presentaciones            |
// |-------------------------------------------------|

function getNewRoom(){
    if (type == "mobile"){
        socket.emit('new_room', {duracion: localStorage.getItem('duracion'), ponente: cs, old_room: localStorage.getItem("room")});
    }
    console.log("[DEBUG] Esperar nuevo código (async)"); 
    socket.on('new_room', (data) => {
        console.log("[DEBUG] Recibido código de sala:", data);
        localStorage.setItem("room", parseInt(data));
        generateQrInvitacion();
    });
}