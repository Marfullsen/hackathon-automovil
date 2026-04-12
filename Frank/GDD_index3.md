# GDD - Index 3: Safe Mobility Parking Lab

## 0. Ficha de Proyecto

- Nombre del modulo: Index 3 - Estacionamiento Urbano Clase B
- Proyecto marco: Safe Mobility 4 All & 4 Life
- Formato: Minijuego educativo mobile-first
- Tipo de producto: Prototipo jugable para aprendizaje gamificado
- Publico objetivo primario: Estudiantes y postulantes a Licencia Clase B
- Duracion ideal de sesion: 3 a 8 minutos
- Plataforma objetivo: Navegador movil y escritorio (sin hardware adicional)

## 1. Resumen Ejecutivo (Pitch de 60 segundos)

Index 3 transforma contenidos teoricos de conduccion Clase B en practica interactiva de alta repeticion y bajo riesgo. El jugador aprende a estacionar en escenarios urbanos progresivos, con reglas reales de seguridad vial, feedback inmediato y decisiones de control que simulan situaciones de examen.

La propuesta prioriza usabilidad movil, motivacion por micro-retos, y factibilidad tecnica para dispositivos de gama media-baja. El resultado es una experiencia clara, atractiva y escalable como modulo de una futura app educativa de seguridad vial.

## 2. Contexto del Desafio

El concurso exige una experiencia digital gamificada que mejore la comprension del Curso Clase B y que sea implementable como aplicacion movil. Index 3 responde a ese desafio con un enfoque practico sobre estacionamiento, uno de los puntos de mayor friccion para aprendices.

Problema de aprendizaje a resolver:

- Dificultad para transferir teoria a accion.
- Baja retencion cuando el contenido es solo lectura.
- Ansiedad por evaluaciones de maniobra y reglas de entorno.
- Confusion en prioridad entre precision, seguridad y cumplimiento normativo.

## 3. Objetivo Pedagogico

### 3.1 Objetivo general

Facilitar la practica y comprension de contenidos teoricos del Curso Clase B mediante una experiencia interactiva centrada en maniobras de estacionamiento seguro.

### 3.2 Objetivos especificos

- Aplicar criterios de posicion final valida en cajon.
- Controlar velocidad y orientacion durante maniobra.
- Reconocer restricciones legales del entorno (grifo, esquina, paradero, cuneta, pendiente).
- Usar intermitentes y cierre de maniobra con secuencia correcta.
- Mejorar toma de decisiones bajo presion espacial.

### 3.3 Evidencia de aprendizaje dentro del juego

- Aprobacion de niveles con criterios de precision.
- Reduccion de faltas por intento.
- Cumplimiento de reglas contextuales por escenario.
- Progreso por hold, angulo, velocidad final y ruta de ingreso.

## 4. Alineacion con Contenidos Clase B

Temas de Clase B integrados en mecanicas:

- Estacionamiento seguro en via urbana.
- Distancias y prohibiciones por elementos viales.
- Uso de intermitentes antes de ingresar a maniobra.
- Control de velocidad y detencion segura.
- Conduccion en pendiente y cierre de maniobra.

Nota de implementacion curricular:

- Cada nivel representa una situacion aplicada.
- Cada criterio de evaluacion de nivel corresponde a una regla observable.
- El sistema de faltas funciona como retroalimentacion formativa inmediata.

## 5. Propuesta de Valor

- Aprendizaje activo: la teoria se vuelve accion en segundos.
- Reintento sin friccion: error no bloquea, enseña.
- Feedback claro: el jugador entiende por que fallo.
- Alto engagement: retos cortos, medibles y progresivos.
- Escalable: arquitectura de niveles data-driven para agregar escenarios.

## 6. Publico Objetivo

### 6.1 Primario

- Personas en etapa de preparacion para licencia Clase B.
- Estudiantes entre 17 y 30 anios con uso frecuente de movil.

### 6.2 Secundario

- Instituciones educativas y programas de apoyo vial.
- Docentes/monitores que requieren recurso practico de refuerzo.

## 7. Pilares de Diseno

- Precision antes que velocidad.
- Seguridad antes que atajo.
- Feedback antes que castigo silencioso.
- Mobile-first con lectura clara.
- Complejidad progresiva y no abrupta.

## 8. Core Loop

1. Seleccionar o cargar nivel.
2. Maniobrar con direccion, aceleracion/freno y marcha.
3. Leer entorno y evitar riesgos.
4. Ingresar al cajon objetivo.
5. Cumplir hold y cierre de maniobra.
6. Recibir evaluacion y pasar al siguiente reto.

## 9. Controles y Accesibilidad

### 9.1 Desktop

- W/S para aceleracion y frenado.
- A/D para direccion.
- B/N intermitentes.
- H evaluar maniobra.
- P pausa.
- R reinicio.

### 9.2 Mobile

- Analogo virtual para control fino.
- Botones tactiles de intermitentes.
- Pausa, reinicio y freno de mano.
- Botones R/N/D.

### 9.3 Interaccion inmersiva

- Palanca 3D R/N/D arrastrable.
- Snap visual por slot activo.
- Indicador de marcha sincronizado con estado del vehiculo.

### 9.4 Consideraciones UX

- Botones grandes y separados.
- Estados activos visibles (intermitentes, marcha, freno de mano).
- Centro de pantalla despejado para leer entorno.

## 10. Mecanicas Principales

### 10.1 Manejo del vehiculo

- Aceleracion progresiva.
- Frenado con deceleracion y drag.
- Direccion suavizada para correcciones finas.
- Comportamiento diferenciado por marcha.

### 10.2 Validacion de estacionamiento

- Caja objetivo con tolerancia de posicion y angulo.
- Umbral de velocidad final.
- Hold minimo de permanencia.
- Validacion forzada o automatica segun evento.

### 10.3 Reglas viales por escenario

- Intermitente correcto segun nivel.
- Tiempo minimo de anticipacion del intermitente.
- Restricciones por proximidad legal.
- Reglas de pendiente y control final.

### 10.4 Colisiones y penalizacion

- Conos, autos estacionados, peatones, senaletica y mobiliario.
- Reinicio rapido al impacto para mantener ciclo de practica.

## 11. Niveles (Estado Actual de Diseno)

### Nivel 1 - Precision Base

- Introduccion al control y alineacion con cuneta.
- Objetivo amplio para aprendizaje inicial.

### Nivel 2 - Grifo y Norma

- Enfatiza restriccion legal de distancia al grifo.
- Exige aproximacion con mayor criterio.

### Nivel 3 - Esquina e Interseccion

- Ruta de avance y giro con estacionamiento posterior.
- Escena despejada para priorizar lectura de trayectoria.

### Nivel 4 - Estacionamiento en Subida

- Control de maniobra en pendiente ascendente.
- Exige precision de entrada y cierre seguro.

### Nivel 5 - Certificacion Final

- Escenario mixto con mayor exigencia espacial.
- Objetivo reposicionado para no bloquear flujo de giro en esquina.

## 12. HUD y Feedback

### 12.1 HUD principal

- Puntaje.
- Nivel actual y total.
- Velocidad.
- Faltas.
- Progreso.

### 12.2 Estados de conduccion

- Pausa.
- Modo/marcha activa.
- Intermitentes.
- Freno de mano.
- Estado de evaluacion.

### 12.3 Apoyo visual

- Guia de distancia a cuneta.
- Marcador de cajon objetivo.
- Toasts para causa de falta o logro.

### 12.4 Intermitentes conectados 2D y 3D

- Botones HTML con parpadeo ambar.
- Luces del vehiculo en 3D sincronizadas.

## 13. Direccion de Arte

- Urbano estilizado, legible y funcional.
- Alto contraste en senaletica y limites de calzada.
- Paleta sobria para evitar sobrecarga visual.
- Iluminacion controlada para evitar brillo excesivo.

## 14. Arquitectura Tecnica

- Motor: Three.js.
- Render: WebGL + postprocesado moderado.
- UI: HTML/CSS superpuesto al canvas.
- Logica: niveles data-driven.
- Interaccion: teclado + tactil + palanca 3D.

## 15. Factibilidad Tecnica (Criterio Concurso)

### 15.1 Cumplimiento de restricciones

- Sin hardware adicional: cumple.
- Sin multijugador sincrono: cumple.
- Sin camara o procesamiento de imagen externo: cumple.
- Ejecutable en movil: objetivo principal del diseno.

### 15.2 Plan de rendimiento para gama media-baja

- Modo grafico equilibrado por defecto.
- Densidad urbana configurable.
- Bloom moderado.
- Geometria simple en assets no criticos.
- Priorizacion de legibilidad sobre fidelidad extrema.

### 15.3 Mantenibilidad

- Reglas separadas por nivel.
- Spawn de decor y restricciones por clave de nivel.
- Escalable para agregar nuevas pruebas sin reescribir base.

## 16. Originalidad e Innovacion

- Integracion de pedagogia vial con gameplay corto de alta repeticion.
- Palanca 3D inmersiva en un flujo mobile-first.
- Convergencia de feedback visual 2D y 3D para aprendizaje contextual.

## 17. Usabilidad y Claridad

Principios aplicados:

- Navegacion directa sin menus profundos.
- Roles visuales diferenciados entre control, estado y objetivo.
- Acciones criticas siempre visibles.
- Estado del vehiculo comprensible en menos de 2 segundos.

## 18. Motivacion y Engagement

- Progresion por niveles con dificultad creciente.
- Reinicio inmediato sin castigo de tiempo muerto.
- Sensacion de mejora por precision, no por azar.
- Retos cortos compatibles con sesiones moviles.

## 19. Mapeo a Criterios Oficiales (1 a 7)

### 19.1 Grado de resolucion del desafio

Evidencia:

- Contenido Clase B convertido en reglas jugables.
- Evaluacion por accion y no solo por lectura.

### 19.2 Capacidad de generar motivacion

Evidencia:

- Loop corto, feedback inmediato, progreso visible.
- Escenarios variados con objetivos claros.

### 19.3 Usabilidad y claridad de interfaz

Evidencia:

- UI compacta, mobile-first, estados persistentes.
- Interacciones directas y consistentes.

### 19.4 Factibilidad tecnica e implementacion

Evidencia:

- Stack web estandar y mantenible.
- Sin dependencias de hardware especial.
- Arquitectura modular por nivel.

### 19.5 Originalidad e innovacion

Evidencia:

- Palanca 3D + reglas viales reales + gamificacion de maniobra.

## 20. Entregables para Jurado

- GDD completo (este documento).
- Demo jugable del Index 3.
- Material visual (PPT + capturas + flujo de nivel).
- Mockups de pantallas clave (HUD, pausa, tutorial, controles).
- Guion de presentacion de 10 minutos.

## 21. Guion Recomendado de Presentacion (10 minutos)

1. Problema de aprendizaje actual.
2. Solucion propuesta y valor.
3. Demo en vivo de un nivel completo.
4. Evidencia pedagogica por reglas.
5. Factibilidad tecnica y escalabilidad.
6. Cierre: impacto esperado y plan de implementacion.

## 22. Propiedad Intelectual y Compliance

- El proyecto considera cesion de resultados segun bases.
- No incorpora mecanicas prohibidas por el concurso.
- Se recomienda documentar origen/licencia de todos los assets externos antes de entrega final.

## 23. Riesgos y Mitigaciones

### Riesgo 1: sobrecarga visual en pantallas pequenas

Mitigacion:

- Jerarquia de HUD.
- Reubicacion dinamica de paneles en modo compacto.

### Riesgo 2: complejidad de control

Mitigacion:

- Convivencia de control simple (botones R/N/D) y control inmersivo (palanca 3D).

### Riesgo 3: rendimiento en dispositivos modestos

Mitigacion:

- Presets graficos y reduccion de densidad de entorno.

## 24. KPIs de Exito del Prototipo

- Tiempo medio para completar Nivel 1.
- Tasa de finalizacion por nivel.
- Faltas promedio por intento.
- Numero de reintentos antes de exito.
- Retencion de sesion (segundos por partida).

## 25. Roadmap Posterior al Hackathon (Abril-Septiembre)

- Ajuste pedagogico fino con expertos de seguridad vial.
- Optimizacion tecnica para parque amplio de dispositivos.
- Integracion de analitica basica de aprendizaje.
- Pulido visual y sonoro orientado a producto final.

## 26. Conclusiones

Index 3 cumple con el espiritu del concurso: convierte teoria de seguridad vial en una experiencia interactiva, motivante y tecnicamente factible para movil. La propuesta combina rigor pedagogico, claridad de interfaz y potencial de implementacion real, con una base de producto escalable para evolucionar post-hackathon.