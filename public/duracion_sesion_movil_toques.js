document.addEventListener("DOMContentLoaded", () => {
  const indicator = document.getElementById("indicator");
  const minutesDisplay = document.getElementById("minutes");
  const handImage = document.getElementById("handImage");
  const dial = document.querySelector(".dial");
  const trailContainer = document.getElementById("trailContainer");

  let lastAngle = null;
  let rotation = 0;
  let drawnSegments = new Set();

  dial.addEventListener("mousemove", handleMove);
  dial.addEventListener("touchmove", (e) => handleMove(e.touches[0]));

  function handleMove(e) {
    const rect = dial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (lastAngle === null) {
      lastAngle = angle;
      return;
    }

    let delta = angle - lastAngle;

    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    rotation += delta;
    lastAngle = angle;

    const normalizedRotation = (rotation % 360 + 360) % 360;
    const minutes = Math.round(normalizedRotation / 3);
    minutesDisplay.textContent = minutes;

    indicator.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    handImage.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;

    // Dibujar todos los ángulos por los que ha pasado (para evitar saltos)
    let currentAngle = Math.floor((rotation % 360 + 360) % 360);
    let previousAngle = Math.floor((rotation - delta) % 360);
    if (previousAngle < 0) previousAngle += 360;

    let step = delta > 0 ? 1 : -1;
    for (let a = previousAngle; a !== currentAngle; a = (a + step + 360) % 360) {
      if (!drawnSegments.has(a)) {
        drawSegment(a);
        drawnSegments.add(a);
      }
    }

    // Limpiar cuando vuelve a 0 minutos
    if (minutes === 0 && drawnSegments.size > 0) {
      drawnSegments.clear();
      trailContainer.innerHTML = "";
    }
  }

  function drawSegment(angle) {
	  const segment = document.createElement("div");
	  segment.classList.add("trail-segment");
	  segment.style.transform = `rotate(${angle}deg) translateY(-90px)`; // aquí también
	  trailContainer.appendChild(segment);
  }
});
