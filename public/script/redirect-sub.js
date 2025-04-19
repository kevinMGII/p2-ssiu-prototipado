// |------------------------------------------------------------|
// | Este módulo se encarga de:                                 |
// | - Redirigir al PC a la siguiente página                    |
// |------------------------------------------------------------|

function changeToSub() {
    socket.emit ("change-html", { cs: cs, html: "subtitulos.html" });
}