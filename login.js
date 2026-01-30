document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  if (email === "arturo@gmail.com" && pass === "admin12345") {
    localStorage.setItem("adminAuth", "true");
    window.location.href = "admin.html";
  } else {
    msg.textContent = "Credenciales incorrectas";
  }
});
