

/* DETECTAR GESTOS DE DESLIZAR HACIA ARRIBA/ABAJO = MOVER SCROLL */

let touchStartY = 0;
let touchEndY = 0;

// Detectamos el inicio del toque
document.addEventListener('touchstart', (e) => {
  touchStartY = e.changedTouches[0].screenY;
});

// Detectamos el final del toque
document.addEventListener('touchend', (e) => {
  touchEndY = e.changedTouches[0].screenY;
  handleSwipeGesture();
});

// Función para manejar el gesto de deslizamiento
function handleSwipeGesture() {
  if (touchEndY < touchStartY) {
    // Deslizó hacia arriba (swipe up), hacer scroll hacia abajo
    console.log('Deslizó hacia arriba');
    socket.emit('scroll_diapo', { desliz: "arriba", cs: cs});
    //window.scrollBy(0, 200);  // Mueve la página 200px hacia abajo (ajusta este valor como quieras)
  } else if (touchEndY > touchStartY) {
    // Deslizó hacia abajo (swipe down), puedes agregar una acción aquí si lo deseas
    console.log('Deslizó hacia abajo');
    socket.emit('scroll_diapo', { desliz: "abajo", cs: cs });
    //window.scrollBy(0, -200);  // Mueve la página 200px hacia abajo (ajusta este valor como quieras)
  }
}

/* Detectar gestos de Mover diapo. izq y derecha */

let ultimo_gesto = 0;  // Variable para controlar el tiempo del último gesto (es que si no se hace cooldown, se detecta el gesto varias veces)
const cooldown = 1500; // 1.5 segundo de cooldown

window.addEventListener("deviceorientation", function(event) { 
    var gamma = event.gamma; // Extrae la inclinación lateral del dispositivo

    // Obtenemos el tiempo actual
    const currentTime = Date.now();

    // Verificamos si ha pasado el tiempo suficiente (cooldown)
    if (currentTime - ultimo_gesto >= cooldown) {
        // Si el tiempo ha pasado, actualizamos el tiempo del último gesto
        ultimo_gesto = currentTime;

        if (gamma > 30) { // Si el valor gamma es mayor a 45, interpretamos que se ha girado a la derecha
            const cs = localStorage.getItem('session'); // Obtener el código de sesión
            console.log("[DEBUG] Gesto detectado: pasar diapo a la derecha");
            socket.emit("pasar_diapo", { tipo: "giro-derecha", cs: cs });
        }
        else if (gamma < -30) {  // Si gamma es menor a -45, se interpreta como un giro a la izquierda
            const cs = localStorage.getItem('session'); // Obtener el código de sesión
            console.log("[DEBUG] Gesto detectado: pasar diapo a la izquierda");
            socket.emit("pasar_diapo", { tipo: "giro-izquierda", cs: cs });
        }
    }
});

