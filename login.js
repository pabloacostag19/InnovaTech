import { registrar, iniciarSesion } from "./auth.js";

const formLogin = document.getElementById("form-login");
const formRegistro = document.getElementById("form-registro");
const textoCambio = document.getElementById("texto-cambio");
const textoCambioLogin = document.getElementById("texto-cambio-login");
const titulo = document.querySelector("h1");

// Cambiar a registro
document.getElementById("ir-registro").addEventListener("click", (e) => {
  e.preventDefault();
  formLogin.classList.add("oculto");
  formRegistro.classList.remove("oculto");
  textoCambio.classList.add("oculto");
  textoCambioLogin.classList.remove("oculto");
  titulo.innerHTML = "CREA TU<br>CUENTA";
});

// Cambiar a inicio de sesión
document.getElementById("ir-login").addEventListener("click", (e) => {
  e.preventDefault();
  formRegistro.classList.add("oculto");
  formLogin.classList.remove("oculto");
  textoCambioLogin.classList.add("oculto");
  textoCambio.classList.remove("oculto");
  titulo.innerHTML = "INICIA<br>SESIÓN";
});

// Enviar login
formLogin.addEventListener("submit", (e) => {
  e.preventDefault();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value;
  iniciarSesion(correo, contrasena);
});

// Enviar registro con los cinco datos
formRegistro.addEventListener("submit", (e) => {
  e.preventDefault();
  registrar({
    nombre: document.getElementById("nombre-reg").value.trim(),
    apellido: document.getElementById("apellido-reg").value.trim(),
    telefono: document.getElementById("telefono-reg").value.trim(),
    correo: document.getElementById("correo-reg").value.trim(),
    contrasena: document.getElementById("contrasena-reg").value
  });
});