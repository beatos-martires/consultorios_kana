const token = localStorage.getItem("token");
const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

if (!token || usuario.rol !== "secretaria") {
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

async function cargarAreas() {
  const res = await apiFetch("/api/areas");
  const areas = await res.json();

  const areaSelect = document.getElementById("area_id");
  const sesionAreaSelect = document.getElementById("sesion_area_id");

  areaSelect.innerHTML = `<option value="">Seleccionar área</option>`;
  sesionAreaSelect.innerHTML = `<option value="">Seleccionar área</option>`;

  areas.forEach((area) => {
    areaSelect.innerHTML += `<option value="${area.id}">${area.nombre}</option>`;
    sesionAreaSelect.innerHTML += `<option value="${area.id}">${area.nombre}</option>`;
  });
}

async function cargarTutores() {
  const res = await apiFetch("/api/pacientes/tutores");
  const tutores = await res.json();

  const tutorSelect = document.getElementById("tutor_id");
  tutorSelect.innerHTML = `<option value="">Seleccionar tutor</option>`;

  tutores.forEach((tutor) => {
    tutorSelect.innerHTML += `<option value="${tutor.id}">${tutor.nombre_completo} - DNI ${tutor.dni}</option>`;
  });
}

async function cargarPacientes() {
  const res = await apiFetch("/api/pacientes");
  const pacientes = await res.json();

  const lista = document.getElementById("listaPacientes");
  const selectPaciente = document.getElementById("sesion_paciente_id");

  lista.innerHTML = "";
  selectPaciente.innerHTML = `<option value="">Seleccionar paciente</option>`;

  pacientes.forEach((p) => {
    lista.innerHTML += `
      <div class="item">
        <strong>${p.nombre_completo}</strong><br>
        Edad: ${p.edad || "-"}<br>
        DNI: ${p.dni || "-"}<br>
        Obra social: ${p.obra_social || "-"}<br>
        Área: ${p.area || "-"}<br>
        Tutor: ${p.tutor_nombre || "-"}<br>
        Observaciones: ${p.observaciones || "-"}
      </div>
    `;

    selectPaciente.innerHTML += `<option value="${p.id}">${p.nombre_completo}</option>`;
  });
}

document.getElementById("pacienteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    nombre_completo: document.getElementById("nombre_completo").value,
    edad: document.getElementById("edad").value,
    dni: document.getElementById("dni_paciente").value,
    obra_social: document.getElementById("obra_social").value,
    area_id: document.getElementById("area_id").value,
    tutor_id: document.getElementById("tutor_id").value || null,
    grupo_familiar: document.getElementById("grupo_familiar").value,
    observaciones: document.getElementById("observaciones").value
  };

  const res = await apiFetch("/api/pacientes", {
    method: "POST",
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Error al guardar paciente");
    return;
  }

  alert("Paciente guardado correctamente");
  e.target.reset();
  cargarPacientes();
});

document.getElementById("sesionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    paciente_id: document.getElementById("sesion_paciente_id").value,
    area_id: document.getElementById("sesion_area_id").value,
    fecha: document.getElementById("fecha").value,
    cantidad: document.getElementById("cantidad").value,
    monto_unitario: document.getElementById("monto_unitario").value,
    observaciones: document.getElementById("sesion_observaciones").value
  };

  const res = await apiFetch("/api/sesiones", {
    method: "POST",
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Error al guardar sesión");
    return;
  }

  alert("Sesión guardada correctamente");
  e.target.reset();
});

async function init() {
  await cargarAreas();
  await cargarTutores();
  await cargarPacientes();
}

init();