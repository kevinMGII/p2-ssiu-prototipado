document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("screen-video");
  const playButton = document.getElementById("play-button");

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  let ponenteId = null;
  let receivedStream = null;

  pc.ontrack = (event) => {
    console.log("[CLIENTE] Stream recibido");
    receivedStream = event.streams[0];
    video.srcObject = receivedStream;
  };

  pc.onicecandidate = (event) => {
    if (event.candidate && ponenteId) {
      socket.emit("webrtc-ice", {
        cs: ponenteId,
        candidate: event.candidate
      });
    }
  };

  socket.on("webrtc-offer", async ({ offer, from }) => {
    console.log("[CLIENTE] Recibida oferta del ponente");
    ponenteId = from;

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    console.log("[CLIENTE] Enviando respuesta al ponente", ponenteId);
    socket.emit("webrtc-answer", {
      to: ponenteId,
      answer
    });
  });

  socket.on("webrtc-ice", ({ candidate }) => {
    pc.addIceCandidate(new RTCIceCandidate(candidate));
  });

  // Aquí va el botón
  playButton.addEventListener("click", () => {
    console.log("Botón Play clicado");
    if (receivedStream) {
      video.play().then(() => {
        console.log("[CLIENTE] Reproducción iniciada tras interacción");
        playButton.style.display = "none";
      }).catch((err) => {
        console.error("Error al intentar reproducir el video:", err);
      });
    } else {
      console.warn("[CLIENTE] Aún no se ha recibido ningún stream.");
    }
  });
});
