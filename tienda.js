import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const WHATSAPP = '18090000000'; // ← cambia por tu número, con código de país y sin signos

const CATS = [
  ['celulares','Celulares','📱'],['tablets','Tablets','📋'],['laptops','Laptops','💻'],['audifonos','Audífonos','🎧'],
  ['relojes','Relojes','⌚'],['acc-celular','Accesorios para celulares','🔌'],['acc-audifonos','Accesorios para audífonos','🎶'],['acc-reloj','Accesorios para relojes','⏱️']
];
// [id, nombre, categoría, precio, emoji, recomendado(1/0)]  — agrega p.i = 'img/foto.png' para usar una foto real
const P = [
  ['c1','iPhone 18 Pro Max Glaciar 256 GB','celulares',1199,'📱',1],
  ['c2','iPhone 18 Pro Max Borgoña 256 GB','celulares',1299,'📱',1],
  ['c3','iPhone 17 128 GB','celulares',799,'📱',0],
  ['c4','iPhone Duo 256 GB','celulares',899,'📱',0],
  ['c5','iPhone 17 Pro Max 256 GB','celulares',899,'📱',0],
  ['c6','iPhone 15 Pro Max 256 GB','celulares',395,'📱',0],
  ['t1','iPad Air 11" 128 GB','tablets',599,'📋',0],
  ['t2','iPad 10.ª generación','tablets',449,'📋',0],
  ['t3','Samsung Galaxy Tab S9','tablets',549,'📋',0],
  ['t4','iPad Pro 11" M4 256 GB','tablets',999,'📋',0],
  ['t5','Xiaomi Pad 6 128 GB','tablets',349,'📋',0],
  ['t6','Lenovo Tab P12','tablets',399,'📋',0],
  ['l1','MacBook Air 13" M3','laptops',1099,'💻',1],
  ['l2','Laptop HP 15" Core i5','laptops',649,'💻',1],
  ['l3','Laptop Dell Inspiron 15','laptops',699,'💻',0],
  ['l4','MacBook Pro 14" M3','laptops',1599,'💻',0],
  ['l5','Laptop Lenovo IdeaPad 3 15"','laptops',549,'💻',0],
  ['l6','Laptop ASUS VivoBook 15','laptops',579,'💻',0],
  ['a1','AirPods Pro 2','audifonos',249,'🎧',1],
  ['a2','AirPods 4','audifonos',179,'🎧',0],
  ['a3','Sony WH-1000XM5','audifonos',349,'🎧',0],
  ['a4','AirPods Max','audifonos',549,'🎧',0],
  ['a5','Samsung Galaxy Buds 3 Pro','audifonos',229,'🎧',0],
  ['a6','JBL Tune 770NC','audifonos',99,'🎧',0],
  ['r1','Apple Watch Series 11','relojes',429,'⌚',1],
  ['r2','Apple Watch SE','relojes',249,'⌚',0],
  ['r3','Samsung Galaxy Watch 7','relojes',299,'⌚',0],
  ['r4','Apple Watch Ultra 2','relojes',799,'⌚',0],
  ['r5','Garmin Forerunner 265','relojes',449,'⌚',0],
  ['r6','Xiaomi Smart Band 8','relojes',49,'⌚',0],
  ['ac1','Funda MagSafe para iPhone 18 Pro Max','acc-celular',35,'🔌',0],
  ['ac2','Cargador USB-C 20 W','acc-celular',25,'🔌',0],
  ['ac3','Cable USB-C 1 m','acc-celular',20,'🔌',0],
  ['ac4','Protector de pantalla templado','acc-celular',15,'🔌',0],
  ['ac5','Soporte de celular para carro','acc-celular',18,'🔌',0],
  ['ac6','Power bank 10 000 mAh','acc-celular',30,'🔌',0],
  ['aa1','Estuche para AirPods Pro','acc-audifonos',15,'🎶',0],
  ['aa2','Almohadillas de repuesto','acc-audifonos',12,'🎶',0],
  ['aa3','Estuche para AirPods 4','acc-audifonos',15,'🎶',0],
  ['aa4','Cable de audio 3.5 mm','acc-audifonos',10,'🎶',0],
  ['aa5','Soporte para audífonos','acc-audifonos',22,'🎶',0],
  ['aa6','Adaptador Bluetooth','acc-audifonos',20,'🎶',0],
  ['ar1','Correa deportiva para reloj','acc-reloj',25,'⏱️',0],
  ['ar2','Cargador magnético para reloj','acc-reloj',29,'⏱️',0],
  ['ar3','Correa de silicona para Apple Watch','acc-reloj',20,'⏱️',0],
  ['ar4','Protector de pantalla para reloj','acc-reloj',10,'⏱️',0],
  ['ar5','Base de carga para reloj','acc-reloj',18,'⏱️',0],
  ['ar6','Funda protectora para reloj','acc-reloj',15,'⏱️',0]
].map(([id,n,c,p,e,r]) => ({id,n,c,p,e,r}));
const byId = Object.fromEntries(P.map(p => [p.id,p]));
const catName = id => (CATS.find(c => c[0] === id) || [])[1];

// Fotos reales para la fila "InnovaTech recomienda"
const FOTOS = {
  c1:'imágenes/tienda/img1.png', // iPhone Glaciar
  c2:'imágenes/tienda/img2.png', // iPhone Borgoña
  c3:'imágenes/tienda/img7.png', // iPhone 17
  c4:'imágenes/tienda/img8.png', //iPhone Duo
  c5:'imágenes/tienda/img9.png', //iPhone 17 Pro Max
  c6:'imágenes/tienda/img10.png', //iPhone 15 Pro Max
  t1:'imágenes/tienda/img11.png', //iPad Air 11
  t2:'imágenes/tienda/img12.png', //iPad 10.ª generación
  t3:'imágenes/tienda/img13.png', //Samsung Galaxy Tab S9
  t4:'imágenes/tienda/img14.png', //iPad Pro 11" M4
  t5:'imágenes/tienda/img15.png', //Xiaomi Pad 6
  t6:'imágenes/tienda/img16.png', //Xiaomi Smart Band 8
  l1:'imágenes/tienda/img3.png', // MacBook Air
  l2:'imágenes/tienda/img4.png', // Laptop HP
  l3:'imágenes/tienda/img17.png', // 
  l4:'imágenes/tienda/img18.png', // 
  l5:'imágenes/tienda/img19.png', //
  l6:'imágenes/tienda/img20.png', //
  a1:'imágenes/tienda/img5.png', // AirPods Pro 2
  a2:'imágenes/tienda/img21.png', 
  a3:'imágenes/tienda/img26.png', 
  a4:'imágenes/tienda/img23.png',
  a5:'imágenes/tienda/img24.png', 
  a6:'imágenes/tienda/img25.png', 
  r1:'imágenes/tienda/img6.png', 
  r2:'imágenes/tienda/img27.png',
  r3:'imágenes/tienda/img28.png',
  r4:'imágenes/tienda/img29.png',
  r5:'imágenes/tienda/img30.png',
  r6:'imágenes/tienda/img31.png',
  ac1:'imágenes/tienda/imgg1.png',
  ac2:'imágenes/tienda/imgg2.png',
  ac3:'imágenes/tienda/imgg3.png',
  ac4:'imágenes/tienda/imgg4.png',
  ac5:'imágenes/tienda/imgg5.png',
  ac6:'imágenes/tienda/imgg6.png',
  aa1: 'imágenes/tienda/imgg7.png',
  aa2: 'imágenes/tienda/imgg8.png',
  aa3: 'imágenes/tienda/imgg9.png',
  aa4: 'imágenes/tienda/imgg10.png',
  aa5: 'imágenes/tienda/imgg11.png',
  aa6: 'imágenes/tienda/imgg12.png',
  ar1: 'imágenes/tienda/imgg13.png',
  ar2: 'imágenes/tienda/imgg14.png',
  ar3: 'imágenes/tienda/imgg15.png',
  ar4: 'imágenes/tienda/imgg16.png',
  ar5: 'imágenes/tienda/imgg17.png',
  ar6: 'imágenes/tienda/imgg18.png',
  
};

const $ = s => document.querySelector(s);
const money = n => '$' + n.toLocaleString('en-US');
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store = {
  get:(k,d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
  set:(k,v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
};
let cart = store.get('it_cart', {}), user = null, cat = null, term = '';


/* ---------- Tienda ---------- */
const card = p => `<article class="card"><div class="im">${FOTOS[p.id] ? `<img src="${FOTOS[p.id]}" alt="">` : `<span>${p.e}</span>`}</div><h3>${p.n}</h3><div class="pr">${money(p.p)}</div><div class="chips"><em>Entrega rápida</em><em class="g">Envío gratis</em></div><button class="add" data-add="${p.id}">Agregar al carrito</button></article>`;
const sec = (t,l,c) => `<section class="blk"><div class="bh"><h2>${t}</h2>${c ? `<button class="lnk" data-cat="${c}">Ver todo ›</button>` : ''}</div><div class="row">${l.map(card).join('')}</div></section>`;

function renderShop() {
  const shop = $('#shop');
  if (cat || term) {
    const list = P.filter(p => (!cat || p.c === cat) && (!term || (p.n + ' ' + catName(p.c)).toLowerCase().includes(term)));
    const t = term ? `Resultados para “${esc(term)}”` : catName(cat);
    shop.innerHTML = `<section class="blk"><div class="bh"><h2>${t}</h2><button class="lnk" data-reset>Ver todo ›</button></div>${list.length ? `<div class="wrap">${list.map(card).join('')}</div>` : '<p class="empty">No encontramos productos con esa búsqueda.</p>'}</section>`;
  } else {
    shop.innerHTML = sec('InnovaTech recomienda ✨', P.filter(p => p.r).map(p => ({...p, i: FOTOS[p.id]}))) + CATS.map(([id,n]) => sec(n, P.filter(p => p.c === id), id)).join('');
  }
}
function renderCats() {
  $('#cats').innerHTML = CATS.map(([id,n,e]) => `<button class="cat${cat === id ? ' on' : ''}" data-cat="${id}"><span>${e}</span>${n}</button>`).join('');
}
function setCat(c) {
  cat = (cat === c) ? null : c; term = ''; $('#q').value = '';
  renderShop(); renderCats();
  if (cat) $('#cats').scrollIntoView({behavior:'smooth'});
}
$('#q').addEventListener('input', e => { term = e.target.value.trim().toLowerCase(); cat = null; renderShop(); renderCats(); });
$('#sf').addEventListener('submit', e => { e.preventDefault(); $('#cats').scrollIntoView({behavior:'smooth'}); });

/* ---------- Carrito ---------- */
function openCart()  { $('#drawer').classList.add('open'); $('#ov').classList.add('on'); }
function closeCart() { $('#drawer').classList.remove('open'); $('#ov').classList.remove('on'); }
function saveCart()  { store.set('it_cart', cart); renderCart(); }
function add(id)     { cart[id] = (cart[id] || 0) + 1; saveCart(); openCart(); }
function setQty(id,d){ cart[id] = (cart[id] || 0) + d; if (cart[id] <= 0) delete cart[id]; saveCart(); }

function renderCart() {
  const ids = Object.keys(cart).filter(id => byId[id]);
  const n = ids.reduce((s,id) => s + cart[id], 0);
  const total = ids.reduce((s,id) => s + cart[id] * byId[id].p, 0);
  $('#cartN').textContent = n; $('#cartN').hidden = !n;
  $('#items').innerHTML = ids.length ? ids.map(id => { const p = byId[id]; return `<li><span class="th">${FOTOS[id] ? `<img src="${FOTOS[id]}" alt="">` : p.e}</span><div><b>${p.n}</b><small>${money(p.p)}</small><div class="qty"><button data-q="${id}" data-d="-1" aria-label="Quitar uno">−</button><span>${cart[id]}</span><button data-q="${id}" data-d="1" aria-label="Agregar uno">+</button></div></div><button class="x" data-q="${id}" data-d="-999" aria-label="Eliminar">×</button></li>`; }).join('') : '<li class="empty">Tu carrito está vacío.</li>';
  $('#total').textContent = money(total);
  const msg = 'Hola InnovaTech, quiero comprar:\n' + ids.map(id => `• ${cart[id]} × ${byId[id].n} (${money(byId[id].p * cart[id])})`).join('\n') + `\nTotal: ${money(total)}`;
  const w = $('#checkout'); w.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`; w.style.display = n ? '' : 'none';
}

/* ---------- Cuenta (sesión real con Firebase) ---------- */
function renderUser() {
  $('#userBtn').title = user ? user : 'Cuenta';
  $('#userL').textContent = user ? user[0].toUpperCase() : '';
}

function openLogin() {
  const d = $('#login');
  d.innerHTML = '<h3>Hola, <span id="un"></span></h3><small>Sesión iniciada en InnovaTech.</small><button class="btn" data-out>Cerrar sesión</button> <button class="lnk" data-close>Cerrar</button>';
  $('#un').textContent = user || '';
  d.showModal();

  const o = d.querySelector('[data-out]');
  if (o) o.onclick = async () => {
    await signOut(auth);
    window.location.href = 'login.html';
  };
}

// Proteger la tienda: solo entra quien tenga sesión
onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }
  try {
    const snap = await getDoc(doc(db, 'usuarios', usuario.uid));
    user = snap.exists() ? snap.data().nombre : usuario.email.split('@')[0];
  } catch {
    user = usuario.email.split('@')[0];
  }
  renderUser();
});

/* ---------- Carrusel ---------- */
const sl = [...document.querySelectorAll('.slide')], dots = $('#dots');
let si = 0, timer;
dots.innerHTML = sl.map((_,i) => `<i data-s="${i}"></i>`).join('');
function go(i) {
  si = (i + sl.length) % sl.length;
  sl.forEach((s,k) => s.classList.toggle('on', k === si));
  [...dots.children].forEach((d,k) => d.classList.toggle('on', k === si));
  clearInterval(timer); timer = setInterval(() => go(si + 1), 5500);
}

/* ---------- Clics ---------- */
document.addEventListener('click', e => {
  const g = s => e.target.closest(s); let t;
  if (t = g('[data-add]')) add(t.dataset.add);
  else if (t = g('[data-q]')) setQty(t.dataset.q, +t.dataset.d);
  else if (t = g('[data-cat]')) setCat(t.dataset.cat);
  else if (g('[data-reset]')) setCat(null);
  else if (t = g('[data-s]')) go(+t.dataset.s);
  else if (g('[data-prev]')) go(si - 1);
  else if (g('[data-next]')) go(si + 1);
  else if (g('[data-scroll]')) $('#cats').scrollBy({left:320, behavior:'smooth'});
  else if (g('#cartBtn')) openCart();
  else if (g('[data-closecart]')) closeCart();
  else if (g('#userBtn')) openLogin();
  else if (g('[data-close]')) $('#login').close();
});

$('#wa').href = `https://wa.me/${WHATSAPP}`;
renderShop(); renderCats(); renderCart(); renderUser(); go(0);