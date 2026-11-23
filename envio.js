import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Al guardar la dirección, el cliente va directo a pagar.
const DESTINO = "pago.html";


const $ = (s) => document.querySelector(s);
const form = $("#form-envio");
const boton = $("#guardar");
const error = $("#error");
const aviso = $("#aviso");
let uid = null;

// Muestra casa o apartamento según lo que elija el cliente
$("#tipo").addEventListener("change", (e) => {
  const v = e.target.value;
  $("#bloque-casa").classList.toggle("oculto", v !== "casa");
  $("#bloque-apto").classList.toggle("oculto", v !== "apartamento");
  $("#num-casa").required = v === "casa";
  $("#num-apto").required = v === "apartamento";
});

// La cédula: solo números y máximo 11
$("#cedula").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 11);
});
function mostrarError(texto) {
  error.textContent = texto;
  error.hidden = false;
}

// Revisa la sesión y si ya hay dirección guardada
onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }
  uid = usuario.uid;
  try {
    const snap = await getDoc(doc(db, "usuarios", uid));
    const datos = snap.exists() ? snap.data() : {};

    // Si ya registró su dirección, no se la pedimos otra vez
    if (datos.direccionCompleta) {
      window.location.href = DESTINO;
      return;
    }

    // Rellena el nombre con el que se registró
    const nombre = [datos.nombre, datos.apellido].filter(Boolean).join(" ");
    if (nombre) $("#nombre").value = nombre;
  } catch (e) {
    mostrarError("No pudimos cargar tus datos. Recarga la página.");
  }
});

// Guarda la dirección
form.addEventListener("submit", async (e) => {
  e.preventDefault();
   error.hidden = true;
  if (!uid) return;

  if ($("#cedula").value.trim().length !== 11) {
    mostrarError("La cédula debe tener exactamente 11 dígitos.");
    return;
  }

  const tipo = $("#tipo").value;
  const direccion = {
    nombreCompleto: $("#nombre").value.trim(),
    cedula: $("#cedula").value.trim(),
    calle: $("#calle").value.trim(),
    sector: $("#sector").value.trim(),
    tipoVivienda: tipo,
    numeroCasa: tipo === "casa" ? $("#num-casa").value.trim() : "",
    numeroApartamento: tipo === "apartamento" ? $("#num-apto").value.trim() : "",
    piso: tipo === "apartamento" ? $("#piso").value.trim() : "",
    edificio: tipo === "apartamento" ? $("#edificio").value.trim() : "",
    ciudad: $("#ciudad").value.trim(),
    codigoPostal: $("#postal").value.trim(),
    referencia: $("#referencia").value.trim()
  };

  boton.disabled = true;
  boton.textContent = "GUARDANDO...";
  try {
    // merge:true conserva nombre, apellido, teléfono y correo que ya estaban
    await setDoc(
      doc(db, "usuarios", uid),
      { direccion, direccionCompleta: true },
      { merge: true }
    );
    aviso.textContent = "Dirección guardada. Redirigiendo...";
    aviso.hidden = false;
    setTimeout(() => { window.location.href = DESTINO; }, 900);
  } catch (err) {
    mostrarError("No pudimos guardar tu dirección. Intenta de nuevo.");
    boton.disabled = false;
    boton.textContent = "GUARDAR Y CONTINUAR";
  }
});
