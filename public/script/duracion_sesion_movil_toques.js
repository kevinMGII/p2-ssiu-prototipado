// La rotación de la imagen del reloj iniciará al cargarse el DOM

let continuar = false;
var minutes = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Consigo del html el indicator (manecilla invisible del reloj), numero de minutos que actualiza, la mano del reloj y el "contenedor" de los segmentos.
  // El dial es donde se encuentra el reloj, y el trailContainer basicamente. Útil para leer ahi los movimientos del dedo.
  const indicador = document.getElementById("indicator");
  const minutos = document.getElementById("minutes");
  const handImage = document.getElementById("handImage");
  const dial = document.querySelector(".dial");
  const trailContainer = document.getElementById("trailContainer");

  // Variables necesarias para la rotación y el seguimiento de segmentos dibujados
  let ultimo_angulo = null; // Ultimo angulo pillado en la rotación
  let rotation = 0; // Mantiene el total de grados "rotados" en el reloj
  let segmentos_dibujados = new Set(); // Objeto para poder guardar los segmentos dibujados (en base a un ángulo) y evitar dibujar los mismos dos veces.
  // Set es una especie como de lista, pero que no permite duplicados. Es decir, si añades un elemento que ya existe, no lo añade. Por eso es útil para evitar dibujar el mismo segmento dos veces.

  // Evento que se activa si alguien toca el dial con el dedo
  // el e.touches[0] es para acceder al primer toque detectado en la pantalla (para evitar detectar varios toques a la vez en la pantalla)
  dial.addEventListener("mousemove", handleMove);
  dial.addEventListener("touchmove", (e) => handleMove(e.touches[0]));

  // Función que maneja el movimiento del dedo en el dial
  function handleMove(e) {
    // Obtengo las coordenadas (generales) del rectuangulo del dial (dial es un rectangulo)
    const rect = dial.getBoundingClientRect();
    // cx e cy son el centro del rectángulo/centro del reloj. Lo cual necesitamos para calcular el desplazamiento, y por tanto el ángulo de movimiento
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Esto nos da la diferencia entre el centro del reloj y el punto donde se ha tocado la pantalla. Es decir, vemos el desplazamiento del dedo respecto al centro del reloj.
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    // Ahora calculamos el ángulo en grados usando la función atan2, que devuelve el ángulo entre el eje X y el vector de desplazamiento (dx, dy).
    // El 180/Math.PI es para convertir de radianes a grados, y el +90 es para que el 0º esté en la parte superior del reloj (12 en punto).
    let angulo = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angulo < 0) angulo += 360; // Hacer su equivalente en el rango [0, 360] para manejar el ángulo correctamente.
    
    // ultimo_angulo es usado para almacenar el ángulo anterior. Si es la primera vez que se calcula, se establece como el valor actual y se termina todo
    // Esto lo necesitamos para reiniciar los angulos
    if (ultimo_angulo === null) {
      ultimo_angulo = angulo;
      return;
    }

    // delta lo necesitamos para calcular el cambio de ángulo entre el último ángulo y el actual. 
    // Esto es necesario para evitar grandes saltos en la rotación, y perdamos el control de la rotación del reloj por más de 360 grados o menos de 0 grados
    // En resumen, mide el cambio de ángulo entre el último ángulo y el actual, ya sea un cambio positivo o negativo.
    let delta = angulo - ultimo_angulo;

    // Ajustamos el delta para que esté en el rango [-180, 180] para evitar saltos grandes en la rotación (no se descontrole).
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    // Rotation se suma el delta (pues suma los angulos que ha recorrido el reloj), y actualizo el ultimo angulo
    rotation += delta;
    ultimo_angulo = angulo;

    // Ajustamos la rotacion para que siempre esté en el rango [0, 360] y calculamos los minutos (como son 120 minutos, cada 3 grados es un minuto)
    const normalizedRotation = (rotation % 360 + 360) % 360;
    minutes = Math.round(normalizedRotation / 3);
    minutos.textContent = minutes; // Lo actualizo en el HTML

    // Actualizo la posición y rotación del indicador y la imagen de la mano
    indicador.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    handImage.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;

    // Dibujar todos los ángulos por los que ha pasado (para evitar saltos)
    let currentAngle = Math.floor((rotation % 360 + 360) % 360); // Consigo angulo actual en el rango [0, 360]
    let previousAngle = Math.floor((rotation - delta) % 360); // Consigo el angulo anterior en el rango [0, 360] (aunque es algo redundante este calculo, ya que lo tengo en la variable angulo de antes)
    if (previousAngle < 0) previousAngle += 360; // Ajusto el previo si es negativo
    
    // Calculo el paso (step) para recorrer los ángulos entre el ángulo anterior y el actual. Si delta es positivo, el paso es 1 (avanzar en sentido horario), si es negativo, el paso es -1 (retroceder en sentido antihorario).
    let step = delta > 0 ? 1 : -1;
    // Este bucle recorre todos los ángulos entre el previousAngle (el ángulo previo) y el currentAngle (el ángulo actual) y dibuja un segmento en cada ángulo por el que pasa la rotación.
    // Se mueve de 1 en 1 dibujando cada angulo. Si ambos angulos son iguales, no hace nada, pues no hay movimiento. Lo ajustamos entre [0, 360] para evitar problemas de rotación, y cuando se pase de 360, se reinicia a 0.
    for (let a = previousAngle; a !== currentAngle; a = (a + step + 360) % 360) {
      // Si el ángulo no está en el conjunto de segmentos dibujados, lo dibuja y lo añade al conjunto.
      if (!segmentos_dibujados.has(a)) {
        dibujar_segmento(a);
        segmentos_dibujados.add(a);
      }
    }

    // Limpiar cuando vuelve a 0 minutos, ya que resetamos el reloj
    if (minutes === 0 && segmentos_dibujados.size > 0) {
      segmentos_dibujados.clear();
      trailContainer.innerHTML = ""; // Lo actualizo en el html tambien
    }
    // Esto para permitir usar el boton de "continuar" cuando el reloj no llega a 0 minutos, pues no tendria mucho sentido.
    if (minutes == 0) {
      continuar = false;
    }
    else {
      continuar = true;
    }
  }

  // Función para dibujar un segmento en el contenedor de la estela (trailContainer) en un ángulo específico
  function dibujar_segmento(angulo) {
	  const segment = document.createElement("div");
	  segment.classList.add("trail-segment");
	  segment.style.transform = `rotate(${angulo}deg) translateY(-90px)`; // Coloca el segmento en la posición correcta (90px es la distancia desde el centro del reloj hasta el borde del dial)
	  trailContainer.appendChild(segment);
  }
});


/*XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX*/

/* |---------------------------------------------------------------------|
   | Este módulo se encarga de:                                          |
   | - Inicializar la conexión con Socket.IO.                            |
   | - Configurar la detección de gestos de giro (deviceorientation)     |
   |   condicionado para emitir eventos hacia el servidor.               |
   | - Escuchar el evento "actualizarInterfaz" para redirigir según la   |
   |   ruta indicada.                                                    |
   |---------------------------------------------------------------------|
 */


function initializeGestoDuracion() {
window.addEventListener("deviceorientation", function(event) { // Detecta cambios en la orientación del dispositivo.
  var currentPath = window.location.pathname; // Examina la ruta actual del documento. Saber adonde redirigir en cada caso.
  var gamma = event.gamma; // Extrae la inclinación lateral del dispositivo
  if (gamma > 45 && continuar == true) { // Si el valor gamma es mayor a 45, interpretamos que se ha girado a la derecha
      localStorage.setItem('duracion') = minutes * 60 * 1000; // guardar la duración establecida en ms

      // Obtengo el cs para saber que dispositivo es el que ha efectuado el gesto.
      const cs = localStorage.getItem('session'); // conseguir código de sesión
      console.log("[DEBUG] Gesto detectado: girar a la derecha");
      // Le mandamos el descriptor por si acaso quire comprobar el socket_id y saber que es él
      socket.emit("gesto", { tipo: "giro-derecha", url: currentPath, cs: cs, socket_des: socket.id });
      // Enviar el evento "giro-derecha" al servidor. Y URL para que sepa a donde redirigir. 
  }
});

  socket.on("actualizarInterfaz", function(ruta) { // Escuchar el evento "actualizarInterfaz"
      console.log("[DEBUG] Recibido actualizarInterfaz:", ruta);
      window.location.href = ruta; // Redirige la página a la ruta recibida desde el servidor
  });
}


// Función que determina si se debe inicializar Socket.IO.
function initSocketForGestosDuracion() {                           // Actualmente se inicializará solo si la ruta actual es "language-screen.html" o "error-screen.html".
  var currentPath = window.location.pathname;                      // Obtenemos la ruta actual del documento.
  // Verificamos si la página es la de duracion_sesion_movil.
  var isDuration = (currentPath.indexOf("duracion_sesion_movil.html") !== -1);

  if (isDuration) {                                                // Si es una de esas páginas:
    initializeGestoDuracion();                                     // Llamamos a la función que inicializa Socket.IO.
  }
}

