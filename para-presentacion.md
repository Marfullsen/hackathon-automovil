# Presentación Hackathon: Safe Drive Learning 🚑

**Proyecto:** Simulador 3D de Conducción para Licencia Clase B  
**Equipo:** Patricio Quintanilla Yevilao  
**Fecha de Evaluación:** 12 de Abril, 2026 (Presencial UFT)

---

## 📑 Guion de Presentación (10 Minutos)

### Slide 1: Portada y Objetivo
* **Título:** Safe Drive Learning.
* **Objetivo:** Transformar la educación vial en Chile mediante un simulador 3D inmersivo que refuerza la "Convivencia Vial" y reduce la brecha entre la teoría y la práctica real.
* **Visión:** Gamificar el aprendizaje para nativos digitales, permitiendo el error en un entorno seguro.

---

### Slide 2: Alcance del Proyecto
* **Público Objetivo:** Estudiantes de programas OTEC y postulantes a la Licencia Clase B (nacionales y extranjeros).
* **Entorno:** Simulación urbana de alta fidelidad que cubre zonas residenciales, ejes comerciales y centros de salud.
* **Propósito Pedagógico:** Evaluar la toma de decisiones bajo estrés (misión de urgencia) y el cumplimiento de normativas chilenas específicas.

---

### Slide 3: Fortalezas (Nuestras Ventajas)
* **Realismo Normativo:** El sistema no solo detecta choques, sino infracciones de "Convivencia" (ej: exceso de velocidad cerca de peatones o colegios).
* **Accesibilidad Total:** Basado en WebGL (Three.js), corre en cualquier navegador sin instalaciones, democratizando el acceso a simuladores de alta calidad.
* **Diseño UI/UX:** Interfaz "Cyberpunk" diseñada para capturar la atención de las nuevas generaciones.

---

### Slide 4: Debilidades y Mitigación
* **Debilidad:** Limitación actual en el modelado de físicas de daño vehicular avanzado (foco actual en reglas, no en destrucción).
* **Debilidad:** Ausencia de retroalimentación háptica (volantes físicos) en la versión web base.
* **Mitigación:** Implementación de un sistema de audio envolvente (Howler.js) y joystick virtual de alta precisión para compensar la falta de periféricos.

---

### Slide 5: Tecnología e Innovación
* **Stack Tecnológico:** JavaScript moderno, Three.js (Motor 3D), CSS3 con efectos de desenfoque de fondo y diseño atómico.
* **Innovación en Gameplay:** El "Game Loop" integra penalizaciones de tiempo real. Una infracción de tránsito equivale a **+30 segundos** de retraso en la misión de urgencia, conectando la seguridad vial con el éxito de la misión.
* **Optimización:** Uso de generación procedural de bloques urbanos para mantener el rendimiento en hardware académico.

---

### Slide 6: El GDD (Game Design Document)
* **Core Loop:** Input (Conducir) -> Update (Detección de Riesgos) -> Feedback (Puntaje y Convivencia).
* **Estética:** HUD futurista que integra minimapa circular dinámico y línea de guía visual (Guide Line) inspirada en títulos AAA.
* **Narrativa:** El usuario no es un conductor cualquiera; es un paramédico en una misión de transporte crítico, elevando el valor emocional de cada decisión.

---

### Slide 7: Resolución del Desafío y Motivación
* **¿Cómo resuelve el reto?:** Ataca la principal causa de fallas en exámenes: la falta de anticipación y el exceso de velocidad.
* **Motivación:** Sistema de "Racha de Seguridad" y multiplicadores de puntaje que premian al conductor ejemplar, no al más rápido.

---

### Slide 8: Factibilidad y Escalabilidad
* **Integración:** Propuesta técnica para ser embebido en plataformas de aprendizaje (Moodle/Canvas).
* **Factibilidad:** Costo de despliegue cero (servidor web estándar). 
* **Futuro:** Potencial de IA para generar escenarios de tráfico basados en los errores históricos del usuario.

---

### Slide 9: Demostración Práctica (Live Demo)
* **Escenario:** Transporte a Clínica desde Zona Residencial Norte.
* **Hitos a mostrar:**
    1. Respeto de velocidad en zona escolar (40 km/h).
    2. Cruce de intersección con tráfico transversal.
    3. Gestión de peatones dinámicos en el Centro Urbano.
    4. Estacionamiento seguro en zona de Clínica.

---

### Slide 10: Conclusión y Cierre
* **Impacto Social:** Reducir la siniestralidad vial mediante conductores mejor preparados psicológicamente.
* **Safe Drive Learning:** La seguridad no es una opción, es una conducta.
* **Preguntas:** Abierto a la ronda de preguntas del jurado.

---

## 📤 Checklist de Entrega (innovacion@uft.cl)
1. **Mockups:** Imágenes del HUD y diseño de la ciudad (assets).
2. **Material Visual:** El enlace a esta presentación y el link a la Demo funcional.
3. **GDD:** Documento técnico extendido (incluyendo tablas de penalizaciones y diagramas de flujo de colisiones).