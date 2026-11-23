const hero  = document.getElementById('hero');
const scene = document.getElementById('scene');
const stage = document.querySelector('.stage');

// Cambia aquí los datos de cada producto
const productos = {
  pro:  { tag: '// Más vendido', nombre: 'iPhone 18 Pro Max Glaciar', precio: '$1,199', detalle: '256 GB · Colores nuevos · Envío gratis' },
  base: { tag: '// Favorito',    nombre: 'iPhone 18 Pro Max Borgoña',         precio: '$1,299',   detalle: '256 GB · Colores nuevos · Envío gratis' }
};

const lt = document.getElementById('lt');
const ln = document.getElementById('ln');
const lp = document.getElementById('lp');
const ld = document.getElementById('ld');

function mostrar(id) {
  const p = productos[id];
  lt.textContent = p.tag;
  ln.textContent = p.nombre;
  lp.textContent = p.precio;
  ld.textContent = p.detalle;
}

function reset() {
  scene.style.setProperty('--ry', '0deg');
  scene.style.setProperty('--rx', '0deg');
}

// Inclinación 3D: solo cuando el cursor está en la zona de los celulares
function tilt(x, y) {
  const r  = stage.getBoundingClientRect();
  const zl = r.left + r.width * 0.20;   // borde izquierdo de la zona sensible
  const zt = r.top  + r.height * 0.10;  // borde superior de la zona sensible

  if (x < zl || x > r.right || y < zt || y > r.bottom) return reset();

  const nx = (x - zl) / (r.right - zl) - 0.5;
  const ny = (y - zt) / (r.bottom - zt) - 0.5;
  scene.style.setProperty('--ry', (nx * 2) + 'deg');
  scene.style.setProperty('--rx', (-ny * 20) + 'deg');
}

hero.addEventListener('pointermove', e => tilt(e.clientX, e.clientY));
hero.addEventListener('pointerleave', reset);

// Cambia la etiqueta al pasar o tocar cada iPhone
['pro', 'base'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('pointerenter', () => mostrar(id));
  el.addEventListener('click', () => mostrar(id));
});







/* ===== SECCIÓN PRODUCTOS ===== */
(function () {
  var sec = document.querySelector(".it-prod");
  if (!sec) return;

  /* Si existe la foto, oculta el dibujo de ejemplo */
  sec.querySelectorAll(".it-media").forEach(function (media) {
    var img = media.querySelector("img");
    var placeholder = media.querySelector("svg");
    if (!img || !placeholder) return;

    function mostrarImagen() { placeholder.style.display = "none"; }
    function quitarImagen()  { img.remove(); }

    if (img.complete) {
      img.naturalWidth > 0 ? mostrarImagen() : quitarImagen();
    } else {
      img.addEventListener("load", mostrarImagen);
      img.addEventListener("error", quitarImagen);
    }
  });
})();
/* ===== FIN SECCIÓN PRODUCTOS ===== */


/* ===== CUENTA REGRESIVA DE OFERTAS ===== */
(function () {
  var h = document.getElementById("c-h");
  var m = document.getElementById("c-m");
  var s = document.getElementById("c-s");
  if (!h || !m || !s) return;

  var DURACION = 24 * 60 * 60 * 1000;
  var fin = Number(localStorage.getItem("it_oferta_fin")) || 0;
  if (fin < Date.now()) {
    fin = Date.now() + DURACION;
    localStorage.setItem("it_oferta_fin", String(fin));
  }

  function dos(n) { return String(n).padStart(2, "0"); }

  function tic() {
    var resto = fin - Date.now();
    if (resto <= 0) {
      fin = Date.now() + DURACION;
      localStorage.setItem("it_oferta_fin", String(fin));
      resto = DURACION;
    }
    var total = Math.floor(resto / 1000);
    h.textContent = dos(Math.floor(total / 3600));
    m.textContent = dos(Math.floor((total % 3600) / 60));
    s.textContent = dos(total % 60);
  }

  tic();
  setInterval(tic, 1000);
})();
/* ===== FIN CUENTA REGRESIVA ===== */

