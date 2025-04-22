// |--------------------------------------------------------------------|
// | Este script se encarga de reproducir el mensaje de voz             |
// | "Has escogido el idioma: Español" cuando se carga la pantalla de   |
// | selección de idioma.                                               |
// |--------------------------------------------------------------------|

document.addEventListener("DOMContentLoaded", function() {                              // Esperamos a que el contenido del DOM esté completamente cargado
  var lang = sessionStorage.getItem("selectedLanguage") || "es";                        // Obtenemos el idioma guardado en sessionStorage (si no hay nada, usamos "es" por defecto)
  socket.emit("guardar_language", {idioma: lang, cs: cs});                              // Enviar el idioma ponente al servidor, da igual que se repita, se guardara de nuevo

  var utterText, utterLang, flagSrc, langName, titleText, continueText, repeatText;     // Declaramos las variables que vamos a usar para el contenido dinámico
  if (lang === "en") {                                                                  // Si el idioma es inglés, cargamos textos e imágenes en inglés
    utterText    = "You have chosen the language: English";                             // Texto que dirá el TTS
    utterLang    = "en-US";                                                             // Idioma del TTS
    flagSrc      = "images/bandera-ingles.png";                                         // Imagen de bandera inglesa
    langName     = "English";                                                           // Nombre del idioma en pantalla
    titleText    = "You have chosen the language:";                                     // Título de mensaje
    continueText = "Continue";                                                          // Texto del botón continuar
    repeatText   = "Repeat";                                                            // Texto del botón repetir
  } else {                                                                              // Si no es inglés (o es español), cargamos textos e imágenes en español
    utterText    = "Has escogido el idioma: Español";                                   // Texto que dirá el TTS
    utterLang    = "es-ES";                                                             // Idioma del TTS
    flagSrc      = "images/bandera-espana.png";                                         // Imagen de bandera española
    langName     = "Español";                                                           // Nombre del idioma en pantalla
    titleText    = "Has escogido el idioma:";                                           // Título de mensaje
    continueText = "Continuar";                                                         // Texto del botón continuar
    repeatText   = "Repetir";                                                           // Texto del botón repetir
  }

  document.getElementById("flagImage").src = flagSrc;                                   // Cambiamos la imagen de la bandera
  document.getElementById("languageName").textContent = langName;                       // Cambiamos el nombre del idioma mostrado
  document.getElementById("languageTitle").textContent = titleText;                     // Cambiamos el texto del título superior
  document.getElementById("continueText").textContent = continueText;                   // Cambiamos el texto del botón "Continuar"
  document.getElementById("repeatText").textContent = repeatText;                       // Cambiamos el texto del botón "Repetir"

  var utterance = new SpeechSynthesisUtterance(utterText);                              // Creamos el mensaje de voz con el texto correspondiente
  utterance.lang = utterLang;                                                           // Establecemos el idioma del mensaje
  utterance.rate = 1;                                                                   // Velocidad de reproducción normal (1)
  utterance.pitch = 1;                                                                  // Tono de voz normal (1)
  window.speechSynthesis.speak(utterance);                                              // Reproducimos el mensaje por voz
});

