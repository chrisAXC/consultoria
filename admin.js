const formAdmin = document.getElementById("formAdmin");
const msgAdmin = document.getElementById("msgAdmin");

if (formAdmin) {
  formAdmin.addEventListener("submit", async (e) => {
    e.preventDefault();

    msgAdmin.textContent = "Verificando...";
    msgAdmin.style.color = "#334155";

    const fd = new FormData(formAdmin);

    try {
      const res = await fetch("php/admin_login.php", {
        method: "POST",
        body: fd
      });

      const data = await res.json();

      if (!data.ok) {
        msgAdmin.textContent = data.error || "Credenciales incorrectas.";
        msgAdmin.style.color = "#ef4444";
        return;
      }

      msgAdmin.textContent = "Acceso correcto. Entrando...";
      msgAdmin.style.color = "#16a34a";
      window.location.href = "admin-panel.html";

    } catch {
      msgAdmin.textContent = "Error de servidor. Revisa XAMPP y rutas.";
      msgAdmin.style.color = "#ef4444";
    }
  });
}
