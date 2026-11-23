import { auth, db } from "./firebase.js";
import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Traduce los errores de Firebase a mensajes claros
function traducirError(codigo) {
const errores = {
"auth/email-already-in-use": "Ese correo ya está registrado.",
"auth/invalid-email": "El correo no es válido.",
"auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
"auth/invalid-credential": "Correo o contraseña incorrectos.",
"auth/user-not-found": "No existe una cuenta con ese correo.",
"auth/wrong-password": "Contraseña incorrecta.",
"auth/too-many-requests": "Demasiados intentos. Espera unos minutos.",
"auth/network-request-failed": "Problema de conexión. Revisa tu internet."
};
return errores[codigo] || "Ocurrió un error. Intenta de nuevo.";
}

// REGISTRO
export async function registrar(datos) {
try {
const cred = await createUserWithEmailAndPassword(auth, datos.correo, datos.contrasena);

// Guarda los datos extra del usuario en Firestore
await setDoc(doc(db, "usuarios", cred.user.uid), {
nombre: datos.nombre,
apellido: datos.apellido,
telefono: datos.telefono,
correo: datos.correo,
creado: new Date()
});

alert("Cuenta creada con éxito. ¡Bienvenido a InnovaTech!");
window.location.href = "tienda.html";
} catch (error) {
alert(traducirError(error.code));
}
}

// INICIO DE SESIÓN
export async function iniciarSesion(correo, contrasena) {
try {
await signInWithEmailAndPassword(auth, correo, contrasena);
window.location.href = "tienda.html";
} catch (error) {
alert(traducirError(error.code));
}
}

// CERRAR SESIÓN
export async function cerrarSesion() {
await signOut(auth);
window.location.href = "login.html";
}

// DETECTAR SI HAY UN USUARIO CON SESIÓN ACTIVA
onAuthStateChanged(auth, (usuario) => {
if (usuario) {
console.log("Sesión activa:", usuario.email);
} else {
console.log("No hay sesión activa");
}
});