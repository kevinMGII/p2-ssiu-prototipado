/* |---------------------------------------------------------------------|
   | Este módulo se encarga de:                                          |
   | - Conseguir la dirección IP local del servidor                      |
   | - Generar el código QR del comienzo para conectar el móvil          |
   |---------------------------------------------------------------------|
 */

    const socket = io();
    console.log("[SOCKET.IO] Conectando al servidor de Socket.IO...");

    socket.on("connect", () => {
        console.log("[SOCKET.IO] Conexión establecida con el servidor:", socket.id);
        console.log("[SOCKET.IO] IP local solicitada al servidor.");
        setTimeout(function(){socket.emit("ip");} , 1000); // Esperar 1 segundo antes de solicitar la IP local
        
    });

    socket.on("ip", (ip) => {                                           // Al recibir la IP local del servidor:
        console.log("[SOCKET.IO] IP local recibida:", ip);
        const qrCodeContainer = document.getElementById("qr-code");     // Obtenemos el contenedor del código QR.
        const qrCode = new QRCode(qrCodeContainer, {                    // Generamos el código QR con la dirección IP y el puerto 3000.
            text: `https://${ip}:3000`,
            width: 175,
            height: 175,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
        });
    });