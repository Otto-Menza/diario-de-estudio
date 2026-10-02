# Tareas 001: Mapa de calor de estudio

## Fase 1: Tests de lógica pura

- [x] **T1.1**: Crear `tests/heat-map.test.js` con tests para `obtenerMinutosPorDia`
  - **RF**: RF-1, RF-8, RF-10
  - **Hecho cuando**: `node --test tests/heat-map.test.js` pasa los tests de suma de minutos, fuera de rango, minutos no válidos y array vacío.

- [x] **T1.2**: Añadir tests para `calcularNivelVerde`
  - **RF**: RF-2
  - **Hecho cuando**: Los tests verifican los 4 niveles de verde (0, 1-150, 151-300, 301-450, 451-600) y el clamp a 4 para valores superiores.

- [x] **T1.3**: Añadir tests para `esDiaFuturo`
  - **RF**: RF-4
  - **Hecho cuando**: Los tests verifican `true` para fecha futura, `false` para hoy y `false` para fecha pasada.

- [x] **T1.4**: Añadir tests para `generarDiasMapa`
  - **RF**: RF-1, RF-10
  - **Hecho cuando**: Los tests verifican 56 días, último día es hoy, primer día es lunes, incluye semana actual.

## Fase 2: Implementación de lógica pura

- [x] **T2.1**: Implementar `obtenerMinutosPorDia(sesiones, hoy)` en `app.js`
  - **RF**: RF-1, RF-8, RF-10
  - **Hecho cuando**: La función filtra fuera de rango, suma minutos por día, ignora minutos no válidos y pasa los tests de T1.1.

- [x] **T2.2**: Implementar `calcularNivelVerde(minutos)` en `app.js`
  - **RF**: RF-2
  - **Hecho cuando**: La función devuelve 0-4 según los rangos y pasa los tests de T1.2.

- [x] **T2.3**: Implementar `esDiaFuturo(fecha, hoy)` en `app.js`
  - **RF**: RF-4
  - **Hecho cuando**: La función compara fechas correctamente y pasa los tests de T1.3.

- [x] **T2.4**: Implementar `generarDiasMapa(hoy)` en `app.js`
  - **RF**: RF-1, RF-10
  - **Hecho cuando**: La función genera 56 días desde lunes de hace 8 semanas hasta hoy y pasa los tests de T1.4.

## Fase 3: Interfaz de usuario

- [x] **T3.1**: Añadir estructura HTML del mapa en `index.html`
  - **RF**: RF-6
  - **Hecho cuando**: La sección `<section class="tarjeta mapa-calor">` está entre el formulario y el historial.

- [x] **T3.2**: Añadir estilos CSS del mapa en `styles.css`
  - **RF**: RF-2, RF-3, RF-4, RF-5
  - **Hecho cuando**: El grid de 7 columnas, los 4 verdes, el gris, el transparente y el tooltip están definidos.

- [x] **T3.3**: Implementar `pintarMapaCalor(sesiones)` en `app.js`
  - **RF**: RF-1, RF-2, RF-3, RF-4, RF-7
  - **Hecho cuando**: La función llama a las funciones puras y pinta el grid con los colores correctos.

- [x] **T3.4**: Implementar tooltip en `app.js`
  - **RF**: RF-5
  - **Hecho cuando**: El tooltip muestra "30 min" o "Sin estudio" al pasar el ratón en escritorio, y no aparece en móvil.

- [x] **T3.5**: Integrar `pintarMapaCalor` en `pintarTodo`
  - **RF**: RF-1, RF-6
  - **Hecho cuando**: El mapa se pinta al cargar la página y al registrar una nueva sesión.

## Fase 4: Verificación

- [ ] **T4.1**: Ejecutar tests automáticos
  - **RF**: Todos
  - **Hecho cuando**: `node --test tests/heat-map.test.js` pasa todos los tests sin errores.

- [ ] **T4.2**: Verificación manual con Chrome DevTools
  - **RF**: Todos
  - **Hecho cuando**: El mapa muestra colores correctos, tooltip en escritorio, transparencia en futuros, sin errores en consola, legible en móvil (375px).
