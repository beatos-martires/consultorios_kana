const token = localStorage.getItem("token");
const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

if (!token || usuario.rol !== "profesional") {
  window.location.href = "/";
}

function logout() {
  localStorage.clear();
  window.location.href = "/";
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  return res;
}

async function cargarPacientes() {
  const res = await apiFetch("/api/pacientes");
  const pacientes = await res.json();

  const lista = document.getElementById("listaPacientes");
  const select = document.getElementById("paciente_id");

  lista.innerHTML = "";
  select.innerHTML = `<option value="">Seleccionar paciente</option>`;

  pacientes.forEach((p) => {
    lista.innerHTML += `
      <div class="item" onclick="verHistorial(${p.id})">
        <strong>${p.nombre_completo}</strong><br>
        Edad: ${p.edad || "-"}<br>
        Área: ${p.area || "-"}<br>
        Obra social: ${p.obra_social || "-"}
      </div>
    `;

    select.innerHTML += `<option value="${p.id}">${p.nombre_completo}</option>`;
  });
}

async function verHistorial(pacienteId) {
  const res = await apiFetch(`/api/evoluciones/paciente/${pacienteId}`);
  const evoluciones = await res.json();

  const historial = document.getElementById("historial");
  historial.innerHTML = `<h3>Paciente ID: ${pacienteId}</h3>`;

  if (!evoluciones.length) {
    historial.innerHTML += `<p>No hay evoluciones cargadas.</p>`;
    return;
  }

  evoluciones.forEach((e) => {
    historial.innerHTML += `
      <div class="item">
        <strong>${new Date(e.fecha).toLocaleString()}</strong><br>
        Profesional: ${e.profesional}<br>
        ${e.detalle}
      </div>
    `;
  });
}

document.getElementById("evolucionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    paciente_id: document.getElementById("paciente_id").value,
    detalle: document.getElementById("detalle").value
  };

  const res = await apiFetch("/api/evoluciones", {
    method: "POST",
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Error al guardar evolución");
    return;
  }

  alert("Evolución guardada correctamente");
  e.target.reset();
});

cargarPacientes();