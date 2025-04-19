// |-------------------------------------------------------------|
// | Este módulo se encarga de:                                  |
// | - Iniciar el escaner de QRs                                 |
// | - Cuando escanea un código de sesión, redirige a esa página |
// |-------------------------------------------------------------|

/*
function escanerQr() {
    const escaner = new Html5QrcodeScanner(
        "escaner-qr",
        {fps: 10, qrbox: 250}
    );

    escaner.render((decodedText, decodedResult) => {
        alert("QR = " + decodedText + "; " +  decodedResult);
    });
}
*/

function escanerQr() {
    console.log("AQUI");
    const html5QrCode = new Html5Qrcode("escaner-qr");
    console.log("AQUI");

    const onScanSuccess = (decodedText, decodedResult) => {
        // Mostrar el resultado del código QR
        alert("QR = " + decodedText + "; " +  decodedResult);
        if (decodedText.search("idioma-sub.html") != -1) {
            window.location.href = decodedText
        }

        // Detener el escaneo después de un resultado exitoso
        html5QrCode.stop().then(() => {
            console.log("Escaneo detenido.");
        }).catch(err => {
            console.error("Error al detener el escaneo:", err);
        });
    };

    const onScanFailure = (error) => {
        // Manejar errores o intentos fallidos de escaneo
        //console.warn("Error de escaneo:", error);
    };

    // Iniciar el escaneo con la cámara
    Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
            const frontCamera = cameras.find(camera => camera.label.toLowerCase().includes("back"));

            const cameraId = frontCamera.id; // Usar la cámara delantera
            console.log("Usando la cámara trasera:", frontCamera.label);
            html5QrCode.start(
                cameraId,
                {
                    aspectRatio: 1,
                    fps: 10,    // Cuadros por segundo
                    qrbox: 200  // Tamaño del cuadro de escaneo
                },
                onScanSuccess,
                onScanFailure
            ).catch(err => {
                console.error("Error al iniciar el escaneo:", err);
            });
        } else {
            console.error("No se encontraron cámaras.");
        }
    }).catch(err => {
        console.error("Error al obtener cámaras:", err);
    });
}