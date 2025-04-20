// |-------------------------------------------------|
// | Este módulo se encarga de:                      |
// | - Crear la sala para realizar la presentación   |
// | - Generar el código QR para ususarios           |
// |   que quieran unirse a la sesión                |
// |-------------------------------------------------|

function generateQrInvitacion (){
    setTimeout(() => {
        socket.emit("ip");
        console.log("[SOCKET.IO] IP local solicitada al servidor.");
    } , 1000); // Esperar 1 segundo antes de solicitar la IP local
    
    let room = localStorage.getItem("room");

    if (room){
        socket.on("ip", (ip) => {                                           // Al recibir la IP local del servidor:
            console.log("[SOCKET.IO] IP local recibida:", ip);
            document.getElementsByClassName("loader")[0].style.display = "none";
            const qrCodeContainer = document.getElementById("qr-code");     // Obtenemos el contenedor del código QR.
            const qrCode = new QRCode(qrCodeContainer, {                    // Generamos el código QR con la dirección IP y el puerto 3000.
                text: `https://${ip}:3000/eleccion-subtitulos-movil.html?room=${room}`,
                width: 250,
                height: 250,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H,
            });
            document.getElementById("qr-code").style.display = "flex";
        });
    }
}