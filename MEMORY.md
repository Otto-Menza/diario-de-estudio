# MEMORY.md

## Estado actual
- Funcionalidad: registrar sesiones (fecha, tema, minutos), racha actual, mejor racha, minutos esta semana, historial.
- Todo en localStorage, sin build ni dependencias.

## Decisiones
- Mejor racha: solo número, sin mostrar cuándo fue. Sin mensaje de "nuevo récord".
- Fechas futuras excluidas del cálculo de mejor racha (coherencia con racha actual).
- Algoritmo de mejor racha: fechas únicas ordenadas, buscar secuencia más larga de días consecutivos.
- Restricciones de entrada: fecha no futura, minutos 1-600, tema máx 100 caracteres. Validación doble: atributos HTML + submit.
- Minutos semanales: semana empieza en lunes (getDay() ajustado). Suma desde lunes hasta hoy.

## Errores a evitar
- No usar toISOString() ni new Date("AAAA-MM-DD") para fechas (problemas UTC).
- Al comprobar días consecutivos, no usar diferencia de milisegundos (falla con cambios de horario).
