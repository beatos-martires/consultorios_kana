const token = localStorage.getItem("token");
const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

if (!token || usuario.rol !== "tutor") {
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
      <div class="item">
        <strong>${p.nombre_completo}</strong><br>
        DNI: ${p.dni || "-"}<br>
        Edad: ${p.edad || "-"}<br>
        Obra social: ${p.obra_social || "-"}
      </div>
    `;

    select.innerHTML += `<option value="${p.id}">${p.nombre_completo}</option>`;
  });
}

document.getElementById("pagoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const pacienteId = document.getElementById("paciente_id").value;
  const anio = document.getElementById("anio").value;
  const mes = document.getElementById("mes").value;

  const res = await apiFetch(`/api/pagos/paciente/${pacienteId}/${anio}/${mes}`);
  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Error al consultar pago");
    return;
  }

  document.getElementById("resultadoPago").innerHTML = `
    <div class="item">
      <strong>Total calculado:</strong> $${Number(data.total_calculado || 0).toFixed(2)}<br>
      <strong>Monto pagado:</strong> $${Number(data.monto_pagado || 0).toFixed(2)}<br>
      <strong>Estado:</strong> ${data.estado || "pendiente"}<br>
      <strong>Observaciones:</strong> ${data.observaciones || "-"}
    </div>
  `;
});

cargarPacientes();