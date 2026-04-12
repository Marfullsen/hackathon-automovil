# GDD General - Safe Mobility: Plataforma de Minijuegos Clase B

## 1. Vision del Proyecto

Safe Mobility es una plataforma de aprendizaje gamificado para contenidos del Curso Clase B en Chile. El sistema integra tres minijuegos cortos, cada uno enfocado en habilidades distintas de conduccion segura, para transformar teoria en practica interactiva.

La experiencia esta pensada para dispositivos moviles y navegadores de escritorio, sin hardware adicional y con foco en dispositivos de gama media-baja.

## 2. Objetivo Pedagogico

Objetivo general:
- Mejorar la comprension y aplicacion de normas viales Clase B mediante practica interactiva y feedback inmediato.

Objetivos especificos:
- Reforzar toma de decisiones en conduccion urbana.
- Practicar control fino del vehiculo en maniobras.
- Evaluar criterio de seguridad vial bajo presion.
- Incentivar repeticion y progresion con metas claras.

## 3. Publico Objetivo

- Estudiantes que preparan examen teorico/practico Clase B.
- Personas post-estudio que requieren reforzamiento.
- Usuarios entre 17 y 35 anios con uso frecuente de movil.

## 4. Pilares de Diseno

- Seguridad antes que velocidad.
- Aprendizaje por accion y repeticion corta.
- Feedback claro en cada error y acierto.
- Interfaces simples, legibles y mobile-first.
- Mecanicas de baja complejidad y alta rejugabilidad.

## 5. Estructura de la Plataforma

La plataforma se organiza en:

1. Home de seleccion de minijuegos.
2. Modulos jugables independientes.
3. Sistema comun de evaluacion (puntaje, faltas, progreso, precision).
4. Reporte de resultados para presentacion a jurado.

## 6. Minijuegos del Proyecto

## 6.1 Modulo A - Patrullaje Seguro (Index 2)

Tema:
- Conduccion de ambulancia/patrulla en ciudad, cumpliendo normas viales.

Fantasia:
- El jugador opera en contexto de urgencia, pero debe priorizar seguridad vial y convivencia.

Objetivos de juego:
- Completar ruta por checkpoints.
- Respetar velocidad, cruces y prioridad peatonal.
- Reducir infracciones y mantener racha de conduccion segura.

Aprendizajes asociados:
- No confundir urgencia con imprudencia.
- Lectura de riesgos urbanos.
- Control de velocidad y toma de decisiones.

## 6.2 Modulo B - Parking Lab (Index 3)

Tema:
- Estacionamiento urbano progresivo con reglas de maniobra.

Fantasia:
- El jugador entrena precision espacial y control fino en situaciones de examen.

Objetivos de juego:
- Estacionar en cajon valido con angulo correcto.
- Evitar choques y faltas.
- Completar niveles con hold final y baja velocidad.

Aprendizajes asociados:
- Distancias de seguridad.
- Reversa y correccion de trayectoria.
- Uso de intermitentes y cierre de maniobra.

## 6.3 Modulo C - Patrulla Cero: Caos Vial Roguelike Trivia (ItaloJuego)

Tema:
- Accion roguelike vehicular con oleadas + preguntas de trivia vial.

Fantasia:
- El jugador sobrevive a amenazas urbanas, mejora su vehiculo y valida conocimientos viales en checkpoints de trivia.

Objetivos de juego:
- Superar oleadas.
- Elegir power-ups para build del vehiculo.
- Responder trivia para reforzar contenidos teoricos.

Aprendizajes asociados:
- Retencion activa de reglas viales.
- Relacion entre decision rapida y consecuencias.
- Motivacion por progresion (nivel, mejoras, puntuacion).

## 7. Core Loop Integrado

1. Elegir minijuego en Home.
2. Recibir objetivo corto.
3. Ejecutar conduccion/maniobra/combate segun modulo.
4. Recibir feedback inmediato.
5. Obtener puntaje y progreso.
6. Reintentar para mejorar desempeno.

## 8. Metricas y Evaluacion

Metricas comunes:
- Puntaje total.
- Tasa de aciertos o precision.
- Numero de infracciones o colisiones.
- Tiempo de cumplimiento del objetivo.
- Progreso por nivel o checkpoint.

Salida para jurado:
- Demo jugable de los 3 modulos.
- GDD unificado.
- Material visual de flujo y UI.

## 9. Usabilidad y Accesibilidad

- Controles tactiles grandes en movil.
- HUD con jerarquia visual clara.
- Mensajes cortos y legibles.
- Bajo costo cognitivo.
- Orientacion a sesiones de 3 a 8 minutos.

## 10. Factibilidad Tecnica

Stack:
- Frontend web (HTML, CSS, JS).
- Render 3D con Three.js en modulos que lo requieren.
- Arquitectura modular por minijuego.

Cumplimiento de bases:
- Sin hardware adicional.
- Sin multijugador sincronico.
- Sin procesamiento de imagen local/nube.
- Viable para dispositivos media-baja.

## 11. Alineacion con Criterios del Concurso

1. Resolucion del desafio:
- Integra teoria Clase B en mecas aplicadas.

2. Motivacion:
- Retos cortos, reintento rapido y progreso visible.

3. Usabilidad:
- UI mobile-first, feedback inmediato y navegacion simple.

4. Factibilidad tecnica:
- Alcance modular, mecanicas concretas y mantenimiento viable.

5. Originalidad:
- Combinacion de simulacion vial, precision de estacionamiento y roguelike trivia en un mismo ecosistema.

## 12. Roadmap Sugerido (Post Hackathon)

Fase 1:
- Integrar Home + acceso a los 3 modulos.
- Normalizar telemetria basica entre juegos.

Fase 2:
- Unificar pantalla de resultados por modulo.
- Mejorar equilibrio de dificultad y onboarding.

Fase 3:
- Version consolidada para pilotaje educativo.
- Preparacion de release para pruebas con usuarios reales.

## 13. Diferencial de la Propuesta

La plataforma no solo ensena reglas: entrena criterio vial en contextos distintos. Cada modulo cubre una competencia complementaria:
- Criterio en ruta (Index 2).
- Precision tecnica (Index 3).
- Retencion y decision bajo presion (ItaloJuego).

Esta combinacion aumenta engagement, mejora transferencia practica y fortalece el valor pedagogico del proyecto para Safe Mobility 4 All & 4 Life.
