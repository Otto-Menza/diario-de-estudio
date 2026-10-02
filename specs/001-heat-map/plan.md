# Plan 001: Mapa de calor de estudio

## Archivos a modificar

| Archivo | Responsabilidad | RF cubiertos |
|---|---|---|
| `index.html` | Añadir la sección del mapa de calor entre el formulario y el historial | RF-6 |
| `styles.css` | Estilos del mapa: grid de 7 columnas, colores de fondo, tooltip | RF-2, RF-3, RF-4, RF-5 |
| `app.js` | Lógica del mapa: cálculo de minutos, colores, renderizado y tooltip | RF-1, RF-2, RF-3, RF-4, RF-5, RF-7, RF-8, RF-9, RF-10 |

No se crean nuevos archivos. No se añaden dependencias.

## Funciones puras de lógica (sin DOM)

Todas reciben `hoy` como parámetro para facilitar tests y respetar RF-10.

### `obtenerMinutosPorDia(sesiones, hoy)`
- **Entrada**: array de sesiones `{ fecha, tema, minutos }`, fecha `hoy` (texto "AAAA-MM-DD")
- **Salida**: objeto `{ "AAAA-MM-DD": minutosTotales, ... }`
- **Comportamiento**:
  - Filtra sesiones con fecha anterior a hace 8 semanas (ignora fuera de rango, RF-1)
  - Suma minutos por día (múltiples sesiones mismo día, caso límite)
  - Ignora minutos no válidos (0, negativo, no numérico) como datos corruptos
  - Nunca usa `toISOString()` ni `new Date("AAAA-MM-DD")` (RF-10)

### `calcularNivelVerde(minutos)`
- **Entrada**: minutos (número)
- **Salida**: número 1-4 (nivel de verde)
- **Comportamiento**:
  - 0 minutos → 0 (sin sesión, gris)
  - 1-150 minutos → 1 (verde claro)
  - 151-300 minutos → 2 (verde medio-claro)
  - 301-450 minutos → 3 (verde medio-oscuro)
  - 451-600 minutos → 4 (verde oscuro)
  - Proporcionalidad lineal con 4 niveles uniformes (RF-2)

### `esDiaFuturo(fecha, hoy)`
- **Entrada**: fecha del día, fecha de hoy (texto "AAAA-MM-DD")
- **Salida**: boolean
- **Comportamiento**: devuelve `true` si `fecha > hoy` (RF-4)

### `generarDiasMapa(hoy)`
- **Entrada**: fecha de hoy (texto "AAAA-MM-DD")
- **Salida**: array de fechas "AAAA-MM-DD" desde el lunes de hace 8 semanas hasta hoy
- **Comportamiento**:
  - Calcula el lunes de la semana actual
  - Retrocede 7 semanas más (8 semanas totales incluyendo actual)
  - Genera todos los días desde ese lunes hasta hoy
  - Usa fecha local, nunca UTC (RF-10)

## Algoritmo del mapa en pseudocódigo

```
function renderizarMapaCalor(sesiones, hoy):
    minutosPorDia = obtenerMinutosPorDia(sesiones, hoy)
    dias = generarDiasMapa(hoy)
    
    para cada dia en dias:
        minutos = minutosPorDia[dia] ?? 0
        esFuturo = esDiaFuturo(dia, hoy)
        
        si esFuturo:
            color = "transparent"
        si no:
            nivel = calcularNivelVerde(minutos)
            color = colorSegunNivel(nivel)  // 0=gris, 1-4=verdes
        
        celda = crearCelda(dia, color, minutos, esFuturo)
        agregarAlGrid(celda)
```

## Cómo se pinta en la interfaz

### Estructura HTML (RF-6)
```html
<section class="tarjeta mapa-calor">
  <h2>Últimas 8 semanas</h2>
  <div class="mapa-grid" id="mapaGrid"></div>
</section>
```

### CSS (RF-2, RF-3, RF-4, RF-5)
- `.mapa-grid`: CSS Grid de 7 columnas, gap de 4px
- `.celda`: aspect-ratio 1, border-radius 4px, color de fondo según nivel
- Colores:
  - Nivel 0 (sin sesión): `#ebedf0` (gris claro)
  - Nivel 1: `#9be9a8` (verde claro)
  - Nivel 2: `#40c463` (verde medio-claro)
  - Nivel 3: `#30a14e` (verde medio-oscuro)
  - Nivel 4: `#216e39` (verde oscuro)
  - Futuro: `transparent`
- Tooltip: `position: absolute`, aparece en `:hover` solo en escritorio (media query `hover: hover`)

### JavaScript (RF-5, RF-7)
- `pintarMapaCalor(sesiones)`: llama a las funciones puras y pinta el grid
- Tooltip: `mouseenter` y `mouseleave` en cada celda (solo si no es futuro)
- Contenido tooltip: `"30 min"` o `"Sin estudio"`

## Decisiones técnicas justificadas

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| CSS Grid de 7 columnas | Simple, responsive, sin cálculos manuales | Flexbox con wraps (más complejo de alinear) |
| 4 niveles de verde discretos | Más simple que gradiente continuo, fácil de testear | Gradiente lineal con `calc()` (difícil de verificar en tests) |
| Funciones puras con `hoy` como parámetro | Permite tests sin mockear Date, respeta RF-7 | Usar `new Date()` directamente en las funciones (imposible de testear sin mocks) |
| Tooltip con `mouseenter`/`mouseleave` | Simple, no requiere librerías | Librería de tooltips (viola RF-9) |
| Media query `hover: hover` para tooltip | Solo muestra tooltip en dispositivos con ratón | Mostrar tooltip también en móvil (viola RF-5) |
| Colores fijos en CSS | Fácil de verificar y cambiar | Colores calculados en JS (mezcla lógica con interfaz, viola RF-7) |

## Estrategia de tests con `node --test`

### Archivo de tests: `tests/heat-map.test.js`

**Tests para `obtenerMinutosPorDia`:**
- Suma minutos correctamente de múltiples sesiones en el mismo día
- Ignora sesiones fuera de rango (más de 8 semanas)
- Ignora minutos no válidos (0, negativo, no numérico)
- Devuelve objeto vacío si no hay sesiones

**Tests para `calcularNivelVerde`:**
- Devuelve 0 para 0 minutos
- Devuelve 1 para 1-150 minutos
- Devuelve 2 para 151-300 minutos
- Devuelve 3 para 301-450 minutos
- Devuelve 4 para 451-600 minutos
- Devuelve 4 para más de 600 minutos (clamp)

**Tests para `esDiaFuturo`:**
- Devuelve `true` para fecha posterior a hoy
- Devuelve `false` para fecha igual a hoy
- Devuelve `false` para fecha anterior a hoy

**Tests para `generarDiasMapa`:**
- Devuelve exactamente 56 días (8 semanas × 7 días)
- El último día es hoy
- El primer día es un lunes
- Incluye la semana actual

### Ejecución de tests
```bash
node --test tests/heat-map.test.js
```

### Criterios de aceptación de tests
- Todos los tests pasan
- No hay errores en consola
- Los tests cubren todos los casos límite del spec
