import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- ELEMENTOS UI ---
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const hud = document.getElementById('hud');
const healthBar = document.getElementById('health-bar');
const scoreDisplay = document.getElementById('score-display');
const waveDisplay = document.getElementById('wave-display');
const enemiesLeftDisplay = document.getElementById('enemies-left');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const triviaScreen = document.getElementById('trivia-screen');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const triviaFeedback = document.getElementById('trivia-feedback');
const upgradeScreen = document.getElementById('upgrade-screen');
const upgradeBtns = document.querySelectorAll('.upgrade-btn');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const finalWaveDisplay = document.getElementById('final-wave');
const restartBtn = document.getElementById('restart-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const minimapContainer = document.getElementById('minimap-container');
const statDmg = document.getElementById('stat-dmg');
const statSpd = document.getElementById('stat-spd');
const statFire = document.getElementById('stat-fire');
const statMulti = document.getElementById('stat-multi');
const statShield = document.getElementById('stat-shield');
const dashContainer = document.getElementById('dash-container');
const dashBarFg = document.getElementById('dash-bar-fg');

// --- VARIABLES GLOBALES DEL JUEGO ---
let isPlaying = false;
let isPaused = false;
let score = 0;
let wave = 1;
let enemiesDefeatedInWave = 0;
let enemiesToSpawn = 5;
let enemiesSpawned = 0;

let player;
let projectiles = [];
let enemies = [];
let particles = [];
let buildings = [];
let rescueVehicles = [];

// --- THREE.JS SETUP ---
const canvas = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Habilitar sombras y Tone Mapping cinemático
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Minimap Renderer
const minimapRenderer = new THREE.WebGLRenderer({ antialias: true });
minimapRenderer.setSize(200, 200);
minimapContainer.appendChild(minimapRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFF7E47); // Atardecer (Sunset)
scene.fog = new THREE.FogExp2(0xFF7E47, 0.005); // Reducida la densidad de la niebla

// Iluminación
// Luz de hemisferio (Cielo naranja, Suelo oscuro)
const hemiLight = new THREE.HemisphereLight(0xffb84d, 0x2c3e50, 0.6);
scene.add(hemiLight);

// Luz del Sol (Direccional) apuntando largo
const dirLight = new THREE.DirectionalLight(0xffe6cc, 1.5);
dirLight.position.set(100, 100, -50);
dirLight.castShadow = true;
// Configuración de la cámara de sombra del sol para cubrir todo el mapa
const d = 150;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 500;
dirLight.shadow.bias = -0.001;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// Cámaras
const cameras = {
    topdown: new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000),
    follow: new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
};
let currentCameraMode = 'topdown'; // topdown, follow
let activeCamera = cameras.topdown;

const minimapCamera = new THREE.OrthographicCamera(-50, 50, 50, -50, 0.1, 200);
minimapCamera.position.set(0, 100, 0);
minimapCamera.lookAt(0, 0, 0);

// --- POST-PROCESADO (Bloom & Compositor) ---
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, activeCamera);
composer.addPass(renderPass);

// Parámetros de Bloom (Resolución, Intensidad, Radio, Umbral)
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.5, 0.85);
composer.addPass(bloomPass);

// --- UTILIDADES (Stats.js) ---
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
// Estilizar para que no tape otros elementos
stats.dom.style.position = 'absolute';
stats.dom.style.top = '10px';
stats.dom.style.left = '50%';
stats.dom.style.transform = 'translateX(-50%)';

// Raycaster para apuntar
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

// Input
const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false, ' ': false };
let isMouseDown = false;
let mouse3DPos = new THREE.Vector3();

// --- GENERACIÓN DEL MAPA ---

let fenceTemplate = null;
function getFenceTemplate() {
    if (fenceTemplate) return fenceTemplate;
    const group = new THREE.Group();
    
    // Materiales para la cerca
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x88949b, roughness: 0.9 }); // Cemento gris
    const railMat = new THREE.MeshStandardMaterial({ color: 0xd0d3d4, metalness: 0.5, roughness: 0.5 }); // Detalles metálicos
    const barMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.8, roughness: 0.3 }); // Barrotes
    
    const fHeight = 2.5;

    // Componentes principales rectos
    const straights = [
        { pos: [0, 0, -12.5], size: [20, fHeight, 0.4] }, // N
        { pos: [0, 0, 12.5], size: [20, fHeight, 0.4] }, // S
        { pos: [-12.5, 0, 0], size: [0.4, fHeight, 20] }, // W
        { pos: [12.5, 0, 0], size: [0.4, fHeight, 20] }  // E
    ];

    straights.forEach(s => {
        const isX = s.size[0] > s.size[2];
        const L = 20;
        
        // Base de cemento
        const baseSize = isX ? [L, 0.6, 0.6] : [0.6, 0.6, L];
        const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(...baseSize), pillarMat);
        baseMesh.position.set(s.pos[0], 0.3, s.pos[2]);
        baseMesh.castShadow = true; baseMesh.receiveShadow = true;
        group.add(baseMesh);
        
        // Rail superior
        const railSize = isX ? [L, 0.2, 0.6] : [0.6, 0.2, L];
        const railMesh = new THREE.Mesh(new THREE.BoxGeometry(...railSize), railMat);
        railMesh.position.set(s.pos[0], fHeight - 0.1, s.pos[2]);
        railMesh.castShadow = true; railMesh.receiveShadow = true;
        group.add(railMesh);
        
        // Pilares cada 5 unidades
        for (let i = -10; i <= 10; i += 5) {
            const px = s.pos[0] + (isX ? i : 0);
            const pz = s.pos[2] + (isX ? 0 : i);
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, fHeight, 0.8), pillarMat);
            pillar.position.set(px, fHeight/2, pz);
            pillar.castShadow = true; pillar.receiveShadow = true;
            group.add(pillar);
        }

        // Barrotes
        const numBars = 20;
        for (let i = 0; i <= numBars; i++) {
            const barL = (i / numBars) * L - (L / 2);
            const bx = s.pos[0] + (isX ? barL : 0);
            const bz = s.pos[2] + (isX ? 0 : barL);
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, fHeight - 0.6), barMat);
            bar.position.set(bx, 0.6 + (fHeight - 0.6)/2, bz);
            bar.castShadow = true; bar.receiveShadow = true;
            group.add(bar);
        }
    });

    const corners = [
        { c: [10, -10], a: Math.PI/2 },   // NE
        { c: [-10, -10], a: Math.PI },    // NW
        { c: [-10, 10], a: 3*Math.PI/2 }, // SW
        { c: [10, 10], a: 0 }             // SE
    ];
    
    corners.forEach(crn => {
        // Curva de cemento base
        const curveBase = new THREE.Mesh(
            new THREE.CylinderGeometry(2.5, 2.5, 0.6, 12, 1, false, crn.a, Math.PI/2),
            pillarMat
        );
        curveBase.position.set(crn.c[0], 0.3, crn.c[1]);
        curveBase.castShadow = true; curveBase.receiveShadow = true;
        group.add(curveBase);
        
        // Curva del rail superior
        const curveRail = new THREE.Mesh(
            new THREE.CylinderGeometry(2.5, 2.5, 0.2, 12, 1, false, crn.a, Math.PI/2),
            railMat
        );
        curveRail.position.set(crn.c[0], fHeight - 0.1, crn.c[1]);
        curveRail.castShadow = true; curveRail.receiveShadow = true;
        group.add(curveRail);

        // Barrotes curvos
        const numBars = 5;
        for (let i = 1; i < numBars; i++) {
            const angle = crn.a + (i / numBars) * (Math.PI/2);
            // Three.js CylinderGeometry usa seno para X y coseno para Z
            const bx = crn.c[0] + Math.sin(angle) * 2.5;
            const bz = crn.c[1] + Math.cos(angle) * 2.5;
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, fHeight - 0.6), barMat);
            bar.position.set(bx, 0.6 + (fHeight - 0.6)/2, bz);
            bar.castShadow = true; bar.receiveShadow = true;
            group.add(bar);
        }
    });

    fenceTemplate = group;
    return group;
}
function createMap() {
    // Suelo principal (Pasto base)
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e3f20, roughness: 0.9 }); // Pasto oscuro
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Calles (Asfalto húmedo)
    const streetMat = new THREE.MeshStandardMaterial({ color: 0x1c2833, roughness: 0.4, metalness: 0.1 });
    
    // Calles horizontales y verticales
    for (let i = -80; i <= 80; i += 40) {
        // Horizontal
        const stH = new THREE.Mesh(new THREE.PlaneGeometry(200, 15), streetMat);
        stH.rotation.x = -Math.PI / 2;
        stH.position.set(0, 0.05, i);
        stH.receiveShadow = true;
        scene.add(stH);
        
        // Vertical
        const stV = new THREE.Mesh(new THREE.PlaneGeometry(15, 200), streetMat);
        stV.rotation.x = -Math.PI / 2;
        stV.position.set(i, 0.05, 0);
        stV.receiveShadow = true;
        scene.add(stV);
    }

    // Limites del mapa (Cercas/Muros)
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
    
    // Es vital limpiar los edificios ANTES de crear el marco del mapa
    buildings.forEach(b => scene.remove(b));
    buildings = [];

    const createFence = (w, d, x, z) => {
        const fence = new THREE.Mesh(new THREE.BoxGeometry(w, 4, d), fenceMat);
        fence.position.set(x, 2, z);
        fence.castShadow = true;
        fence.receiveShadow = true;
        scene.add(fence);
        buildings.push(fence); // Agregarlo a colisiones
    };
    
    createFence(200, 2, 0, -99); // Norte
    createFence(200, 2, 0, 99);  // Sur
    createFence(2, 200, -99, 0); // Oeste
    createFence(2, 200, 99, 0);  // Este

    const houseMats = [
        new THREE.MeshStandardMaterial({ color: 0xecf0f1 }),
        new THREE.MeshStandardMaterial({ color: 0xe74c3c }),
        new THREE.MeshStandardMaterial({ color: 0x3498db })
    ];
    
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xc0392b });

    // Material para las rejas de las manzanas edificadas
    const blockFenceMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.5, roughness: 0.5 });
    const fHeight = 2.5; // Altura de la reja
    const fThick = 0.5;  // Grosor de la reja

    for (let x = -60; x <= 60; x += 40) {
        for (let z = -60; z <= 60; z += 40) {
            // Generar el bloque de colisión escalonado (esquinas redondeadas lógicas)
            const blockMat = new THREE.MeshStandardMaterial({ visible: false }); // Invisible, solo para colisión
            
            const coll1 = new THREE.Mesh(new THREE.BoxGeometry(20, 4, 25), blockMat);
            coll1.position.set(x, 2, z); scene.add(coll1); buildings.push(coll1);
            
            const coll2 = new THREE.Mesh(new THREE.BoxGeometry(25, 4, 20), blockMat);
            coll2.position.set(x, 2, z); scene.add(coll2); buildings.push(coll2);
            
            const coll3 = new THREE.Mesh(new THREE.BoxGeometry(23, 4, 23), blockMat);
            coll3.position.set(x, 2, z); scene.add(coll3); buildings.push(coll3);

            // Crear rejas perimetrales visibles (modelo procedural cacheado)
            const blockFence = getFenceTemplate().clone();
            blockFence.position.set(x, 0, z);
            scene.add(blockFence);

            // Generar 1 a 3 casas por bloque
            const numHouses = Math.floor(Math.random() * 3) + 1;
            const windowMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0x4d3319 }); // Luz cálida de ventana
            const doorMat = new THREE.MeshStandardMaterial({ color: 0x4e342e }); // Puerta de madera
            
            for(let i=0; i<numHouses; i++) {
                const w = 6 + Math.random() * 4;
                const h = 8 + Math.random() * 12;
                const d = 6 + Math.random() * 4;
                
                const houseGroup = new THREE.Group();
                const hx = x + (Math.random() - 0.5) * 8;
                const hz = z + (Math.random() - 0.5) * 8;
                houseGroup.position.set(hx, 0, hz);
                
                // Edificio Base
                const house = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), houseMats[Math.floor(Math.random()*houseMats.length)]);
                house.position.y = h/2;
                house.castShadow = true; house.receiveShadow = true;
                houseGroup.add(house);
                
                // Techo
                const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*0.8, 3, 4), roofMat);
                roof.rotation.y = Math.PI / 4;
                roof.position.y = h + 1.5;
                roof.castShadow = true; roof.receiveShadow = true;
                houseGroup.add(roof);

                // Puerta
                const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 0.2), doorMat);
                door.position.set(0, 1.5, d/2 + 0.05); // Puerta al frente
                houseGroup.add(door);

                // Ventanas (2 o 4 según la altura)
                const floors = Math.floor((h - 3) / 3);
                for(let fl = 1; fl <= floors; fl++) {
                    const win1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.2), windowMat);
                    win1.position.set(-w/4, fl * 3 + 1.5, d/2 + 0.05);
                    const win2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.2), windowMat);
                    win2.position.set(w/4, fl * 3 + 1.5, d/2 + 0.05);
                    houseGroup.add(win1, win2);
                }
                
                // Rotar casa ligeramente de forma aleatoria para que no se vean todas de frente absoluto
                houseGroup.rotation.y = Math.random() < 0.5 ? 0 : Math.PI / 2;
                scene.add(houseGroup);
            }
        }
    }
}

// --- CLASES ---

class Player {
    constructor() {
        this.group = new THREE.Group();
        this.group.castShadow = true;
        
        // Cuerpo del vehículo (Carabineros de Chile)
        const bodyGeo = new THREE.BoxGeometry(2, 1, 4);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00592b, roughness: 0.2, metalness: 0.8 }); // Brillante
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.5;
        body.castShadow = true;
        this.group.add(body);

        // Cabina
        const cabinGeo = new THREE.BoxGeometry(1.6, 0.8, 2);
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9 }); // Blanca
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(0, 1.2, -0.5);
        cabin.castShadow = true;
        this.group.add(cabin);

        // Sirenas (Rojo y azul) multiplicadas para que salten con Bloom
        const sirenR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(5.0, 0, 0) }));
        sirenR.position.set(0.4, 1.7, -0.5);
        const sirenB = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 0, 5.0) }));
        sirenB.position.set(-0.4, 1.7, -0.5);
        this.group.add(sirenR, sirenB);
        this.sirenR = sirenR;
        this.sirenB = sirenB;

        // Focos
        const lightMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4.0, 4.0, 1.0) });
        const light1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.1), lightMat);
        light1.position.set(0.6, 0.5, 2.05);
        const light2 = light1.clone();
        light2.position.set(-0.6, 0.5, 2.05);
        
        // Defensa (Bumper delantero)
        const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.5), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        bumper.position.set(0, 0.4, 2.1);
        
        this.group.add(light1, light2, bumper);
        
        // Ruedas
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const createWheel = (x, y, z) => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.rotation.z = Math.PI / 2;
            w.position.set(x, y, z);
            return w;
        };
        this.group.add(createWheel(1.1, 0.4, 1.2));
        this.group.add(createWheel(-1.1, 0.4, 1.2));
        this.group.add(createWheel(1.1, 0.4, -1.2));
        this.group.add(createWheel(-1.1, 0.4, -1.2));

        // Luces frontales (modo faros de auto)
        // Aumentada la intensidad (de 2.5 a 10.0), la distancia (de 40 a 80) y el ángulo
        const headLight = new THREE.SpotLight(0xffffff, 10.0, 80, Math.PI / 4, 0.5, 0.5);
        headLight.position.set(0, 1.0, 2.2);
        headLight.target.position.set(0, 0.0, 40);
        // Desactivamos la proyección de sombras de faros para recuperar FPS
        headLight.castShadow = false;
        this.group.add(headLight);
        this.group.add(headLight.target);
        
        // Focos brillantes físicos
        const headlampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 2.5, 2.5) });
        const focusR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.1), headlampMat);
        focusR.position.set(0.6, 0.5, 2.05);
        const focusL = focusR.clone();
        focusL.position.set(-0.6, 0.5, 2.05);
        this.group.add(focusR, focusL);

        scene.add(this.group);

        this.radius = 2; // Para colisiones simples
        this.speed = 15; // Unidades por segundo
        this.maxHealth = 100;
        this.health = 100;
        
        this.fireRate = 300; 
        this.damage = 25;
        this.bulletSpeed = 30;
        
        this.lastShotTime = 0;
        
        // Especiales
        this.multiShot = 1;
        this.hasShield = false;
        this.canDash = false;
        this.isDashing = false;
        this.dashCooldown = 0;
        this.dashDuration = 0;
        this.dashSpeedMultiplier = 3;
    }

    update(dt) {
        if (this.currentSpeed === undefined) {
            this.currentSpeed = 0;
            this.group.rotation.y = Math.PI; // Iniciar mirando hacia 'Arriba' / Norte
        }

        let engineForce = 0;
        if (keys.w || keys.ArrowUp) engineForce = 1;
        if (keys.s || keys.ArrowDown) engineForce = -1;

        // Lógica de Dash
        if (this.dashCooldown > 0) this.dashCooldown -= dt;
        if (this.dashDuration > 0) this.dashDuration -= dt;
        
        if (keys[' '] && this.canDash && this.dashCooldown <= 0) {
            this.dashDuration = 0.2; // 200ms de dash
            this.dashCooldown = 2.0; // 2s de cooldown
        }
        
        if (this.canDash) {
            const cooldownPercent = Math.max(0, 1 - (this.dashCooldown / 2.0)) * 100;
            dashBarFg.style.width = `${cooldownPercent}%`;
            if (cooldownPercent >= 100) dashBarFg.style.backgroundColor = '#f1c40f'; // Listo
            else dashBarFg.style.backgroundColor = '#e74c3c'; // Recargando
        }
        
        let maxS = this.speed;
        if (this.dashDuration > 0) {
            maxS *= this.dashSpeedMultiplier;
        }

        const acceleration = this.speed * 2.0;
        const friction = this.speed * 1.0;

        // Acelerar y Frenar
        if (engineForce !== 0) {
            this.currentSpeed += engineForce * acceleration * dt;
        } else {
            // Fricción natural al soltar gas
            if (this.currentSpeed > 0) {
                this.currentSpeed = Math.max(0, this.currentSpeed - friction * dt);
            } else if (this.currentSpeed < 0) {
                this.currentSpeed = Math.min(0, this.currentSpeed + friction * dt);
            }
        }

        // Limitar velocidad máxima 
        if (this.currentSpeed > maxS) this.currentSpeed = maxS;
        if (this.currentSpeed < -maxS * 0.5) this.currentSpeed = -maxS * 0.5;

        // Volante (rotar izquierda y derecha)
        if (Math.abs(this.currentSpeed) > 0.1) {
            let turnDir = 0;
            if (keys.a || keys.ArrowLeft) turnDir = 1; 
            if (keys.d || keys.ArrowRight) turnDir = -1; 
            
            // Invertir dirección de la rotación al ir en reversa
            const driveDir = this.currentSpeed > 0 ? 1 : -1;
            this.group.rotation.y += turnDir * 3.0 * driveDir * dt;
        }

        // Obtener el vector hacia el que apunta la patrulla físicamente (+Z local)
        const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(this.group.quaternion).normalize();

        // Movimiento tentativo
        let nextX = this.group.position.x + fwd.x * this.currentSpeed * dt;
        let nextZ = this.group.position.z + fwd.z * this.currentSpeed * dt;

        // Colisiones con edificios (con reducción de velocidad al impactar)
        if (checkBuildingCollision(nextX, this.group.position.z, this.radius)) {
            nextX = this.group.position.x;
            this.currentSpeed *= 0.5; 
        }
        if (checkBuildingCollision(this.group.position.x, nextZ, this.radius)) {
            nextZ = this.group.position.z;
            this.currentSpeed *= 0.5;
        }

        // Limites del mapa
        this.group.position.x = Math.max(-95, Math.min(95, nextX));
        this.group.position.z = Math.max(-95, Math.min(95, nextZ));

        // Disparo (El disparo siempre apunta hacia donde mira el usuario con el puntero/mouse)
        if (isMouseDown && performance.now() - this.lastShotTime > this.fireRate) {
            this.shoot();
        }
        
        // Efecto visual: Parpadeo de sirena de patrulla (estilo ambulancia)
        if (this.sirenB && this.sirenR) {
            if (Math.floor(performance.now() / 200) % 2 === 0) {
                this.sirenR.material.color.setRGB(5.0, 0, 0);       // Rojo prendido fuerte
                this.sirenB.material.color.setRGB(0.05, 0.05, 0.05);  // Azul apagado
            } else {
                this.sirenR.material.color.setRGB(0.05, 0.05, 0.05);  // Rojo apagado
                this.sirenB.material.color.setRGB(0, 0, 5.0);       // Azul prendido fuerte
            }
        }
        
        // Efecto visual de escudo
        if (this.hasShield) {
            if (!this.shieldMesh) {
                this.shieldMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(3, 16, 16),
                    new THREE.MeshBasicMaterial({ color: 0x3498db, transparent: true, opacity: 0.3, wireframe: true })
                );
                this.shieldMesh.position.y = 1;
                this.group.add(this.shieldMesh);
            }
        }
    }

    shoot() {
        if (!mouse3DPos) return;
        
        const dir = new THREE.Vector3().subVectors(mouse3DPos, this.group.position);
        dir.y = 0;
        dir.normalize();

        const baseAngle = Math.atan2(-dir.z, dir.x); // Inverted Z because Three.js Z axis goes forward differently
        
        for (let i = 0; i < this.multiShot; i++) {
            // Calcular offset de ángulo basado en la cantidad de proyectiles
            let angleOffset = 0;
            if (this.multiShot > 1) {
                // Rango de dispersión: 0.2 radianes * (multiShot - 1)
                const spread = 0.15;
                angleOffset = - (spread * (this.multiShot - 1) / 2) + (i * spread);
            }
            
            const newAngle = baseAngle + angleOffset;
            const newDir = new THREE.Vector3(Math.cos(newAngle), 0, -Math.sin(newAngle)).normalize();
            
            // Disparar papeles (color blanco)
            projectiles.push(new Projectile(this.group.position.clone(), newDir, this.bulletSpeed, this.damage, 0xffffff, true));
        }
        
        this.lastShotTime = performance.now();
    }

    takeDamage(amount) {
        if (this.hasShield) {
            amount = amount * 0.5; // Escudo reduce daño 50%
        }
        this.health -= amount;
        updateHUD();
        
        // Animación de Shake en UI y Cámara usando GSAP
        if (window.gsap && this.health > 0) {
            gsap.fromTo(healthBar.parentElement, 
                { x: -5 }, 
                { x: 5, duration: 0.05, yoyo: true, repeatControl: 5, repeat: 5, ease: "none", clearProps: "x" }
            );
            
            // Vibrar cámara un poco
            const origY = activeCamera.position.y;
            gsap.fromTo(activeCamera.position,
                { y: origY - 0.5 }, 
                { y: origY + 0.5, duration: 0.05, yoyo: true, repeat: 5, ease: "none", onComplete: () => { activeCamera.position.y = origY; }}
            );
        }

        if (this.health <= 0 && this.group.visible) {
            // El auto solo desaparece
            this.group.visible = false;
            createFloatingText(this.group.position, "¡Desaparecido!", "#ffffff", true);
            endGame();
        }
    }
}

class Projectile {
    constructor(pos, dir, speed, damage, color, isPlayer) {
        // En vez de balas, usamos papeles (forma plana)
        // Quitamos MeshBasicMaterial (que emite luz con bloom) y usamos Standard (que reacciona a la luz ambiente nada más)
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 1.2),
            new THREE.MeshStandardMaterial({ color: color, roughness: 0.8, side: THREE.DoubleSide }) 
        );
        this.mesh.rotation.x = -Math.PI / 2; // Acostarlo
        this.mesh.position.copy(pos);
        this.mesh.position.y = 1;
        scene.add(this.mesh);

        this.dir = dir;
        this.speed = speed;
        this.damage = damage;
        this.isPlayer = isPlayer;
        this.markedForDeletion = false;
        this.radius = 0.5;
        this.lifeTime = 0;
    }

    update(dt) {
        this.mesh.position.addScaledVector(this.dir, this.speed * dt);
        this.mesh.rotation.z -= 10 * dt; // Girar como papel
        this.lifeTime += dt;

        if (checkBuildingCollision(this.mesh.position.x, this.mesh.position.z, this.radius) ||
            this.lifeTime > 3 || Math.abs(this.mesh.position.x) > 100 || Math.abs(this.mesh.position.z) > 100) {
            this.destroy();
        }
    }

    destroy() {
        this.markedForDeletion = true;
        scene.remove(this.mesh);
    }
}

class Enemy {
    constructor(x, z, health, speed, type) {
        this.group = new THREE.Group();
        this.type = type;
        this.lastShotTime = 0;
        
        let w = 2, h = 1, d = 4;
        let color = 0xe74c3c; // Normal, Default (Rojo)
        
        if (type === 2) { w = 3; h = 2.5; d = 6; color = 0xe67e22; } // Pesado/Remolque (Naranja)
        else if (type === 3) { w = 1.8; h = 0.8; d = 4; color = 0x3498db; } // Veloz/Deportivo (Azul Claro)
        else if (type === 4) { w = 2.2; h = 1.2; d = 4.2; color = 0x34495e; } // Disparador (Gris Oscuro/Negro)
        else if (type === 5) { w = 4; h = 3; d = 7; color = 0x8e44ad; } // Minijefe (Morado)
        else if (type === 6) { w = 8; h = 5; d = 12; color = 0xc0392b; } // Jefe (Rojo Oscuro Grande)

        // Cuerpo base
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshStandardMaterial({ color: color })
        );
        body.position.y = h/2;
        this.group.add(body);
        
        // Cabina
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(w * 0.8, h * 0.8, d * 0.5),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        cabin.position.set(0, h + (h*0.8)/2, -d*0.1);
        this.group.add(cabin);

        // Detalles decorativos adicionales según tipo
        if (type === 3) {
            // Spoiler alerón deportivo (Veloz)
            const spoiler = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, 0.5), new THREE.MeshStandardMaterial({ color: 0x000000 }));
            spoiler.position.set(0, h + 0.5, -d/2 + 0.5);
            this.group.add(spoiler);
        }
        else if (type === 4) {
            // "Cañon de papeles" en el techo (Disparador)
            const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0x7f8c8d }));
            cannon.rotation.x = Math.PI / 2;
            cannon.position.set(0, h + h*0.8 + 0.3, 0);
            this.group.add(cannon);
        }
        else if (type >= 5) {
            // Adosados blindaje/puntas para jefes
            const spikes = new THREE.Mesh(
                new THREE.BoxGeometry(w * 1.1, h * 0.2, d * 0.2),
                new THREE.MeshStandardMaterial({ color: 0xbdc3c7 })
            );
            spikes.position.set(0, h/2, d/2 + 0.1);
            this.group.add(spikes);
        }
        if (type === 6) {
            // Domo blindado de Jefe Máximo
            const turret = new THREE.Mesh(
                new THREE.CylinderGeometry(w/2, w/2, h, 8),
                new THREE.MeshStandardMaterial({ color: 0x7f8c8d })
            );
            turret.position.set(0, h * 1.5, -d/4);
            this.group.add(turret);
        }

        // Ruedas Universales
        const wheelR = w * 0.25;
        const wheelGeo = new THREE.CylinderGeometry(wheelR, wheelR, w*0.15, 8);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const createWh = (x, y, z) => {
            const wh = new THREE.Mesh(wheelGeo, wheelMat);
            wh.rotation.z = Math.PI / 2;
            wh.position.set(x, y, z);
            return wh;
        };
        this.group.add(createWh(w/2 + w*0.05, wheelR, d*0.3));
        this.group.add(createWh(-w/2 - w*0.05, wheelR, d*0.3));
        this.group.add(createWh(w/2 + w*0.05, wheelR, -d*0.3));
        this.group.add(createWh(-w/2 - w*0.05, wheelR, -d*0.3));

        // Focos brillantes físicos (Enemigos)
        const focusMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.5, 1.0) });
        const focusR = new THREE.Mesh(new THREE.BoxGeometry(w*0.2, h*0.2, 0.1), focusMat);
        focusR.position.set(w*0.3, h*0.5, d/2 + 0.05);
        const focusL = focusR.clone();
        focusL.position.set(-w*0.3, h*0.5, d/2 + 0.05);
        this.group.add(focusR, focusL);

        // Se elimina el SpotLight sombra a los enemigos para recuperar los FPS
        // y prevenir la recompilación extrema de shaders de WebGL.

        // Barra de Vida
        const hpBg = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, 0.4), new THREE.MeshBasicMaterial({color: 0xff0000}));
        const hpFg = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, 0.4), new THREE.MeshBasicMaterial({color: 0x00ff00}));
        hpFg.position.z = 0.01;
        this.hpContainer = new THREE.Group();
        this.hpContainer.add(hpBg);
        this.hpContainer.add(hpFg);
        this.hpOffsetY = h * 2 + 1;
        // Agregamos la barra de vida a la escena, no al grupo del enemigo
        scene.add(this.hpContainer);
        this.hpBarFg = hpFg;
        this.hpBarWidth = w * 1.5;
        
        this.group.position.set(x, 0, z);
        scene.add(this.group);

        this.radius = Math.max(w, d) / 2;
        this.health = health;
        this.maxHealth = health;
        this.speed = speed;
        this.damage = type >= 5 ? 30 : (type === 2 ? 20 : 10);
        if (type === 6) { this.damage = 50; }
        this.markedForDeletion = false;
    }

    update(dt) {
        // Mover hacia el jugador
        const dir = new THREE.Vector3().subVectors(player.group.position, this.group.position);
        dir.y = 0;
        const distToPlayer = dir.length();
        dir.normalize();

        this.group.lookAt(player.group.position.x, this.group.position.y, player.group.position.z);
        
        let nextX = this.group.position.x + dir.x * this.speed * dt;
        let nextZ = this.group.position.z + dir.z * this.speed * dt;

        const colX = checkBuildingCollision(nextX, this.group.position.z, this.radius);
        const colZ = checkBuildingCollision(this.group.position.x, nextZ, this.radius);

        if (colX) {
            nextX = this.group.position.x;
            // Si está bloqueado en X, intentar rodear sumando en Z
            nextZ += Math.sign(dir.z || 1) * this.speed * dt * 0.5; 
        }
        if (colZ) {
            nextZ = this.group.position.z;
            // Si está bloqueado en Z, intentar rodear sumando en X
            nextX += Math.sign(dir.x || 1) * this.speed * dt * 0.5;
        }

        // Re-chequear para asegurar que el movimiento lateral no los meta en un edificio
        if (colX && checkBuildingCollision(nextX, this.group.position.z, this.radius)) nextX = this.group.position.x;
        if (colZ && checkBuildingCollision(this.group.position.x, nextZ, this.radius)) nextZ = this.group.position.z;
        
        this.group.position.set(nextX, this.group.position.y, nextZ);

        if (activeCamera) {
            this.hpContainer.position.copy(this.group.position);
            this.hpContainer.position.y += this.hpOffsetY;
            this.hpContainer.quaternion.copy(activeCamera.quaternion);
        }

        // Disparo de Vehículo Tipo 4 (Shooter/Gris oscuro)
        if (this.type === 4 && distToPlayer < 50 && distToPlayer > 10) {
            if (performance.now() - this.lastShotTime > 1500) { // Dispara un "papel" cada 1.5s
                this.lastShotTime = performance.now();
                const projDir = dir.clone();
                // Color rojo para diferenciarlos del papel verde/blanco del jugador
                projectiles.push(new Projectile(this.group.position.clone(), projDir, 25, 10, 0xe74c3c, false));
            }
        }

        // Colisión con jugador
        if (distToPlayer < this.radius + player.radius) {
            player.takeDamage(this.damage);
            this.destroy();
            createRescueEffect(this.group.position, this.type === 2 || this.type >= 5);
            checkWaveProgress(); // Contar como resuelto si choca
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        
        createFloatingText(this.group.position, `$${amount}`, '#f1c40f');
        
        const hpRatio = Math.max(0, this.health / this.maxHealth);
        this.hpBarFg.scale.x = hpRatio;
        this.hpBarFg.position.x = -(this.hpBarWidth / 2) * (1 - hpRatio);
        
        // Efecto visual de daño (parpadeo blanco)
        this.group.children[0].material.emissive.setHex(0xffffff);
        setTimeout(() => {
            if(this.group && this.group.children[0]) {
                 this.group.children[0].material.emissive.setHex(0x000000);
            }
        }, 100);

        if (this.health <= 0) {
            this.destroy();
            score += this.type === 1 ? 10 : 25;
            createRescueEffect(this.group.position, this.type >= 2);
            checkWaveProgress();
        }
    }

    destroy() {
        this.markedForDeletion = true;
        scene.remove(this.group);
        if (this.hpContainer) scene.remove(this.hpContainer);
    }
}

class Particle {
    constructor(pos, color) {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshBasicMaterial({ color: color })
        );
        this.mesh.position.copy(pos);
        this.mesh.position.y += 1;
        scene.add(this.mesh);

        this.vx = (Math.random() - 0.5) * 15;
        this.vy = Math.random() * 10 + 5;
        this.vz = (Math.random() - 0.5) * 15;
        this.life = 1.0;
        this.markedForDeletion = false;
    }
    update(dt) {
        this.mesh.position.x += this.vx * dt;
        this.mesh.position.y += this.vy * dt;
        this.mesh.position.z += this.vz * dt;
        this.vy -= 20 * dt; // Gravedad
        
        this.life -= dt * 2;
        if(this.mesh.material.opacity !== undefined) {
             this.mesh.material.transparent = true;
             this.mesh.material.opacity = this.life;
        }

        this.mesh.rotation.x += 5 * dt;
        this.mesh.rotation.y += 5 * dt;

        if (this.life <= 0) {
            this.markedForDeletion = true;
            scene.remove(this.mesh);
        }
    }
}

// --- LÓGICAS GENERALES ---

function checkBuildingCollision(x, z, radius) {
    for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        if (!b.geometry || !b.geometry.parameters) continue;
        const hw = b.geometry.parameters.width / 2;
        const hd = b.geometry.parameters.depth / 2;
        const minX = b.position.x - hw - radius;
        const maxX = b.position.x + hw + radius;
        const minZ = b.position.z - hd - radius;
        const maxZ = b.position.z + hd + radius;
        if (x > minX && x < maxX && z > minZ && z < maxZ) {
            return true;
        }
    }
    return false;
}

const floatingContainer = document.getElementById('floating-texts-container');

function createFloatingText(pos3D, text, color, isBig = false) {
    if (!activeCamera) return;
    const pos = pos3D.clone();
    pos.y += 2;
    pos.project(activeCamera);
    
    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (pos.y * -0.5 + 0.5) * window.innerHeight;
    
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;
    if (isBig) el.style.fontSize = '24px';
    else el.style.fontSize = '16px';
    el.style.textShadow = '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';
    el.textContent = text;
    
    floatingContainer.appendChild(el);
    // Animación JUICY usando GSAP
    if (window.gsap) {
        gsap.fromTo(el,
            { y: `+=${10}`, x: `+=${x/100}`, scale: 0.5, opacity: 1 },
            { y: `-=${80}`, scale: 1.5, opacity: 0, duration: 1.5, ease: "power2.out", onComplete: () => {
                if(el.parentElement) el.remove();
            }}
        );
    } else {
        setTimeout(() => {
            if(el.parentElement) el.remove();
        }, 1000);
    }
}

function spawnEnemy() {
    let x, z;
    // Spawn solo en las calles (asfalto) cerca de los bordes internos del mapa
    const roads = [-80, -40, 0, 40, 80];
    const road = roads[Math.floor(Math.random() * roads.length)];
    
    if (Math.random() < 0.5) {
        // En una calle horizontal, a un extremo del eje X (pero dentro del mapa)
        z = road;
        x = Math.random() < 0.5 ? -95 : 95;
    } else {
        // En una calle vertical, a un extremo del eje Z (pero dentro del mapa)
        x = road;
        z = Math.random() < 0.5 ? -95 : 95;
    }

    let isHeavy = Math.random() > 0.6;
    let isFast = Math.random() > 0.7;
    let isShooter = wave >= 3 && Math.random() > 0.8; // Empiezan a aparecer tiradores desde oleada 3
    
    let type = 1; // 1 = Normal
    let hp = 50 + (wave * 15);
    let speed = 10 + (wave * 0.4); // Incremento notable de velocidad general

    if (isShooter) {
        type = 4; // Disparador (Gris oscuro)
        hp = 60 + (wave * 15); 
        speed = 8 + (wave * 0.3);
    } else if (isFast) {
        type = 3; // Veloz (Azul claro deportivo)
        hp = 40 + (wave * 10); 
        speed = 14 + (wave * 0.6); // Muy rápido
    } else if (isHeavy) {
        type = 2; // Pesado (Naranja)
        hp = 100 + (wave * 30); 
        speed = 6 + (wave * 0.3); // Robusto pero aún ágil
    }

    // Lógica de Jefe / Minijefe (1 por oleada respectiva)
    if (wave % 10 === 0 && enemiesSpawned === 0) {
        // Jefe Final
        type = 6;
        hp = 1000 + (wave * 50);
        speed = 5;
    } else if (wave % 5 === 0 && wave % 10 !== 0 && enemiesSpawned === 0) {
        // Minijefe
        type = 5;
        hp = 500 + (wave * 40);
        speed = 7;
    }

    enemies.push(new Enemy(x, z, hp, speed, type));
    enemiesSpawned++;
}

class RescueVehicle {
    constructor(pos, type) {
        this.group = new THREE.Group();
        this.group.position.copy(pos);
        scene.add(this.group);
        this.speed = 15;
        this.markedForDeletion = false;
        this.lifeTime = 0;

        // Dirección aleatoria de salida (Norte, Sur, Este, Oeste)
        const angles = [0, Math.PI/2, Math.PI, -Math.PI/2];
        const exitAngle = angles[Math.floor(Math.random() * angles.length)];
        this.dir = new THREE.Vector3(Math.cos(exitAngle), 0, -Math.sin(exitAngle));
        
        // Orientar el grupo para que mire hacia su dirección de movimiento
        this.group.lookAt(this.group.position.x + this.dir.x, this.group.position.y, this.group.position.z + this.dir.z);

        // Material común para ruedas
        const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 8);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const createWheel = (x, y, z) => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.rotation.z = Math.PI / 2;
            w.position.set(x, y, z);
            return w;
        };

        if (type === 'ambulance') {
            // Ambulancia Detallada
            // Cabina
            const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 2.5), new THREE.MeshStandardMaterial({ color: 0xffffff }));
            cab.position.set(0, 1.25, 1.25);
            
            // Caja trasera medica
            const box = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 3.5), new THREE.MeshStandardMaterial({ color: 0xffffff }));
            box.position.set(0, 1.6, -1.75);
            
            // Franja Verde Cruz
            const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.5, 3.6), new THREE.MeshStandardMaterial({ color: 0x2ecc71 }));
            stripe.position.set(0, 1.5, -1.75);
            
            // Lámparas Gemelas en Cabina
            const sirenB = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.4), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
            sirenB.position.set(0.6, 2.1, 1.5);
            const sirenR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.4), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
            sirenR.position.set(-0.6, 2.1, 1.5);
            
            this.group.add(cab, box, stripe, sirenB, sirenR);
            this.sirenB = sirenB;
            this.sirenR = sirenR;

            // Ruedas Ambulancia
            this.group.add(createWheel(1.4, 0.5, 1.25));
            this.group.add(createWheel(-1.4, 0.5, 1.25));
            this.group.add(createWheel(1.4, 0.5, -2));
            this.group.add(createWheel(-1.4, 0.5, -2));

        } else {
            // Remolque Grúa Detallada
            // Cabina Amarilla
            const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2, 2.5), new THREE.MeshStandardMaterial({ color: 0xf1c40f })); // Amarillo de rescate
            cab.position.set(0, 1.5, 2);
            
            // Cama/Chasis de la grúa
            const bed = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 5), new THREE.MeshStandardMaterial({ color: 0x333333 }));
            bed.position.set(0, 0.75, -1.75);

            // Brazo/Poste Grua
            const craneArm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3, 0.4), new THREE.MeshStandardMaterial({ color: 0xe74c3c }));
            craneArm.position.set(0, 2, -3.5); 
            craneArm.rotation.x = -Math.PI / 4; 
            
            // Auto Enganchado
            const towedCarBody = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 3.5), new THREE.MeshStandardMaterial({ color: 0x555555 }));
            towedCarBody.position.set(0, 1, -5.5);
            towedCarBody.rotation.x = -Math.PI / 12;

            this.group.add(cab, bed, craneArm, towedCarBody);

            // Ruedas Remolque
            this.group.add(createWheel(1.4, 0.5, 2));
            this.group.add(createWheel(-1.4, 0.5, 2));
            this.group.add(createWheel(1.4, 0.5, -1));
            this.group.add(createWheel(-1.4, 0.5, -1));
            this.group.add(createWheel(1.4, 0.5, -2.5));
            this.group.add(createWheel(-1.4, 0.5, -2.5));
            
            // Ruedas del auto remolcado tocando el puente
            this.group.add(createWheel(1.2, 0.5, -6.5));
            this.group.add(createWheel(-1.2, 0.5, -6.5));
        }

        // Focos para los Vehículos de Rescate (Miran hacia +Z local)
        const headlampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 2.5, 2.0) });
        const focusR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.1), headlampMat);
        focusR.position.set(0.8, 0.6, 2.55);
        const focusL = focusR.clone();
        focusL.position.set(-0.8, 0.6, 2.55);
        this.group.add(focusR, focusL);

        // Sin luces volumétricas con castShadow = true aquí para evitar el lag de clonado
        // Clonar materiales para la ambulancia cuesta un poco en WebGL al principio (Shader recompilation)
        // pero evitamos lag masivo al haber quitado el SpotLight sombra.
        this.group.traverse(child => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
                child.material.transparent = true;
            }
        });
    }

    update(dt) {
        this.lifeTime += dt;
        
        // Destruir después de difuminarse por 2 segundos completos
        if (this.lifeTime > 2.0) {
            this.destroy();
            return;
        }

        // Aplicar opacidad progresiva a lo largo de los 2 segundos
        const opacity = Math.max(0, 1.0 - (this.lifeTime / 2.0));
        this.group.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.opacity = opacity;
            }
        });
        
        let nextX = this.group.position.x + this.dir.x * this.speed * dt;
        let nextZ = this.group.position.z + this.dir.z * this.speed * dt;
        
        // Evitar atravesar edificios y orientar al doblar
        if (checkBuildingCollision(nextX, this.group.position.z, 2)) {
            this.dir.set(this.dir.z, 0, -this.dir.x);
            this.group.lookAt(this.group.position.x + this.dir.x, this.group.position.y, this.group.position.z + this.dir.z);
            nextX = this.group.position.x;
        }
        if (checkBuildingCollision(this.group.position.x, nextZ, 2)) {
            this.dir.set(-this.dir.z, 0, this.dir.x);
            this.group.lookAt(this.group.position.x + this.dir.x, this.group.position.y, this.group.position.z + this.dir.z);
            nextZ = this.group.position.z;
        }
        
        this.group.position.set(nextX, this.group.position.y, nextZ);
        
        // Efecto visual Parpadeo sirena ambulancia roja y azul intercalada
        if (this.sirenB && this.sirenR) {
            if (Math.floor(performance.now() / 200) % 2 === 0) {
                this.sirenR.material.color.setHex(0xff0000);
                this.sirenB.material.color.setHex(0x111111);
            } else {
                this.sirenR.material.color.setHex(0x111111);
                this.sirenB.material.color.setHex(0x0000ff);
            }
        }
    }

    destroy() {
        this.markedForDeletion = true;
        scene.remove(this.group);
    }
}

function createRescueEffect(pos, isHeavy) {
    rescueVehicles.push(new RescueVehicle(pos, isHeavy ? 'tow_truck' : 'ambulance'));
}

function checkWaveProgress() {
    enemiesDefeatedInWave++;
    updateHUD();
    
    if (enemiesDefeatedInWave >= enemiesToSpawn) {
        // Limpiar balas y enemigos restantes por seguridad
        projectiles.forEach(p => p.destroy());
        enemies.forEach(e => e.destroy());
        projectiles = [];
        enemies = [];
        
        startTrivia();
    }
}

function nextWave() {
    wave++;
    enemiesDefeatedInWave = 0;
    enemiesSpawned = 0;
    
    if (wave % 5 === 0) {
        // Oleada de jefe / minijefe, menos enemigos en total pero uno es especial
        enemiesToSpawn = 1 + Math.floor(wave / 2);
    } else {
        enemiesToSpawn = 5 + (wave * 3);
    }
    
    updateHUD();
    isPaused = false;
    unpauseGame();
}

function updateHUD() {
    if(!player) return;
    const hpPercent = Math.max(0, player.health / player.maxHealth * 100);
    healthBar.style.width = `${hpPercent}%`;
    if (hpPercent > 50) healthBar.style.backgroundColor = '#2ecc71';
    else if (hpPercent > 20) healthBar.style.backgroundColor = '#f1c40f';
    else healthBar.style.backgroundColor = '#e74c3c';

    scoreDisplay.textContent = `Puntos: ${score}`;
    waveDisplay.textContent = `Oleada: ${wave}`;
    
    const left = enemiesToSpawn - enemiesDefeatedInWave;
    enemiesLeftDisplay.textContent = `Enemigos Faltantes: ${Math.max(0, left)}`;
    
    statDmg.textContent = player.damage;
    statSpd.textContent = player.speed;
    statFire.textContent = player.fireRate;
    statMulti.textContent = player.multiShot;
    if (player.hasShield) statShield.classList.remove('hidden');
    else statShield.classList.add('hidden');
    
    if (player.canDash) dashContainer.classList.remove('hidden');
    else dashContainer.classList.add('hidden');
}

// --- CÁMARAS ---
function updateCameras() {
    if (!player) return;
    const pPos = player.group.position;

    // Topdown
    cameras.topdown.position.set(pPos.x, 60, pPos.z + 20);
    cameras.topdown.lookAt(pPos.x, 0, pPos.z);

    // Follow (Third Person - Clásica de persecución)
    // El fwd apunta a la dirección de movimiento del auto
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(player.group.quaternion).normalize();
    
    // Posición de la cámara: Detrás del coche (restamos el vector fwd) y alineada un poco más arriba
    cameras.follow.position.copy(pPos).addScaledVector(fwd, -15); // La cámara va atrás del auto
    cameras.follow.position.y += 7; // Altura de seguimiento ligeramente elevada
    
    // Mirando hacia el frente, a través de la perspectiva del coche (hacia la calle)
    cameras.follow.lookAt(pPos.x + fwd.x * 15, pPos.y + 2, pPos.z + fwd.z * 15);

    // Update active camera
    activeCamera = cameras[currentCameraMode];

    // Minimap logic
    minimapContainer.classList.remove('hidden');
    minimapCamera.position.set(pPos.x, 50, pPos.z);
}

function toggleCamera() {
    if (currentCameraMode === 'topdown') {
        currentCameraMode = 'follow';
    } else {
        currentCameraMode = 'topdown';
    }
    renderPass.camera = cameras[currentCameraMode];
}

// --- TRIVIAS Y MEJORAS ---

const triviaBank = [
    { q: "¿Qué significa la luz amarilla continua en un semáforo?", options: ["Acelerar para cruzar", "Prevención, detenerse si es seguro", "Paso libre", "Peligro inminente"], correct: 1 },
    { q: "¿Cuál es el límite de velocidad en zona urbana para vehículos livianos?", options: ["60 km/h", "40 km/h", "50 km/h", "70 km/h"], correct: 2 },
    { q: "¿Qué distancia lateral mínima se debe dejar al sobrepasar a un ciclista?", options: ["1,0 metro", "0,5 metros", "2,0 metros", "1,5 metros"], correct: 3 },
    { q: "Si se revienta el neumático trasero, ¿hacia dónde debe girar el volante?", options: ["Hacia el lado contrario", "Hacia el centro", "Hacia el lado en que se desvía la cola", "Mantener firme"], correct: 2 },
    { q: "¿Cuál es la tasa de alcohol segura para conducir?", options: ["0.3 g/l", "0.5 g/l", "0", "0.8 g/l"], correct: 2 }
];

function startTrivia() {
    pauseGameForUI();
    triviaScreen.classList.remove('hidden');
    triviaFeedback.classList.add('hidden');
    optionsContainer.innerHTML = '';
    
    const qIndex = Math.floor(Math.random() * triviaBank.length);
    const question = triviaBank[qIndex];
    questionText.textContent = question.q;
    
    question.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = opt;
        btn.onclick = () => handleTriviaAnswer(index === question.correct, btn, question.correct);
        optionsContainer.appendChild(btn);
    });
}

function handleTriviaAnswer(isCorrect, btnClicked, correctIndex) {
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);
    
    buttons[correctIndex].classList.add('correct');
    if (!isCorrect) btnClicked.classList.add('incorrect');
    
    triviaFeedback.classList.remove('hidden');
    
    if (isCorrect) {
        triviaFeedback.textContent = "¡Correcto! Te preparas para la mejora...";
        triviaFeedback.style.color = '#2ecc71';
        setTimeout(() => {
            triviaScreen.classList.add('hidden');
            showUpgradeScreen();
        }, 2000);
    } else {
        triviaFeedback.textContent = "Incorrecto. Avanzas sin mejoras.";
        triviaFeedback.style.color = '#e74c3c';
        setTimeout(() => {
            triviaScreen.classList.add('hidden');
            nextWave();
        }, 2500);
    }
}

function showUpgradeScreen() {
    upgradeScreen.classList.remove('hidden');
    // Curar 25%
    const healAmount = player.maxHealth * 0.25;
    player.health = Math.min(player.maxHealth, player.health + healAmount);
    updateHUD();
    
    // Mostrar mejoras especiales si es oleada de jefe / minijefe
    const specialBtns = document.querySelectorAll('.special-upgrade');
    if (wave % 5 === 0) {
        specialBtns.forEach(btn => btn.classList.remove('hidden'));
    } else {
        specialBtns.forEach(btn => btn.classList.add('hidden'));
    }
}

upgradeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const type = e.currentTarget.getAttribute('data-type');
        applyUpgrade(type);
        upgradeScreen.classList.add('hidden');
        nextWave();
    });
});

function applyUpgrade(type) {
    let text = "";
    if (type === 'damage') { player.damage += 15; text = "+AUTORIDAD"; }
    else if (type === 'speed') { player.speed += 2; text = "+VELOCIDAD"; }
    else if (type === 'fireRate') { player.fireRate = Math.max(100, player.fireRate - 40); text = "+TRÁMITE RÁPIDO"; }
    else if (type === 'health') {
        player.maxHealth += 50;
        player.health += 50;
        updateHUD();
        text = "+CHASIS MEJORADO";
    }
    else if (type === 'multiShot') { player.multiShot += 1; text = "+MULTA MÚLTIPLE"; }
    else if (type === 'dash') { player.isDashing = true; text = "IMPULSO DESBLOQUEADO"; }
    else if (type === 'shield') { player.hasShield = true; text = "SEGURO ACTIVO"; }
    
    if (player && player.group) {
        createFloatingText(player.group.position, text, '#2ecc71', true);
    }
}

// --- GAME LIFECYCLE ---

function initGame() {
    createMap();
    if(player) {
        scene.remove(player.group);
    }
    player = new Player();
    
    projectiles.forEach(p => p.destroy());
    enemies.forEach(e => e.destroy());
    rescueVehicles.forEach(rv => rv.destroy());
    projectiles = [];
    enemies = [];
    particles = [];
    rescueVehicles = [];
    
    score = 0;
    wave = 1;
    enemiesDefeatedInWave = 0;
    enemiesSpawned = 0;
    enemiesToSpawn = 5;
    
    updateHUD();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    
    isPlaying = true;
    isPaused = false;
    currentCameraMode = 'topdown';
    
    lastTime = performance.now();
    requestAnimationFrame(loop);
}

function endGame() {
    isPlaying = false;
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = `Puntuación Final: ${score}`;
    finalWaveDisplay.textContent = `Oleadas Superadas: ${wave - 1}`;
}

function pauseGameForUI() {
    isPaused = true;
}

function unpauseGame() {
    isPaused = false;
    lastTime = performance.now();
}

function togglePause() {
    if (!isPlaying || triviaScreen.classList.contains('hidden') === false || upgradeScreen.classList.contains('hidden') === false) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        pauseScreen.classList.remove('hidden');
    } else {
        pauseScreen.classList.add('hidden');
        lastTime = performance.now();
    }
}

resumeBtn.addEventListener('click', togglePause);

// --- MAIN LOOP ---
let lastTime = 0;

// Estado del juego agregado:
let gameState = 'title'; // 'playing', 'paused', 'trivia', 'upgrade', 'admin', 'gameover'

function loop(currentTime) {
    stats.begin(); // Tracking de inicio de frame

    if (!isPlaying) {
        stats.end();
        return;
    }
    requestAnimationFrame(loop);

    if (isPaused || gameState === 'admin') {
        stats.end();
        return;
    }

    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Actualizar jugador
    player.update(dt);
    
    // Generar enemigos si faltan en la oleada actual
    if (enemiesSpawned < enemiesToSpawn && enemies.length < 15 && Math.random() < 0.5 * dt) {
        spawnEnemy();
    }

    // Actualizar entidades
    projectiles.forEach(p => p.update(dt));
    enemies.forEach(e => e.update(dt));
    particles.forEach(p => p.update(dt));
    rescueVehicles.forEach(rv => rv.update(dt));

    // Limpiar eliminados
    projectiles = projectiles.filter(p => !p.markedForDeletion);
    enemies = enemies.filter(e => !e.markedForDeletion);
    particles = particles.filter(p => !p.markedForDeletion);
    rescueVehicles = rescueVehicles.filter(rv => !rv.markedForDeletion);

    // Detección de colisiones Proyectil -> Personajes
    projectiles.forEach(p => {
        if (p.isPlayer) {
            enemies.forEach(e => {
                if (!p.markedForDeletion && !e.markedForDeletion) {
                    const dist = p.mesh.position.distanceTo(e.group.position);
                    if (dist < p.radius + e.radius) {
                        p.destroy();
                        e.takeDamage(p.damage);
                    }
                }
            });
        } else {
            // Proyectil enemigo impactando al jugador
            const dist = p.mesh.position.distanceTo(player.group.position);
            if (!p.markedForDeletion && dist < p.radius + player.radius) {
                p.destroy();
                player.takeDamage(p.damage);
            }
        }
    });

    // Actualizar Camaras
    updateCameras();

    // Reevaluar raycast para que el mouse3DPos esté correcto si la cámara se mueve
    raycaster.setFromCamera(mouseVec, activeCamera);
    raycaster.ray.intersectPlane(groundPlane, mouse3DPos);

    // Renderizar escena principal (ahora con Post-Procesado)
    composer.render();

    // Renderizar minimapa siempre
    minimapRenderer.render(scene, minimapCamera);
    
    // FPS stats al final
    stats.end();
}

// --- EVENT LISTENERS ---

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    Object.values(cameras).forEach(cam => {
        cam.aspect = window.innerWidth / window.innerHeight;
        cam.updateProjectionMatrix();
    });
});

let keyBuffer = "";
const secretCode = "admin";

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (e.key.toLowerCase() === 'c') toggleCamera();
    if (e.key.toLowerCase() === 'p' || e.key === 'Escape') togglePause();
    
    // Lógica del código secreto (admin)
    if (e.key.length === 1) { // Solo caracteres visibles
        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > secretCode.length) {
            keyBuffer = keyBuffer.slice(-secretCode.length);
        }
        if (keyBuffer === secretCode && gameState === 'playing') {
            openAdminPanel();
            keyBuffer = ""; // Limpiar el buffer
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Eventos de botones del Panel de Admin
document.getElementById('admin-heal-btn').addEventListener('click', () => {
    if(player) {
        player.health = player.maxHealth;
        updateHUD();
        createFloatingText(player.group.position, "SALUD MAX. (ADMIN)", '#2ecc71');
    }
});

document.getElementById('admin-kill-btn').addEventListener('click', () => {
    // Matar todos los enemigos actuales
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].health = 0; // Se borrarán en el próximo update
    }
});

document.getElementById('admin-wave-btn').addEventListener('click', () => {
    // Forzar el final de la oleada actualizando los enemigos restantes
    enemiesLeft = 0; 
});

document.getElementById('admin-close-btn').addEventListener('click', () => {
    document.getElementById('admin-panel').classList.add('hidden');
    gameState = 'playing'; // Reanudar juego
});

document.getElementById('admin-apply-stats-btn').addEventListener('click', () => {
    if (player) {
        const nDmg = parseFloat(document.getElementById('admin-dmg').value);
        const nSpd = parseFloat(document.getElementById('admin-spd').value);
        const nFire = parseFloat(document.getElementById('admin-fire').value);
        const nMulti = parseInt(document.getElementById('admin-multi').value);
        
        if (!isNaN(nDmg)) player.damage = nDmg;
        if (!isNaN(nSpd)) player.speed = nSpd;
        if (!isNaN(nFire)) player.fireRate = nFire;
        if (!isNaN(nMulti)) player.multiShot = nMulti;
        
        updateHUD();
        createFloatingText(player.group.position, "STATS ACTUALIZADAS", '#9b59b6');
    }
});

document.getElementById('admin-defeat-btn').addEventListener('click', () => {
    if (player) {
        player.health = 0;
        document.getElementById('admin-panel').classList.add('hidden');
        // El bucle principal detectará que health <= 0 y ejecutará el Game Over automáticamente
        gameState = 'playing'; 
    }
});

function openAdminPanel() {
    gameState = 'admin'; // Simplemente un estado especial para evitar loops o pausar
    document.getElementById('admin-panel').classList.remove('hidden');
    
    // Cargar estadísticas actuales en los inputs
    if (player) {
        document.getElementById('admin-dmg').value = player.damage;
        document.getElementById('admin-spd').value = player.speed;
        document.getElementById('admin-fire').value = player.fireRate;
        document.getElementById('admin-multi').value = player.multiShot || 1;
    }
}

// Raycasting para el mouse / touch
function updatePointer(clientX, clientY) {
    mouseVec.x = (clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseVec, activeCamera);
    raycaster.ray.intersectPlane(groundPlane, mouse3DPos);
}

window.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY));
window.addEventListener('mousedown', () => isMouseDown = true);
window.addEventListener('mouseup', () => isMouseDown = false);

// Eventos táctiles para apuntar/disparar tocando la zona del canvas/juego
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Evita el scroll o zoom indeseado
    if (e.touches.length > 0) {
        isMouseDown = true;
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
}, {passive: false});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
}, {passive: false});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (e.touches.length === 0) isMouseDown = false;
}, {passive: false});

// Lógica de botones Móviles Virtuales
const mobileControls = document.getElementById('mobile-controls');
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    mobileControls.classList.remove('hidden'); // Mostrar en dispositivos táctiles
}

const setupTouchBtn = (id, keyName) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[keyName] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyName] = false; });
    
    // Por si quieren cliquearlos con ratón para probar en PC
    btn.addEventListener('mousedown', (e) => { keys[keyName] = true; });
    btn.addEventListener('mouseup', (e) => { keys[keyName] = false; });
    btn.addEventListener('mouseleave', (e) => { keys[keyName] = false; });
};

setupTouchBtn('btn-up', 'w'); // Acelerar
setupTouchBtn('btn-down', 's'); // Frenar/Reversa
setupTouchBtn('btn-left', 'a'); // Izquierda
setupTouchBtn('btn-right', 'd'); // Derecha
setupTouchBtn('btn-dash', ' '); // Dash/Impulso

const btnCam = document.getElementById('btn-cam');
if (btnCam) {
    btnCam.addEventListener('touchstart', (e) => { e.preventDefault(); toggleCamera(); });
    btnCam.addEventListener('mousedown', (e) => { toggleCamera(); });
}

startBtn.addEventListener('click', () => {
    initGame();
    gameState = 'playing';
});
restartBtn.addEventListener('click', () => {
    initGame();
    gameState = 'playing';
});

if (mainMenuBtn) {
    mainMenuBtn.addEventListener('click', () => {
        window.location.href = '../index.html'; // Cambiar a la ruta de tu seleccionador de juegos más adelante
    });
}