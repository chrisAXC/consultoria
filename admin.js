const API = "api.php";

/* =========================
   CERRAR SESIÓN
========================= */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("adminAuth");
    window.location.href = "index.html";
  });
}

/* =========================
   CARGAR MENSAJES
========================= */
async function loadMessages() {
  const res = await fetch(API + "?action=messages");
  const messages = await res.json();

  const tbody = document.getElementById("messagesTable");
  tbody.innerHTML = "";

  messages.forEach(m => {
    tbody.innerHTML += `
      <tr>
        <td>${m.fecha}</td>
        <td>${m.nombre}</td>
        <td>${m.email}</td>
        <td>${m.asunto}</td>
        <td>${m.status}</td>
        <td>
          <button class="btn ghost" onclick="selectMessage(${m.id})">Ver</button>
        </td>
      </tr>
    `;
  });
}

/* =========================
   SELECCIONAR MENSAJE
========================= */
function selectMessage(id) {
  fetch(API + "?action=message&id=" + id)
    .then(res => res.json())
    .then(m => {
      const f = document.getElementById("replyForm");
      f.id_message.value = m.id;
      f.asunto.value = "Re: " + m.asunto;
      f.respuesta.value =
        `Hola ${m.nombre},\n\nGracias por tu mensaje.\n\nSaludos.\nConsultoría`;
    });
}

/* =========================
   RESPONDER MENSAJE
========================= */
document.getElementById("replyForm").addEventListener("submit", async e => {
  e.preventDefault();

  const res = await fetch(API + "?action=reply", {
    method: "POST",
    body: new FormData(e.target)
  });

  const data = await res.json();
  alert(data.message);
  loadMessages();
});

/* =========================
   INICIAL
========================= */
loadMessages();
