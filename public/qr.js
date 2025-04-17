// |---------------------------------------------------------------------|
// | Este módulo se encarga de:                                          |
// | - Conseguir la dirección IP local del servidor                      |
// | - Generar el código QR del comienzo para conectar el móvil          |
// |---------------------------------------------------------------------|


function generateQr (){
    setTimeout(() => {
        socket.emit("ip");
        console.log("[SOCKET.IO] IP local solicitada al servidor.");
    } , 1000); // Esperar 1 segundo antes de solicitar la IP local
    
    socket.on("ip", (ip) => {                                           // Al recibir la IP local del servidor:
        console.log("[SOCKET.IO] IP local recibida:", ip);
        document.getElementsByClassName("qr-inicio")[0].style.display = "none";
        const qrCodeContainer = document.getElementById("qr-code");     // Obtenemos el contenedor del código QR.
        const qrCode = new QRCode(qrCodeContainer, {                    // Generamos el código QR con la dirección IP y el puerto 3000.
            text: `https://${ip}:3000/menu_principal_movil.html?cs=${cs}`,
            width: 175,
            height: 175,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
        });
        document.getElementById("qr-code").style.display = "flex";
    });
}
    