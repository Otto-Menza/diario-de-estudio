# Constitución del Diario de Estudio

1. **Stack cero dependencias**: HTML, CSS y JavaScript puros. Sin frameworks, npm, bundler ni build.
2. **El código es la spec**: las reglas de fechas y racha de AGENTS.md se implementan literalmente en app.js.
3. **Lógica separada de interfaz**: las funciones de cálculo (racha, semana, mes) nunca tocan el DOM.
4. **Verificación manual**: después de cada cambio, probar con Chrome DevTools (funcionalidad, consola, móvil). Sin tests automáticos ni dependencias.
5. **Datos del usuario protegidos**: todo se guarda en localStorage. Nunca se envían datos a servidores externos.