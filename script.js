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

  /* 1. Imágenes: si existe la foto, oculta el dibujo de ejemplo */
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

  /* 2. Separar el título en letras */
  var h2 = sec.querySelector(".it-prod__cabecera h2");
  var letras = [];
  if (h2) {
    var etiqueta = Array.prototype.filter.call(h2.childNodes, function (n) { return n.nodeType === 3; })
      .map(function (n) { return n.textContent.trim(); }).join(" ");
    h2.setAttribute("aria-label", etiqueta);

    Array.prototype.slice.call(h2.childNodes).forEach(function (nodo) {
      if (nodo.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      nodo.textContent.split(" ").forEach(function (palabra, i) {
        if (i > 0) frag.appendChild(document.createTextNode(" "));
        var w = document.createElement("span");
        w.className = "it-palabra";
        w.setAttribute("aria-hidden", "true");
        palabra.split("").forEach(function (ch) {
          var l = document.createElement("span");
          l.className = "it-letra";
          l.textContent = ch;
          w.appendChild(l);
          letras.push(l);
        });
        frag.appendChild(w);
      });
      h2.replaceChild(frag, nodo);
    });
  }

  /* 3. Si la persona prefiere menos movimiento, se muestra todo de una vez */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* 4. Lista de elementos que aparecen, en orden */
  var items = [];
  function add(el, dy, card) {
    if (el) items.push({ el: el, dy: dy, card: !!card, top: 0, left: 0 });
  }
  add(sec.querySelector(".it-prod__eyebrow"), 20);
  letras.forEach(function (l) { add(l, 44); });
  add(sec.querySelector(".it-prod__cabecera p"), 20);
  add(sec.querySelector(".it-prod__vertodo"), 20);
  sec.querySelectorAll(".it-tarjeta").forEach(function (t) { add(t, 60, true); });

  var mq = window.matchMedia("(max-width:1000px), (max-height:560px)");

  function clamp(x) { return Math.min(1, Math.max(0, x)); }

  function pintar(it, v) {
    it.el.style.opacity = v;
    it.el.style.transform =
      "translateY(" + ((1 - v) * it.dy).toFixed(1) + "px)" +
      (it.card ? " scale(" + (0.94 + 0.06 * v).toFixed(3) + ")" : "");
    if (it.card) it.el.style.pointerEvents = v < 0.5 ? "none" : "";
  }

  function actualizar() {
    var vh = window.innerHeight;

    if (!mq.matches) {
      /* Escritorio: el avance depende de cuánto se ha deslizado la sección */
      var total = sec.offsetHeight - vh;
      var p = clamp(-sec.getBoundingClientRect().top / total);
      p = clamp(p / 0.20);                 // el último 10% queda completo en pantalla
      var n = items.length - 1, w = 0.30;
      items.forEach(function (it, i) {
        pintar(it, clamp((p - (i / n) * (1 - w)) / w));
      });
    } else {
      /* Pantallas pequeñas: cada elemento aparece al entrar en pantalla */
      var y = window.pageYOffset;
      items.forEach(function (it) {
        var pos = it.top - y;
        var desde = vh * 0.95 + (it.left / window.innerWidth) * vh * 0.08;
        pintar(it, clamp((desde - pos) / (vh * 0.2)));
      });
    }
  }

  function medir() {
    if (mq.matches) {
      items.forEach(function (it) {
        it.el.style.transform = "none";
        var r = it.el.getBoundingClientRect();
        it.top = r.top + window.pageYOffset;
        it.left = r.left;
      });
    }
    actualizar();
  }

  var pendiente = false;
  window.addEventListener("scroll", function () {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () { pendiente = false; actualizar(); });
  }, { passive: true });
  window.addEventListener("resize", medir);
  window.addEventListener("load", medir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);

  medir();
})();
/* ===== FIN SECCIÓN PRODUCTOS ===== */