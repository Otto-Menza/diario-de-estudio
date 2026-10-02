# Spec 001: Mapa de calor de estudio

## Contexto y objetivo

El Diario de Estudio ya muestra la racha actual, la mejor racha, los minutos de la semana y los días del mes. Sin embargo, el usuario no puede ver de un vistazo cómo ha sido su estudio a lo largo de las últimas semanas. El objetivo de esta funcionalidad es añadir un mapa de calor tipo GitHub que muestre visualmente los días estudiados de las últimas 8 semanas (incluyendo la semana actual), donde la intensidad del color refleja los minutos estudiados.

## Usuarios

- **Usuario principal**: alguien que está aprendiendo a programar y registra sus sesiones de estudio. Quiere ver su progreso de forma visual y motivarse.

## Historias de usuario

- Como usuario, quiero ver un mapa de calor de las últimas 8 semanas para identificar rápidamente qué días estudié y cuánto.
- Como usuario, quiero pasar el ratón por un día (en escritorio) y ver los minutos exactos para conocer el detalle sin buscar en el historial.
- Como usuario, quiero que los días sin sesión se distingan claramente de los días con sesión.

## Requisitos funcionales

### RF-1: Mostrar las últimas 8 semanas
**Cuando** el usuario abre la aplicación, **el sistema debe** mostrar un mapa de calor con las últimas 8 semanas (incluyendo la semana actual), organizadas en filas de 7 días (lunes a domingo). Las sesiones con fecha anterior a las últimas 8 semanas se ignoran.

### RF-2: Color según minutos estudiados
**Cuando** un día tiene al menos una sesión registrada, **el sistema debe** colorear ese día en una escala de 4 verdes proporcional a los minutos estudiados. La proporcionalidad es lineal: el verde más claro corresponde a 1 minuto y el verde más oscuro a 600 minutos (el máximo permitido). Los 4 niveles de verde se distribuyen uniformemente en este rango.

### RF-3: Días sin sesión en gris
**Cuando** un día no tiene ninguna sesión registrada, **el sistema debe** mostrar ese día en gris claro. Esto incluye el día actual si todavía no se ha registrado ninguna sesión.

### RF-4: Días futuros transparentes
**Cuando** un día está dentro de las últimas 8 semanas pero es posterior a hoy, **el sistema debe** mostrar ese día en color transparente (sin fondo).

### RF-5: Tooltip con minutos (solo escritorio)
**Cuando** el usuario pasa el ratón por encima de un día con sesión en un dispositivo de escritorio, **el sistema debe** mostrar un tooltip con el formato "30 min". Si el día no tiene sesión, el tooltip indica "Sin estudio". En dispositivos móviles no se muestra ningún tooltip ni interacción.

### RF-6: Ubicación en la página
**Cuando** se muestre el mapa de calor, **el sistema debe** colocarlo entre la tarjeta del formulario y la tarjeta del historial.

### RF-7: Cálculo de colores separado de la interfaz
**Cuando** se calcula el color de un día, **el sistema debe** realizar este cálculo en una función separada de la renderización del mapa. La función de cálculo recibe los minutos y devuelve el color, sin tocar el DOM.

### RF-8: Datos protegidos
**Cuando** se muestre el mapa de calor, **el sistema debe** obtener los datos exclusivamente de localStorage. Nunca se envían datos a servidores externos.

### RF-9: Sin dependencias
**Cuando** se implemente el mapa de calor, **el sistema debe** utilizar únicamente HTML, CSS y JavaScript puros. No se permiten librerías, frameworks ni dependencias externas.

### RF-10: Configuración de zona horaria
**Cuando** se calculen las fechas del mapa de calor, **el sistema debe** utilizar siempre la zona horaria local del usuario. Nunca se deben usar funciones que conviertan a UTC (como `toISOString()`).

## Requisitos no funcionales

- El mapa de calor debe ser legible en pantallas de móvil (375px de ancho).
- Los colores deben tener suficiente contraste para distinguir los diferentes niveles de intensidad.
- El tooltip debe aparecer y desaparecer sin retraso perceptible en escritorio.

## Casos límite

- **Día con múltiples sesiones**: si un día tiene varias sesiones, la suma de todos los minutos determina la intensidad del color.
- **Días futuros**: los días futuros dentro de las últimas 8 semanas se muestran en transparente y no tienen tooltip.
- **Sin datos**: si no hay ninguna sesión registrada, todo el mapa se muestra en gris claro (excepto los días futuros, que son transparentes).
- **Minutos muy altos**: si un día tiene 600 minutos (el máximo permitido), el color debe ser el verde más oscuro de la escala.
- **Datos corruptos**: si en localStorage hay una sesión con minutos no válidos (0, negativo o no numérico), se trata como si no tuviera sesión.
- **Sesiones fuera de rango**: las sesiones con fecha anterior a las últimas 8 semanas se ignoran y no se muestran en el mapa.

## Fuera de alcance

- No se incluye la posibilidad de hacer clic en un día para ver el detalle de las sesiones.
- No se incluye un selector de rango de semanas (siempre son las últimas 8, incluyendo la actual).
- No se incluye exportación ni compartir el mapa.
- No se incluyen animaciones de transición al mostrar el mapa.
- No se incluye interacción táctil ni tooltip en dispositivos móviles.

## Criterios de finalización

- El mapa de calor muestra las últimas 8 semanas (incluyendo la actual) con los colores correctos según los minutos.
- Los días sin sesión se muestran en gris claro.
- Los días futuros se muestran en transparente.
- El tooltip aparece al pasar el ratón en escritorio y muestra "30 min" o "Sin estudio".
- No hay tooltip ni interacción en móvil.
- El mapa se encuentra entre el formulario y el historial.
- La consola no muestra errores al interactuar con el mapa.
- La vista en móvil (375px) es legible y el mapa no se desborda.
- El cálculo de colores está separado de la renderización.
- No se han añadido dependencias ni librerías.

## Dudas abiertas

- [NECESITA ACLARARACIÓN] ¿El tooltip debe mostrar también el tema estudiado o solo los minutos?
