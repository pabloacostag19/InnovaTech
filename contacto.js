import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const $ = (s) => document.querySelector(s);
const form = $("#form-contacto");
const boton = $("#enviar");
const error = $("#error");
const aviso = $("#aviso");
let uid = null;

// Si hay sesión, rellena el correo (no obliga a iniciar sesión)
onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;
  uid = usuario.uid;
  if (usuario.email && !$("#correo").value) $("#correo").value = usuario.email;
  if (usuario.displayName && !$("#nombre").value) $("#nombre").value = usuario.displayName;
});

function mostrarError(texto) {
  error.textContent = texto;
  error.hidden = false;
  aviso.hidden = true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  error.hidden = true;

  const nombre = $("#nombre").value.trim();
  const correo = $("#correo").value.trim();
  const asunto = $("#asunto").value;
  const mensaje = $("#mensaje").value.trim();

  if (nombre.length < 2) return mostrarError("Escribe tu nombre.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return mostrarError("Escribe un correo válido.");
  if (!asunto) return mostrarError("Elige un asunto.");
  if (mensaje.length < 10) return mostrarError("El mensaje es muy corto, cuéntanos un poco más.");

  boton.disabled = true;
  boton.textContent = "ENVIANDO...";

  try {
    await addDoc(collection(db, "mensajes"), {
      nombre,
      correo,
      asunto,
      mensaje,
      uid,                       // null si no había sesión
      fecha: serverTimestamp()
    });
    form.reset();
    aviso.textContent = "¡Mensaje enviado! Te respondemos pronto.";
    aviso.hidden = false;
  } catch (err) {
    mostrarError("No pudimos enviar tu mensaje. Intenta de nuevo.");
  }

  boton.disabled = false;
  boton.textContent = "ENVIAR MENSAJE";
});