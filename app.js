/* =========================================================
   Diario de Estudio - app.js
   Lógica de la aplicación: formulario, racha y localStorage.
   ========================================================= */

// Clave donde guardamos las sesiones en localStorage
const CLAVE_LOCAL = "diarioEstudio.sesiones";

// Elementos del DOM
const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const mensajeError = document.getElementById("error");
const rachaNumero = document.getElementById("rachaNumero");
const rachaTexto = document.getElementById("rachaTexto");
const mejorRacha = document.getElementById("mejorRacha");
const semanaMinutos = document.getElementById("semanaMinutos");
const mesDias = document.getElementById("mesDias");
const lista = document.getElementById("lista");
const avisoVacio = document.getElementById("vacio");

/* ---------- Utilidades de fechas (siempre hora local) ---------- */

// Devuelve la fecha de hoy como texto "YYYY-MM-DD" en hora local.
function hoyComoTexto() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Convierte un texto "YYYY-MM-DD" a un Date local (medianoche).
function textoAFecha(texto) {
  const [anio, mes, dia] = texto.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

// Formatea una fecha "YYYY-MM-DD" para mostrarla en español.
function formatearFecha(texto) {
  return textoAFecha(texto).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/* ---------- Datos ---------- */

// Carga las sesiones guardadas (array de { fecha, tema, minutos }).
function cargarSesiones() {
  const datos = localStorage.getItem(CLAVE_LOCAL);
  return datos ? JSON.parse(datos) : [];
}

// Guarda las sesiones en localStorage.
function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE_LOCAL, JSON.stringify(sesiones));
}

/* ---------- Racha ---------- */

// Calcula la racha: días consecutivos con sesión que terminan hoy.
// Si hoy no hay sesión pero sí ayer, la racha sigue viva.
function calcularRacha(sesiones) {
  // Conjunto con los días que tienen al menos una sesión
  const diasConSesion = new Set(sesiones.map((s) => s.fecha));

  // Empezamos por hoy; si hoy no hay sesión, empezamos por ayer.
  const hoy = new Date();
  let cursor = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (!diasConSesion.has(fechaATexto(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  // Contamos hacia atrás mientras cada día tenga sesión.
  let racha = 0;
  while (diasConSesion.has(fechaATexto(cursor))) {
    racha++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return racha;
}

// Igual que hoyComoTexto, pero sirve para cualquier Date.
function fechaATexto(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Calcula la mejor racha: la secuencia más larga de días consecutivos
// con al menos 1 sesión, sin incluir fechas futuras.
function calcularMejorRacha(sesiones) {
  const hoy = hoyComoTexto();
  const diasUnicos = [...new Set(sesiones.map((s) => s.fecha))]
    .filter((f) => f <= hoy)
    .sort();

  if (diasUnicos.length === 0) return 0;

  let mejor = 1;
  let actual = 1;

  for (let i = 1; i < diasUnicos.length; i++) {
    const anterior = textoAFecha(diasUnicos[i - 1]);
    const actualFecha = textoAFecha(diasUnicos[i]);

    // Comprobamos si son días consecutivos sumando 1 día al anterior
    const siguienteEsperado = new Date(anterior.getFullYear(), anterior.getMonth(), anterior.getDate() + 1);
    const esConsecutivo = actualFecha.getFullYear() === siguienteEsperado.getFullYear() &&
                          actualFecha.getMonth() === siguienteEsperado.getMonth() &&
                          actualFecha.getDate() === siguienteEsperado.getDate();

    if (esConsecutivo) {
      actual++;
      if (actual > mejor) mejor = actual;
    } else {
      actual = 1;
    }
  }

  return mejor;
}

// Calcula el total de minutos estudiados esta semana (lunes a hoy).
// Devuelve { total, inicioSemana, finSemana }.
function calcularMinutosSemana(sesiones) {
  const ahora = new Date();
  const diaSemana = ahora.getDay(); // 0 = domingo, 1 = lunes, ...
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;

  const lunes = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - diasDesdeLunes);
  const inicioSemana = fechaATexto(lunes);
  const finSemana = hoyComoTexto();

  const total = sesiones
    .filter((s) => s.fecha >= inicioSemana && s.fecha <= finSemana)
    .reduce((suma, s) => suma + s.minutos, 0);

  return { total, inicioSemana, finSemana };
}

// Calcula los días únicos estudiados este mes (mes actual, fecha local).
function calcularDiasMes(sesiones) {
  const ahora = new Date();
  const mesActual = String(ahora.getMonth() + 1).padStart(2, "0");
  const anioActual = ahora.getFullYear();

  const diasUnicos = new Set(
    sesiones
      .filter((s) => s.fecha.startsWith(`${anioActual}-${mesActual}`))
      .map((s) => s.fecha)
  );

  return diasUnicos.size;
}

/* ---------- Mapa de calor ---------- */

// Calcula los minutos totales por día de las últimas 8 semanas.
// Devuelve un objeto { "AAAA-MM-DD": minutosTotales }.
function obtenerMinutosPorDia(sesiones, hoy) {
  const inicio = textoAFecha(hoy);
  const inicioDate = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() - 56);
  const inicioTexto = fechaATexto(inicioDate);

  const minutosPorDia = {};

  for (const sesion of sesiones) {
    if (sesion.fecha < inicioTexto || sesion.fecha > hoy) continue;
    const minutos = Number(sesion.minutos);
    if (!Number.isFinite(minutos) || minutos <= 0) continue;
    minutosPorDia[sesion.fecha] = (minutosPorDia[sesion.fecha] || 0) + minutos;
  }

  return minutosPorDia;
}

// Calcula el nivel de verde (0-4) según los minutos estudiados.
function calcularNivelVerde(minutos) {
  if (minutos <= 0) return 0;
  if (minutos <= 150) return 1;
  if (minutos <= 300) return 2;
  if (minutos <= 450) return 3;
  return 4;
}

// Devuelve true si la fecha es posterior a hoy.
function esDiaFuturo(fecha, hoy) {
  return fecha > hoy;
}

// Genera un array de 56 fechas "AAAA-MM-DD" (8 semanas × 7 días) desde el lunes de hace 8 semanas hasta el domingo de la semana actual.
function generarDiasMapa(hoy) {
  const hoyDate = textoAFecha(hoy);
  const diaSemana = hoyDate.getDay();
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;

  const lunesActual = new Date(hoyDate.getFullYear(), hoyDate.getMonth(), hoyDate.getDate());
  lunesActual.setDate(lunesActual.getDate() - diasDesdeLunes);

  const inicio = new Date(lunesActual.getFullYear(), lunesActual.getMonth(), lunesActual.getDate());
  inicio.setDate(inicio.getDate() - 49);

  const dias = [];
  for (let i = 0; i < 56; i++) {
    const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
    dias.push(fechaATexto(cursor));
  }

  return dias;
}

/* ---------- Pintar la interfaz ---------- */

function pintarRacha(sesiones) {
  const racha = calcularRacha(sesiones);
  rachaNumero.textContent = racha;
  rachaTexto.textContent =
    racha === 1 ? "día de racha 🔥" : "días de racha 🔥";
}

function pintarMejorRacha(sesiones) {
  const mejor = calcularMejorRacha(sesiones);
  mejorRacha.textContent =
    mejor === 1 ? "Mejor racha: 1 día 🏆" : `Mejor racha: ${mejor} días 🏆`;
}

function pintarMinutosSemana(sesiones) {
  const { total, inicioSemana, finSemana } = calcularMinutosSemana(sesiones);
  const inicio = textoAFecha(inicioSemana).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const fin = textoAFecha(finSemana).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  semanaMinutos.textContent = `Esta semana (${inicio}-${fin}): ${total} min 📚`;
}

function pintarDiasMes(sesiones) {
  const dias = calcularDiasMes(sesiones);
  const ahora = new Date();
  const nombreMes = ahora.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  mesDias.textContent = `${nombreMes}: ${dias} días 📅`;
}

function pintarLista(sesiones) {
  // Ordenamos de más reciente a más antigua
  const ordenadas = [...sesiones].sort((a, b) => b.fecha.localeCompare(a.fecha));

  lista.innerHTML = "";
  avisoVacio.style.display = ordenadas.length === 0 ? "block" : "none";

  for (const sesion of ordenadas) {
    const item = document.createElement("li");

    const tema = document.createElement("span");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema;

    const detalle = document.createElement("span");
    detalle.className = "sesion-detalle";
    detalle.textContent = `${formatearFecha(sesion.fecha)} · ${sesion.minutos} min`;

    item.appendChild(tema);
    item.appendChild(detalle);
    lista.appendChild(item);
  }
}

function pintarMapaCalor(sesiones) {
  const mapaGrid = document.getElementById("mapaGrid");
  const hoy = hoyComoTexto();
  const minutosPorDia = obtenerMinutosPorDia(sesiones, hoy);
  const dias = generarDiasMapa(hoy);

  mapaGrid.innerHTML = "";

  for (const dia of dias) {
    const minutos = minutosPorDia[dia] || 0;
    const futuro = esDiaFuturo(dia, hoy);
    const nivel = futuro ? 0 : calcularNivelVerde(minutos);

    const celda = document.createElement("div");
    celda.className = futuro ? "celda futuro" : `celda nivel-${nivel}`;

    if (!futuro) {
      const tooltip = document.createElement("span");
      tooltip.className = "tooltip";
      tooltip.textContent = minutos > 0 ? `${minutos} min` : "Sin estudio";
      celda.appendChild(tooltip);
    }

    mapaGrid.appendChild(celda);
  }
}

function pintarTodo() {
  const sesiones = cargarSesiones();
  pintarRacha(sesiones);
  pintarMejorRacha(sesiones);
  pintarMinutosSemana(sesiones);
  pintarDiasMes(sesiones);
  pintarMapaCalor(sesiones);
  pintarLista(sesiones);
}

/* ---------- Eventos ---------- */

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  mensajeError.textContent = "";

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  // Validaciones sencillas con mensajes claros
  if (!fecha) {
    mensajeError.textContent = "Elige una fecha.";
    return;
  }
  if (fecha > hoyComoTexto()) {
    mensajeError.textContent = "La fecha no puede ser futura.";
    return;
  }
  if (!tema) {
    mensajeError.textContent = "Escribe el tema.";
    return;
  }
  if (!Number.isFinite(minutos) || minutos <= 0) {
    mensajeError.textContent = "Los minutos deben ser un número mayor que 0.";
    return;
  }
  if (minutos > 600) {
    mensajeError.textContent = "Los minutos no pueden ser más de 600.";
    return;
  }

  // Guardamos la sesión
  const sesiones = cargarSesiones();
  sesiones.push({ fecha, tema, minutos });
  guardarSesiones(sesiones);

  // Limpiamos el formulario (fecha vuelve a hoy, tema y minutos se vacían)
  campoTema.value = "";
  campoMinutos.value = "";
  campoFecha.value = hoyComoTexto();

  pintarTodo();
});

/* ---------- Arranque ---------- */

// La fecha del formulario empieza siendo hoy
campoFecha.value = hoyComoTexto();
pintarTodo();
