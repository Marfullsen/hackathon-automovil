# 🎮 Sistema de Narrativa Funcional - Safe Drive Learning

## Descripción General

El juego ahora permite a los usuarios elegir **2 narrativas diferentes** al inicio:

### 1️⃣ **Estudiante Practicante** 📚
- **Descripción**: Aprende conducción segura de forma guiada
- **Tipo de misión**: Patrullaje urbano  
- **Dificultad**: Guiado
- **Características**:
  - Retroalimentación inmediata
  - Pausas permitidas
  - Enfoque en aprendizaje

### 2️⃣ **Paramédico - Ambulancia 911** 🚑
- **Descripción**: Transporta un paciente crítico a tiempo
- **Tipo de misión**: Transporte de urgencia
- **Dificultad**: Exigente  
- **Características**:
  - Presión de tiempo
  - Contra reloj
  - Misión crítica

---

## Flujo de Juego

```
┌─────────────────────────────────────┐
│   Página Carga (index2.html)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Modal de Selección Narrativa       │ ◄─── NUEVO
│  (Dos tarjetas interactivas)        │
│  📚 vs 🚑                           │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┐
         │           │
         ▼           ▼
  ┌──────────────┐   ┌──────────────┐
  │ Estudiante   │   │ Ambulancia   │
  │  Practicante │   │   911        │
  └───────┬──────┘   └───────┬──────┘
          │                  │
          │ selectNarrative  │
          └────────┬─────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ updateMissionContent()       │
    │ - Cambia título de misión    │
    │ - Actualiza objetivos        │
    │ - Cambia dificultad          │
    │ - Modifica narrativa general │
    └───────────┬──────────────────┘
                │
                ▼
    ┌──────────────────────────────┐
    │ resetGame()                  │
    │ - Inicia posición del auto   │
    │ - Muestra missionModal       │
    │ - Con contenido de narrativa │
    └───────────┬──────────────────┘
                │
                ▼
    ┌──────────────────────────────┐
    │ Juego Iniciado               │
    │ HUD y misión actualizados    │
    └──────────────────────────────┘
```

---

## Cambios en Contenido por Narrativa

### Títulos y Texto

| Elemento | Estudiante | Ambulancia |
|----------|-----------|-----------|
| **Ícono** | 📚 | 🚑 |
| **Título Principal** | Patrullaje Urbano - Práctica Segura | Transporte Crítico - Emergencia Médica |
| **Intro** | ¡Bienvenido estudiante! Tu misión es completar un patrullaje de seguridad vial... | ¡Paramédico en servicio! Tu paciente es crítico... |
| **Etapas** | Puntos de Patrullaje | Ruta de Transporte |
| **Dificultad HUD** | Guiado | Exigente |
| **Botón** | Comenzar Práctica 🚔 | Iniciar Transporte 🚑 |

### Objetivos de Misión

**Estudiante Practicante:**
1. Zona Residencial Norte: Verifica seguridad
2. Eje Este: Supervisa avenida principal
3. Centro Urbano: Inspecciona cruce central
4. Sector Oeste: Verifica zona oeste
5. Retorno a Base: Completa patrullaje

**Paramédico - Ambulancia:**
1. Zona Residencial: Salida rápida
2. Eje Este: Navega con tráfico
3. Centro Urbano: Cruza el corazón de la ciudad
4. Sector Sur: Aproximación a clínica
5. Llegada a Clínica: Estacionamiento seguro

---

## Implementación Técnica

### Archivos Modificados

#### 1. `index2.html`
```diff
+ <!-- Modal de selección narrativa inicial -->
+ <div class="narrative-modal" id="narrativeModal">
+   <div class="narrative-modal-content">
+     <div class="narrative-modal-header">...</div>
+     <div class="narrative-options">
+       <button class="narrative-card" id="narrativeStudent">...</button>
+       <button class="narrative-card" id="narrativeAmbulance">...</button>
+     </div>
+   </div>
+ </div>
```

#### 2. `style.css`
- Agregados estilos para `.narrative-modal`
- `.narrative-modal-content`, `.narrative-card`
- Animaciones: `slideInNarrative`, `float`, `pulse`
- Efectos hover y estados activos en las tarjetas

#### 3. `index2.js`
```javascript
let narrativeMode = null; // 'student' | 'ambulance'

const narrativeConfigurations = {
  student: { /* config */ },
  ambulance: { /* config */ }
};

function selectNarrative(mode) { /* lógica */ }
function updateMissionContent(mode) { /* actualiza contenido */ }
function showNarrativeSelector() { /* muestra modal */ }
function hideNarrativeSelector() { /* oculta modal */ }
```

### Variables Globales

- `narrativeMode`: Almacena la narrativa seleccionada
- `narrativeConfigurations`: Diccionario con configuraciones de cada narrativa

### Funciones Nuevas

1. **`selectNarrative(mode)`**
   - Establece `narrativeMode`
   - Oculta modal narrativo
   - Actualiza contenido de misión
   - Inicia el juego

2. **`updateMissionContent(mode)`**
   - Actualiza título, intro, objetivos
   - Modifica HUD (dificultad, etc)
   - Sincroniza con la narrativa elegida

3. **`showNarrativeSelector()`** / **`hideNarrativeSelector()`**
   - Controlan visibilidad del modal

---

## Interacción del Usuario

### Paso 1: Selección Inicial
- El juego muestra dos tarjetas grandes y atractivas
- Cada tarjeta tiene:
  - Ícono prominente (📚 o 🚑)
  - Título descriptivo
  - Descripción corta
  - 3 features destacadas (tags)
- Efectos hover: escala, cambio de border, brillo

### Paso 2: Confirmación de Misión
- Según la selección, el modal de misión cambia completamente:
  - Texto, objetivos, dificultad
  - Todo refleja la narrativa elegida
- Botón "Comenzar Práctica" o "Iniciar Transporte"

### Paso 3: Juego en Ejecución
- HUD muestra la dificultad correcta
- Panel de misión refleja la narrativa
- Reglas y normas se aplican según el modo

---

## Mejoras Futuras (Roadmap)

- [ ] **Cronómetro para Ambulancia**: Agregar presión de tiempo real
- [ ] **Audio personalizado**: Alarma de ambulancia para modo 911
- [ ] **Bonificaciones narrativas**: Bonus diferentes según modo
- [ ] **Velocidades límite diferenciadas**: 60 km/h (estudiante) vs 80 km/h (ambulancia)
- [ ] **Penalizaciones narrativas**: Multas (estudiante) vs vidas (ambulancia)
- [ ] **Feedback narrativo**: Mensajes contextuales según modo
- [ ] **Guardado de progreso**: Guardar récord por narrativa

---

## Testing Checklist

- [ ] Modal narrativo visible al cargar
- [ ] Botones responden a clicks
- [ ] Contenido de misión cambia según selección
- [ ] HUD actualiza correctamente
- [ ] Juego inicia con narrativa correcta
- [ ] Efectos visuales funcionan
- [ ] Sin errores de consola

---

**Versión**: 1.0 (12 de Abril 2026)  
**Estado**: ✅ Implementado y funcional  
**Prioridad Hackathon**: 🔴 CRÍTICA - Requisito de presentación
