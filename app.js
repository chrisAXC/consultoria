// ================================
// app.js - Frontend (sin backend)
// - Animaciones reveal
// - Contadores
// - Chatbot (respuestas rápidas)
// - Formulario (modo demo localStorage + endpoints opcionales)
// - Proyectos (demo + filtro)
// ================================

(function () {
  // Mobile nav
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  }

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("show");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  // Counters in hero
  const counters = Array.from(document.querySelectorAll("[data-counter]"));
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-counter"), 10) || 0;
    let current = 0;
    const steps = Math.max(18, Math.min(70, target * 3));
    const inc = target / steps;
    const tick = () => {
      current += inc;
      if (current >= target) {
        el.textContent = String(target);
        return;
      }
      el.textContent = String(Math.floor(current));
      requestAnimationFrame(tick);
    };
    tick();
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObserver.unobserve(e.target);
        }
      }
    },
    { threshold: 0.3 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  // Projects page demo data
  const demoProjects = [
    {
      id: 1,
      titulo: "Landing para consultoría",
      descripcion: "Landing moderna con secciones, formulario y animaciones.",
      tipo: "pagina_web",
      url: "",
    },
    {
      id: 2,
      titulo: "Instalación de entorno de desarrollo",
      descripcion: "Configuración completa (dependencias, pruebas y checklist).",
      tipo: "instalacion_programas",
      url: "",
    },
    {
      id: 3,
      titulo: "Asesoría para mejora de rendimiento",
      descripcion: "Diagnóstico y optimización en carga y estructura.",
      tipo: "consultoria",
      url: "",
    },
    {
      id: 4,
      titulo: "App interna de control",
      descripcion: "CRUD + panel de visualización para gestión interna.",
      tipo: "app",
      url: "",
    },
  ];

  const projectsGrid = document.getElementById("projectsGrid");
  const filterText = document.getElementById("filterText");
  const filterType = document.getElementById("filterType");

  function renderProjects() {
    if (!projectsGrid) return;

    const q = (filterText?.value || "").trim().toLowerCase();
    const t = filterType?.value || "all";

    const data = demoProjects.filter((p) => {
      const okType = t === "all" ? true : p.tipo === t;
      const okText =
        !q ||
        p.titulo.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q);
      return okType && okText;
    });

    projectsGrid.innerHTML = data
      .map(
        (p, idx) => `
        <article class="card reveal show" style="--delay:${idx * 80}ms;">
          <div class="badge">${labelTipo(p.tipo)}</div>
          <h3 style="margin-top:10px;">${escapeHtml(p.titulo)}</h3>
          <p>${escapeHtml(p.descripcion)}</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
            <a class="btn ghost" href="solicitar.html">Me interesa</a>
            ${
              p.url
                ? `<a class="btn primary" href="${escapeHtml(p.url)}" target="_blank" rel="noopener">Ver demo</a>`
                : `<span class="muted small">Demo no pública</span>`
            }
          </div>
        </article>
      `
      )
      .join("");
  }

  function labelTipo(tipo) {
    if (tipo === "pagina_web") return "Página web";
    if (tipo === "instalacion_programas") return "Instalación";
    if (tipo === "consultoria") return "Consultoría";
    if (tipo === "app") return "App";
    return "Proyecto";
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  if (projectsGrid) {
    renderProjects();
    filterText?.addEventListener("input", renderProjects);
    filterType?.addEventListener("change", renderProjects);
  }

  // Contact form
  const contactForm = document.getElementById("contactForm");
  const formResult = document.getElementById("formResult");

  async function postToApiOrDemo(payload) {
    // Si tienes backend, cambia USE_DEMO = false y define tus endpoints.
    const USE_DEMO = true;

    if (!USE_DEMO) {
      // Ejemplo backend:
      // POST /api/contact
      // body: {nombre, apellido, email, telefono, asunto, mensaje}
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al enviar");
      return await res.json();
    }

    // DEMO (localStorage)
    const db = loadDemoDB();
    const now = new Date().toISOString();

    // upsert user
    let user = db.users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
    if (!user) {
      user = {
        id_user: db.nextUserId++,
        nombre: payload.nombre,
        apellido: payload.apellido,
        email: payload.email,
        telefono: payload.telefono || "",
        origen: "contacto",
        creado_en: now,
      };
      db.users.push(user);
    } else {
      user.nombre = payload.nombre;
      user.apellido = payload.apellido;
      user.telefono = payload.telefono || user.telefono;
    }

    const msg = {
      id_message: db.nextMessageId++,
      id_user: user.id_user,
      asunto: payload.asunto,
      mensaje: payload.mensaje,
      canal: "formulario",
      status: "nuevo",
      creado_en: now,
    };
    db.messages.push(msg);

    saveDemoDB(db);
    return { ok: true, id_message: msg.id_message };
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(contactForm);
      const payload = {
        nombre: String(fd.get("nombre") || "").trim(),
        apellido: String(fd.get("apellido") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        telefono: String(fd.get("telefono") || "").trim(),
        asunto: String(fd.get("asunto") || "").trim(),
        mensaje: String(fd.get("mensaje") || "").trim(),
      };

      try {
        await postToApiOrDemo(payload);
        contactForm.hidden = true;
        formResult.hidden = false;
      } catch (err) {
        alert("No se pudo enviar. Intenta de nuevo.");
      }
    });
  }

  // Chatbot
  const chatFab = document.getElementById("chatFab");
  const chatBox = document.getElementById("chatBox");
  const chatClose = document.getElementById("chatClose");
  const chatBody = document.getElementById("chatBody");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");

  function addBubble(text, me = false) {
    if (!chatBody) return;
    const div = document.createElement("div");
    div.className = "bubble" + (me ? " me" : "");
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function botReply(userText) {
    const t = userText.toLowerCase();

    const replies = [
      {
        keys: ["precio", "costo", "cuánto", "cuanto"],
        text:
          "Depende del alcance. Si me dices qué necesitas (tipo de sitio, secciones, si habrá panel), te preparo una propuesta. Puedes dejar tu correo en Solicitar propuesta.",
      },
      {
        keys: ["página", "pagina", "web", "landing"],
        text:
          "Hacemos páginas web modernas, responsivas y rápidas. Si quieres, dime: tipo de negocio, secciones y ejemplo de estilo.",
      },
      {
        keys: ["instalación", "instalacion", "programas", "software"],
        text:
          "Instalamos y configuramos software y entornos (dependencias, versiones, pruebas y checklist). ¿Qué necesitas instalar y en qué sistema?",
      },
      {
        keys: ["portafolio", "proyectos"],
        text:
          "Puedes ver ejemplos en Proyectos. Si te interesa algo similar, deja tu mensaje y tu correo.",
      },
      {
        keys: ["contacto", "correo", "tel", "telefono"],
        text:
          "Tel: +52 000 000 0000 | Correo: contacto@consultoria.com. Si dejas tu mensaje, en momentos nos ponemos en contacto contigo.",
      },
    ];

    const found = replies.find((r) => r.keys.some((k) => t.includes(k)));
    if (found) return found.text;

    return "Puedo ayudarte. Dime si es consultoría, instalación de programas o página web. Si deseas, deja tu correo en Solicitar propuesta y registramos tu solicitud.";
  }

  async function logChatToApiOrDemo(pregunta, respuesta) {
    const USE_DEMO = true;

    if (!USE_DEMO) {
      await fetch("/api/chat/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, respuesta }),
      });
      return;
    }

    const db = loadDemoDB();
    db.chatlogs.push({
      id_log: db.nextChatId++,
      id_user: null,
      pregunta,
      respuesta,
      creado_en: new Date().toISOString(),
    });
    saveDemoDB(db);
  }

  if (chatFab && chatBox) {
    chatFab.addEventListener("click", () => {
      chatBox.classList.add("open");
      chatBox.setAttribute("aria-hidden", "false");
      if (chatBody && chatBody.childElementCount === 0) {
        addBubble("Hola. Soy el asistente. ¿Qué necesitas: consultoría, instalación o página web?");
      }
    });
  }
  if (chatClose && chatBox) {
    chatClose.addEventListener("click", () => {
      chatBox.classList.remove("open");
      chatBox.setAttribute("aria-hidden", "true");
    });
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      addBubble(text, true);
      chatInput.value = "";

      const reply = botReply(text);
      setTimeout(() => addBubble(reply, false), 250);

      try {
        await logChatToApiOrDemo(text, reply);
      } catch (_) {}
    });
  }

  // DEMO DB helpers
  function loadDemoDB() {
    const raw = localStorage.getItem("consultoria_demo_db");
    if (raw) return JSON.parse(raw);
    const init = {
      nextUserId: 1,
      nextMessageId: 1,
      nextChatId: 1,
      users: [],
      messages: [],
      replies: [],
      chatlogs: [],
    };
    localStorage.setItem("consultoria_demo_db", JSON.stringify(init));
    return init;
  }
  function saveDemoDB(db) {
    localStorage.setItem("consultoria_demo_db", JSON.stringify(db));
  }
})();
