const token = localStorage.getItem("token");
const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

if (!token || usuario.rol !== "secretaria") {
  window.location.href = "/";
}

let profesionalesGlobal = [];

function logout() {
  localStorage.clear();
  window.location.href = "/";
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {})
    }
  });

  return res;
}

async function cargarDashboard() {
  const res = await apiFetch("/api/reportes/dashboard");
  const data = await res.json();

  document.getElementById("statPacientes").textContent = data.pacientes || 0;
  document.getElementById("statUsuarios").textContent = data.usuarios || 0;
  document.getElementById("statSesiones").textContent = data.sesiones || 0;
  document.getElementById("statPendientes").textContent = data.pagos_pendientes || 0;
}

async function cargarAreas() {
  const res = await apiFetch("/api/areas");
  const areas = await res.json();

  const areaUsuario = document.getElementById("usuario_area_id");
  const areaSesion = document.getElementById("sesion_area_id");

  areaUsuario.innerHTML = `<option value="">Área (solo profesional)</option>`;
  areaSesion.innerHTML = `<option value="">Seleccionar área</option>`;

  areas.forEach((area) => {
    areaUsuario.innerHTML += `<option value="${area.id}">${area.nombre}</option>`;
    areaSesion.innerHTML += `<option value="${area.id}">${area.nombre}</option>`;
  });
}

async function cargarUsuarios() {
  const res = await apiFetch("/api/usuarios");
  const usuarios = await res.json();

  const lista = document.getElementById("listaUsuarios");
  lista.innerHTML = "";

  usuarios.forEach((u) => {
    lista.innerHTML += `
      <div class="item">
        <strong>${u.nombre_completo}</strong><br>
        DNI: ${u.dni}<br>
        Rol: ${u.rol}<br>
        Área: ${u.area || "-"}<br>
        Teléfono: ${u.telefono || "-"}<br>
        Email: ${u.email || "-"}<br>
        Activo: ${u.activo ? "Sí" : "No"}<br><br>
        <button onclick="editarUsuario(${u.id})">Editar</button>
        <button onclick="eliminarUsuario(${u.id})">Eliminar</button>
      </div>
    `;
  });
}

async function cargarTutores() {
  const res = await apiFetch("/api/pacientes/tutores");
  const tutores = await res.json();

  const select = document.getElementById("tutor_id");
  select.innerHTML = `<option value="">Seleccionar tutor</option>`;

  tutores.forEach((t) => {
    select.innerHTML += `<option value="${t.id}">${t.nombre_completo} - DNI ${t.dni}</option>`;
  });
}

async function cargarProfesionales() {
  const res = await apiFetch("/api/pacientes/profesionales");
  const profesionales = await res.json();
  profesionalesGlobal = profesionales;

  const sesionProfesional = document.getElementById("sesion_profesional_id");
  const container = document.getElementById("profesionalesContainer");

  sesionProfesional.innerHTML = `<option value="">Seleccionar profesional</option>`;
  container.innerHTML = "";

  profesionales.forEach((p) => {
    sesionProfesional.innerHTML += `<option value="${p.id}" data-area="${p.area_id}">${p.nombre_completo} - ${p.area || "-"}</option>`;

    container.innerHTML += `
      <label class="check-item">
        <input type="checkbox" name="profesional_checkbox" value="${p.id}" data-area="${p.area_id}">
        ${p.nombre_completo} - ${p.area || "-"}
      </label>
    `;
  });
}

async function cargarPacientes() {
  const res = await apiFetch("/api/pacientes");
  const pacientes = await res.json();

  const lista = document.getElementById("listaPacientes");
  const sesionPaciente = document.getElementById("sesion_paciente_id");
  const pagoPaciente = document.getElementById("pago_paciente_id");
  const cudPaciente = document.getElementById("cud_paciente_id");

  lista.innerHTML = "";
  sesionPaciente.innerHTML = `<option value="">Seleccionar paciente</option>`;
  pagoPaciente.innerHTML = `<option value="">Seleccionar paciente</option>`;
  cudPaciente.innerHTML = `<option value="">Seleccionar paciente</option>`;

  pacientes.forEach((p) => {
    lista.innerHTML += `
      <div class="item">
        <strong>${p.nombre_completo}</strong><br>
        DNI: ${p.dni || "-"}<br>
        Fecha nacimiento: ${p.fecha_nacimiento ? p.fecha_nacimiento.slice(0, 10) : "-"}<br>
        Edad: ${p.edad || "-"}<br>
        Obra social: ${p.obra_social || "-"}<br>
        Tiene CUD: ${p.cud_tiene ? "Sí" : "No"}<br>
        Vencimiento CUD: ${p.cud_vencimiento ? p.cud_vencimiento.slice(0, 10) : "-"}<br>
        ${p.cud_pdf_url ? `<a href="${p.cud_pdf_url}" target="_blank">Ver PDF CUD</a><br>` : ""}
        Observaciones: ${p.observaciones || "-"}<br><br>
        <button onclick="verDetallePaciente(${p.id})">Detalle</button>
        <button onclick="editarPaciente(${p.id})">Editar</button>
        <button onclick="eliminarPaciente(${p.id})">Eliminar</button>
      </div>
    `;

    sesionPaciente.innerHTML += `<option value="${p.id}">${p.nombre_completo}</option>`;
    pagoPaciente.innerHTML += `<option value="${p.id}">${p.nombre_completo}</option>`;
    cudPaciente.innerHTML += `<option value="${p.id}">${p.nombre_completo}</option>`;
  });
}

async function editarUsuario(id) {
  const res = await apiFetch(`/api/usuarios/${id}`);
  const u = await res.json();

  document.getElementById("usuario_id").value = u.id;
  document.getElementById("usuario_nombre").value = u.nombre_completo;
  document.getElementById("usuario_dni").value = u.dni;
  document.getElementById("usuario_rol").value = u.rol;
  document.getElementById("usuario_area_id").value = u.area_id || "";
  document.getElementById("usuario_telefono").value = u.telefono || "";
  document.getElementById("usuario_email").value = u.email || "";
  document.getElementById("usuario_activo").checked = u.activo;
}

async function eliminarUsuario(id) {
  if (!confirm("¿Eliminar este usuario?")) return;

  const res = await apiFetch(`/api/usuarios/${id}`, { method: "DELETE" });
  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "No se pudo eliminar");
    return;
  }

  alert(data.mensaje);
  await cargarUsuarios();
  await cargarDashboard();
}

async function verDetallePaciente(id) {
  const res = await apiFetch(`/api/pacientes/${id}`);
  const p = await res.json();

  let detalle = `
Paciente: ${p.nombre_completo}
DNI: ${p.dni || "-"}
Fecha nacimiento: ${p.fecha_nacimiento ? p.fecha_nacimiento.slice(0, 10) : "-"}
Edad: ${p.edad || "-"}
Obra social: ${p.obra_social || "-"}
Tiene CUD: ${p.cud_tiene ? "Sí" : "No"}
Vencimiento CUD: ${p.cud_vencimiento ? p.cud_vencimiento.slice(0, 10) : "-"}
Observaciones: ${p.observaciones || "-"}
`;

  detalle += `\nTutores:\n`;
  p.tutores.forEach((t) => {
    detalle += `- ${t.nombre_completo} (${t.parentesco || "-"})\n`;
  });

  detalle += `\nProfesionales:\n`;
  p.profesionales.forEach((pr) => {
    detalle += `- ${pr.nombre_completo} (${pr.area})\n`;
  });

  alert(detalle);
}

async function editarPaciente(id) {
  const res = await apiFetch(`/api/pacientes/${id}`);
  const p = await res.json();

  document.getElementById("paciente_id_edit").value = p.id;
  document.getElementById("nombre_completo").value = p.nombre_completo || "";
  document.getElementById("dni_paciente").value = p.dni || "";
  document.getElementById("fecha_nacimiento").value = p.fecha_nacimiento ? p.fecha_nacimiento.slice(0, 10) : "";
  document.getElementById("edad").value = p.edad || "";
  document.getElementById("obra_social").value = p.obra_social || "";
  document.getElementById("observaciones").value = p.observaciones || "";
  document.getElementById("cud_tiene").checked = !!p.cud_tiene;
  document.getElementById("cud_vencimiento").value = p.cud_vencimiento ? p.cud_vencimiento.slice(0, 10) : "";

  if (p.tutores.length) {
    document.getElementById("tutor_id").value = p.tutores[0].id;
    document.getElementById("parentesco").value = p.tutores[0].parentesco || "";
  }

  const checks = document.querySelectorAll('input[name="profesional_checkbox"]');
  checks.forEach((c) => {
    c.checked = p.profesionales.some((pr) => pr.id === Number(c.value));
  });
}

async function eliminarPaciente(id) {
  if (!confirm("¿Eliminar este paciente?")) return;

  const res = await apiFetch(`/api/pacientes/${id}`, { method: "DELETE" });
  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "No se pudo eliminar");
    return;
  }

  alert(data.mensaje);
  await cargarPacientes();
  await cargarDashboard();
}

document.getElementById("usuarioForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("usuario_id").value;
  const body = {
    nombre_completo: document.getElementById("usuario_nombre").value,
    dni: document.getElementById("usuario_dni").value,
    rol: document.getElementById("usuario_rol").value,
    area_id: document.getElementById("usuario_area_id").value || null,
    telefono: document.getElementById("usuario_telefono").value,
    email: document.getElementById("usuario_email").value,
    activo: document.getElementById("usuario_activo").checked
  };

  const res = await apiFetch(id ? `/api/usuarios/${id}` : "/api/usuarios", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Error al guardar usuario");
    return;
  }

  alert(id ? "Usuario actualizado" : "Usuario creado");
  e.target.reset();
  document.getElementById("usuario_id").value = "";
  document.getElementById("usuario_activo").checked = true;
  await cargarUsuarios();
  await cargarTutores();
  await cargarProfesionales();
  await cargarDashboard();
});

document.getElementById("pacienteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("paciente_id_edit").value;
  const profesionalChecks = [...document.querySelectorAll('input[name="profesional_checkbox"]:checked')];

  const profesionales = profesionalChecks.map((check) => ({
    profesional_id: Number(check.value),
    area_id: Number(check.dataset.area)
  }));

  const tutores = [];
  const tutorId = document.getElementById("tutor_id").value;
  const parentesco = document.getElementById("parentesco").value;

  if (tutorId) {
    tutores.push({
      tutor_id: Number(tutorId),
      parentesco
    });
  }

  const body = {
    nombre_completo: document.getElementById("nombre_completo").value,
    dni: document.getElementById("dni_paciente").value,
    fecha_nacimiento: document.getElementById("fecha_nacimiento").value,
    edad: document.getElementById("edad").value,
    obra_social: document.getElementById("obra_social").value,
    observaciones: document.getElementById("observaciones").value,
    cud_tiene: document.getElementById("cud_tiene").checked,
    cud_vencimiento: document.getElementById("cud_vencimiento").value,
    tutores,
    profesionales
  };

  const res = await apiFetch(id ? `/api/pacientes/${id}` : "/api/pacientes", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Error al guardar paciente");
    return;
  }

  alert(id ? "Paciente actualizado" : "Paciente creado");
  e.target.reset();
  document.getElementById("paciente_id_edit").value = "";
  await cargarPacientes();
  await cargarDashboard();
});

document.getElementById("cudForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const pacienteId = document.getElementById("cud_paciente_id").value;
  const fileInput = document.getElementById("cud_pdf");

  const formData = new FormData();
  formData.append("cud_pdf", fileInput.files[0]);

  const res = await apiFetch(`/api/pacientes/${pacienteId}/cud`, {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Error al subir PDF");
    return;
  }

  alert("CUD subido correctamente");
  e.target.reset();
  await cargarPacientes();
});

document.getElementById("sesionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    paciente_id: document.getElementById("sesion_paciente_id").value,
    profesional_id: document.getElementById("sesion_profesional_id").value || null,
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
  await cargarDashboard();
});

document.getElementById("pagoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    paciente_id: document.getElementById("pago_paciente_id").value,
    anio: document.getElementById("pago_anio").value,
    mes: document.getElementById("pago_mes").value,
    monto_pagado: document.getElementById("monto_pagado").value,
    estado: document.getElementById("estado_pago").value,
    observaciones: document.getElementById("pago_observaciones").value
  };

  const res = await apiFetch("/api/pagos", {
    method: "POST",
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Error al guardar pago");
    return;
  }

  alert("Pago mensual guardado correctamente");
  e.target.reset();
  await cargarDashboard();
});

document.getElementById("btnImprimirComprobante").addEventListener("click", () => {
  window.print();
});

document.getElementById("buscarPacienteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const q = document.getElementById("buscar_q").value;
  const res = await apiFetch(`/api/pacientes/buscar?q=${encodeURIComponent(q)}`);
  const pacientes = await res.json();

  const resultado = document.getElementById("resultadoBusqueda");
  resultado.innerHTML = "";

  if (!pacientes.length) {
    resultado.innerHTML = `<p>No se encontraron pacientes.</p>`;
    return;
  }

  pacientes.forEach((p) => {
    resultado.innerHTML += `
      <div class="item">
        <strong>${p.nombre_completo}</strong><br>
        DNI: ${p.dni || "-"}<br>
        Edad: ${p.edad || "-"}<br>
        Obra social: ${p.obra_social || "-"}
      </div>
    `;
  });
});

document.getElementById("reporteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const anio = document.getElementById("reporte_anio").value;
  const mes = document.getElementById("reporte_mes").value;
  const desde = document.getElementById("reporte_desde").value;
  const hasta = document.getElementById("reporte_hasta").value;

  const params = new URLSearchParams();
  if (anio) params.append("anio", anio);
  if (mes) params.append("mes", mes);
  if (desde) params.append("desde", desde);
  if (hasta) params.append("hasta", hasta);

  const res = await apiFetch(`/api/reportes/mensual-por-area?${params.toString()}`);
  const data = await res.json();

  const cont = document.getElementById("resultadoReporte");
  cont.innerHTML = "";

  if (!data.length) {
    cont.innerHTML = "<p>No hay datos para ese período.</p>";
    return;
  }

  data.forEach((r) => {
    cont.innerHTML += `
      <div class="item">
        <strong>${r.area}</strong><br>
        Total sesiones: ${r.total_sesiones}<br>
        Total facturado: $${Number(r.total_facturado).toFixed(2)}
      </div>
    `;
  });
});

async function init() {
  await cargarDashboard();
  await cargarAreas();
  await cargarUsuarios();
  await cargarTutores();
  await cargarProfesionales();
  await cargarPacientes();
}

init();