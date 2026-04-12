import * as THREE from 'three';

// Trazado complejo con múltiples curvas y giros
const routeWaypoints = [
    { x: 0, z: 450, angle: 0 },      // Inicio
    { x: 0, z: 350, angle: 0 },      // Hacia norte - recta
    { x: 0, z: 280, angle: 0 },      // Primera intersección
    { x: 120, z: 280, angle: -Math.PI / 2 },  // Giro a derecha
    { x: 120, z: 150, angle: -Math.PI / 2 },  // Hacia este
    { x: 120, z: 80, angle: 0 },     // Giro a norte
    { x: 0, z: 80, angle: Math.PI / 2 },      // Giro a izquierda
    { x: -120, z: 80, angle: Math.PI / 2 },   // Hacia oeste
    { x: -120, z: 200, angle: 0 },   // Giro a norte
    { x: 0, z: 200, angle: -Math.PI / 2 },    // Hacia este
    { x: 0, z: 0, angle: 0 },        // Centro - cruce importante
    { x: 0, z: -100, angle: 0 },     // Hacia sur
    { x: 100, z: -100, angle: -Math.PI / 2 }, // Giro derecha
    { x: 100, z: -220, angle: -Math.PI / 2 }, // Hacia sur este
    { x: 0, z: -220, angle: Math.PI / 2 },    // Giro izquierda
    { x: -100, z: -220, angle: Math.PI / 2 }, // Hacia oeste
    { x: -100, z: -100, angle: 0 },           // Giro norte
    { x: 0, z: -100, angle: -Math.PI / 2 },   // Hacia clínica
    { x: 0, z: -280, angle: 0 },    // Sector sur
    { x: 0, z: -400, angle: 0 }     // Llegada a clínica
];

const stages = [
    { chapter: 'Patrullaje Urbano - Punto 1', learning: 'Zona Residencial Norte - Verifica seguridad en sector residencial.', wpIdx: 1, zone: 'residencial', x: 0, z: 380 },
    { chapter: 'Patrullaje Urbano - Punto 2', learning: 'Eje Este - Supervisa avenida principal de tráfico.', wpIdx: 5, zone: 'comercial', x: 140, z: 120 },
    { chapter: 'Patrullaje Urbano - Punto 3', learning: 'Centro Urbano - Inspecciona cruce central.', wpIdx: 10, zone: 'cultural', x: 0, z: 0 },
    { chapter: 'Patrullaje Urbano - Punto 4', learning: 'Sector Oeste - Verifica zona oeste de la ciudad.', wpIdx: 8, zone: 'intersecciones', x: -140, z: 130 },
    { chapter: 'Patrullaje Urbano - Punto 5 (Final)', learning: 'Regresa a base - Completa el patrullaje urbano.', wpIdx: 1, zone: 'residencial', x: 0, z: 380 }
];

const districtZones = [
    { id: 'residencial', name: 'Zona Residencial', xMin: -20, xMax: 20, zMin: 350, zMax: 500 },
    { id: 'providencia', name: 'Intersección Norte', xMin: -50, xMax: 150, zMin: 180, zMax: 350 },
    { id: 'comercial', name: 'Eje Este', xMin: 50, xMax: 180, zMin: 0, zMax: 200 },
    { id: 'intersecciones', name: 'Sector Oeste', xMin: -180, xMax: 50, zMin: 0, zMax: 250 },
    { id: 'cultural', name: 'Centro Urbano', xMin: -50, xMax: 50, zMin: -150, zMax: 150 },
    { id: 'centro', name: 'Zona Sur-Este', xMin: 50, xMax: 150, zMin: -280, zMax: 0 },
    { id: 'alameda', name: 'Sector Sur-Oeste', xMin: -150, xMax: 50, zMin: -280, zMax: -100 },
    { id: 'final', name: 'Clínica Destino', xMin: -30, xMax: 30, zMin: -450, zMax: -350 }
];

const scoreValue = document.getElementById('scoreValue');
const scenarioIndex = document.getElementById('scenarioIndex');
const scenarioTotal = document.getElementById('scenarioTotal');
const speedValue = document.getElementById('speedValue');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const streakValue = document.getElementById('streakValue');
const collectValue = document.getElementById('collectValue');
const collectTotal = document.getElementById('collectTotal');
const accuracyValue = document.getElementById('accuracyValue');
const challengeValue = document.getElementById('challengeValue');
const missionTitle = document.getElementById('missionTitle');
const missionText = document.getElementById('missionText');
const missionChapter = document.getElementById('missionChapter');
const missionDifficulty = document.getElementById('missionDifficulty');
const missionAccuracy = document.getElementById('missionAccuracy');
const resetBtn = document.getElementById('resetBtn');
const modeStudent = document.getElementById('modeStudent');
const modePost = document.getElementById('modePost');
const toast = document.getElementById('toast');
const miniMapCanvas = document.getElementById('miniMapCanvas');
const miniMapCtx = miniMapCanvas.getContext('2d');
const infractionValue = document.getElementById('infractionValue');
const lastInfractionValue = document.getElementById('lastInfractionValue');

// Referencias del Modal
const missionModal = document.getElementById('missionModal');
const startMissionBtn = document.getElementById('startMissionBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalMissionTitle = document.getElementById('modalMissionTitle');

// Referencias del Panel de Navegación
const navDestination = document.getElementById('navDestination');
const navDistance = document.getElementById('navDistance');
const navDirectionArrow = document.getElementById('navDirectionArrow');
const navAngle = document.getElementById('navAngle');

scenarioTotal.textContent = stages.length;

const difficultyNames = ['Guiado', 'Activo', 'Exigente'];
const difficultyProfiles = [
    { maxSpeed: 0.56, turnSpeed: 0.024, checkpointRadius: 3.6, hotspotRadius: 2.35 },
    { maxSpeed: 0.62, turnSpeed: 0.028, checkpointRadius: 3.1, hotspotRadius: 2.15 },
    { maxSpeed: 0.68, turnSpeed: 0.031, checkpointRadius: 2.75, hotspotRadius: 1.95 }
];

const CHILEAN_TRAFFIC_RULES = {
    maxSpeedUrban: 60,
    maxSpeedRural: 100,
    maxSpeedHighway: 120,
    safeFollowingDistance: 0.5,
    pedestrianPriorityRadius: 5.0,
    trafficLightRadius: 4.0,
    speedBumpRadius: 3.5,
    zoneSchoolRadius: 8.0,
    zoneSchoolMaxSpeed: 45,
    laneChangePenalty: 30,
    redLightPenalty: 150,
    speedExcessPenalty: 50,
    pedestrianCollisionPenalty: 200,
    vehicleCollisionPenalty: 100,
    safeManeuverBonus: 25
};

const INFRACTION_TYPES = {
    SPEEDING: 'speeding',
    RED_LIGHT: 'redLight',
    UNSAFE_DISTANCE: 'unsafeDistance',
    PEDESTRIAN_VIOLATION: 'pedestrianViolation',
    COLLISION: 'collision',
    RECKLESS_MANEUVER: 'recklessManeuver',
    SAFE_MANEUVER: 'safeManeuver'
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ea7d0);
scene.fog = new THREE.Fog(0x7ea7d0, 45, 310);

const canvas = document.getElementById('gameCanvas');
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1200);
camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.85);
sunLight.position.set(30, 45, 10);
scene.add(sunLight);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 2400),
    new THREE.MeshStandardMaterial({ color: 0x35613c })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const road = new THREE.Group();
scene.add(road);

// Crear segmentos de carretera entre waypoints
for (let i = 0; i < routeWaypoints.length - 1; i++) {
    const wp1 = routeWaypoints[i];
    const wp2 = routeWaypoints[i + 1];
    
    const dx = wp2.x - wp1.x;
    const dz = wp2.z - wp1.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const midX = (wp1.x + wp2.x) / 2;
    const midZ = (wp1.z + wp2.z) / 2;
    const angle = Math.atan2(dx, -dz);
    
    // Carretera principal
    const roadSeg = new THREE.Mesh(
        new THREE.PlaneGeometry(28, distance + 20),
        new THREE.MeshStandardMaterial({ color: 0x2f2f32 })
    );
    roadSeg.rotation.x = -Math.PI / 2;
    roadSeg.rotation.z = angle;
    roadSeg.position.set(midX, 0.01, midZ);
    road.add(roadSeg);
    
    // Líneas de carril punteadas en el segmento
    const numDashes = Math.ceil(distance / 12);
    for (let j = 0; j < numDashes; j++) {
        const t = j / numDashes;
        const px = wp1.x + dx * t;
        const pz = wp1.z + dz * t;
        
        const lane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.45, 8),
            new THREE.MeshStandardMaterial({ color: 0xffe16a })
        );
        lane.rotation.x = -Math.PI / 2;
        lane.rotation.z = angle;
        lane.position.set(px, 0.03, pz);
        road.add(lane);
    }
    
    // Crear entradas para intersecciones
    if (i > 0) {
        const crossRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 28),
            new THREE.MeshStandardMaterial({ color: 0x2a2a2d })
        );
        crossRoad.rotation.x = -Math.PI / 2;
        crossRoad.rotation.z = wp1.angle;
        crossRoad.position.set(wp1.x, 0.015, wp1.z);
        road.add(crossRoad);
        
        // Marcas blancas para cruces peatonales
        for (let x = -20; x <= 20; x += 6) {
            const mark = new THREE.Mesh(
                new THREE.PlaneGeometry(2.4, 0.34),
                new THREE.MeshStandardMaterial({ color: 0xf2f2f2 })
            );
            mark.rotation.x = -Math.PI / 2;
            const rotX = Math.cos(wp1.angle) * x - Math.sin(wp1.angle) * (-2.6);
            const rotZ = Math.sin(wp1.angle) * x + Math.cos(wp1.angle) * (-2.6);
            mark.rotation.z = wp1.angle;
            mark.position.set(wp1.x + rotX, 0.04, wp1.z + rotZ);
            road.add(mark);
        }
    }
}

const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b8f93 });

// Aceras expandidas para el circuito más amplio
const sidewalks = [
    { x: -22, z: -15, w: 4, d: 1150 },   // Acera norte oeste
    { x: 22, z: -15, w: 4, d: 1150 },    // Acera norte este
    { x: -40, z: 150, w: 4, d: 200 },    // Acera oeste norte
    { x: 40, z: 150, w: 4, d: 200 },     // Acera este norte
    { x: -40, z: -100, w: 4, d: 200 },   // Acera oeste sur
    { x: 40, z: -100, w: 4, d: 200 }     // Acera este sur
];

sidewalks.forEach(sw => {
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(sw.w, 0.2, sw.d), sidewalkMaterial);
    sidewalk.position.set(sw.x, 0.1, sw.z);
    scene.add(sidewalk);
});

// Sistema de calles ordenado tipo GTA - grilla urbana
// Crear manzanas (bloques) verdes entre calles
function addUrbanBlock(x, z, sizeX = 35, sizeZ = 35) {
    // Césped/parque de manzana
    const block = new THREE.Mesh(
        new THREE.PlaneGeometry(sizeX, sizeZ),
        new THREE.MeshStandardMaterial({ color: 0x3a8a5c })
    );
    block.rotation.x = -Math.PI / 2;
    block.position.set(x, 0.005, z);
    scene.add(block);
    
    // Agregar edificios DENTRO de la manzana
    const buildingHeights = [6, 8, 7, 9, 6.5];
    const buildingWidths = [12, 14, 13, 16, 11];
    
    // Crear 1-3 edificios por manzana, distribuidos
    const numBuildings = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numBuildings; i++) {
        const bx = x + (Math.random() - 0.5) * (sizeX - 20);
        const bz = z + (Math.random() - 0.5) * (sizeZ - 20);
        const height = buildingHeights[Math.floor(Math.random() * buildingHeights.length)];
        const width = buildingWidths[Math.floor(Math.random() * buildingWidths.length)];
        const colorVar = Math.floor(Math.random() * 6);
        createBuilding(bx, bz, width, 10, height, colorVar);
    }
    
    // Árboles decorativos (menos cantidad ahora que hay edificios)
    const treeCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < treeCount; i++) {
        const tx = x + (Math.random() - 0.5) * sizeX * 0.6;
        const tz = z + (Math.random() - 0.5) * sizeZ * 0.6;
        const treeColors = [0x2d6a3d, 0x3d7f4a, 0x4c8d56];
        addTree(tx, tz, treeColors[Math.floor(Math.random() * treeColors.length)]);
    }
}

// Función para crear edificios urbanos con ventanas (optimizado)
function createBuilding(x, z, width = 15, depth = 12, height = 8, colorVariation = 0) {
    const colors = [
        0xb8a080,  // Ladrillo claro
        0xa58968,  // Ladrillo medio
        0x9a7a63,  // Ladrillo oscuro
        0xc0b0a0,  // Gris claro
        0x8a8a8a,  // Gris medio
        0x7a7a7a   // Gris oscuro
    ];
    const color = colors[colorVariation % colors.length];

    const building = new THREE.Group();
    
    // Cuerpo principal del edificio con ventanas texturizadas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Fondo del edificio
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, 256, 256);
    
    // Dibujar ventanas en la textura
    ctx.fillStyle = '#1a2830';
    const windowPixelSize = 20;
    for (let row = 0; row < 12; row++) {
        for (let col = 0; col < 12; col++) {
            const x_pix = col * 22 + 1;
            const y_pix = row * 22 + 1;
            if (x_pix < 256 && y_pix < 256) {
                ctx.fillRect(x_pix, y_pix, windowPixelSize, windowPixelSize);
                // Reflejo de luz
                ctx.fillStyle = '#445566';
                ctx.fillRect(x_pix + 2, y_pix + 2, 6, 6);
                ctx.fillStyle = '#1a2830';
            }
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    
    const bodyMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        bodyMaterial
    );
    body.position.y = height / 2;
    building.add(body);

    // Techo
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.4, 0.8, depth + 0.4),
        new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.8
        })
    );
    roof.position.y = height + 0.4;
    building.add(roof);

    building.position.set(x, 0, z);
    scene.add(building);
    return building;
}

// Definir tamaños de bloques (optimizado para rendimiento)
const blockSize = 35;
const streetWidth = 60;

// Generar bloques urbanos CON edificios integrados
for (let bx = -150; bx <= 150; bx += blockSize + streetWidth) {
    for (let bz = -450; bz <= 450; bz += blockSize + streetWidth) {
        const distToWaypoint = Math.min(...routeWaypoints.map(wp => 
            Math.sqrt((bx - wp.x) ** 2 + (bz - wp.z) ** 2)
        ));
        
        if (distToWaypoint > 50) {
            addUrbanBlock(bx, bz, blockSize, blockSize);
        }
    }
}

function addLampPost(x, z) {
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 4.2, 10),
        new THREE.MeshStandardMaterial({ color: 0x353c47, metalness: 0.4, roughness: 0.6 })
    );
    pole.position.set(x, 2.1, z);
    scene.add(pole);

    const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.2, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xd8e8ff, emissive: 0x6da9ff, emissiveIntensity: 0.3 })
    );
    lamp.position.set(x, 4.1, z + 0.2);
    scene.add(lamp);
}

function addTree(x, z, crownColor = 0x3e7d43) {
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.18, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x6f5134 })
    );
    trunk.position.set(x, 0.6, z);
    scene.add(trunk);

    const crown = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 12, 12),
        new THREE.MeshStandardMaterial({ color: crownColor })
    );
    crown.position.set(x, 1.55, z);
    scene.add(crown);
}

function addTrafficLight(x, z) {
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 3.1, 10),
        new THREE.MeshStandardMaterial({ color: 0x30343b })
    );
    pole.position.set(x, 1.55, z);
    scene.add(pole);

    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.9, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x1d2128 })
    );
    box.position.set(x, 2.5, z);
    scene.add(box);

    const red = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), new THREE.MeshStandardMaterial({ color: 0xff5e5e, emissive: 0x661515, emissiveIntensity: 0.55 }));
    red.position.set(x, 2.72, z + 0.15);
    scene.add(red);
}

// DELIMITACIÓN DE ZONAS - Calles vs Construcción
const STREET_WIDTH = 25;  // ±25 unidades en X = carril de conducción
const STREET_BOUNDARY_X = 32;  // Límite donde comienza zona de construcción

// Postes de luz FUERA DE LAS CALLES (en bordes de acera)
for (let z = -550; z <= 530; z += 25) {
    addLampPost(-STREET_BOUNDARY_X - 5, z);
    addLampPost(STREET_BOUNDARY_X + 5, z + 12);
}

// Árboles solo en zonas MUY alejadas de las calles
for (let z = -560; z <= 540; z += 30) {
    addTree(-200, z, 0x2d6a3d);
    addTree(200, z + 15, 0x3d7f4a);
}

// Semáforos SOLO en intersecciones principales dentro de las calles
const trafficLightPositions = [
    { x: 20, z: 280 },
    { x: -20, z: 280 },
    { x: 20, z: 80 },
    { x: -20, z: 80 },
    { x: 20, z: 0 },
    { x: -20, z: 0 },
    { x: 20, z: -100 },
    { x: -20, z: -100 },
    { x: 20, z: -220 },
    { x: -20, z: -220 }
];

trafficLightPositions.forEach((pos) => {
    addTrafficLight(pos.x, pos.z);
});

function addClinicLandmark(x, z) {
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(12, 8.5, 11),
        new THREE.MeshStandardMaterial({ color: 0xd7e3f1 })
    );
    base.position.set(x, 4.25, z);
    scene.add(base);

    const crossMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x1f4a7c, emissiveIntensity: 0.2 });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.8, 0.3), crossMat);
    crossV.position.set(x, 6.8, z + 5.7);
    scene.add(crossV);

    const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.8, 0.3), crossMat);
    crossH.position.set(x, 6.8, z + 5.7);
    scene.add(crossH);
}

addClinicLandmark(65, -500);

function addCone(x, z) {
    const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.62, 10),
        new THREE.MeshStandardMaterial({ color: 0xff8b2d, emissive: 0x5e2d05, emissiveIntensity: 0.2 })
    );
    cone.position.set(x, 0.32, z);
    scene.add(cone);

    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.08, 10),
        new THREE.MeshStandardMaterial({ color: 0x262626 })
    );
    base.position.set(x, 0.04, z);
    scene.add(base);

    return cone;
}

const cones = [];

// Conos en CALLES - Restricción de carriles en ciertas zonas
const coneZones = [
    // Zona norte - restricción lateral
    { posX: 10, startZ: 40, endZ: 80, step: 7, side: 1 },
    { posX: -10, startZ: 40, endZ: 80, step: 7, side: -1 },
    // Zona centro - restricción lateral
    { posX: 8, startZ: -60, endZ: -20, step: 8, side: 1 },
    { posX: -8, startZ: -60, endZ: -20, step: 8, side: -1 },
    // Zona sur - restricción central
    { posX: 0, startZ: -280, endZ: -240, step: 10, side: 0 }
];

coneZones.forEach(zone => {
    for (let z = zone.startZ; z <= zone.endZ; z += zone.step) {
        cones.push(addCone(zone.posX, z));
    }
});

const speedBumps = [];
const bumpMaterial = new THREE.MeshStandardMaterial({ color: 0xe5bf3f });

// Resaltos (Speed Bumps) SOLO EN CALLES - zonas residenciales y escolares
const bumpZones = [180, 44, -24, -176, -334];  // Posiciones Z de resaltos
bumpZones.forEach((z) => {
    const bump = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.14, 0.65), bumpMaterial);
    bump.position.set(0, 0.08, z);
    scene.add(bump);
    speedBumps.push(bump);
});

const zebraMaterial = new THREE.MeshStandardMaterial({ color: 0xe7edf3 });

// Paso de cebra inicial EN LA CALLE
for (let x = -3; x <= 3; x += 1) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 3.6), zebraMaterial);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.035, 58);
    scene.add(stripe);
}

// Pasos de cebra SOLO en intersecciones de calles principales
const pedestrianCrossings = [
    { x: 0, z: 430 }, { x: 0, z: 350 }, 
    { x: 0, z: 280 },  // Intersección principal norte
    { x: 0, z: 100 }, { x: 0, z: 0 }, 
    { x: 0, z: -100 },  // Centro
    { x: 0, z: -220 },  // Intersección sur
    { x: 0, z: -350 }   // Acceso clínica
];

pedestrianCrossings.forEach((crossing) => {
    for (let offset = -4; offset <= 4; offset += 1.2) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 3.2), zebraMaterial);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(crossing.x + offset, 0.035, crossing.z);
        scene.add(stripe);
    }
});

function createPedestrian(color = 0x2f6da4) {
    const p = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.55, 4, 8), new THREE.MeshStandardMaterial({ color }));
    body.position.y = 0.62;
    p.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshStandardMaterial({ color: 0xf2d6be }));
    head.position.y = 1.15;
    p.add(head);
    return p;
}

const pedestrians = [
    // Zona norte residencial
    { mesh: createPedestrian(0x2d77b6), x: -8, z: 420, xMin: -15, xMax: 10, dir: 1, speed: 0.035, radius: 1.25, activeRange: 120 },
    { mesh: createPedestrian(0xb6632d), x: 8, z: 400, xMin: 15, xMax: -10, dir: -1, speed: 0.038, radius: 1.25, activeRange: 120 },
    // Intersección norte
    { mesh: createPedestrian(0x43a061), x: 0, z: 320, xMin: -20, xMax: 20, dir: 1, speed: 0.04, radius: 1.2, activeRange: 100 },
    { mesh: createPedestrian(0x8b5fb9), x: 50, z: 280, xMin: 20, xMax: 60, dir: 1, speed: 0.042, radius: 1.25, activeRange: 110 },
    // Eje Este
    { mesh: createPedestrian(0x4f7d8b), x: 150, z: 200, xMin: 120, xMax: 180, dir: 1, speed: 0.036, radius: 1.2, activeRange: 115 },
    { mesh: createPedestrian(0x788c33), x: 130, z: 100, xMin: 160, xMax: 100, dir: -1, speed: 0.039, radius: 1.2, activeRange: 105 },
    // Zona central norte
    { mesh: createPedestrian(0xb7485f), x: -50, z: 150, xMin: -100, xMax: 0, dir: 1, speed: 0.034, radius: 1.25, activeRange: 100 },
    { mesh: createPedestrian(0x3a6ca2), x: 20, z: 80, xMin: -30, xMax: 60, dir: 1, speed: 0.041, radius: 1.2, activeRange: 120 },
    // Centro urbano
    { mesh: createPedestrian(0xd4a4ff), x: -30, z: 0, xMin: -60, xMax: 10, dir: 1, speed: 0.037, radius: 1.25, activeRange: 110 },
    { mesh: createPedestrian(0x99dd77), x: 30, z: 50, xMin: 0, xMax: 80, dir: 1, speed: 0.038, radius: 1.2, activeRange: 115 },
    // Zona sur este
    { mesh: createPedestrian(0xff9966), x: 110, z: -100, xMin: 70, xMax: 140, dir: 1, speed: 0.036, radius: 1.25, activeRange: 105 },
    { mesh: createPedestrian(0x66ccff), x: 100, z: -180, xMin: 140, xMax: 60, dir: -1, speed: 0.039, radius: 1.2, activeRange: 112 },
    // Zona sur oeste
    { mesh: createPedestrian(0xffcc99), x: -90, z: -220, xMin: -140, xMax: -40, dir: 1, speed: 0.035, radius: 1.25, activeRange: 110 },
    // Acceso a clínica
    { mesh: createPedestrian(0x99ff99), x: 0, z: -350, xMin: -30, xMax: 30, dir: 1, speed: 0.032, radius: 1.2, activeRange: 100 }
];

pedestrians.forEach((ped) => {
    ped.mesh.position.set(ped.x, 0.02, ped.z);
    ped.mesh.visible = false;
    scene.add(ped.mesh);
});

const vehicle = new THREE.Group();

const paintMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2f5fa,
    metalness: 0.42,
    roughness: 0.32
});
const emergencyRedMaterial = new THREE.MeshStandardMaterial({
    color: 0xc71f2f,
    metalness: 0.38,
    roughness: 0.34
});
const medicalWhiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fbff,
    metalness: 0.2,
    roughness: 0.4
});
const darkTrimMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1e24,
    metalness: 0.2,
    roughness: 0.75
});
const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x22384f,
    metalness: 0.05,
    roughness: 0.2
});

const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 0.42, 3.95),
    paintMaterial
);
chassis.position.y = 0.55;
vehicle.add(chassis);

const hood = new THREE.Mesh(
    new THREE.BoxGeometry(1.88, 0.25, 1.15),
    paintMaterial
);
hood.position.set(0, 0.83, 1.25);
vehicle.add(hood);

const roofBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 0.56, 1.95),
    paintMaterial
);
roofBase.position.set(0, 1.03, -0.28);
vehicle.add(roofBase);

const ambulanceCabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.68, 0.75, 2.05),
    medicalWhiteMaterial
);
ambulanceCabin.position.set(0, 1.34, -0.35);
vehicle.add(ambulanceCabin);

const sideStripeLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.2, 3.6),
    emergencyRedMaterial
);
sideStripeLeft.position.set(-1.03, 0.98, 0);
vehicle.add(sideStripeLeft);

const sideStripeRight = sideStripeLeft.clone();
sideStripeRight.position.x = 1.03;
vehicle.add(sideStripeRight);

const hoodStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.03, 1.2),
    emergencyRedMaterial
);
hoodStripe.position.set(0, 0.97, 1.25);
vehicle.add(hoodStripe);

const crossVerticalLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.28), emergencyRedMaterial);
crossVerticalLeft.position.set(-1.03, 1.1, 0.8);
vehicle.add(crossVerticalLeft);
const crossHorizontalLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.46), emergencyRedMaterial);
crossHorizontalLeft.position.set(-1.03, 1.1, 0.8);
vehicle.add(crossHorizontalLeft);

const crossVerticalRight = crossVerticalLeft.clone();
crossVerticalRight.position.x = 1.03;
vehicle.add(crossVerticalRight);
const crossHorizontalRight = crossHorizontalLeft.clone();
crossHorizontalRight.position.x = 1.03;
vehicle.add(crossHorizontalRight);

const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 0.45, 0.08),
    glassMaterial
);
windshield.position.set(0, 1.08, 0.72);
windshield.rotation.x = -0.48;
vehicle.add(windshield);

const rearWindow = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.38, 0.08),
    glassMaterial
);
rearWindow.position.set(0, 1.04, -1.17);
rearWindow.rotation.x = 0.45;
vehicle.add(rearWindow);

const frontBumper = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.18, 0.22),
    darkTrimMaterial
);
frontBumper.position.set(0, 0.4, 1.95);
vehicle.add(frontBumper);

const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.18, 0.22),
    darkTrimMaterial
);
rearBumper.position.set(0, 0.4, -1.95);
vehicle.add(rearBumper);

const headLightMat = new THREE.MeshStandardMaterial({ color: 0xdff8ff, emissive: 0x8ac4ff, emissiveIntensity: 0.28 });
const tailLightMat = new THREE.MeshStandardMaterial({ color: 0xff5d5d, emissive: 0x7a1010, emissiveIntensity: 0.28 });

const headLeft = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.08), headLightMat);
headLeft.position.set(-0.62, 0.63, 1.98);
vehicle.add(headLeft);
const headRight = headLeft.clone();
headRight.position.x = 0.62;
vehicle.add(headRight);

const tailLeft = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.08), tailLightMat);
tailLeft.position.set(-0.63, 0.62, -1.98);
vehicle.add(tailLeft);
const tailRight = tailLeft.clone();
tailRight.position.x = 0.63;
vehicle.add(tailRight);

const lightBarBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.06, 0.09, 0.34),
    new THREE.MeshStandardMaterial({ color: 0x1b1f25, metalness: 0.6, roughness: 0.3 })
);
lightBarBase.position.set(0, 1.78, 0.05);
vehicle.add(lightBarBase);

const sirenBlueMat = new THREE.MeshStandardMaterial({ color: 0x58a7ff, emissive: 0x113766, emissiveIntensity: 0.35 });
const sirenRedMat = new THREE.MeshStandardMaterial({ color: 0xff5c68, emissive: 0x66161c, emissiveIntensity: 0.35 });
const lightBarBlue = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.07, 0.25), sirenBlueMat);
lightBarBlue.position.set(-0.24, 1.82, 0.05);
vehicle.add(lightBarBlue);
const lightBarRed = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.07, 0.25), sirenRedMat);
lightBarRed.position.set(0.24, 1.82, 0.05);
vehicle.add(lightBarRed);

const wheelGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.33, 26);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.95 });
const rimMat = new THREE.MeshStandardMaterial({ color: 0xaeb8c2, metalness: 0.7, roughness: 0.3 });
const wheelPos = [
    [-1.02, 0.42, 1.25], [1.02, 0.42, 1.25],
    [-1.02, 0.42, -1.25], [1.02, 0.42, -1.25]
];

wheelPos.forEach((p) => {
    const w = new THREE.Mesh(wheelGeom, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(p[0], p[1], p[2]);
    vehicle.add(w);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.34, 18), rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(p[0], p[1], p[2]);
    vehicle.add(rim);
});

const sideSkirtLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 3.55), darkTrimMaterial);
sideSkirtLeft.position.set(-1.01, 0.44, 0);
vehicle.add(sideSkirtLeft);
const sideSkirtRight = sideSkirtLeft.clone();
sideSkirtRight.position.x = 1.01;
vehicle.add(sideSkirtRight);

const getVehicleScale = () => {
    if (window.innerWidth < 640) return 1.24;
    if (window.innerWidth < 980) return 1.12;
    return 1.0;
};

const applyVehicleScale = () => {
    const scale = getVehicleScale();
    vehicle.scale.set(scale, scale, scale);
};

vehicle.position.set(0, 0.05, 470);
applyVehicleScale();
scene.add(vehicle);

// Función para crear banderines de patrullaje
function createPatrolFlag(x, z, pointNumber) {
    const group = new THREE.Group();
    
    // Poste del banderín
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 3.5, 12),
        new THREE.MeshStandardMaterial({ color: 0x404040, metalness: 0.6 })
    );
    pole.position.set(0, 1.75, 0);
    group.add(pole);
    
    // Bandera (plano colorido)
    const flagColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff];
    const flagColor = flagColors[pointNumber % flagColors.length];
    
    const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 1.3),
        new THREE.MeshStandardMaterial({ 
            color: flagColor, 
            emissive: flagColor,
            emissiveIntensity: 0.3,
            side: THREE.DoubleSide
        })
    );
    flag.rotation.y = Math.PI / 4;
    flag.position.set(1.2, 2.8, 0);
    group.add(flag);
    
    // Número en el banderín (usando geometría simple)
    const numberGeom = new THREE.SphereGeometry(0.25, 16, 16);
    const numberMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        emissive: flagColor,
        emissiveIntensity: 0.6
    });
    const numberMesh = new THREE.Mesh(numberGeom, numberMat);
    numberMesh.position.set(1.2, 2.8, 0.15);
    group.add(numberMesh);
    
    // Luz del banderín
    const light = new THREE.PointLight(flagColor, 0.8, 15);
    light.position.set(1.2, 2.8, 0.5);
    group.add(light);
    
    group.position.set(x, 0, z);
    return group;
}

const checkpointMeshes = stages.map((stage, idx) => {
    const flag = createPatrolFlag(stage.x, stage.z, idx + 1);
    scene.add(flag);
    return flag;
});

// SISTEMA DE GUÍA DE NAVEGACIÓN
// Línea de guía visual desde el vehículo al siguiente checkpoint
let guideLine = null;
function createGuideLine() {
    const material = new THREE.LineBasicMaterial({ 
        color: 0x00ffcc, 
        linewidth: 3,
        transparent: true,
        opacity: 0.7,
        fog: false,
        depthTest: true
    });
    const geometry = new THREE.BufferGeometry();
    guideLine = new THREE.Line(geometry, material);
    scene.add(guideLine);
}

function updateGuideLine() {
    if (!guideLine || missionFinished || currentScenario >= stages.length) {
        if (guideLine && guideLine.geometry.attributes.position) {
            guideLine.geometry.attributes.position.needsUpdate = false;
        }
        return;
    }

    const stage = stages[currentScenario];
    const targetPos = new THREE.Vector3(stage.x, 0.5, stage.z);
    const currentPos = vehicle.position.clone();
    currentPos.y = 0.5;

    // Crear puntos intermedios para que la línea sea más suave
    const points = [];
    points.push(currentPos);
    
    // Agregar 2 puntos intermedios
    for (let i = 1; i < 3; i++) {
        const t = i / 3;
        const mid = new THREE.Vector3().lerpVectors(currentPos, targetPos, t);
        mid.y = 0.5 + Math.sin(t * Math.PI) * 2; // Curva suave
        points.push(mid);
    }
    
    points.push(targetPos);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    guideLine.geometry = geometry;
    guideLine.geometry.attributes.position.needsUpdate = true;
}

function updateNavigationHUD() {
    if (currentScenario >= stages.length || missionFinished) {
        navDestination.textContent = '✅ Misión Completada';
        navDistance.textContent = 'Distancia: 0 m';
        navAngle.textContent = '--';
        return;
    }

    const stage = stages[currentScenario];
    const targetPos = new THREE.Vector3(stage.x, 0, stage.z);
    const currentPos = vehicle.position;
    
    // Calcular distancia
    const distance = currentPos.distanceTo(targetPos);
    const distanceM = Math.round(distance * 10) * 10; // Redondear a decenas
    
    // Calcular ángulo hacia el objetivo
    const direction = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
    const vehicleForward = new THREE.Vector3(Math.sin(vehicle.rotation.y), 0, Math.cos(vehicle.rotation.y));
    
    // Ángulo entre la dirección del vehículo y el objetivo
    let angle = Math.atan2(direction.x, direction.z) - Math.atan2(vehicleForward.x, vehicleForward.z);
    
    // Normalizar ángulo a rango -PI a PI
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    
    // Convertir a grados
    const angleDeg = Math.round(angle * 180 / Math.PI);
    
    // Actualizar elementos del HUD
    const stageNum = currentScenario + 1;
    const stageName = stage.zone.charAt(0).toUpperCase() + stage.zone.slice(1);
    navDestination.textContent = `📍 Punto ${stageNum}: ${stageName}`;
    navDistance.textContent = `Distancia: ${distanceM} m`;
    navAngle.textContent = `${Math.abs(angleDeg)}°`;
    
    // Rotar la flecha de la brújula
    const rotation = angle;
    navDirectionArrow.style.transform = `rotate(${rotation}rad)`;
}

createGuideLine();

function addTrafficWheels(group, positions, radius = 0.28, width = 0.22) {
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.95 });
    const rimMatLocal = new THREE.MeshStandardMaterial({ color: 0xb8c1cb, metalness: 0.6, roughness: 0.35 });
    positions.forEach((p) => {
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 20), tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.position.set(p[0], p[1], p[2]);
        group.add(tire);

        const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.52, radius * 0.52, width + 0.01, 14), rimMatLocal);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(p[0], p[1], p[2]);
        group.add(rim);
    });
}

function createNpcVehicle(type = 'car', color = 0x3e78d8) {
    const group = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({ color, metalness: 0.28, roughness: 0.55 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1f232a, roughness: 0.5 });

    if (type === 'bus') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 6.2), paint);
        body.position.y = 0.78;
        group.add(body);

        const top = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.55, 5.8), new THREE.MeshStandardMaterial({ color: 0x2a3f58, roughness: 0.32 }));
        top.position.set(0, 1.28, -0.1);
        group.add(top);

        const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.12, 5.8), new THREE.MeshStandardMaterial({ color: 0xe8edf5 }));
        stripe.position.set(0, 0.95, -0.1);
        group.add(stripe);

        addTrafficWheels(group, [
            [-1.08, 0.36, 2.1], [1.08, 0.36, 2.1],
            [-1.08, 0.36, -0.1], [1.08, 0.36, -0.1],
            [-1.08, 0.36, -2.2], [1.08, 0.36, -2.2]
        ], 0.34, 0.25);
    } else if (type === 'truck') {
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.72, 2.1), paint);
        cabin.position.set(0, 0.8, 1.2);
        group.add(cabin);

        const cargo = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.95, 3.4), new THREE.MeshStandardMaterial({ color: 0xd9dde2, roughness: 0.6 }));
        cargo.position.set(0, 0.85, -1.05);
        group.add(cargo);

        const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.16, 0.2), dark);
        bumper.position.set(0, 0.34, 2.2);
        group.add(bumper);

        addTrafficWheels(group, [
            [-1.05, 0.34, 1.2], [1.05, 0.34, 1.2],
            [-1.05, 0.34, -1.8], [1.05, 0.34, -1.8]
        ], 0.31, 0.24);
    } else {
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 3.2), paint);
        body.position.y = 0.45;
        group.add(body);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 1.5), new THREE.MeshStandardMaterial({ color: 0x203247, roughness: 0.3 }));
        cabin.position.set(0, 0.82, -0.2);
        group.add(cabin);

        addTrafficWheels(group, [
            [-0.9, 0.26, 1.0], [0.9, 0.26, 1.0],
            [-0.9, 0.26, -1.0], [0.9, 0.26, -1.0]
        ], 0.26, 0.2);
    }

    return group;
}

const npcVehicles = [
    { mesh: createNpcVehicle('car', 0x3e78d8), speed: 0.18, laneX: -4.2, minZ: -580, maxZ: 550, dir: 1, radius: 3.0 },
    { mesh: createNpcVehicle('car', 0xd85353), speed: 0.15, laneX: 4.2, minZ: -580, maxZ: 550, dir: -1, radius: 3.0 },
    { mesh: createNpcVehicle('truck', 0x5ca05f), speed: 0.12, laneX: -7.2, minZ: -580, maxZ: 550, dir: 1, radius: 3.4 },
    { mesh: createNpcVehicle('bus', 0x396ba8), speed: 0.1, laneX: 7.1, minZ: -580, maxZ: 550, dir: -1, radius: 4.0 },
    { mesh: createNpcVehicle('car', 0xd6a244), speed: 0.19, laneX: -2.6, minZ: -580, maxZ: 550, dir: 1, radius: 2.9 },
    { mesh: createNpcVehicle('truck', 0x777f8a), speed: 0.11, laneX: 2.6, minZ: -580, maxZ: 550, dir: -1, radius: 3.5 },
    { mesh: createNpcVehicle('bus', 0x4c7fb5), speed: 0.09, laneX: -9.2, minZ: -580, maxZ: 550, dir: 1, radius: 4.1 },
    { mesh: createNpcVehicle('car', 0x9f5cc9), speed: 0.2, laneX: 9.0, minZ: -580, maxZ: 550, dir: -1, radius: 2.9 }
];

npcVehicles[0].mesh.position.set(-4.2, 0.02, -280);
npcVehicles[1].mesh.position.set(4.2, 0.02, 420);
npcVehicles[2].mesh.position.set(-7.2, 0.02, -40);
npcVehicles[3].mesh.position.set(7.1, 0.02, 260);
npcVehicles[4].mesh.position.set(-2.6, 0.02, 90);
npcVehicles[5].mesh.position.set(2.6, 0.02, -360);
npcVehicles[6].mesh.position.set(-9.2, 0.02, -470);
npcVehicles[7].mesh.position.set(9.0, 0.02, 170);
npcVehicles.forEach((npc) => scene.add(npc.mesh));

function createCrossTrafficVehicle(cfg) {
    const entry = {
        mesh: createNpcVehicle(cfg.type, cfg.color),
        laneZ: cfg.laneZ,
        dir: cfg.dir,
        speed: cfg.speed,
        minX: cfg.minX,
        maxX: cfg.maxX,
        startX: cfg.startX,
        radius: cfg.radius,
        activeRange: cfg.activeRange
    };
    entry.mesh.position.set(entry.startX, 0.02, entry.laneZ);
    entry.mesh.rotation.y = entry.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
    return entry;
}

const crossTrafficVehicles = [
    createCrossTrafficVehicle({ laneZ: 360, dir: 1, speed: 0.11, minX: -24, maxX: 24, startX: -20, type: 'car', color: 0x5d8ad1, radius: 3.0, activeRange: 120 }),
    createCrossTrafficVehicle({ laneZ: 300, dir: -1, speed: 0.1, minX: -24, maxX: 24, startX: 22, type: 'car', color: 0xbf6a48, radius: 3.0, activeRange: 120 }),
    createCrossTrafficVehicle({ laneZ: 240, dir: 1, speed: 0.085, minX: -25, maxX: 25, startX: -21, type: 'bus', color: 0x4571ab, radius: 3.9, activeRange: 130 }),
    createCrossTrafficVehicle({ laneZ: 120, dir: -1, speed: 0.094, minX: -24, maxX: 24, startX: 21, type: 'truck', color: 0x85919e, radius: 3.4, activeRange: 125 }),
    createCrossTrafficVehicle({ laneZ: 0, dir: 1, speed: 0.115, minX: -24, maxX: 24, startX: -18, type: 'car', color: 0xa66acf, radius: 3.0, activeRange: 120 }),
    createCrossTrafficVehicle({ laneZ: -120, dir: -1, speed: 0.09, minX: -24, maxX: 24, startX: 19, type: 'truck', color: 0x63a26f, radius: 3.5, activeRange: 125 }),
    createCrossTrafficVehicle({ laneZ: -240, dir: 1, speed: 0.082, minX: -25, maxX: 25, startX: -23, type: 'bus', color: 0x2f5f94, radius: 4.0, activeRange: 132 }),
    createCrossTrafficVehicle({ laneZ: -360, dir: -1, speed: 0.108, minX: -24, maxX: 24, startX: 20, type: 'car', color: 0xd17b5a, radius: 3.0, activeRange: 120 }),
    createCrossTrafficVehicle({ laneZ: -490, dir: 1, speed: 0.088, minX: -25, maxX: 25, startX: -22, type: 'truck', color: 0x7f8a95, radius: 3.5, activeRange: 130 })
];
crossTrafficVehicles.forEach((cross) => scene.add(cross.mesh));

const keys = {};
let speed = 0;
let throttleHold = 0;
let score = 0;
let streak = 0;
let collected = 0;
let currentScenario = 0;
let safeActions = 0;
let infractions = 0;
let missionFinished = false;
let challengeLevel = 0;
let learnerMode = 'student';
let activeDistrictName = 'Providencia norte';
const crossingSafety = new Map();

function getAccuracy() {
    const total = safeActions + infractions;
    if (!total) return 100;
    return Math.round((safeActions / total) * 100);
}

function getDifficultyProfile() {
    return difficultyProfiles[challengeLevel] || difficultyProfiles[1];
}

function updateMission() {
    const stage = stages[Math.min(currentScenario, stages.length - 1)] || stages[0];
    if (!stage) return;

    missionTitle.textContent = currentScenario >= stages.length ? 'Operacion completada' : stage.chapter;
    missionText.textContent = currentScenario >= stages.length
        ? 'Llegaste a la clinica. Priorizaste peatones y mantuviste una conduccion segura.'
        : stage.learning + ' Prioriza traslado de urgencia con rapidez y control. Zona activa: ' + activeDistrictName + '.';
    missionChapter.textContent = currentScenario >= stages.length
        ? 'Traslado finalizado'
        : 'Etapa ' + (currentScenario + 1) + ' / ' + stages.length;
    missionDifficulty.textContent = difficultyNames[challengeLevel] || difficultyNames[1];
    missionAccuracy.textContent = 'Convivencia ' + getAccuracy() + '%';
}

function updateDistrictState() {
    const x = vehicle.position.x;
    const z = vehicle.position.z;
    const district = districtZones.find((item) => 
        x >= item.xMin && x <= item.xMax && z >= item.zMin && z <= item.zMax
    ) || districtZones[districtZones.length - 1];
    activeDistrictName = district.name;
}

const hotspotMeshes = [];
const hotspotData = [
    { x: -8.5, z: 420, msg: 'Tip: Inicia con control suave de aceleración en zona residencial.' },
    { x: 8.2, z: 320, msg: 'Tip: Anticipa el giro a la derecha, reduce velocidad antes de la curva.' },
    { x: 130, z: 180, msg: 'Tip: En eje este mantén distancia de vehículos que cruzan.' },
    { x: 120, z: 50, msg: 'Tip: Prepárate para girar izquierda hacia zona oeste.' },
    { x: -8.3, z: 100, msg: 'Tip: Zona central con alto tráfico, máxima precaución.' },
    { x: -130, z: 150, msg: 'Tip: En sector oeste modera velocidad para el retorno.' },
    { x: 80, z: -150, msg: 'Tip: Nueva curva sur, anticipa cambio de dirección.' },
    { x: -80, z: -220, msg: 'Tip: En zona sur aumenta atención a peatones urbanos.' },
    { x: 8.3, z: -350, msg: 'Tip: Aproximación final a destino, reducir velocidad progresivamente.' },
    { x: 0, z: -450, msg: 'Tip: Llegada a clínica: estaciona con máxima seguridad.' }
];

hotspotData.forEach((item) => {
    const g = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.12, 12, 18),
        new THREE.MeshStandardMaterial({ color: 0xffcf54, emissive: 0x7a5a12, emissiveIntensity: 0.35 })
    );
    g.rotation.x = Math.PI / 2;
    g.position.set(item.x, 0.6, item.z);
    g.userData = { collected: false, msg: item.msg };
    scene.add(g);
    hotspotMeshes.push(g);
});

collectTotal.textContent = String(hotspotMeshes.length);

let toastTimer;

class InfractionSystem {
    constructor() {
        this.infractions = [];
        this.lastInfractionTime = {};
        this.infractionCooldown = 1000;
    }

    recordInfraction(type, severity = 1, message = '') {
        const now = Date.now();
        if (this.lastInfractionTime[type] && now - this.lastInfractionTime[type] < this.infractionCooldown) {
            return;
        }

        this.lastInfractionTime[type] = now;
        const infraction = {
            type,
            severity,
            timestamp: now,
            message
        };
        this.infractions.push(infraction);
        infractions++;
        return infraction;
    }

    getPenalty(type) {
        switch (type) {
            case INFRACTION_TYPES.RED_LIGHT:
                return CHILEAN_TRAFFIC_RULES.redLightPenalty;
            case INFRACTION_TYPES.PEDESTRIAN_VIOLATION:
                return CHILEAN_TRAFFIC_RULES.pedestrianCollisionPenalty;
            case INFRACTION_TYPES.SPEEDING:
                return CHILEAN_TRAFFIC_RULES.speedExcessPenalty;
            case INFRACTION_TYPES.UNSAFE_DISTANCE:
                return CHILEAN_TRAFFIC_RULES.laneChangePenalty;
            case INFRACTION_TYPES.COLLISION:
                return CHILEAN_TRAFFIC_RULES.vehicleCollisionPenalty;
            case INFRACTION_TYPES.RECKLESS_MANEUVER:
                return 30;
            case INFRACTION_TYPES.SAFE_MANEUVER:
                return -CHILEAN_TRAFFIC_RULES.safeManeuverBonus;
            default:
                return 0;
        }
    }

    clear() {
        this.infractions = [];
        this.lastInfractionTime = {};
    }
}

class EmergencyAudioSystem {
    constructor() {
        this.sirenVolume = 0.5;
        this.siren = null;
        this.audioAvailable = typeof window.Howl !== 'undefined';
        this.initAudio();
    }

    initAudio() {
        if (!this.audioAvailable) {
            console.log('Howler.js no disponible');
            return;
        }
        try {
            this.siren = new window.Howl({
                src: ['data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YSIAAAAAAA=='],
                loop: true,
                volume: this.sirenVolume
            });
        } catch (e) {
            console.log('Error inicializando audio:', e);
            this.audioAvailable = false;
        }
    }

    playSiren() {
        if (!this.audioAvailable || !this.siren) return;
        try {
            this.siren.volume(this.sirenVolume);
            if (!this.siren.playing()) {
                this.siren.play();
            }
        } catch (e) {
            console.log('Error reproduciendo sirena', e);
        }
    }

    stopSiren() {
        if (!this.audioAvailable || !this.siren) return;
        try {
            if (this.siren.playing()) {
                this.siren.stop();
            }
        } catch (e) {
            console.log('Error deteniendo sirena', e);
        }
    }

    setSirenIntensity(frequency) {
        if (!this.audioAvailable || !this.siren) return;
        try {
            if (this.siren.playing()) {
                this.sirenVolume = Math.min(frequency / 100, 1.0);
                this.siren.volume(this.sirenVolume);
            }
        } catch (e) {
            // Silenciar errores de audio
        }
    }
}

const infractionSystem = new InfractionSystem();
const emergencyAudio = new EmergencyAudioSystem();

const acceleration = 0.0068;
const turnSpeed = 0.028;
const maxSpeed = 0.34;
const friction = 0.97;
const throttleFriction = 0.992;
const coastFriction = 0.968;
const mapWorld = {
    minX: -18,
    maxX: 18,
    minZ: -600,
    maxZ: 550
};

function updateHud() {
    scoreValue.textContent = String(score);
    scenarioIndex.textContent = String(Math.min(currentScenario + 1, stages.length));
    streakValue.textContent = String(streak);
    collectValue.textContent = String(collected);
    accuracyValue.textContent = getAccuracy() + '%';
    challengeValue.textContent = difficultyNames[challengeLevel] || difficultyNames[1];
    const progress = Math.round((currentScenario / stages.length) * 100);
    progressText.textContent = progress + '%';
    progressBar.style.width = progress + '%';
    speedValue.textContent = String(Math.max(0, Math.round(Math.abs(speed) * 220)));
    infractionValue.textContent = String(infractionSystem.infractions.length);
    
    if (infractionSystem.infractions.length > 0) {
        const lastInfraction = infractionSystem.infractions[infractionSystem.infractions.length - 1];
        lastInfractionValue.textContent = lastInfraction.message.substring(0, 30) + '...';
    } else {
        lastInfractionValue.textContent = 'Ninguna';
    }
    
    updateMission();
}

function worldToMiniMap(x, z, size) {
    const px = ((x - mapWorld.minX) / (mapWorld.maxX - mapWorld.minX)) * size;
    const pz = ((mapWorld.maxZ - z) / (mapWorld.maxZ - mapWorld.minZ)) * size;
    return {
        x: Math.max(0, Math.min(size, px)),
        y: Math.max(0, Math.min(size, pz))
    };
}

function drawMiniMap() {
    const size = miniMapCanvas.width;
    const center = size / 2;
    const radius = center - 2;

    miniMapCtx.clearRect(0, 0, size, size);
    miniMapCtx.save();
    miniMapCtx.beginPath();
    miniMapCtx.arc(center, center, radius, 0, Math.PI * 2);
    miniMapCtx.clip();

    miniMapCtx.fillStyle = '#122431';
    miniMapCtx.fillRect(0, 0, size, size);

    const roadTop = worldToMiniMap(0, mapWorld.maxZ, size).y;
    const roadBottom = worldToMiniMap(0, mapWorld.minZ, size).y;
    const roadLeft = worldToMiniMap(-15, 0, size).x;
    const roadRight = worldToMiniMap(15, 0, size).x;

    miniMapCtx.fillStyle = '#2d3440';
    miniMapCtx.fillRect(roadLeft, roadTop, roadRight - roadLeft, roadBottom - roadTop);

    miniMapCtx.strokeStyle = '#ffe16a';
    miniMapCtx.setLineDash([6, 8]);
    miniMapCtx.lineWidth = 2;
    miniMapCtx.beginPath();
    const laneX = worldToMiniMap(0, 0, size).x;
    miniMapCtx.moveTo(laneX, roadTop);
    miniMapCtx.lineTo(laneX, roadBottom);
    miniMapCtx.stroke();
    miniMapCtx.setLineDash([]);

    miniMapCtx.strokeStyle = 'rgba(230, 238, 247, 0.5)';
    miniMapCtx.lineWidth = 1;
    
    // Dibujar la ruta completa conectando waypoints
    miniMapCtx.strokeStyle = 'rgba(93, 184, 255, 0.6)';
    miniMapCtx.lineWidth = 2.5;
    miniMapCtx.setLineDash([8, 4]);
    miniMapCtx.beginPath();
    for (let i = 0; i < routeWaypoints.length; i++) {
        const wp = routeWaypoints[i];
        const pos = worldToMiniMap(wp.x, wp.z, size);
        if (i === 0) {
            miniMapCtx.moveTo(pos.x, pos.y);
        } else {
            miniMapCtx.lineTo(pos.x, pos.y);
        }
    }
    miniMapCtx.stroke();
    miniMapCtx.setLineDash([]);
    
    // Dibujar intersecciones basadas en waypoints
    routeWaypoints.forEach((wp) => {
        const pos = worldToMiniMap(wp.x, wp.z, size);
        miniMapCtx.beginPath();
        miniMapCtx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
        miniMapCtx.stroke();
    });

    checkpointMeshes.forEach((cp, index) => {
        const cpPos = worldToMiniMap(cp.position.x, cp.position.z, size);
        
        if (index < currentScenario) {
            // Completado - Verde
            miniMapCtx.fillStyle = '#2add79';
            miniMapCtx.strokeStyle = '#1aa85a';
            miniMapCtx.lineWidth = 2;
            miniMapCtx.beginPath();
            miniMapCtx.arc(cpPos.x, cpPos.y, 5.5, 0, Math.PI * 2);
            miniMapCtx.fill();
            miniMapCtx.stroke();
            
            // Checkmark en los completados
            miniMapCtx.fillStyle = '#0a1f1a';
            miniMapCtx.font = 'bold 8px Arial';
            miniMapCtx.textAlign = 'center';
            miniMapCtx.textBaseline = 'middle';
            miniMapCtx.fillText('✓', cpPos.x, cpPos.y);
        } else if (index === currentScenario) {
            // Próximo objetivo - Amarillo/Dorado pulsante
            const pulse = Math.sin(performance.now() * 0.004) * 0.5 + 0.5;
            const size_pulsante = 5 + pulse * 2.5;
            miniMapCtx.fillStyle = '#ffed4e';
            miniMapCtx.strokeStyle = '#ffc94a';
            miniMapCtx.lineWidth = 2.5;
            miniMapCtx.beginPath();
            miniMapCtx.arc(cpPos.x, cpPos.y, size_pulsante, 0, Math.PI * 2);
            miniMapCtx.fill();
            miniMapCtx.stroke();
            
            // Número del punto actual
            miniMapCtx.fillStyle = '#000000';
            miniMapCtx.font = 'bold 9px Arial';
            miniMapCtx.fillText(String(index + 1), cpPos.x, cpPos.y);
        } else {
            // Pendientes - Rojo claro
            miniMapCtx.fillStyle = '#ff6b6b';
            miniMapCtx.strokeStyle = '#cc3333';
            miniMapCtx.lineWidth = 1.5;
            miniMapCtx.beginPath();
            miniMapCtx.arc(cpPos.x, cpPos.y, 4.5, 0, Math.PI * 2);
            miniMapCtx.fill();
            miniMapCtx.stroke();
            
            // Número del punto pendiente
            miniMapCtx.fillStyle = '#ffffff';
            miniMapCtx.font = 'bold 8px Arial';
            miniMapCtx.fillText(String(index + 1), cpPos.x, cpPos.y);
        }
    });

    npcVehicles.forEach((npc) => {
        const npcPos = worldToMiniMap(npc.mesh.position.x, npc.mesh.position.z, size);
        miniMapCtx.fillStyle = '#ffb34a';
        miniMapCtx.beginPath();
        miniMapCtx.arc(npcPos.x, npcPos.y, 2.8, 0, Math.PI * 2);
        miniMapCtx.fill();
    });

    crossTrafficVehicles.forEach((cross) => {
        if (!cross.mesh.visible) return;
        const crossPos = worldToMiniMap(cross.mesh.position.x, cross.mesh.position.z, size);
        miniMapCtx.fillStyle = '#7fe3ff';
        miniMapCtx.beginPath();
        miniMapCtx.arc(crossPos.x, crossPos.y, 2.6, 0, Math.PI * 2);
        miniMapCtx.fill();
    });

    const vehiclePos = worldToMiniMap(vehicle.position.x, vehicle.position.z, size);
    miniMapCtx.save();
    miniMapCtx.translate(vehiclePos.x, vehiclePos.y);
    miniMapCtx.rotate(vehicle.rotation.y);
    miniMapCtx.fillStyle = '#ff4f66';
    miniMapCtx.beginPath();
    miniMapCtx.moveTo(0, -7);
    miniMapCtx.lineTo(5.2, 5.8);
    miniMapCtx.lineTo(-5.2, 5.8);
    miniMapCtx.closePath();
    miniMapCtx.fill();
    miniMapCtx.restore();

    miniMapCtx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    miniMapCtx.lineWidth = 1.4;
    miniMapCtx.beginPath();
    miniMapCtx.arc(center, center, radius - 1, 0, Math.PI * 2);
    miniMapCtx.stroke();
    miniMapCtx.restore();
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}

function setLearnerMode(mode) {
    learnerMode = mode;
    modeStudent.classList.toggle('active', mode === 'student');
    modePost.classList.toggle('active', mode === 'post');
}

function showMissionModal() {
    missionModal.classList.remove('hidden');
    
    // Si hay una narrativa seleccionada, usar su configuración
    if (narrativeMode) {
        const config = narrativeConfigurations[narrativeMode];
        modalMissionTitle.textContent = config.missionTitle;
        const missionIntro = document.getElementById('missionIntro');
        if (missionIntro) missionIntro.textContent = config.missionIntro;
        const objectivesTitle = document.querySelector('.mission-objectives h3');
        if (objectivesTitle) objectivesTitle.textContent = config.objectivesTitle;
        const objectivesList = document.getElementById('objectivesList');
        if (objectivesList) objectivesList.innerHTML = config.objectives.map(obj => `<li>${obj}</li>`).join('');
        startMissionBtn.textContent = config.buttonText;
    } else {
        // Fallback por defecto
        modalMissionTitle.textContent = 'Patrullaje Urbano';
        getObjectivesList().style.display = 'block';
        getMissionRules().style.display = 'block';
        const missionIntro = document.getElementById('missionIntro');
        if (missionIntro) missionIntro.textContent = '¡Bienvenido Agente! Tu misión es completar un patrullaje de seguridad vial en la ciudad.';
        startMissionBtn.textContent = 'Comenzar Misión 🚓';
    }
}

function showMissionCompletedModal() {
    missionModal.classList.remove('hidden');
    modalMissionTitle.textContent = '✅ ¡Misión Completada!';
    getObjectivesList().style.display = 'none';
    getMissionRules().style.display = 'none';
    getMissionIntro().textContent = `🎉 ¡Felicidades! Completaste el patrullaje urbano con un score de ${score} puntos y ${getAccuracy()}% de convivencia vial.`;
    startMissionBtn.textContent = 'Nueva Misión';
    startMissionBtn.addEventListener('click', resetGame, { once: true });
}

function getObjectivesList() {
    return document.querySelector('.mission-objectives');
}

function getMissionRules() {
    return document.querySelector('.mission-rules');
}

function getMissionIntro() {
    return document.querySelector('.mission-intro');
}

function closeMissionModal() {
    missionModal.classList.add('hidden');
}

function penalize(message, amount = 30, infractionType = INFRACTION_TYPES.RECKLESS_MANEUVER) {
    score = Math.max(0, score - amount);
    streak = 0;
    challengeLevel = Math.max(0, challengeLevel - 1);
    
    const infraction = infractionSystem.recordInfraction(infractionType, 1, message);
    if (infraction) {
        showToast(message + ' (-' + amount + ')');
    }
    
    updateHud();
}

function reward(message, amount = 40) {
    score += amount;
    safeActions += 1;
    streak += 1;
    challengeLevel = Math.min(2, challengeLevel + 1);
    
    infractionSystem.recordInfraction(INFRACTION_TYPES.SAFE_MANEUVER, -1, message);
    showToast(message + ' (+' + amount + ')');
    updateHud();
}

function resetGame() {
    vehicle.position.set(0, 0.05, 470);
    vehicle.rotation.set(0, 0, 0);
    speed = 0;
    throttleHold = 0;
    score = 0;
    streak = 0;
    collected = 0;
    safeActions = 0;
    infractions = 0;
    challengeLevel = 0;
    currentScenario = 0;
    missionFinished = false;
    infractionSystem.clear();
    emergencyAudio.stopSiren();
    hotspotMeshes.forEach((hotspot) => {
        hotspot.userData.collected = false;
        hotspot.visible = true;
    });
    cones.forEach((cone) => {
        cone.visible = true;
    });
    npcVehicles[0].mesh.position.set(-4.2, 0.02, -280);
    npcVehicles[1].mesh.position.set(4.2, 0.02, 420);
    npcVehicles[2].mesh.position.set(-7.2, 0.02, -40);
    npcVehicles[3].mesh.position.set(7.1, 0.02, 260);
    npcVehicles[4].mesh.position.set(-2.6, 0.02, 90);
    npcVehicles[5].mesh.position.set(2.6, 0.02, -360);
    npcVehicles[6].mesh.position.set(-9.2, 0.02, -470);
    npcVehicles[7].mesh.position.set(9.0, 0.02, 170);
    crossTrafficVehicles.forEach((cross) => {
        cross.mesh.position.set(cross.startX, 0.02, cross.laneZ);
        cross.mesh.rotation.y = cross.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
        cross.mesh.visible = false;
    });
    applyVehicleScale();
    updateHud();
    updateNavigationHUD();
    drawMiniMap();
    showMissionModal();
}

// Joystick Control Variables
let joystickX = 0;
let joystickY = 0;
let joystickActive = false;
const joystickBase = document.getElementById('joystickBase');
const joystickHandle = document.getElementById('joystickHandle');
const joystickValX = document.getElementById('joystickValX');
const joystickValY = document.getElementById('joystickValY');
const maxJoystickRadius = 75;

function updateJoystickDisplay() {
    joystickValX.textContent = joystickX.toFixed(2);
    joystickValY.textContent = joystickY.toFixed(2);
}

function handleJoystickMove(clientX, clientY) {
    if (!joystickActive) return;

    const rect = joystickBase.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let diffX = clientX - centerX;
    let diffY = clientY - centerY;

    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    if (distance > maxJoystickRadius) {
        const angle = Math.atan2(diffY, diffX);
        diffX = Math.cos(angle) * maxJoystickRadius;
        diffY = Math.sin(angle) * maxJoystickRadius;
    }

    joystickHandle.style.transform = `translate(${diffX}px, ${diffY}px)`;
    joystickX = parseFloat((diffX / maxJoystickRadius).toFixed(2));
    joystickY = parseFloat((diffY / maxJoystickRadius * -1).toFixed(2));
    updateJoystickDisplay();
}

function stopJoystick() {
    joystickActive = false;
    joystickHandle.style.transition = 'transform 0.2s ease-out';
    joystickHandle.style.transform = 'translate(0, 0)';
    joystickX = 0;
    joystickY = 0;
    updateJoystickDisplay();
}

function startJoystick() {
    joystickActive = true;
    joystickHandle.style.transition = 'none';
}

// Joystick Events - Mouse
joystickHandle.addEventListener('mousedown', startJoystick);
window.addEventListener('mousemove', (e) => handleJoystickMove(e.clientX, e.clientY));
window.addEventListener('mouseup', stopJoystick);

// Joystick Events - Touch
joystickHandle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startJoystick();
});
window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (joystickActive && e.touches.length > 0) {
        handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: false });
window.addEventListener('touchend', stopJoystick);

// Keyboard Controls
resetBtn.addEventListener('click', resetGame);
modeStudent.addEventListener('click', () => setLearnerMode('student'));
modePost.addEventListener('click', () => setLearnerMode('post'));

// Modal Controls
startMissionBtn.addEventListener('click', closeMissionModal);
closeModalBtn.addEventListener('click', closeMissionModal);

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'r') resetGame();
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

document.querySelectorAll('.touch-btn[data-key]').forEach((btn) => {
    const key = btn.getAttribute('data-key');
    const start = (event) => {
        event.preventDefault();
        keys[key] = true;
    };
    const end = (event) => {
        event.preventDefault();
        keys[key] = false;
    };

    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointerleave', end);
    btn.addEventListener('pointercancel', end);
});

function updateVehicle() {
    if (missionFinished) return;

    const profile = getDifficultyProfile();
    const forwardKey = keys['w'] || keys['arrowup'];
    const backwardKey = keys['s'] || keys['arrowdown'];
    const forwardJoy = joystickY > 0.1;
    const backwardJoy = joystickY < -0.1;
    const pressingForward = forwardKey || forwardJoy;

    // Keyboard input
    if (keys['a'] || keys['arrowleft']) vehicle.rotation.y += profile.turnSpeed;
    if (keys['d'] || keys['arrowright']) vehicle.rotation.y -= profile.turnSpeed;

    if (pressingForward && !backwardKey && !backwardJoy) {
        throttleHold = Math.min(90, throttleHold + 1);
    } else {
        throttleHold = Math.max(0, throttleHold - 4);
    }
    const throttleRamp = 1 + (throttleHold / 90) * 1.4;

    if (forwardKey) speed += acceleration * throttleRamp;
    if (backwardKey) speed -= acceleration * 1.2;

    // Joystick input (analog control with higher precision)
    if (Math.abs(joystickX) > 0.1) {
        vehicle.rotation.y -= joystickX * profile.turnSpeed * 1.5;
    }
    if (forwardJoy) {
        speed += joystickY * acceleration * 2.4 * throttleRamp;
    } else if (backwardJoy) {
        speed += joystickY * acceleration * 1.8;
    }

    speed *= pressingForward ? throttleFriction : coastFriction;
    if (backwardKey && speed > 0.02) speed *= 0.94;
    speed = Math.max(-profile.maxSpeed * 0.45, Math.min(profile.maxSpeed, speed));
    vehicle.translateZ(-speed);

    // Límites expandidos: zona de juego mucho más amplia para permitir maniobrabilidad
    // El circuito ahora permite moverse en toda la zona con giros y cursas
    vehicle.position.x = Math.max(-280, Math.min(280, vehicle.position.x));
    vehicle.position.z = Math.max(-500, Math.min(500, vehicle.position.z));

    const desiredOffset = new THREE.Vector3(0, 6.2, 13.5).applyMatrix4(vehicle.matrixWorld);
    camera.position.lerp(desiredOffset, 0.1);
    camera.lookAt(vehicle.position.x, vehicle.position.y + 0.8, vehicle.position.z - 7);
}

function updateNpcTraffic() {
    npcVehicles.forEach((npc) => {
        const isNear = Math.abs(npc.mesh.position.z - vehicle.position.z) < 170;
        npc.mesh.visible = isNear;
        if (!isNear) return;

        npc.mesh.position.z += npc.speed * npc.dir;
        npc.mesh.position.x = npc.laneX;

        if (npc.mesh.position.z > npc.maxZ) npc.mesh.position.z = npc.minZ;
        if (npc.mesh.position.z < npc.minZ) npc.mesh.position.z = npc.maxZ;

        npc.mesh.rotation.y = npc.dir > 0 ? Math.PI : 0;
    });
}

function updateCrossTraffic() {
    crossTrafficVehicles.forEach((cross) => {
        const isNear = Math.abs(cross.laneZ - vehicle.position.z) < cross.activeRange;
        cross.mesh.visible = isNear;
        if (!isNear) return;

        cross.mesh.position.x += cross.speed * cross.dir;
        cross.mesh.position.z = cross.laneZ;
        cross.mesh.rotation.y = cross.dir > 0 ? -Math.PI / 2 : Math.PI / 2;

        if (cross.dir > 0 && cross.mesh.position.x > cross.maxX) {
            cross.mesh.position.x = cross.minX;
        }
        if (cross.dir < 0 && cross.mesh.position.x < cross.minX) {
            cross.mesh.position.x = cross.maxX;
        }
    });
}

function updatePedestrians() {
    pedestrians.forEach((ped, idx) => {
        const distVec = new THREE.Vector3(
            vehicle.position.x - ped.mesh.position.x,
            0,
            vehicle.position.z - ped.z
        );
        const dist = distVec.length();
        const isNear = dist < ped.activeRange;
        ped.mesh.visible = isNear;
        
        if (!isNear) return;

        ped.mesh.position.x += ped.speed * ped.dir;
        ped.mesh.position.z = ped.z;
        ped.mesh.rotation.y = ped.dir > 0 ? -Math.PI / 2 : Math.PI / 2;

        if (ped.dir > 0 && ped.mesh.position.x > ped.xMax) {
            ped.mesh.position.x = ped.xMin;
        }
        if (ped.dir < 0 && ped.mesh.position.x < ped.xMax) {
            ped.mesh.position.x = ped.xMin;
        }

        if (dist < 4 && Math.abs(vehicle.position.x - ped.mesh.position.x) < 2) {
            crossingSafety.set(idx, true);
        }
        if (dist > 15 && crossingSafety.get(idx)) {
            crossingSafety.set(idx, false);
            if (Math.max(0, Math.round(Math.abs(speed) * 220)) < 24) {
                reward('Paso peatonal gestionado de forma segura', 16);
            }
        }
    });
}

function detectCheckpoint() {
    if (missionFinished || currentScenario >= stages.length) return;

    const stage = stages[currentScenario];
    const checkpointPos = new THREE.Vector3(stage.x, 0, stage.z);
    const distance = vehicle.position.distanceTo(checkpointPos);
    const checkpointRadius = 5.5;  // Radio de detección del banderín

    if (distance < checkpointRadius) {
        const pointNum = currentScenario + 1;
        reward(`Punto ${pointNum} alcanzado - Patrullaje en progreso`, 60);
        currentScenario += 1;
        
        if (currentScenario >= stages.length) {
            missionFinished = true;
            reward('¡Patrullaje urbano completado! Seguridad vial lograda 🚓', 150);
            setTimeout(() => showMissionCompletedModal(), 500);  // Mostrar modal de éxito
        }
        updateHud();
    }
}

function detectConvivencia() {
    if (missionFinished) return;

    const speedKmh = Math.max(0, Math.round(Math.abs(speed) * 220));

    // Detectar proximidad a intersecciones (waypoints)
    const nearWaypoint = routeWaypoints.some((wp) => {
        const dist = Math.sqrt((vehicle.position.x - wp.x) ** 2 + (vehicle.position.z - wp.z) ** 2);
        return dist < 20;
    });
    
    if (nearWaypoint && speedKmh > 40) {
        penalize('Velocidad excesiva en interseccion', 22, INFRACTION_TYPES.SPEEDING);
    }

    // Detectar proximidad a cruces peatonales
    const nearCrossing = pedestrianCrossings.some((crossing) => {
        const dist = Math.sqrt((vehicle.position.x - crossing.x) ** 2 + (vehicle.position.z - crossing.z) ** 2);
        return dist < 15;
    });
    
    if (nearCrossing && speedKmh > 32) {
        penalize('Exceso de velocidad cerca de paso peatonal', 24, INFRACTION_TYPES.PEDESTRIAN_VIOLATION);
    }

    // Detectar proximidad a resaltos
    const nearBump = speedBumps.some((bump) => {
        const dist = Math.sqrt((vehicle.position.x - bump.position.x) ** 2 + (vehicle.position.z - bump.position.z) ** 2);
        return dist < 4;
    });
    
    if (nearBump && speedKmh > 28) {
        penalize('Exceso de velocidad sobre resalto', 18, INFRACTION_TYPES.SPEEDING);
    }

    cones.forEach((cone) => {
        if (!cone.visible) return;
        const distance = vehicle.position.distanceTo(cone.position);
        if (distance < 1.35) {
            cone.visible = false;
            penalize('Cono impactado en zona de obras', 28, INFRACTION_TYPES.COLLISION);
        }
    });

    npcVehicles.forEach((npc) => {
        if (!npc.mesh.visible) return;
        const distance = vehicle.position.distanceTo(npc.mesh.position);
        if (distance < (npc.radius || 3.0)) {
            penalize('Distancia insegura con otro vehiculo', 35, INFRACTION_TYPES.UNSAFE_DISTANCE);
            vehicle.position.z -= 1.6;
        }
    });

    crossTrafficVehicles.forEach((cross) => {
        if (!cross.mesh.visible) return;
        const distance = vehicle.position.distanceTo(cross.mesh.position);
        if (distance < cross.radius) {
            penalize('Riesgo con trafico cruzado en interseccion', 42, INFRACTION_TYPES.RED_LIGHT);
            vehicle.position.z += 1.4;
            speed *= 0.65;
        }
    });

    pedestrians.forEach((ped) => {
        if (!ped.mesh.visible) return;
        const distance = vehicle.position.distanceTo(ped.mesh.position);
        if (distance < ped.radius) {
            penalize('Riesgo alto: paso peatonal ocupado', 55, INFRACTION_TYPES.PEDESTRIAN_VIOLATION);
            vehicle.position.x -= 0.8;
            speed *= 0.6;
        }
    });

    // Límite lateral extendido pero todavía válido
    if (Math.abs(vehicle.position.x) > 200) {
        penalize('Saliste de la zona de conduccion', 30);
    }
}

function detectHotspots() {
    hotspotMeshes.forEach((hotspot) => {
        hotspot.rotation.z += 0.03;
        if (hotspot.userData.collected) return;

        const distance = vehicle.position.distanceTo(hotspot.position);
        if (distance < getDifficultyProfile().hotspotRadius) {
            hotspot.userData.collected = true;
            hotspot.visible = false;
            collected += 1;
            score += 25;
            showToast(hotspot.userData.msg + ' (+25)');
            updateHud();
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    const pulse = performance.now() * 0.015;
    sirenBlueMat.emissiveIntensity = 0.22 + Math.max(0, Math.sin(pulse)) * 0.85;
    sirenRedMat.emissiveIntensity = 0.22 + Math.max(0, Math.sin(pulse + Math.PI)) * 0.85;
    
    const speedKmh = Math.max(0, Math.round(Math.abs(speed) * 220));
    emergencyAudio.setSirenIntensity(speedKmh);
    if (speedKmh > 15 && !missionFinished) {
        emergencyAudio.playSiren();
    } else {
        emergencyAudio.stopSiren();
    }
    
    updateVehicle();
    updateDistrictState();
    updateNpcTraffic();
    updateCrossTraffic();
    updatePedestrians();
    detectCheckpoint();
    detectHotspots();
    detectConvivencia();
    updateHud();
    updateGuideLine();
    updateNavigationHUD();
    drawMiniMap();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    applyVehicleScale();
});

// ============================================================
// SISTEMA DE NARRATIVA FUNCIONAL
// ============================================================

let narrativeMode = null; // 'student' o 'ambulance'

// Configuraciones de narrativa
const narrativeConfigurations = {
    student: {
        name: 'Estudiante Practicante',
        icon: '📚',
        missionTitle: 'Patrullaje Urbano - Práctica Segura',
        missionIntro: '¡Bienvenido estudiante! Tu misión es completar un patrullaje de seguridad vial en la ciudad. Aprende conducción segura con retroalimentación inmediata.',
        objectivesTitle: 'Puntos de Patrullaje:',
        objectives: [
            '<strong>Punto 1 - Zona Residencial Norte:</strong> Verifica seguridad en sector residencial',
            '<strong>Punto 2 - Eje Este:</strong> Supervisa avenida principal de tráfico',
            '<strong>Punto 3 - Centro Urbano:</strong> Inspecciona cruce central',
            '<strong>Punto 4 - Sector Oeste:</strong> Verifica zona oeste de la ciudad',
            '<strong>Punto 5 - Retorno a Base:</strong> Completa el patrullaje urbano'
        ],
        missionKicker: '📚 Misión de Aprendizaje',
        difficulty: 'Guiado',
        buttonText: 'Comenzar Práctica 🚔'
    },
    ambulance: {
        name: 'Paramédico - Ambulancia 911',
        icon: '🚑',
        missionTitle: 'Transporte Crítico - Emergencia Médica',
        missionIntro: '¡Paramédico en servicio! Tu paciente es crítico. Completa el transporte a la clínica en el menor tiempo posible, sin comprometer la seguridad vial.',
        objectivesTitle: 'Ruta de Transporte:',
        objectives: [
            '<strong>Etapa 1 - Zona Residencial:</strong> Salida rápida de zona residencial norte',
            '<strong>Etapa 2 - Eje Este:</strong> Navega avenida principal con tráfico',
            '<strong>Etapa 3 - Centro Urbano:</strong> Cruza el corazón de la ciudad',
            '<strong>Etapa 4 - Sector Sur:</strong> Aproximación a clínica de urgencia',
            '<strong>Etapa 5 - Llegada a Clínica:</strong> Estacionamiento seguro de ambulancia'
        ],
        missionKicker: '🚑 Misión de Urgencia',
        difficulty: 'Exigente',
        buttonText: 'Iniciar Transporte 🚑'
    }
};

function showNarrativeSelector() {
    const narrativeModal = document.getElementById('narrativeModal');
    if (narrativeModal) {
        narrativeModal.style.display = 'flex';
    }
}

function hideNarrativeSelector() {
    const narrativeModal = document.getElementById('narrativeModal');
    if (narrativeModal) {
        narrativeModal.style.display = 'none';
    }
}

function selectNarrative(mode) {
    narrativeMode = mode;
    hideNarrativeSelector();
    updateMissionContent(mode);
    resetGame();
}

function updateMissionContent(mode) {
    const config = narrativeConfigurations[mode];
    
    // Actualizar modal de misión
    const modalMissionTitle = document.getElementById('modalMissionTitle');
    const missionIntro = document.getElementById('missionIntro');
    const objectivesTitle = document.querySelector('.mission-objectives h3');
    const objectivesList = document.getElementById('objectivesList');
    const startMissionBtn = document.getElementById('startMissionBtn');
    
    if (modalMissionTitle) modalMissionTitle.textContent = config.missionTitle;
    if (missionIntro) missionIntro.textContent = config.missionIntro;
    if (objectivesTitle) objectivesTitle.textContent = config.objectivesTitle;
    if (startMissionBtn) startMissionBtn.textContent = config.buttonText;
    
    // Actualizar lista de objetivos
    if (objectivesList) {
        objectivesList.innerHTML = config.objectives
            .map(obj => `<li>${obj}</li>`)
            .join('');
    }
    
    // Actualizar panel de misión (HUD)
    const missionKicker = document.querySelector('.mission-kicker');
    missionDifficulty.textContent = config.difficulty;
    if (missionKicker) missionKicker.textContent = config.missionKicker;
    
    // Mostrar indicador en consola
    console.log(`🎮 Narrativa seleccionada: ${config.name}`);
}

// Manejadores de botones del modal narrativo
const narrativeStudentBtn = document.getElementById('narrativeStudent');
const narrativeAmbulanceBtn = document.getElementById('narrativeAmbulance');

if (narrativeStudentBtn) {
    narrativeStudentBtn.addEventListener('click', () => selectNarrative('student'));
}

if (narrativeAmbulanceBtn) {
    narrativeAmbulanceBtn.addEventListener('click', () => selectNarrative('ambulance'));
}

// Mostrar selector narrativo al inicio
showNarrativeSelector();
animate();
