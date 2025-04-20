function getNewRoom(){
    // Si ya tienen código, no pedir
    let room = localStorage.getItem("room");
    if (room) {
        console.log("[DEBUG] Recibido código de sala:", room);
        generateQrInvitacion();
    } else {
        if (type == "mobile"){
            socket.emit('new_room', {duracion: localStorage.getItem('duracion'), ponente: cs});
        }
        console.log("[DEBUG] Esperar nuevo código (async)"); 
        socket.on('new_room', (data) => {
            console.log("[DEBUG] Recibido código de sala:", data);
            localStorage.setItem("room", parseInt(data));
            generateQrInvitacion();
        });
    }
}