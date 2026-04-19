// ================================
// 🔥 FIREBASE IMPORTS
// ================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ================================
// 🔥 CONFIG
// ================================
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "bmc-ranking.firebaseapp.com",
  projectId: "bmc-ranking",
  storageBucket: "bmc-ranking.firebasestorage.app",
  messagingSenderId: "81111080222",
  appId: "1:81111080222:web:3370c3289ab07b83493d0f"
};


// ================================
// 🔥 INIT
// ================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ================================
// 🔥 LOGIN
// ================================
window.loginFirebase = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  signInWithEmailAndPassword(auth, email, senha)
    .then(() => alert("Logado 😈"))
    .catch(err => alert(err.message));
};


// ================================
// 🔥 AUTH CHECK
// ================================
onAuthStateChanged(auth, (user) => {
  const login = document.getElementById("login-screen");
  const painel = document.getElementById("painel");

  if (!login || !painel) return;

  if (user) {
    login.style.display = "none";
    painel.style.display = "block";
  } else {
    login.style.display = "flex";
    painel.style.display = "none";
  }
});


// ================================
// 🔥 LOGOUT
// ================================
window.logout = function () {
  signOut(auth);
};


// ================================
// 🔥 ADD PLAYER (COM POSIÇÃO + DEVICE)
// ================================
window.adicionarDoPainel = async function () {
  const nome = document.getElementById("nome").value;
  const modo = document.getElementById("modo").value;
  const categoria = document.getElementById("categoria").value;
  const tier = document.getElementById("tier").value;
  const pontos = document.getElementById("pontos").value;
  const dispositivo = document.getElementById("dispositivo")?.value || "mobile";

  if (!nome || !modo) {
    alert("Preencha tudo!");
    return;
  }

  await addDoc(collection(db, "players"), {
    nome,
    modo,
    categoria,
    tier,
    pontos: Number(pontos) || 0,
    dispositivo,
    posicao: Date.now() // posição automática (ordenável)
  });

  limparCampos();
};


// ================================
// 🔥 EDITAR COMPLETO
// ================================
window.editarPlayer = async function (id, p) {

  const nome = prompt("Nome:", p.nome);
  if (nome === null) return;

  const tier = prompt("Tier (ex: splus, a, bminus):", p.tier);
  if (tier === null) return;

  const dispositivo = prompt("Dispositivo (mobile, pc, controle):", p.dispositivo || "mobile");
  if (dispositivo === null) return;

  const posicao = prompt("Posição (número menor = topo):", p.posicao || 0);
  if (posicao === null) return;

  await updateDoc(doc(db, "players", id), {
    nome,
    tier,
    dispositivo,
    posicao: Number(posicao)
  });
};


// ================================
// 🔥 REMOVER
// ================================
window.removerPlayer = async function (id) {
  await deleteDoc(doc(db, "players", id));
};


// ================================
// 🔥 LIMPAR INPUTS
// ================================
function limparCampos() {
  document.getElementById("nome").value = "";
  document.getElementById("modo").value = "";
  document.getElementById("pontos").value = "";
}


// ================================
// 🔥 CARD PLAYER (CORRIGIDO ESPAÇO)
// ================================
function criarPlayer(p) {
  const div = document.createElement("div");
  div.className = "player";

  div.innerHTML = `
    <span class="nick">${p.nome}</span>
    <span class="modo">${p.modo}</span>
    <span class="pontos"> ${p.pontos || 0} pts</span>

    <div class="admin-buttons">
      <button onclick='editarPlayer("${p.id}", ${JSON.stringify(p)})'>✏️</button>
      <button onclick='removerPlayer("${p.id}")'>❌</button>
    </div>
  `;

  return div;
}


// ================================
// 🔥 RENDER REALTIME (COM ORDEM)
// ================================
onSnapshot(collection(db, "players"), (snapshot) => {

  document.querySelectorAll(".players").forEach(el => el.innerHTML = "");

  const lista = document.getElementById("lista");
  if (lista) lista.innerHTML = "";

  const players = [];

  snapshot.forEach(docSnap => {
    players.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  // 🔥 ordenar por posição
  players.sort((a,b)=>(a.posicao||999999)-(b.posicao||999999));

  players.forEach(p => {

    const tierId = `${p.categoria}-${p.tier}`;
    const container = document.getElementById(tierId);

    if (container) {
      container.appendChild(criarPlayer(p));
    }

    // STAFF
    if (lista) {
      const div = document.createElement("div");

      div.className = "player-staff";

      div.innerHTML = `
        <strong>${p.nome}</strong> - ${p.modo}
        <br>${p.categoria} / ${p.tier}
        <br>${p.pontos || 0} pts
        <br>${p.dispositivo || "mobile"}
        <br>Posição: ${p.posicao || "-"}
        <br>
        <button onclick="removerPlayer('${p.id}')">Remover</button>
        <button onclick='editarPlayer("${p.id}", ${JSON.stringify(p)})'>Editar</button>
      `;

      lista.appendChild(div);
    }

  });

});
