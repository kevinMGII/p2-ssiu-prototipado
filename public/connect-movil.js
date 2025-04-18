// |------------------------------------------------------------|
// | Este módulo se encarga de:                                 |
// | - Detectar que el móvil se ha conectado                    |
// | - Enviar mensaje a PC diciendo que pase a siguiente página |
// |------------------------------------------------------------|

function connectMovil() {
    socket.emit ("change-html", { cs: cs, html: "menu_principal.html" });
}