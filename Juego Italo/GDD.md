# Game Design Document (GDD) - Hackathon Conducción

## 1. Resumen del Juego
* **Título Provisional**: Neon Patrol / Conducción Hackathon
* **Género**: Conducción Arcade / Acción / Supervivencia
* **Plataforma**: Navegador Web (PC)
* **Perspectiva**: Tercera persona (Cámara de seguimiento isométrica/detrás del vehículo).
* **Concepto General**: El jugador controla una patrulla de policía en una ciudad generada de forma semi-procedural durante un atardecer perpetuo. El objetivo es sobrevivir, patrullar y enfrentarse a vehículos enemigos utilizando mecánicas de conducción arcade y un sistema de combate básico con proyectiles, evitando daños y colisiones con el entorno.

## 2. Mecánicas de Juego (Gameplay)
* **Controles**:
  * **W / Flecha Arriba**: Acelerar.
  * **S / Flecha Abajo**: Frenar / Reversa.
  * **A / Flecha Izquierda**: Girar a la izquierda.
  * **D / Flecha Derecha**: Girar a la derecha.
  * **Ratón (Click)**: Disparar proyectiles hacia la dirección en la que apunta el vehículo o cámara.
  * **Espacio**: Habilidad "Dash" con la cual avanzas rapido durante un momento
* **Conducción**:
  * Física arcade (sin simulación realista pesada).
  * Velocidad con inercia y fricción.
  * Colisiones suaves (escalonadas) contra edificios y rejas para evitar atascos. Reducción de velocidad al impactar.
* **Combate / Salud**:
  * El jugador puede disparar. Los proyectiles no tienen efecto "bloom" para mantener claridad visual.
  * Al recibir daño, la cámara y/o UI tiemblan (Efectos de *Game Feel* / *Juiciness* mediante GSAP).
  * Sistema de FPS optimizado al derrotar enemigos (eliminación de cálculos de luz dinámica compleja).

## 3. Elementos del Mundo y Nivel
* **Generación del Mapa**:
  * Cuadrículas de calles ortogonales (asfalto húmedo) y zonas de pasto.
  * **Manzanas (Bloques)**: Rodeadas por un sistema de cercas metálicas detalladas (con bases de cemento, barrotes metálicos y esquinas curvas) que actúan como límite físico y colisionador.
  * **Edificios**: Generación de 1 a 3 casas aleatorias por manzana, equipadas con ventanas que emiten luz cálida y puertas de madera.
* **Iluminación y Atmósfera**:
  * **Estilo Visual**: Atardecer cinemático / Cyberpunk ligero.
  * **Luces**: `HemisphereLight` para ambiente de atardecer, y `DirectionalLight` (Sol) que proyecta sombras dinámicas.
  * **Niebla (Fog)**: Densidad baja (`FogExp2` ajustado) que oculta la distancia de dibujado pero permite buena visibilidad.
* **Límites**:
  * Malla perimetral alrededor de toda la ciudad para evitar que el jugador o entidades caigan al vacío.

## 4. Entidades
* **Jugador (Patrulla)**: 
  * Modelo basado en geometrías primitivas o importado.
  * **Luces especiales**: 
    * Sirenas policiales parpadeantes (alternan colores azul/rojo mediante `setRGB`).
    * Faro frontal (`SpotLight`) muy potente, con un gran ángulo y distancia para iluminar calles oscuras (no proyecta sombras para ahorrar rendimiento).
* **Enemigos**:
  * Vehículos hostiles.
  * Utilizan mallas brillantes ("Faux-lights" / Materiales básicos con colores emisivos) en lugar de luces reales para emular faros sin hundir la tasa de cuadros por segundo (FPS).
* **Vehículos de Rescate (Ambulancias)**:
  * Vehículos neutrales o aliados con luces propias de emergencia.

## 5. Gráficos, Efectos y Sonido
* **Motor Gráfico**: Three.js (WebGL).
* **Post-Procesamiento (Post-Processing)**:
  * `EffectComposer` en uso.
  * `UnrealBloomPass`: Genera un brillo de neón intenso (Bloom) para luces de faros, sirenas y ventanas emisivas.
* **Animaciones UI/Cámara (GSAP)**:
  * Interacciones de daño generan temblores y sacudidas dinámicas (*Screen Shake*).

## 6. Interfaz de Usuario (UI) y Herramientas
* **HUD Básico**: Vida, Puntaje (sujetos a diseño final de HTML overlay).
* **Monitoreo de Rendimiento**: `Stats.js` integrado en la esquina de la pantalla para monitorear FPS y latencia en tiempo real.
* **Panel de Administrador ("Cheat/Dev Mode")**: 
  * Sistema de teclado oculto que, al teclear la palabra "admin", despliega un menú HTML flotante para modificar variables en tiempo real.

## 7. Stack Tecnológico
* **Frontend**: HTML5, CSS3, JavaScript (ES6+).
* **Librerías Extra**: 
  * `three.js` (Renderizado 3D y matemáticas espaciales).
  * `GSAP` (Animaciones y Tweens desde CDN).
  * `Stats.js` (Profilers visuales).
* **Backend y Entorno de Desarrollo**:
  * **Node.js** ejecutando `server.js`.
  * **Nodemon**: Permite hot-reload (reinicio automático) del servidor al guardar cambios durante el desarrollo (`npm run dev`).
