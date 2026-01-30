// ================================
// admin.js - Panel Admin (demo localStorage)
// - Lista usuarios
// - Lista mensajes
// - Permite "responder" y cambiar status
// - En producción reemplaza por fetch a tu API
// ================================
//ehwrhrwheikhw
(function () {
  const loginForm = document.getElementById("adminLoginForm");
  const messagesTable = document.getElementById("messagesTable")?.querySelector("tbody");
  const usersTable = document.getElementById("usersTable")?.querySelector("tbody");
  const replyForm = document.getElementById("replyForm");
  const clearReplyBtn = document.getElementById("clearReply");
  const statusFilter = document.getElementById("statusFilter");
  const adminSearch = document.getElementById("adminSearch");

  const kpiUsers = document.getElementById("kpiUsers");
  const kpiMessages = document.getElementById("kpiMessages");
  const kpiPending = document.getElementById("kpiPending");

  let isLogged = false;

  function loadDB() {
    const raw = localStorage.getItem("consultoria_demo_db");
    if (!raw) return {
      nextUserId: 1, nextMessageId: 1, nextChatId: 1,
      users: [], messages: [], replies: [], chatlogs: []
    };
    return JSON.parse(raw);
  }

  function saveDB(db) {
    localStorage.setItem("consultoria_demo_db", JSON.stringify(db));
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function badge(status) {
    const cls = status === "nuevo" ? "new" : (status === "respondido" || status === "cerrado") ? "done" : "";
    return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
  }

  function getUser(db, id_user) {
    return db.users.find(u => u.id_user === id_user) || null;
  }

  function render() {
    const db = loadDB();

    if (kpiUsers) kpiUsers.textContent = String(db.users.length);
    if (kpiMessages) kpiMessages.textContent = String(db.messages.length);
    if (kpiPending) kpiPending.textContent = String(db.messages.filter(m => m.status === "nuevo").length);

    if (usersTable) {
      usersTable.innerHTML = db.users
        .slice()
        .sort((a,b) => (b.creado_en || "").localeCompare(a.creado_en || ""))
        .map(u => `
          <tr>
            <td>${escapeHtml((u.creado_en || "").slice(0,19).replace("T"," "))}</td>
            <td>${escapeHtml(`${u.nombre || ""} ${u.apellido || ""}`.trim())}</td>
            <td>${escapeHtml(u.email || "")}</td>
            <td>${escapeHtml(u.telefono || "")}</td>
            <td>${escapeHtml(u.origen || "")}</td>
          </tr>
        `).join("");
    }

    if (messagesTable) {
      const q = (adminSearch?.value || "").trim().toLowerCase();
      const st = statusFilter?.value || "all";

      const rows = db.messages
        .slice()
        .sort((a,b) => (b.creado_en || "").localeCompare(a.creado_en || ""))
        .filter(m => (st === "all" ? true : m.status === st))
        .filter(m => {
          const u = getUser(db, m.id_user);
          const hay =
            (u?.email || "").toLowerCase().includes(q) ||
            (m.asunto || "").toLowerCase().includes(q);
          return !q ? true : hay;
        })
        .map(m => {
          const u = getUser(db, m.id_user);
          return `
            <tr>
              <td>${escapeHtml((m.creado_en || "").slice(0,19).replace("T"," "))}</td>
              <td>${escapeHtml(`${u?.nombre || ""} ${u?.apellido || ""}`.trim())}</td>
              <td>${escapeHtml(u?.email || "")}</td>
              <td>${escapeHtml(m.asunto || "")}</td>
              <td>${badge(m.status || "")}</td>
              <td>
                <button class="btn ghost" data-action="select" data-id="${m.id_message}">Ver</button>
              </td>
            </tr>
          `;
        });

      messagesTable.innerHTML = rows.join("");
    }
  }

  function selectMessage(id) {
    const db = loadDB();
    const msg = db.messages.find(m => m.id_message === id);
    if (!msg) return;

    const u = getUser(db, msg.id_user);
    const subject = `Re: ${msg.asunto || "Tu solicitud"}`;

    replyForm.elements.messageId.value = String(msg.id_message);
    replyForm.elements.asunto.value = subject;
    replyForm.elements.respuesta.value =
      `Hola ${u?.nombre || ""},\n\nGracias por escribirnos. En momentos nos ponemos en contacto contigo para revisar tu solicitud.\n\nSaludos.\nConsultoría`;
    replyForm.elements.status.value = msg.status === "nuevo" ? "en_proceso" : msg.status;
  }

  function saveReply(e) {
    e.preventDefault();
    if (!isLogged) {
      alert("Primero inicia sesión (demo).");
      return;
    }

    const db = loadDB();
    const id_message = parseInt(replyForm.elements.messageId.value, 10);
    const asunto = replyForm.elements.asunto.value.trim();
    const respuesta = replyForm.elements.respuesta.value.trim();
    const status = replyForm.elements.status.value;

    if (!id_message || !asunto || !respuesta) {
      alert("Completa la respuesta.");
      return;
    }

    const msg = db.messages.find(m => m.id_message === id_message);
    if (!msg) return;

    // Guardar respuesta (demo)
    db.replies.push({
      id_reply: Date.now(),
      id_message,
      id_admin: 1,
      asunto,
      respuesta,
      enviado_a_correo: 0,
      creado_en: new Date().toISOString()
    });

    msg.status = status;

    saveDB(db);
    alert("Respuesta guardada (demo).");
    replyForm.reset();
    render();
  }

  function clearReply() {
    replyForm.reset();
    replyForm.elements.messageId.value = "";
  }

  // Login demo
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm.elements.email.value.trim().toLowerCase();
      const pass = loginForm.elements.password.value.trim();

      // Demo: cualquier admin@... con 1234
      if (email && pass === "1234") {
        isLogged = true;
        alert("Sesión iniciada (demo).");
      } else {
        alert("Credenciales inválidas (demo: password 1234).");
      }
    });
  }

  // Table actions
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = parseInt(btn.getAttribute("data-id"), 10);

    if (action === "select") selectMessage(id);
  });

  replyForm?.addEventListener("submit", saveReply);
  clearReplyBtn?.addEventListener("click", clearReply);
  statusFilter?.addEventListener("change", render);
  adminSearch?.addEventListener("input", render);

  render();
})();
