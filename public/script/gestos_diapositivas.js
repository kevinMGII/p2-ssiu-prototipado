/* DETECTAR GESTOS DE DESLIZAR HACIA ARRIBA/ABAJO = MOVER SCROLL VERTICAL */
let touchStartY = 0;
let touchEndY = 0;

// Detectamos el inicio del toque
document.addEventListener('touchstart', (e) => {
  touchStartY = e.changedTouches[0].screenY;
});

// Detectamos el final del toque
document.addEventListener('touchend', (e) => {
  touchEndY = e.changedTouches[0].screenY;
  handleVerticalSwipeGesture(); // Llamamos a la función para manejar el gesto vertical
});

// Función para manejar el gesto de deslizamiento vertical
function handleVerticalSwipeGesture() {
  if (touchEndY < touchStartY) {
    // Deslizó hacia arriba (swipe up), hacer scroll hacia abajo
    console.log('Deslizó hacia arriba');
    socket.emit('scroll_diapo', { desliz: "arriba", cs: cs });
    // window.scrollBy(0, 200);  // Mueve la página 200px hacia abajo (ajusta este valor como quieras)
  } else if (touchEndY > touchStartY) {
    // Deslizó hacia abajo (swipe down)
    console.log('Deslizó hacia abajo');
    socket.emit('scroll_diapo', { desliz: "abajo", cs: cs });
    // window.scrollBy(0, -200);  // Mueve la página 200px hacia arriba (ajusta este valor como quieras)
  }
}

/* DETECTAR GESTOS DE DESLIZAR HACIA LA IZQUIERDA = CAMBIAR OPCIONES PONENTE (AKA SUBIR NUEVO ARCHIVO PDF VAMOS) */

let touchStartX = 0;
let touchEndX = 0;

// Detectamos el inicio del toque para el deslizamiento horizontal
document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

// Detectamos el final del toque para el deslizamiento horizontal
document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleHorizontalSwipeGesture(); // Llamamos a la función para manejar el gesto horizontal
});

// Función para manejar el gesto de deslizamiento horizontal
function handleHorizontalSwipeGesture() {
    const threshold = 100; // Umbral de desplazamiento mínimo para considerar el gesto, no sea tan sensible
    if (touchEndX < touchStartX - threshold) { // Aumenta la diferencia para que el gesto sea menos sensible
      // Deslizó hacia la izquierda (swipe left), hacer scroll a la izquierda
      console.log('Deslizó hacia la izquierda');
      socket.emit('scroll_diapo', { desliz: "izquierda", cs: cs });
      // pdfContainer.scrollBy(-150, 0);  // Mueve el contenedor 150px hacia la izquierda
    }
}

/* DETECTAR GESTOS DE MOVIMIENTO DEL PONENTE (Giro de dispositivo para pasar de diapositiva) */

let ultimo_gesto = 0;  // Variable para controlar el tiempo del último gesto (para evitar repetición)
const cooldown = 1500; // 1.5 segundos de cooldown para evitar múltiples gestos rápidamente

window.addEventListener("deviceorientation", function(event) { 
    var gamma = event.gamma; // Extrae la inclinación lateral del dispositivo

    // Obtener el tiempo actual
    const currentTime = Date.now();

    // Verificamos si ha pasado el tiempo suficiente para un nuevo gesto
    if (currentTime - ultimo_gesto >= cooldown) {
        // Si ha pasado el tiempo, actualizamos el tiempo del último gesto
        ultimo_gesto = currentTime;

        if (gamma > 15) { // Si el valor gamma es mayor a 30, interpretamos que se ha girado a la derecha
            const cs = localStorage.getItem('session'); // Obtener el código de sesión
            console.log("[DEBUG] Gesto detectado: pasar diapo a la derecha");
            socket.emit("pasar_diapo", { tipo: "giro-derecha", cs: cs });
        }
        else if (gamma < -15) {  // Si gamma es menor a -30, se interpreta como un giro a la izquierda
            const cs = localStorage.getItem('session'); // Obtener el código de sesión
            console.log("[DEBUG] Gesto detectado: pasar diapo a la izquierda");
            socket.emit("pasar_diapo", { tipo: "giro-izquierda", cs: cs });
        }
    }
});

socket.on("actualizarInterfaz", function(ruta) { // Escuchar el evento "actualizarInterfaz"
    console.log("[DEBUG] Recibido actualizarInterfaz:", ruta);
    window.location.href = ruta; // Redirige la página a la ruta recibida desde el servidor
}); 
