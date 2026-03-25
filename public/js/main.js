document.addEventListener("DOMContentLoaded", () => {
  const API = {
  auth: "/api/auth",
  usuarios: "/api/usuarios",
  especialidades: "/api/especialidades",
  profesionales: "/api/profesionales",
  pacientes: "/api/pacientes",
  sesiones: "/api/sesiones",
  resumen: "/api/resumen",
  observaciones: "/api/observaciones",
  informes: "/api/informes",
  tutorPacientes: "/api/tutor/pacientes",
  tutorSesiones: "/api/tutor/sesiones"
};

  const state = {
    usuarios: [],
    especialidades: [],
    profesionales: [],
    pacientes: [],
    sesiones: [],
    observaciones: [],
    informes: []
  };

  function formatearMonto(valor) {
    return `$${Number(valor || 0).toLocaleString("es-AR")}`;
  }

  async function fetchJSON(url, options = {}) {
    const response = await fetch(url, options);
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    if (!response.ok) {
      throw new Error(data?.error || "Ocurrió un error.");
    }
    return data;
  }

  async function fetchFormData(url, formData, method = "POST") {
    const response = await fetch(url, {
      method,
      body: formData
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(data?.error || "Ocurrió un error.");
    }

    return data;
  }

  function limpiarFormulario(idForm, idHidden = null) {
    const form = document.getElementById(idForm);
    const hidden = idHidden ? document.getElementById(idHidden) : null;
    if (form) form.reset();
    if (hidden) hidden.value = "";
  }

  function nombreEspecialidadPorId(id) {
    return state.especialidades.find(e => String(e.id) === String(id))?.nombre || "Sin especialidad";
  }

  function nombreUsuarioPorId(id) {
    return state.usuarios.find(u => String(u.id) === String(id))?.nombre || "Sin usuario";
  }

  function nombrePacientePorId(id) {
    return state.pacientes.find(p => String(p.id) === String(id))?.nombre || "Sin paciente";
  }

  function profesionalPorUsuarioId(usuarioId) {
    return state.profesionales.find(p => String(p.usuario_id) === String(usuarioId));
  }

  async function cargarDatosBase() {
  const tutorActivoId = sessionStorage.getItem("tutorActivoId");
  const profesionalActivoUsuarioId = sessionStorage.getItem("profesionalActivoUsuarioId");

  const esTutor = !!tutorActivoId;
  const esProfesional = !!profesionalActivoUsuarioId;

  if (esTutor) {
    const resultados = await Promise.all([
      fetchJSON(`${API.tutorPacientes}/${tutorActivoId}`).catch(() => []),
      fetchJSON(`${API.tutorSesiones}/${tutorActivoId}`).catch(() => [])
    ]);

    state.usuarios = [];
    state.especialidades = [];
    state.profesionales = [];
    state.pacientes = resultados[0];
    state.sesiones = resultados[1];
    return;
  }

  const resultados = await Promise.all([
    fetchJSON(API.usuarios).catch(() => []),
    fetchJSON(API.especialidades).catch(() => []),
    fetchJSON(API.profesionales).catch(() => []),
    fetchJSON(API.pacientes).catch(() => []),
    fetchJSON(API.sesiones).catch(() => [])
  ]);

  state.usuarios = resultados[0];
  state.especialidades = resultados[1];
  state.profesionales = resultados[2];
  state.pacientes = resultados[3];
  state.sesiones = resultados[4];
}

  function cargarSelectUsuariosProfesionales() {
    const select = document.getElementById("usuarioProfesional");
    if (!select) return;

    const usuariosProfesionales = state.usuarios.filter(u => u.rol === "profesional");
    select.innerHTML = `<option value="">Seleccionar</option>`;
    usuariosProfesionales.forEach(u => {
      select.innerHTML += `<option value="${u.id}">${u.nombre} - DNI ${u.dni}</option>`;
    });
  }

  function cargarSelectTutores() {
    const select = document.getElementById("tutorUsuario");
    if (!select) return;

    const tutores = state.usuarios.filter(u => u.rol === "tutor" && u.activo);
    select.innerHTML = `<option value="">Seleccionar tutor</option>`;
    tutores.forEach(u => {
      select.innerHTML += `<option value="${u.id}">${u.nombre} - DNI ${u.dni}</option>`;
    });
  }

  function cargarSelectEspecialidades() {
    const select1 = document.getElementById("especialidadProfesional");
    const select2 = document.getElementById("especialidadSesion");

    if (select1) {
      select1.innerHTML = `<option value="">Seleccionar</option>`;
      state.especialidades.forEach(e => {
        select1.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
      });
    }

    if (select2) {
      select2.innerHTML = `<option value="">Seleccionar</option>`;
      state.especialidades.forEach(e => {
        select2.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
      });
    }
  }

  function cargarSelectPacientes() {
  const select1 = document.getElementById("pacienteSesion");
  const select2 = document.getElementById("pacienteTutor");
  const select3 = document.getElementById("pacienteProfesional");
  const profesionalActivoUsuarioId = sessionStorage.getItem("profesionalActivoUsuarioId");
  const profesionalActivo = profesionalPorUsuarioId(profesionalActivoUsuarioId);

  if (select1) {
    select1.innerHTML = `<option value="">Seleccionar</option>`;
    state.pacientes.forEach(p => {
      select1.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });
  }

  if (select2) {
    select2.innerHTML = `<option value="">Seleccionar</option>`;

    state.pacientes.forEach(p => {
      select2.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });

    if (state.pacientes.length === 1) {
      select2.value = state.pacientes[0].id;
      select2.disabled = true;
    } else {
      select2.disabled = false;
    }
  }

  if (select3) {
    let idsPacientes = [];
    if (profesionalActivo) {
      idsPacientes = [...new Set(
        state.sesiones
          .filter(s => String(s.profesional_id) === String(profesionalActivo.id))
          .map(s => String(s.paciente_id))
      )];
    }

    const pacientesProfesional = state.pacientes.filter(p =>
      idsPacientes.includes(String(p.id))
    );

    select3.innerHTML = `<option value="">Seleccionar paciente</option>`;
    pacientesProfesional.forEach(p => {
      select3.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });
  }
}

  function cargarSelectProfesionalesSesion() {
    const select = document.getElementById("profesionalSesion");
    if (!select) return;

    select.innerHTML = `<option value="">Seleccionar profesional</option>`;
    state.profesionales.forEach(p => {
      select.innerHTML += `<option value="${p.id}" data-especialidad="${p.especialidad_id}">
        ${p.nombre} - ${p.especialidad_nombre}
      </option>`;
    });
  }

  function ocultarListaSiNoHayBusqueda(lista, buscador) {
  if (!lista) return true;

  const texto = buscador ? buscador.value.toLowerCase().trim() : "";

  if (!texto) {
    lista.innerHTML = "";
    lista.style.display = "none";
    return true;
  }

  lista.style.display = "block";
  return false;
}

function renderListaUsuarios() {
  const lista = document.getElementById("listaUsuarios");
  const buscador = document.getElementById("buscarUsuario");
  if (!lista) return;

  if (ocultarListaSiNoHayBusqueda(lista, buscador)) return;

  const texto = buscador.value.toLowerCase().trim();

  const usuarios = state.usuarios.filter(u =>
    `${u.nombre || ""} ${u.dni || ""} ${u.rol || ""}`.toLowerCase().includes(texto)
  );

  lista.innerHTML = usuarios.length
    ? usuarios.map(u => `
        <li class="item-lista">
          <span>${u.nombre} - DNI: ${u.dni} - Rol: ${u.rol} - ${u.activo ? "Activo" : "Inactivo"}</span>
          <div class="acciones-lista">
            <button class="btn-editar" onclick="window.editarUsuario('${u.id}')">Editar</button>
            <button class="btn-eliminar" onclick="window.eliminarUsuario('${u.id}')">Eliminar</button>
          </div>
        </li>
      `).join("")
    : "<li>No se encontraron usuarios.</li>";
}

function renderListaEspecialidades() {
  const lista = document.getElementById("listaEspecialidades");
  const buscador = document.getElementById("buscarEspecialidad");
  if (!lista) return;

  if (ocultarListaSiNoHayBusqueda(lista, buscador)) return;

  const texto = buscador.value.toLowerCase().trim();

  const items = state.especialidades.filter(i =>
    `${i.nombre || ""} ${i.precio || ""}`.toLowerCase().includes(texto)
  );

  lista.innerHTML = items.length
    ? items.map(i => `
        <li class="item-lista">
          <span>${i.nombre} - ${formatearMonto(i.precio)}</span>
          <div class="acciones-lista">
            <button class="btn-editar" onclick="window.editarEspecialidad('${i.id}')">Editar</button>
            <button class="btn-eliminar" onclick="window.eliminarEspecialidad('${i.id}')">Eliminar</button>
          </div>
        </li>
      `).join("")
    : "<li>No se encontraron especialidades.</li>";
}

function renderListaProfesionales() {
  const lista = document.getElementById("listaProfesionales");
  const buscador = document.getElementById("buscarProfesional");
  if (!lista) return;

  if (ocultarListaSiNoHayBusqueda(lista, buscador)) return;

  const texto = buscador.value.toLowerCase().trim();

  const items = state.profesionales.filter(i =>
    `${i.nombre || ""} ${i.especialidad_nombre || ""}`.toLowerCase().includes(texto)
  );

  lista.innerHTML = items.length
    ? items.map(i => `
        <li class="item-lista">
          <span>${i.nombre} - ${i.especialidad_nombre}</span>
          <div class="acciones-lista">
            <button class="btn-editar" onclick="window.editarProfesional('${i.id}')">Editar</button>
            <button class="btn-eliminar" onclick="window.eliminarProfesional('${i.id}')">Eliminar</button>
          </div>
        </li>
      `).join("")
    : "<li>No se encontraron profesionales.</li>";
}

function renderListaPacientes() {
  const lista = document.getElementById("listaPacientes");
  const buscador = document.getElementById("buscarPaciente");
  if (!lista) return;

  if (ocultarListaSiNoHayBusqueda(lista, buscador)) return;

  const texto = buscador.value.toLowerCase().trim();

  const items = state.pacientes.filter(i =>
    `${i.nombre || ""} ${i.dni || ""} ${i.tutor_nombre || nombreUsuarioPorId(i.tutor_usuario_id) || ""}`
      .toLowerCase()
      .includes(texto)
  );

  lista.innerHTML = items.length
    ? items.map(i => `
        <li class="item-lista">
          <span>
            ${i.nombre} - Tutor: ${i.tutor_nombre || nombreUsuarioPorId(i.tutor_usuario_id)}
            ${i.cud_ruta ? ` - <a href="${i.cud_ruta}" target="_blank">Ver CUD</a>` : ""}
          </span>
          <div class="acciones-lista">
            <button class="btn-editar" onclick="window.editarPaciente('${i.id}')">Editar</button>
            <button class="btn-eliminar" onclick="window.eliminarPaciente('${i.id}')">Eliminar</button>
          </div>
        </li>
      `).join("")
    : "<li>No se encontraron pacientes.</li>";
}

function renderListaSesiones() {
  const lista = document.getElementById("listaSesiones");
  const buscador = document.getElementById("buscarSesion");
  if (!lista) return;

  if (ocultarListaSiNoHayBusqueda(lista, buscador)) return;

  const texto = buscador.value.toLowerCase().trim();

  const items = state.sesiones.filter(i =>
    `${i.paciente_nombre || ""} ${i.profesional_nombre || ""} ${i.especialidad_nombre || ""} ${i.mes || ""} ${i.anio || ""}`
      .toLowerCase()
      .includes(texto)
  );

  lista.innerHTML = items.length
    ? items.map(i => `
        <li class="item-lista">
          <span>${i.paciente_nombre} - ${i.profesional_nombre} - ${i.especialidad_nombre} - ${i.mes} ${i.anio} - ${i.cantidad} sesiones - ${formatearMonto(i.subtotal)}</span>
          <div class="acciones-lista">
            <button class="btn-editar" onclick="window.editarSesion('${i.id}')">Editar</button>
            <button class="btn-eliminar" onclick="window.eliminarSesion('${i.id}')">Eliminar</button>
          </div>
        </li>
      `).join("")
    : "<li>No se encontraron sesiones.</li>";
}

  function renderTutor() {
  const pacienteSelect = document.getElementById("pacienteTutor");

  if (pacienteSelect && state.pacientes.length === 1) {
    pacienteSelect.value = state.pacientes[0].id;
    pacienteSelect.disabled = true;
  } else if (pacienteSelect) {
    pacienteSelect.disabled = false;
  }

  obtenerResumenTutorActual();
}

function renderSecretaria() {
  renderListaUsuarios();
  renderListaEspecialidades();
  renderListaProfesionales();
  renderListaPacientes();
  renderListaSesiones();
}

  async function renderResumenAdministrativo() {
    const total = document.getElementById("totalGeneralResumen");
    const tablaEsp = document.getElementById("tablaResumenEspecialidad");
    const tablaPro = document.getElementById("tablaResumenProfesional");
    const mes = document.getElementById("mesResumen");
    const anio = document.getElementById("anioResumen");

    if (!total || !tablaEsp || !tablaPro) return;

    const params = new URLSearchParams();
    if (mes?.value) params.append("mes", mes.value);
    if (anio?.value) params.append("anio", anio.value);

    try {
      const data = await fetchJSON(`${API.resumen}/administrativo?${params.toString()}`);
      total.textContent = formatearMonto(data.total);

      tablaEsp.innerHTML = data.porEspecialidad.length
        ? data.porEspecialidad.map(i => `
            <tr>
              <td>${i.nombre}</td>
              <td>${formatearMonto(i.total)}</td>
            </tr>
          `).join("")
        : `<tr><td colspan="2">No hay datos para este período.</td></tr>`;

      tablaPro.innerHTML = data.porProfesional.length
        ? data.porProfesional.map(i => `
            <tr>
              <td>${i.nombre}</td>
              <td>${formatearMonto(i.total)}</td>
            </tr>
          `).join("")
        : `<tr><td colspan="2">No hay datos para este período.</td></tr>`;
    } catch (error) {
      console.error(error);
    }
  }

  function obtenerResumenTutorActual() {
    const pacienteSelect = document.getElementById("pacienteTutor");
    const detalle = document.getElementById("detallePacienteTutor");
    const tabla = document.getElementById("tablaTutor");
    const total = document.getElementById("totalTutor");

    if (!pacienteSelect || !detalle || !tabla || !total) return null;

    const pacienteId = pacienteSelect.value || pacienteSelect.options[1]?.value;
    if (!pacienteId) return null;

    const paciente = state.pacientes.find(p => String(p.id) === String(pacienteId));
    if (!paciente) return null;

    let sesiones = state.sesiones.filter(s => String(s.paciente_id) === String(paciente.id));

    const mes = document.getElementById("mesTutor")?.value || "";
    const anio = document.getElementById("anioTutor")?.value || "";

    if (mes) sesiones = sesiones.filter(s => s.mes === mes);
    if (anio) sesiones = sesiones.filter(s => String(s.anio) === String(anio));

    const agrupadas = {};
    sesiones.forEach(s => {
      const clave = s.especialidad_id;
      if (!agrupadas[clave]) {
        agrupadas[clave] = {
          especialidad: s.especialidad_nombre,
          sesiones: 0,
          precio: Number(s.precio),
          subtotal: 0
        };
      }
      agrupadas[clave].sesiones += Number(s.cantidad);
      agrupadas[clave].subtotal += Number(s.subtotal);
    });

    const filas = Object.values(agrupadas);
    const montoTotal = filas.reduce((acc, item) => acc + item.subtotal, 0);

    detalle.innerHTML = `
      <p><strong>Paciente:</strong> ${paciente.nombre}</p>
      <p><strong>DNI:</strong> ${paciente.dni}</p>
      <p><strong>Fecha de nacimiento:</strong> ${paciente.fecha_nacimiento || "-"}</p>
      <p><strong>Tutor:</strong> ${paciente.tutor_nombre || nombreUsuarioPorId(paciente.tutor_usuario_id)}</p>
      ${paciente.cud_ruta ? `<p><strong>CUD:</strong> <a href="${paciente.cud_ruta}" target="_blank">Ver PDF</a></p>` : ""}
    `;

    tabla.innerHTML = filas.length
      ? filas.map(f => `
          <tr>
            <td>${f.especialidad}</td>
            <td>${f.sesiones}</td>
            <td>${formatearMonto(f.precio)}</td>
            <td>${formatearMonto(f.subtotal)}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="4">No hay sesiones registradas.</td></tr>`;

    total.textContent = formatearMonto(montoTotal);

    return { paciente, filas, total: montoTotal, mes, anio };
  }

  function renderTutor() {
    obtenerResumenTutorActual();
  }

  async function renderProfesional() {
    const datosProfesional = document.getElementById("datosProfesional");
    const misPacientes = document.getElementById("misPacientes");
    const pacienteSelect = document.getElementById("pacienteProfesional");
    const datosPaciente = document.getElementById("datosPacienteProfesional");
    const tablaSesiones = document.getElementById("tablaSesionesProfesional");
    const listaObs = document.getElementById("listaObservaciones");
    const listaInf = document.getElementById("listaInformes");

    if (!datosProfesional) return;

    const usuarioId = sessionStorage.getItem("profesionalActivoUsuarioId");
    if (!usuarioId) {
      datosProfesional.innerHTML = "<p>No hay profesional activo.</p>";
      return;
    }

    const profesional = profesionalPorUsuarioId(usuarioId);
    if (!profesional) {
      datosProfesional.innerHTML = "<p>No se encontró el perfil profesional.</p>";
      return;
    }

    datosProfesional.innerHTML = `
      <p><strong>Nombre:</strong> ${profesional.nombre}</p>
      <p><strong>DNI:</strong> ${profesional.dni}</p>
      <p><strong>Profesión / Especialidad:</strong> ${profesional.especialidad_nombre}</p>
      <p><strong>Email:</strong> ${profesional.email || "-"}</p>
      <p><strong>Teléfono:</strong> ${profesional.telefono || "-"}</p>
    `;

    const sesionesPropias = state.sesiones.filter(s => String(s.profesional_id) === String(profesional.id));
    const idsPacientes = [...new Set(sesionesPropias.map(s => String(s.paciente_id)))];
    const pacientes = state.pacientes.filter(p => idsPacientes.includes(String(p.id)));

    if (misPacientes) {
      misPacientes.innerHTML = pacientes.length
        ? pacientes.map(p => `<li>${p.nombre}</li>`).join("")
        : "<li>No hay pacientes vinculados.</li>";
    }

    if (pacienteSelect) {
      const actual = pacienteSelect.value;
      pacienteSelect.innerHTML = `<option value="">Seleccionar paciente</option>`;
      pacientes.forEach(p => {
        pacienteSelect.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
      });
      if (actual && pacientes.some(p => String(p.id) === String(actual))) {
        pacienteSelect.value = actual;
      } else if (pacientes[0]) {
        pacienteSelect.value = pacientes[0].id;
      }
    }

    const pacienteId = pacienteSelect?.value;
    if (!pacienteId) {
      if (datosPaciente) datosPaciente.innerHTML = "<p>Seleccioná un paciente.</p>";
      if (tablaSesiones) tablaSesiones.innerHTML = `<tr><td colspan="4">No hay datos.</td></tr>`;
      if (listaObs) listaObs.innerHTML = "<p>No hay observaciones.</p>";
      if (listaInf) listaInf.innerHTML = "<p>No hay informes.</p>";
      return;
    }

    const paciente = state.pacientes.find(p => String(p.id) === String(pacienteId));

    if (datosPaciente && paciente) {
      datosPaciente.innerHTML = `
        <p><strong>Nombre:</strong> ${paciente.nombre}</p>
        <p><strong>DNI:</strong> ${paciente.dni}</p>
        <p><strong>Fecha de nacimiento:</strong> ${paciente.fecha_nacimiento || "-"}</p>
        <p><strong>Tutor:</strong> ${paciente.tutor_nombre || nombreUsuarioPorId(paciente.tutor_usuario_id)}</p>
        ${paciente.cud_ruta ? `<p><strong>CUD:</strong> <a href="${paciente.cud_ruta}" target="_blank">Ver PDF</a></p>` : ""}
      `;
    }

    const sesionesPaciente = sesionesPropias.filter(s => String(s.paciente_id) === String(pacienteId));

    if (tablaSesiones) {
      tablaSesiones.innerHTML = sesionesPaciente.length
        ? sesionesPaciente.map(s => `
            <tr>
              <td>${s.mes} ${s.anio}</td>
              <td>${s.cantidad}</td>
              <td>${s.especialidad_nombre}</td>
              <td>${formatearMonto(s.subtotal)}</td>
            </tr>
          `).join("")
        : `<tr><td colspan="4">No hay sesiones registradas.</td></tr>`;
    }

    try {
      state.observaciones = await fetchJSON(`${API.observaciones}/paciente/${pacienteId}`);
      state.informes = await fetchJSON(`${API.informes}/paciente/${pacienteId}`);
    } catch (error) {
      console.error(error);
      state.observaciones = [];
      state.informes = [];
    }

    if (listaObs) {
      listaObs.innerHTML = state.observaciones.length
        ? state.observaciones.map(o => `
            <div class="bloque-item">
              <p><strong>${o.profesional_nombre}</strong> - ${o.especialidad_nombre}</p>
              <p><small>${new Date(o.fecha).toLocaleString("es-AR")}</small></p>
              <p>${o.observacion}</p>
            </div>
          `).join("")
        : "<p>No hay observaciones cargadas.</p>";
    }

    if (listaInf) {
      listaInf.innerHTML = state.informes.length
        ? state.informes.map(i => `
            <div class="bloque-item">
              <p><strong>${i.profesional_nombre}</strong> - ${i.especialidad_nombre}</p>
              <p><small>${new Date(i.fecha).toLocaleString("es-AR")}</small></p>
              <p><a href="${i.ruta}" target="_blank">${i.nombre_original}</a></p>
            </div>
          `).join("")
        : "<p>No hay informes cargados.</p>";
    }
  }

  window.editarUsuario = function(id) {
    const u = state.usuarios.find(x => String(x.id) === String(id));
    if (!u) return;
    document.getElementById("editandoUsuarioId").value = u.id;
    document.getElementById("nombreUsuario").value = u.nombre;
    document.getElementById("dniUsuario").value = u.dni;
    document.getElementById("rolUsuario").value = u.rol;
    document.getElementById("telefonoUsuario").value = u.telefono || "";
    document.getElementById("emailUsuario").value = u.email || "";
    document.getElementById("activoUsuario").value = String(u.activo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.editarEspecialidad = function(id) {
    const e = state.especialidades.find(x => String(x.id) === String(id));
    if (!e) return;
    document.getElementById("editandoEspecialidadId").value = e.id;
    document.getElementById("nombreEspecialidad").value = e.nombre;
    document.getElementById("precioSesion").value = e.precio_sesion;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.editarProfesional = function(id) {
    const p = state.profesionales.find(x => String(x.id) === String(id));
    if (!p) return;
    document.getElementById("editandoProfesionalId").value = p.id;
    document.getElementById("usuarioProfesional").value = p.usuario_id;
    document.getElementById("especialidadProfesional").value = p.especialidad_id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.editarPaciente = function(id) {
    const p = state.pacientes.find(x => String(x.id) === String(id));
    if (!p) return;
    document.getElementById("editandoPacienteId").value = p.id;
    document.getElementById("nombrePaciente").value = p.nombre;
    document.getElementById("dniPaciente").value = p.dni;
    document.getElementById("fechaNacimiento").value = p.fecha_nacimiento || "";
    document.getElementById("tutorUsuario").value = p.tutor_usuario_id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.editarSesion = function(id) {
    const s = state.sesiones.find(x => String(x.id) === String(id));
    if (!s) return;
    document.getElementById("editandoSesionId").value = s.id;
    document.getElementById("pacienteSesion").value = s.paciente_id;
    document.getElementById("profesionalSesion").value = s.profesional_id;
    document.getElementById("mesSesion").value = s.mes;
    document.getElementById("anioSesion").value = s.anio;
    document.getElementById("especialidadSesion").value = s.especialidad_id;
    document.getElementById("cantidadSesiones").value = s.cantidad;
    document.getElementById("precioUnitario").value = s.precio;
    document.getElementById("subtotal").value = s.subtotal;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.eliminarUsuario = async function(id) {
    if (!confirm("¿Eliminar este usuario?")) return;
    await fetchJSON(`${API.usuarios}/${id}`, { method: "DELETE" });
    await refrescarTodo();
  };

  window.eliminarEspecialidad = async function(id) {
    if (!confirm("¿Eliminar esta especialidad?")) return;
    await fetchJSON(`${API.especialidades}/${id}`, { method: "DELETE" });
    await refrescarTodo();
  };

  window.eliminarProfesional = async function(id) {
    if (!confirm("¿Eliminar este profesional?")) return;
    await fetchJSON(`${API.profesionales}/${id}`, { method: "DELETE" });
    await refrescarTodo();
  };

  window.eliminarPaciente = async function(id) {
    if (!confirm("¿Eliminar este paciente?")) return;
    await fetchJSON(`${API.pacientes}/${id}`, { method: "DELETE" });
    await refrescarTodo();
  };

  window.eliminarSesion = async function(id) {
    if (!confirm("¿Eliminar esta sesión?")) return;
    await fetchJSON(`${API.sesiones}/${id}`, { method: "DELETE" });
    await refrescarTodo();
  };

  async function refrescarTodo() {
    await cargarDatosBase();
    cargarSelectUsuariosProfesionales();
    cargarSelectTutores();
    cargarSelectEspecialidades();
    cargarSelectPacientes();
    cargarSelectProfesionalesSesion();
    renderSecretaria();
    renderTutor();
    await renderProfesional();
    await renderResumenAdministrativo();
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const dni = document.getElementById("dniIngreso").value.trim();

      try {
        const data = await fetchJSON(`${API.auth}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dni })
        });

        sessionStorage.removeItem("profesionalActivoUsuarioId");
        sessionStorage.removeItem("tutorActivoId");

        if (data.rol === "secretaria") {
          window.location.href = "/public/pages/secretaria.html";
          return;
        }

        if (data.rol === "profesional") {
          sessionStorage.setItem("profesionalActivoUsuarioId", data.usuario.id);
          window.location.href = "/public/pages/profesional.html";
          return;
        }

        if (data.rol === "tutor") {
          sessionStorage.setItem("tutorActivoId", data.usuario.id);
          window.location.href = "/public/pages/tutor.html";
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const formUsuario = document.getElementById("formUsuario");
  if (formUsuario) {
    formUsuario.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editandoUsuarioId").value;
      const payload = {
        nombre: document.getElementById("nombreUsuario").value.trim(),
        dni: document.getElementById("dniUsuario").value.trim(),
        rol: document.getElementById("rolUsuario").value,
        telefono: document.getElementById("telefonoUsuario").value.trim(),
        email: document.getElementById("emailUsuario").value.trim(),
        activo: document.getElementById("activoUsuario").value === "true"
      };

      try {
        if (id) {
          await fetchJSON(`${API.usuarios}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          await fetchJSON(API.usuarios, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }

        limpiarFormulario("formUsuario", "editandoUsuarioId");
        await refrescarTodo();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const formEspecialidad = document.getElementById("formEspecialidad");
  if (formEspecialidad) {
    formEspecialidad.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("editandoEspecialidadId").value;
      const payload = {
        nombre: document.getElementById("nombreEspecialidad").value.trim(),
        precio_sesion: Number(document.getElementById("precioSesion").value)
      };

      try {
        if (id) {
          await fetchJSON(`${API.especialidades}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          await fetchJSON(API.especialidades, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
        limpiarFormulario("formEspecialidad", "editandoEspecialidadId");
        await refrescarTodo();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const formProfesional = document.getElementById("formProfesional");
  if (formProfesional) {
    formProfesional.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("editandoProfesionalId").value;
      const payload = {
        usuario_id: Number(document.getElementById("usuarioProfesional").value),
        especialidad_id: Number(document.getElementById("especialidadProfesional").value)
      };

      try {
        if (id) {
          await fetchJSON(`${API.profesionales}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          await fetchJSON(API.profesionales, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
        limpiarFormulario("formProfesional", "editandoProfesionalId");
        await refrescarTodo();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const formPaciente = document.getElementById("formPaciente");
  if (formPaciente) {
    formPaciente.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("editandoPacienteId").value;

      const fd = new FormData();
      fd.append("nombre", document.getElementById("nombrePaciente").value.trim());
      fd.append("dni", document.getElementById("dniPaciente").value.trim());
      fd.append("fecha_nacimiento", document.getElementById("fechaNacimiento").value);
      fd.append("tutor_usuario_id", document.getElementById("tutorUsuario").value);

      const archivo = document.getElementById("cudPaciente").files[0];
      if (archivo) fd.append("cud", archivo);

      try {
        if (id) {
          await fetchFormData(`${API.pacientes}/${id}`, fd, "PUT");
        } else {
          await fetchFormData(API.pacientes, fd, "POST");
        }
        limpiarFormulario("formPaciente", "editandoPacienteId");
        await refrescarTodo();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const formSesion = document.getElementById("formSesion");
  if (formSesion) {
    formSesion.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("editandoSesionId").value;

      const payload = {
        paciente_id: Number(document.getElementById("pacienteSesion").value),
        profesional_id: Number(document.getElementById("profesionalSesion").value),
        especialidad_id: Number(document.getElementById("especialidadSesion").value),
        mes: document.getElementById("mesSesion").value,
        anio: Number(document.getElementById("anioSesion").value),
        cantidad: Number(document.getElementById("cantidadSesiones").value),
        precio: Number(document.getElementById("precioUnitario").value),
        subtotal: Number(document.getElementById("subtotal").value)
      };

      try {
        if (id) {
          await fetchJSON(`${API.sesiones}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          await fetchJSON(API.sesiones, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
        limpiarFormulario("formSesion", "editandoSesionId");
        await refrescarTodo();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const selectProfesionalSesion = document.getElementById("profesionalSesion");
  const selectEspecialidadSesion = document.getElementById("especialidadSesion");
  const precioUnitario = document.getElementById("precioUnitario");
  const cantidadSesiones = document.getElementById("cantidadSesiones");
  const subtotal = document.getElementById("subtotal");

  function recalcularSubtotal() {
    if (!subtotal) return;
    subtotal.value = (Number(cantidadSesiones?.value || 0) * Number(precioUnitario?.value || 0));
  }

  if (cantidadSesiones) cantidadSesiones.addEventListener("input", recalcularSubtotal);
  if (precioUnitario) precioUnitario.addEventListener("input", recalcularSubtotal);

  if (selectProfesionalSesion) {
    selectProfesionalSesion.addEventListener("change", () => {
      const profesional = state.profesionales.find(p => String(p.id) === String(selectProfesionalSesion.value));
      if (!profesional) return;
      if (selectEspecialidadSesion) selectEspecialidadSesion.value = profesional.especialidad_id;

      const esp = state.especialidades.find(e => String(e.id) === String(profesional.especialidad_id));
      if (esp && precioUnitario) precioUnitario.value = esp.precio_sesion;

      recalcularSubtotal();
    });
  }

  if (selectEspecialidadSesion) {
    selectEspecialidadSesion.addEventListener("change", () => {
      const esp = state.especialidades.find(e => String(e.id) === String(selectEspecialidadSesion.value));
      if (esp && precioUnitario) precioUnitario.value = esp.precio_sesion;
      recalcularSubtotal();
    });
  }

  const formObservacion = document.getElementById("formObservacionProfesional");
  if (formObservacion) {
    formObservacion.addEventListener("submit", async (e) => {
      e.preventDefault();

      const usuarioId = sessionStorage.getItem("profesionalActivoUsuarioId");
      const profesional = profesionalPorUsuarioId(usuarioId);
      const pacienteId = document.getElementById("pacienteProfesional")?.value;
      const observacion = document.getElementById("textoObservacion").value.trim();

      if (!profesional || !pacienteId || !observacion) {
        alert("Seleccioná paciente y escribí una observación.");
        return;
      }

      try {
        await fetchJSON(API.observaciones, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paciente_id: Number(pacienteId),
            profesional_id: profesional.id,
            observacion
          })
        });

        formObservacion.reset();
        await renderProfesional();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const formInforme = document.getElementById("formInformeProfesional");
  if (formInforme) {
    formInforme.addEventListener("submit", async (e) => {
      e.preventDefault();

      const usuarioId = sessionStorage.getItem("profesionalActivoUsuarioId");
      const profesional = profesionalPorUsuarioId(usuarioId);
      const pacienteId = document.getElementById("pacienteProfesional")?.value;
      const archivo = document.getElementById("archivoInforme").files[0];

      if (!profesional || !pacienteId || !archivo) {
        alert("Seleccioná paciente y adjuntá un PDF.");
        return;
      }

      const fd = new FormData();
      fd.append("paciente_id", pacienteId);
      fd.append("profesional_id", profesional.id);
      fd.append("informe", archivo);

      try {
        await fetchFormData(API.informes, fd, "POST");
        formInforme.reset();
        await renderProfesional();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const pacienteProfesional = document.getElementById("pacienteProfesional");
  if (pacienteProfesional) {
    pacienteProfesional.addEventListener("change", renderProfesional);
  }

  const pacienteTutor = document.getElementById("pacienteTutor");
  const mesTutor = document.getElementById("mesTutor");
  const anioTutor = document.getElementById("anioTutor");
  if (pacienteTutor) pacienteTutor.addEventListener("change", renderTutor);
  if (mesTutor) mesTutor.addEventListener("change", renderTutor);
  if (anioTutor) anioTutor.addEventListener("input", renderTutor);

  const buscarUsuario = document.getElementById("buscarUsuario");
  const buscarEspecialidad = document.getElementById("buscarEspecialidad");
  const buscarProfesional = document.getElementById("buscarProfesional");
  const buscarPaciente = document.getElementById("buscarPaciente");
  const buscarSesion = document.getElementById("buscarSesion");

  if (buscarUsuario) buscarUsuario.addEventListener("input", renderListaUsuarios);
  if (buscarEspecialidad) buscarEspecialidad.addEventListener("input", renderListaEspecialidades);
  if (buscarProfesional) buscarProfesional.addEventListener("input", renderListaProfesionales);
  if (buscarPaciente) buscarPaciente.addEventListener("input", renderListaPacientes);
  if (buscarSesion) buscarSesion.addEventListener("input", renderListaSesiones);

  document.getElementById("cancelarUsuario")?.addEventListener("click", () => limpiarFormulario("formUsuario", "editandoUsuarioId"));
  document.getElementById("cancelarEspecialidad")?.addEventListener("click", () => limpiarFormulario("formEspecialidad", "editandoEspecialidadId"));
  document.getElementById("cancelarProfesional")?.addEventListener("click", () => limpiarFormulario("formProfesional", "editandoProfesionalId"));
  document.getElementById("cancelarPaciente")?.addEventListener("click", () => limpiarFormulario("formPaciente", "editandoPacienteId"));
  document.getElementById("cancelarSesion")?.addEventListener("click", () => limpiarFormulario("formSesion", "editandoSesionId"));

  document.getElementById("btnImprimirResumen")?.addEventListener("click", () => {
    const resumen = obtenerResumenTutorActual();
    if (!resumen) return;

    const filasHtml = resumen.filas.map(f => `
      <tr>
        <td>${f.especialidad}</td>
        <td>${f.sesiones}</td>
        <td>${formatearMonto(f.precio)}</td>
        <td>${formatearMonto(f.subtotal)}</td>
      </tr>
    `).join("");

    const ventana = window.open("", "_blank", "width=900,height=700");
    ventana.document.write(`
      <html>
      <head>
        <title>Resumen mensual</title>
        <style>
          body{font-family:Arial;padding:30px;}
          table{width:100%;border-collapse:collapse;}
          th,td{border:1px solid #ccc;padding:10px;text-align:left;}
        </style>
      </head>
      <body>
        <h1>Consultorios KANA</h1>
        <h2>Resumen mensual</h2>
        <p><strong>Paciente:</strong> ${resumen.paciente.nombre}</p>
        <table>
          <thead>
            <tr>
              <th>Especialidad</th>
              <th>Sesiones</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>${filasHtml}</tbody>
        </table>
        <p><strong>Total:</strong> ${formatearMonto(resumen.total)}</p>
      </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  });

  document.getElementById("mesResumen")?.addEventListener("change", renderResumenAdministrativo);
  document.getElementById("anioResumen")?.addEventListener("input", renderResumenAdministrativo);

  refrescarTodo().catch(console.error);
});