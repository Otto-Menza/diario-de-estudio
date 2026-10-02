const { test } = require('node:test');
const assert = require('node:assert/strict');

// Implementación de las funciones puras (copia de app.js para tests en Node)
function fechaATexto(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function textoAFecha(texto) {
  const [anio, mes, dia] = texto.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

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

test('suma minutos correctamente de múltiples sesiones en el mismo día', () => {
  const sesiones = [
    { fecha: '2026-10-01', tema: 'Matemáticas', minutos: 30 },
    { fecha: '2026-10-01', tema: 'Física', minutos: 45 }
  ];
  const resultado = obtenerMinutosPorDia(sesiones, '2026-10-01');
  assert.equal(resultado['2026-10-01'], 75);
});

test('ignora sesiones fuera de rango (más de 8 semanas)', () => {
  const sesiones = [
    { fecha: '2026-10-01', tema: 'Matemáticas', minutos: 30 },
    { fecha: '2026-06-01', tema: 'Antigua', minutos: 999 }
  ];
  const resultado = obtenerMinutosPorDia(sesiones, '2026-10-01');
  assert.equal(resultado['2026-10-01'], 30);
  assert.equal(resultado['2026-06-01'], undefined);
});

test('ignora minutos no válidos (0, negativo, no numérico)', () => {
  const sesiones = [
    { fecha: '2026-10-01', tema: 'Matemáticas', minutos: 30 },
    { fecha: '2026-10-01', tema: 'Cero', minutos: 0 },
    { fecha: '2026-10-01', tema: 'Negativo', minutos: -10 },
    { fecha: '2026-10-01', tema: 'No numérico', minutos: 'abc' }
  ];
  const resultado = obtenerMinutosPorDia(sesiones, '2026-10-01');
  assert.equal(resultado['2026-10-01'], 30);
});

test('devuelve objeto vacío si no hay sesiones', () => {
  const resultado = obtenerMinutosPorDia([], '2026-10-01');
  assert.deepEqual(resultado, {});
});

// Tests para calcularNivelVerde
function calcularNivelVerde(minutos) {
  if (minutos <= 0) return 0;
  if (minutos <= 150) return 1;
  if (minutos <= 300) return 2;
  if (minutos <= 450) return 3;
  return 4;
}

test('calcularNivelVerde devuelve 0 para 0 minutos', () => {
  assert.equal(calcularNivelVerde(0), 0);
});

test('calcularNivelVerde devuelve 1 para 1-150 minutos', () => {
  assert.equal(calcularNivelVerde(1), 1);
  assert.equal(calcularNivelVerde(75), 1);
  assert.equal(calcularNivelVerde(150), 1);
});

test('calcularNivelVerde devuelve 2 para 151-300 minutos', () => {
  assert.equal(calcularNivelVerde(151), 2);
  assert.equal(calcularNivelVerde(225), 2);
  assert.equal(calcularNivelVerde(300), 2);
});

test('calcularNivelVerde devuelve 3 para 301-450 minutos', () => {
  assert.equal(calcularNivelVerde(301), 3);
  assert.equal(calcularNivelVerde(375), 3);
  assert.equal(calcularNivelVerde(450), 3);
});

test('calcularNivelVerde devuelve 4 para 451-600 minutos', () => {
  assert.equal(calcularNivelVerde(451), 4);
  assert.equal(calcularNivelVerde(525), 4);
  assert.equal(calcularNivelVerde(600), 4);
});

test('calcularNivelVerde hace clamp a 4 para valores superiores a 600', () => {
  assert.equal(calcularNivelVerde(601), 4);
  assert.equal(calcularNivelVerde(999), 4);
});

// Tests para esDiaFuturo
function esDiaFuturo(fecha, hoy) {
  return fecha > hoy;
}

test('esDiaFuturo devuelve true para fecha futura', () => {
  assert.equal(esDiaFuturo('2026-10-02', '2026-10-01'), true);
});

test('esDiaFuturo devuelve false para fecha igual a hoy', () => {
  assert.equal(esDiaFuturo('2026-10-01', '2026-10-01'), false);
});

test('esDiaFuturo devuelve false para fecha pasada', () => {
  assert.equal(esDiaFuturo('2026-09-30', '2026-10-01'), false);
});

// Tests para generarDiasMapa
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

test('generarDiasMapa devuelve exactamente 56 días', () => {
  const dias = generarDiasMapa('2026-10-01');
  assert.equal(dias.length, 56);
});

test('generarDiasMapa el último día es el domingo de la semana actual', () => {
  const dias = generarDiasMapa('2026-10-01');
  assert.equal(dias[dias.length - 1], '2026-10-04');
});

test('generarDiasMapa el primer día es un lunes', () => {
  const dias = generarDiasMapa('2026-10-01');
  const primerDia = new Date(dias[0]);
  assert.equal(primerDia.getDay(), 1); // 1 = lunes
});

test('generarDiasMapa incluye la semana actual', () => {
  const dias = generarDiasMapa('2026-10-01');
  assert.ok(dias.includes('2026-10-01'));
  assert.ok(dias.includes('2026-09-28'));
});
