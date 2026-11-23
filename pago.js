import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const $ = (s) => document.querySelector(s);
const money = (n) => "$" + n.toLocaleString("en-US");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- Productos (los mismos de tienda.js: id, nombre, precio) ---------- */
const PRODUCTOS = {
  c1: ["iPhone 18 Pro Max Glaciar 256 GB", 1199], c2: ["iPhone 18 Pro Max Borgoña 256 GB", 1299],
  c3: ["iPhone 17 128 GB", 799], c4: ["iPhone Duo 256 GB", 899], c5: ["iPhone 17 Pro Max 256 GB", 899],
  c6: ["iPhone 15 Pro Max 256 GB", 395],
  t1: ['iPad Air 11" 128 GB', 599], t2: ["iPad 10.ª generación", 449], t3: ["Samsung Galaxy Tab S9", 549],
  t4: ['iPad Pro 11" M4 256 GB', 999], t5: ["Xiaomi Pad 6 128 GB", 349], t6: ["Lenovo Tab P12", 399],
  l1: ['MacBook Air 13" M3', 1099], l2: ['Laptop HP 15" Core i5', 649], l3: ["Laptop Dell Inspiron 15", 699],
  l4: ['MacBook Pro 14" M3', 1599], l5: ['Laptop Lenovo IdeaPad 3 15"', 549], l6: ["Laptop ASUS VivoBook 15", 579],
  a1: ["AirPods Pro 2", 249], a2: ["AirPods 4", 179], a3: ["Sony WH-1000XM5", 349], a4: ["AirPods Max", 549],
  a5: ["Samsung Galaxy Buds 3 Pro", 229], a6: ["JBL Tune 770NC", 99],
  r1: ["Apple Watch Series 11", 429], r2: ["Apple Watch SE", 249], r3: ["Samsung Galaxy Watch 7", 299],
  r4: ["Apple Watch Ultra 2", 799], r5: ["Garmin Forerunner 265", 449], r6: ["Xiaomi Smart Band 8", 49],
  ac1: ["Funda MagSafe para iPhone 18 Pro Max", 35], ac2: ["Cargador USB-C 20 W", 25], ac3: ["Cable USB-C 1 m", 20],
  ac4: ["Protector de pantalla templado", 15], ac5: ["Soporte de celular para carro", 18], ac6: ["Power bank 10 000 mAh", 30],
  aa1: ["Estuche para AirPods Pro", 15], aa2: ["Almohadillas de repuesto", 12], aa3: ["Estuche para AirPods 4", 15],
  aa4: ["Cable de audio 3.5 mm", 10], aa5: ["Soporte para audífonos", 22], aa6: ["Adaptador Bluetooth", 20],
  ar1: ["Correa deportiva para reloj", 25], ar2: ["Cargador magnético para reloj", 29], ar3: ["Correa de silicona para Apple Watch", 20],
  ar4: ["Protector de pantalla para reloj", 10], ar5: ["Base de carga para reloj", 18], ar6: ["Funda protectora para reloj", 15]
};

const FOTOS = {
  c1:'imágenes/tienda/img1.png', c2:'imágenes/tienda/img2.png', c3:'imágenes/tienda/img7.png',
  c4:'imágenes/tienda/img8.png', c5:'imágenes/tienda/img9.png', c6:'imágenes/tienda/img10.png',
  t1:'imágenes/tienda/img11.png', t2:'imágenes/tienda/img12.png', t3:'imágenes/tienda/img13.png',
  t4:'imágenes/tienda/img14.png', t5:'imágenes/tienda/img15.png', t6:'imágenes/tienda/img16.png',
  l1:'imágenes/tienda/img3.png', l2:'imágenes/tienda/img4.png', l3:'imágenes/tienda/img17.png',
  l4:'imágenes/tienda/img18.png', l5:'imágenes/tienda/img19.png', l6:'imágenes/tienda/img20.png',
  a1:'imágenes/tienda/img5.png', a2:'imágenes/tienda/img21.png', a3:'imágenes/tienda/img26.png',
  a4:'imágenes/tienda/img23.png', a5:'imágenes/tienda/img24.png', a6:'imágenes/tienda/img25.png',
  r1:'imágenes/tienda/img6.png', r2:'imágenes/tienda/img27.png', r3:'imágenes/tienda/img28.png',
  r4:'imágenes/tienda/img29.png', r5:'imágenes/tienda/img30.png', r6:'imágenes/tienda/img31.png',
  ac1:'imágenes/tienda/imgg1.png', ac2:'imágenes/tienda/imgg2.png', ac3:'imágenes/tienda/imgg3.png',
  ac4:'imágenes/tienda/imgg4.png', ac5:'imágenes/tienda/imgg5.png', ac6:'imágenes/tienda/imgg6.png',
  aa1:'imágenes/tienda/imgg7.png', aa2:'imágenes/tienda/imgg8.png', aa3:'imágenes/tienda/imgg9.png',
  aa4:'imágenes/tienda/imgg10.png', aa5:'imágenes/tienda/imgg11.png', aa6:'imágenes/tienda/imgg12.png',
  ar1:'imágenes/tienda/imgg13.png', ar2:'imágenes/tienda/imgg14.png', ar3:'imágenes/tienda/imgg15.png',
  ar4:'imágenes/tienda/imgg16.png', ar5:'imágenes/tienda/imgg17.png', ar6:'imágenes/tienda/imgg18.png'
};

/* ---------- Carrito: se arma cuando Firebase confirma quién es el usuario ---------- */
let cart = {};
let claveCarrito = null;
let items = [];
let total = 0;

function armarPedido(uid) {
  claveCarrito = "it_cart_" + uid;
  try { cart = JSON.parse(localStorage.getItem(claveCarrito)) || {}; } catch { cart = {}; }

  items = Object.keys(cart).filter((id) => PRODUCTOS[id]).map((id) => ({
    id, nombre: PRODUCTOS[id][0], precio: PRODUCTOS[id][1], cant: cart[id], importe: PRODUCTOS[id][1] * cart[id],
    imagen: FOTOS[id] || ""
  }));
  total = items.reduce((s, i) => s + i.importe, 0);

  // Sin productos en el carrito de este usuario, vuelve a la tienda
  if (!items.length) { window.location.href = "tienda.html"; return false; }

  /* ---------- Resumen del pedido ---------- */
  $("#r-items").innerHTML = items.map((i) =>
    `<li><span class="th">🛍️</span><div>${esc(i.nombre)}<small>Cant. ${i.cant}</small></div><b>${money(i.importe)}</b></li>`
  ).join("");
  $("#r-sub").textContent = money(total);
  $("#r-total").textContent = money(total);
  return true;
}

/* ---------- Datos del cliente (desde Firestore) ---------- */
let cliente = { uid: "", correo: "", nombre: "", cedula: "", direccion: "" };

function textoDireccion(d) {
  const vivienda = d.tipoVivienda === "apartamento"
    ? `Apto. ${d.numeroApartamento}${d.piso ? ", piso " + d.piso : ""}${d.edificio ? ", " + d.edificio : ""}`
    : `Casa ${d.numeroCasa}`;
  return `${d.calle}, ${vivienda}, ${d.sector}, ${d.ciudad} (${d.codigoPostal})`;
}

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) { window.location.href = "login.html"; return; }

  // Primero el carrito de ESTE usuario. Si está vacío, se va a la tienda.
  if (!armarPedido(usuario.uid)) return;

  try {
    const snap = await getDoc(doc(db, "usuarios", usuario.uid));
    const datos = snap.exists() ? snap.data() : {};

    // Sin dirección guardada, primero va al formulario de envío
    if (!datos.direccionCompleta || !datos.direccion) { window.location.href = "envio.html"; return; }

    const d = datos.direccion;
    cliente = { uid: usuario.uid, correo: usuario.email, nombre: d.nombreCompleto, cedula: d.cedula, direccion: textoDireccion(d) };
    $("#r-dir").textContent = "Envío a: " + cliente.direccion;
    $("#titular").value = (d.nombreCompleto || "").toUpperCase();
    $("#t-nom").textContent = $("#titular").value || "NOMBRE APELLIDO";
  } catch (e) {
    $("#r-dir").textContent = "No pudimos cargar tu dirección. Recarga la página.";
  }
});

/* ---------- Elegir método de pago ---------- */
let metodo = "tarjeta";

$("#metodos").addEventListener("click", (e) => {
  const b = e.target.closest("[data-metodo]");
  if (!b) return;
  metodo = b.dataset.metodo;
  document.querySelectorAll(".metodo").forEach((m) => m.classList.toggle("on", m === b));
  $("#f-tarjeta").classList.toggle("oculto", metodo !== "tarjeta");
  $("#f-electronico").classList.toggle("oculto", metodo !== "electronico");
  $("#f-transferencia").classList.toggle("oculto", metodo !== "transferencia");
});

/* ---------- DETECTOR DE BANCO (simulado, por los primeros dígitos) ----------
   Son prefijos INVENTADOS para el proyecto, no los reales de cada banco.
   Se revisan de más largo a más corto. Para cambiar uno, edita su prefijo aquí.
*/
const BANCOS = [
  // [prefijo, clave (color en el CSS), nombre]
  ["1000", "popular",     "Banco Popular Dominicano"],
  ["1100", "bhd",         "Banco BHD"],
  ["1200", "banreservas", "Banreservas"],
  ["1300", "scotiabank",  "Scotiabank"],
  ["1400", "santacruz",   "Banco Santa Cruz"],
  ["1500", "promerica",   "Banco Promerica"],
  ["1600", "caribe",      "Banco Caribe"],
  ["1700", "progreso",    "Banco del Progreso"],
  ["1800", "lafise",      "Banco Lafise"],
  ["1900", "vimenca",     "Banco Vimenca"],
  ["2000", "bdi",         "Banco BDI"],
  ["2100", "lopezdeharo", "Banco López de Haro"],
  ["2200", "banesco",     "Banesco"],
  ["2300", "ademi",       "Banco Ademi"],
  ["2400", "jmmb",        "JMMB Bank"],
  ["2500", "qik",         "Qik Banco Digital"]
];
// Tarjetas internacionales: por el primer dígito (4 Visa, 5 Mastercard, 3 Amex)
const INTERNACIONALES = [
  ["4", "visa", "Visa"],
  ["5", "mastercard", "Mastercard"],
  ["3", "amex", "American Express"]
];

function detectar(num) {
  for (const [pref, clave, nombre] of BANCOS) {
    if (num.startsWith(pref)) return { clave, nombre, esBanco: true };
  }
  for (const [pref, clave, nombre] of INTERNACIONALES) {
    if (num.startsWith(pref)) return { clave, nombre, esBanco: false };
  }
  return null;
}

function actualizarTarjeta() {
  const num = $("#numero").value.replace(/\s/g, "");
  const r = detectar(num);
  const t = $("#tarjeta");
  const aviso = $("#detectado");

  if (r) {
    t.dataset.banco = r.clave;
    $("#t-banco").textContent = r.nombre;
    $("#t-marca").textContent = r.esBanco ? "" : r.nombre.toUpperCase();
    aviso.textContent = r.esBanco ? "Tarjeta detectada: " + r.nombre : "Tarjeta internacional: " + r.nombre;
    aviso.classList.add("ok");
  } else {
    t.dataset.banco = "generica";
    $("#t-banco").textContent = "Tu tarjeta";
    $("#t-marca").textContent = "";
    aviso.textContent = num.length >= 4 ? "No reconocemos este banco, pero puedes pagar igual." : "Escribe el número y detectamos tu banco.";
    aviso.classList.remove("ok");
  }
}

// Número: solo dígitos, en grupos de 4
$("#numero").addEventListener("input", (e) => {
  const d = e.target.value.replace(/\D/g, "").slice(0, 16);
  e.target.value = d.replace(/(.{4})/g, "$1 ").trim();
  $("#t-num").textContent = (d + "•".repeat(16)).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  actualizarTarjeta();
});

$("#titular").addEventListener("input", (e) => {
  $("#t-nom").textContent = e.target.value.toUpperCase() || "NOMBRE APELLIDO";
});

// Vencimiento: MM/AA
$("#venc").addEventListener("input", (e) => {
  let d = e.target.value.replace(/\D/g, "").slice(0, 4);
  if (d.length > 2) d = d.slice(0, 2) + "/" + d.slice(2);
  e.target.value = d;
  $("#t-venc").textContent = d || "MM/AA";
});

$("#cvv").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, ""); });

/* ---------- Validar la tarjeta (simulacro) ---------- */
function validarTarjeta() {
  const num = $("#numero").value.replace(/\s/g, "");
  if (num.length !== 16) return "El número de tarjeta debe tener 16 dígitos.";
  if (!$("#titular").value.trim()) return "Escribe el nombre que aparece en la tarjeta.";

  const v = $("#venc").value;
  if (!/^\d{2}\/\d{2}$/.test(v)) return "El vencimiento debe tener el formato MM/AA.";
  const mes = +v.slice(0, 2), anio = 2000 + +v.slice(3);
  if (mes < 1 || mes > 12) return "El mes de vencimiento no es válido.";
  const hoy = new Date();
  if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) return "La tarjeta está vencida.";

  if ($("#cvv").value.length < 3) return "El CVV debe tener 3 o 4 dígitos.";
  return "";
}

/* ---------- Ejecutar el pago (simulado) ---------- */
function textoMetodoTarjeta() {
  const num = $("#numero").value.replace(/\s/g, "");
  const r = detectar(num);
  return `${r ? r.nombre : "Tarjeta"} •••• ${num.slice(-4)}`;
}

function pagar(textoMetodo, boton, textoBoton) {
  boton.disabled = true;
  boton.textContent = "Procesando pago...";
  setTimeout(() => {
    mostrarFactura(textoMetodo);
    boton.disabled = false;
    boton.textContent = textoBoton;
  }, 1800);
}

$("#f-tarjeta").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = validarTarjeta();
  const err = $("#error-t");
  if (msg) { err.textContent = msg; err.hidden = false; return; }
  err.hidden = true;
  pagar(textoMetodoTarjeta(), $("#pagar-t"), "PAGAR");
});

document.querySelectorAll("[data-wallet]").forEach((b) => {
  b.addEventListener("click", () => pagar(b.dataset.wallet, b, b.innerHTML));
});

$("#pagar-tr").addEventListener("click", () => {
  pagar("Transferencia bancaria", $("#pagar-tr"), "YA HICE LA TRANSFERENCIA");
});

/* ---------- Guardar el pedido en Firestore ---------- */
async function guardarPedido(numeroFactura, textoMetodo) {
  try {
    await addDoc(collection(db, "pedidos"), {
      uid: cliente.uid,
      correo: cliente.correo,
      factura: numeroFactura,
      productos: items.map((i) => ({
        nombre: i.nombre,
        precio: i.precio,
        cantidad: i.cant,
        importe: i.importe,
        imagen: i.imagen
      })),
      total: total,
      metodoPago: textoMetodo,
      direccionEnvio: cliente.direccion,
      fecha: serverTimestamp()
    });
  } catch (e) {
    console.error("No se pudo guardar el pedido:", e);
  }
}

/* ---------- Factura ---------- */
function mostrarFactura(textoMetodo) {
  const ahora = new Date();
  const numero = "IT-" + ahora.getFullYear() + "-" + String(Math.floor(Math.random() * 900000) + 100000);

  $("#f-num").textContent = numero;
  guardarPedido(numero, textoMetodo);
  $("#f-fecha").textContent = ahora.toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric" })
    + ", " + ahora.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });
  $("#f-nombre").textContent = cliente.nombre;
  $("#f-cedula").textContent = "Cédula: " + cliente.cedula;
  $("#f-direccion").textContent = cliente.direccion;
  $("#f-metodo").textContent = textoMetodo;

  $("#f-items").innerHTML = items.map((i) =>
    `<tr><td>${esc(i.nombre)}</td><td>${i.cant}</td><td>${money(i.precio)}</td><td>${money(i.importe)}</td></tr>`
  ).join("");
  $("#f-sub").textContent = money(total);
  $("#f-total").textContent = money(total);

  // El pago ya se hizo: se vacía el carrito de este usuario
  if (claveCarrito) localStorage.removeItem(claveCarrito);

  $("#vista-pago").classList.add("oculto");
  $("#vista-factura").classList.remove("oculto");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("#imprimir").addEventListener("click", () => window.print());