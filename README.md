# 🚦 Road Safety Simulator - Interactive Learning

Este proyecto es un simulador de conducción interactivo en 3D diseñado para la educación vial. Basado en una arquitectura de alto rendimiento con Three.js, permite a los usuarios practicar maniobras, reconocer señales de tránsito y entender las reglas de prioridad en un entorno seguro y virtual.

## 🚀 Características Principales

* **Entorno 3D Inmersivo:** Basado en el motor de renderizado de Bruno Simon, optimizado para web.
* **Sistema de Físicas Realista:** Manejo de colisiones, fricción de neumáticos y gravedad.
* **Módulo de Logros:** Sistema integrado para trackear el progreso del usuario (respeto de semáforos, velocidad permitida, etc.).
* **Soporte Multidispositivo:** Controles adaptados para teclado (WASD) y dispositivos móviles mediante botones táctiles en pantalla.

## 🛠 Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/vial-sim-game.git](https://github.com/tu-usuario/vial-sim-game.git)
    cd vial-sim-game
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar en modo desarrollo:**
    ```bash
    npm run dev
    ```

4.  **Construir para producción:**
    ```bash
    npm run build
    ```

## 🎮 Controles

| Acción | Teclado | Táctil |
| :--- | :--- | :--- |
| Acelerar | `W` / `↑` | Botón Forward |
| Frenar / Reversa | `S` / `↓` | Botón Backward |
| Girar | `A` / `D` | Joystick / Botones Dir |
| Interactuar | `E` / `Enter` | Botón "Interact" |
| Reiniciar Posición| `R` | Botón "Unstuck" |

## 🏗 Estructura del Proyecto (Basada en HTML)

* `index.html`: Punto de entrada que contiene el contenedor del `<canvas>` y los elementos de la UI (Menú, Mapas, Logros).
* `/assets`: Contiene los scripts de lógica principal (`index-ORr3L4no.js`).
* `/respawns`: Modelos `.glb` comprimidos para la regeneración de objetos y vehículos.
* `/ui`: Iconos SVG y previsualizaciones para el sistema de navegación del menú.

## 📈 Roadmap de Aprendizaje

1.  **Nivel 1:** Reconocimiento de señales de pare y ceda el paso.
2.  **Nivel 2:** Circulación en rotondas y prioridades.
3.  **Nivel 3:** Conducción nocturna y condiciones climáticas adversas (implementación de texturas `.ktx`).

---
Desarrollado con fines educativos.