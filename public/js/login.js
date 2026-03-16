const form = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dni = document.getElementById("dni").value.trim();

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ dni })
    });

    const data = await res.json();

    if (!res.ok) {
      mensaje.textContent = data.error || "Error al iniciar sesión";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    if (data.usuario.rol === "secretaria") {
      window.location.href = "/secretaria.html";
    } else if (data.usuario.rol === "profesional") {
      window.location.href = "/profesional.html";
    } else {
      window.location.href = "/tutor.html";
    }
  } catch (error) {
    mensaje.textContent = "No se pudo conectar con el servidor";
  }
});