(async function () {
  const tbody = document.getElementById("apTbody");
  const filterStatus = document.getElementById("apFilterStatus");
  const searchText = document.getElementById("apSearch");
  const btnRefresh = document.getElementById("apRefresh");
  const btnLogout = document.getElementById("apLogout");
  const btnGoLogin = document.getElementById("apGoLogin");

  const who = document.getElementById("apWho");
  const kpiNuevo = document.getElementById("apKpiNuevo");
  const kpiProceso = document.getElementById("apKpiProceso");
  const kpiResp = document.getElementById("apKpiResp");
  const kpiTotal = document.getElementById("apKpiTotal");

  // Modal
  const backdrop = document.getElementById("apBackdrop");
  const btnClose = document.getElementById("apClose");
  const meta = document.getElementById("apMeta");
  const folio = document.getElementById("apFolio");
  const email = document.getElementById("apEmail");
  const mensaje = document.getElementById("apMensaje");
  const replyAsunto = document.getElementById("apReplyAsunto");
  const replyText = document.getElementById("apReplyText");
  const btnSend = document.getElementById("apSendReply");
  const msg = document.getElementById("apMsg");

  let ALL = [];
  let current = null;

  const esc = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  function fmtDate(iso) {
    if (!iso) return "";
    // si viene "2026-01-31 12:00:00" lo hacemos ISO
    const safe = String(iso).includes("T") ? iso : String(iso).replace(" ", "T");
    const d = new Date(safe);
    return isNaN(d.getTime()) ? iso : d.toLocaleString();
  }

  function statusChip(st) {
    const map = {
      nuevo: ["nuevo", "NUEVO"],
      en_proceso: ["en_proceso", "EN PROCESO"],
      respondido: ["respondido", "RESPONDIDO"],
      cerrado: ["cerrado", "CERRADO"],
    };
    const v = map[st] || ["", st];
    return `
      <span class="ap-status">
        <span class="ap-dot ${v[0]}"></span>
        <span>${v[1]}</span>
      </span>
    `;
  }

  async function apiGet(url) {
    const res = await fetch(url);
    const data = await res.json().catch(() => null);
    return { ok: res.ok, data };
  }

  async function apiPost(url, obj) {
    const fd = new FormData();
    Object.keys(obj).forEach((k) => fd.append(k, obj[k]));
    const res = await fetch(url, { method: "POST", body: fd });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, data };
  }

  async function checkSession() {
    const r = await apiGet("php/admin_me.php");
    if (!r.ok || !r.data?.ok || !r.data?.logged) {
      who.textContent = "Sin sesión activa. Inicia sesión en admin.html";
      btnGoLogin.hidden = false;
      tbody.innerHTML = `<tr><td colspan="6" class="ap-empty">No hay sesión activa. Inicia sesión en admin.html</td></tr>`;
      return false;
    }
    btnGoLogin.hidden = true;
    who.textContent = r.data.admin?.nombre ? `Sesión: ${r.data.admin.nombre}` : "Sesión activa";
    return true;
  }

  async function loadMessages() {
    tbody.innerHTML = `<tr><td colspan="6" class="ap-empty">Cargando...</td></tr>`;

    const st = filterStatus.value ? `?status=${encodeURIComponent(filterStatus.value)}` : "";
    const r = await apiGet("php/admin_messages.php" + st);

    if (!r.ok || !r.data?.ok) {
      tbody.innerHTML = `<tr><td colspan="6" class="ap-empty">Error al cargar solicitudes.</td></tr>`;
      return;
    }

    ALL = r.data.messages || [];
    renderKpis(ALL);
    render();
  }

  function renderKpis(list) {
    const c = { nuevo: 0, en_proceso: 0, respondido: 0, cerrado: 0 };
    list.forEach((m) => (c[m.status] = (c[m.status] || 0) + 1));
    kpiNuevo.textContent = c.nuevo || 0;
    kpiProceso.textContent = c.en_proceso || 0;
    kpiResp.textContent = c.respondido || 0;
    kpiTotal.textContent = list.length;
  }

  function render() {
    const q = (searchText.value || "").trim().toLowerCase();

    const rows = ALL.filter((m) => {
      if (!q) return true;
      return (
        String(m.folio || "").toLowerCase().includes(q) ||
        String(m.email || "").toLowerCase().includes(q) ||
        String(m.asunto || "").toLowerCase().includes(q) ||
        String(m.nombre || "").toLowerCase().includes(q) ||
        String(m.apellido || "").toLowerCase().includes(q) ||
        String(m.mensaje || "").toLowerCase().includes(q)
      );
    });

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="ap-empty">No hay resultados.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows
      .map(
        (m) => `
        <tr>
          <td class="ap-mono">${esc(m.folio)}</td>
          <td>
            <div style="font-weight:800;">${esc((m.nombre || "") + " " + (m.apellido || ""))}</div>
            <div class="ap-muted" style="font-size:.9rem;">${esc(m.email)}${m.telefono ? " · " + esc(m.telefono) : ""}</div>
          </td>
          <td>
            <div style="font-weight:800;">${esc(m.asunto)}</div>
            <div class="ap-muted" style="font-size:.9rem;max-width:540px;">
              ${esc(m.mensaje).slice(0, 130)}${String(m.mensaje || "").length > 130 ? "…" : ""}
            </div>
          </td>
          <td>${statusChip(m.status)}</td>
          <td class="ap-muted">${esc(fmtDate(m.creado_en))}</td>
          <td>
            <div class="ap-actions">
              <button class="ap-btn primary" data-action="reply" data-id="${m.id_message}">Responder</button>
            </div>
          </td>
        </tr>
      `
      )
      .join("");

    tbody.querySelectorAll('button[data-action="reply"]').forEach((b) => {
      b.addEventListener("click", () => {
        const id = Number(b.getAttribute("data-id"));
        const item = ALL.find((x) => Number(x.id_message) === id);
        if (item) openModal(item);
      });
    });
  }

  function openModal(item) {
    current = item;
    msg.textContent = "";
    replyText.value = "";
    replyAsunto.value = (`Re: ${item.asunto || ""}`).trim();

    meta.textContent = `#${item.id_message} · ${fmtDate(item.creado_en)} · Estado: ${item.status}`;
    folio.textContent = item.folio || "—";
    email.textContent = item.email || "—";
    mensaje.textContent = item.mensaje || "—";

    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    setTimeout(() => replyText.focus(), 50);
  }

  function closeModal() {
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
    current = null;
  }

  async function sendReply() {
    if (!current) return;

    const asunto = replyAsunto.value.trim();
    const respuesta = replyText.value.trim();

    if (!asunto || !respuesta) {
      msg.textContent = "Escribe asunto y respuesta.";
      return;
    }

    btnSend.disabled = true;
    msg.textContent = "Guardando respuesta...";

    const r = await apiPost("php/admin_reply.php", {
      id_message: current.id_message,
      asunto,
      respuesta,
    });

    btnSend.disabled = false;

    if (!r.ok || !r.data?.ok) {
      msg.textContent = r.data?.error || "No se pudo guardar la respuesta.";
      return;
    }

    msg.textContent = "✅ Respuesta guardada. El usuario la verá en Seguimiento.";
    await loadMessages();
    setTimeout(closeModal, 600);
  }

  // Eventos UI
  btnGoLogin.addEventListener("click", () => (location.href = "admin.html"));
  btnRefresh.addEventListener("click", loadMessages);
  filterStatus.addEventListener("change", loadMessages);
  searchText.addEventListener("input", render);

  btnLogout.addEventListener("click", async () => {
    await apiPost("php/admin_logout.php", {});
    location.href = "admin.html";
  });

  btnClose.addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  btnSend.addEventListener("click", sendReply);

  // init
  const ok = await checkSession();
  if (ok) await loadMessages();
})();
