// Sistema de Mapa 2D - Calles y Grid urbano
// Coordenadas X: -120 a 120 (Eje Este-Oeste)
// Coordenadas Y: -60 a 100  (Eje Norte-Sur)

class Map2D {
    constructor(scene) {
        this.scene = scene;
        this.gridSize = 40;
        this.roadWidth = 18;
        this.sidewalkWidth = 2.2;
        this.buildings = [];
        this.roads = [];
        this.intersections = [];
        this.pedestrianCrossings = [];
        this.speedBumps = [];
        this.trafficLights = [];
        
        this.init();
    }

    init() {
        this.createGround();
        this.createRoadsGrid();
        this.createIntersections();
        this.createSidewalks();
        this.createBuildings();
        this.createTrafficInfrastructure();
    }

    createGround() {
        const groundMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(300, 200),
            new THREE.MeshStandardMaterial({ color: 0x35613c })
        );
        groundMesh.rotation.x = -Math.PI / 2;
        this.scene.add(groundMesh);
    }

    createRoadsGrid() {
        const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x2f2f32 });
        const laneMaterial = new THREE.MeshStandardMaterial({ color: 0xffe16a });

        // Calles Horizontales (Este-Oeste)
        const horizontalStreetsY = [80, 40, 10, -30];
        horizontalStreetsY.forEach((y) => {
            const roadMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(260, this.roadWidth),
                roadMaterial
            );
            roadMesh.rotation.x = -Math.PI / 2;
            roadMesh.position.set(0, 0.01, y);
            this.scene.add(roadMesh);
            this.roads.push({ x1: -120, x2: 120, y: y, direction: 'horizontal', width: this.roadWidth });

            // Lineas de carriles
            for (let x = -120; x <= 120; x += 12) {
                const lane = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.45, 6),
                    laneMaterial
                );
                lane.rotation.x = -Math.PI / 2;
                lane.position.set(x, 0.03, y);
                this.scene.add(lane);
            }
        });

        // Calles Verticales (Norte-Sur)
        const verticalStreetsX = [-80, -40, 0, 40, 80];
        verticalStreetsX.forEach((x) => {
            const roadMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(this.roadWidth, 200),
                roadMaterial
            );
            roadMesh.rotation.x = -Math.PI / 2;
            roadMesh.position.set(x, 0.01, 20);
            this.scene.add(roadMesh);
            this.roads.push({ y1: -60, y2: 100, x: x, direction: 'vertical', width: this.roadWidth });

            // Lineas de carriles
            for (let y = -60; y <= 100; y += 12) {
                const lane = new THREE.Mesh(
                    new THREE.PlaneGeometry(6, 0.45),
                    laneMaterial
                );
                lane.rotation.x = -Math.PI / 2;
                lane.position.set(x, 0.03, y);
                this.scene.add(lane);
            }
        });
    }

    createIntersections() {
        const intersectionMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2d });
        const horizontalStreetsY = [80, 40, 10, -30];
        const verticalStreetsX = [-80, -40, 0, 40, 80];

        // Crear todas las intersecciones (cruces completas)
        horizontalStreetsY.forEach((y) => {
            verticalStreetsX.forEach((x) => {
                // Superficie de interseccion
                const intersection = new THREE.Mesh(
                    new THREE.PlaneGeometry(this.roadWidth + 2, this.roadWidth + 2),
                    intersectionMaterial
                );
                intersection.rotation.x = -Math.PI / 2;
                intersection.position.set(x, 0.015, y);
                this.scene.add(intersection);
                this.intersections.push({ x, y, type: 'cross' });

                // Marcas de cruce peatonal
                this.createPedestrianCrossingMarkings(x, y);
            });
        });
    }

    createPedestrianCrossingMarkings(x, y) {
        const zebra = new THREE.MeshStandardMaterial({ color: 0xe7edf3 });
        const positions = [
            { offsetX: 0, offsetY: 10, scaleX: 1, scaleY: 0.08 },  // Norte
            { offsetX: 0, offsetY: -10, scaleX: 1, scaleY: 0.08 }, // Sur
            { offsetX: 10, offsetY: 0, scaleX: 0.08, scaleY: 1 },  // Este
            { offsetX: -10, offsetY: 0, scaleX: 0.08, scaleY: 1 }  // Oeste
        ];

        positions.forEach((pos) => {
            for (let i = 0; i < 6; i++) {
                const stripe = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.2 * pos.scaleX, 1.2 * pos.scaleY),
                    zebra
                );
                stripe.rotation.x = -Math.PI / 2;
                stripe.position.set(
                    x + pos.offsetX + (i - 3) * 1.4 * pos.scaleX,
                    0.035,
                    y + (i - 3) * 1.4 * pos.scaleY
                );
                this.scene.add(stripe);
                this.pedestrianCrossings.push(stripe);
            }
        });
    }

    createSidewalks() {
        const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b8f93 });

        // Aceras Horizontales
        const horizontalStreetsY = [80, 40, 10, -30];
        horizontalStreetsY.forEach((y) => {
            const leftSidewalk = new THREE.Mesh(
                new THREE.BoxGeometry(260, 0.2, this.sidewalkWidth),
                sidewalkMaterial
            );
            leftSidewalk.position.set(0, 0.1, y - (this.roadWidth / 2 + this.sidewalkWidth));
            this.scene.add(leftSidewalk);

            const rightSidewalk = new THREE.Mesh(
                new THREE.BoxGeometry(260, 0.2, this.sidewalkWidth),
                sidewalkMaterial
            );
            rightSidewalk.position.set(0, 0.1, y + (this.roadWidth / 2 + this.sidewalkWidth));
            this.scene.add(rightSidewalk);
        });

        // Aceras Verticales
        const verticalStreetsX = [-80, -40, 0, 40, 80];
        verticalStreetsX.forEach((x) => {
            const leftSidewalk = new THREE.Mesh(
                new THREE.BoxGeometry(this.sidewalkWidth, 0.2, 200),
                sidewalkMaterial
            );
            leftSidewalk.position.set(x - (this.roadWidth / 2 + this.sidewalkWidth), 0.1, 20);
            this.scene.add(leftSidewalk);

            const rightSidewalk = new THREE.Mesh(
                new THREE.BoxGeometry(this.sidewalkWidth, 0.2, 200),
                sidewalkMaterial
            );
            rightSidewalk.position.set(x + (this.roadWidth / 2 + this.sidewalkWidth), 0.1, 20);
            this.scene.add(rightSidewalk);
        });
    }

    createBuildings() {
        const colors = [0x9eb4ca, 0xa4b0bd, 0x8fa5b5, 0xa8b6c5];
        let colorIndex = 0;

        // Bloques de viviendas entre calles
        const horizontalStreetsY = [80, 40, 10, -30];
        const verticalStreetsX = [-80, -40, 0, 40, 80];

        const blockSize = 20;
        const buildingSpacing = 15;

        for (let i = 0; i < horizontalStreetsY.length - 1; i++) {
            for (let j = 0; j < verticalStreetsX.length - 1; j++) {
                const blockCenterX = (verticalStreetsX[j] + verticalStreetsX[j + 1]) / 2;
                const blockCenterY = (horizontalStreetsY[i] + horizontalStreetsY[i + 1]) / 2;

                // Generar 3-4 edificios por bloque
                const numBuildings = Math.floor(Math.random() * 2) + 3;
                for (let k = 0; k < numBuildings; k++) {
                    const buildingX = blockCenterX + (Math.random() - 0.5) * buildingSpacing;
                    const buildingY = blockCenterY + (Math.random() - 0.5) * buildingSpacing;
                    const buildingWidth = Math.random() * 4 + 4;
                    const buildingHeight = Math.random() * 3 + 4;
                    const buildingDepth = Math.random() * 4 + 4;

                    this.addBuilding(
                        buildingX,
                        buildingY,
                        buildingWidth,
                        buildingHeight,
                        buildingDepth,
                        colors[colorIndex % colors.length]
                    );
                    colorIndex++;
                }
            }
        }
    }

    addBuilding(x, y, width, height, depth, color) {
        const building = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshStandardMaterial({ color })
        );
        building.position.set(x, height / 2, y);
        this.scene.add(building);
        this.buildings.push(building);
    }

    createTrafficInfrastructure() {
        const horizontalStreetsY = [80, 40, 10, -30];
        const verticalStreetsX = [-80, -40, 0, 40, 80];

        // Semaforos en intersecciones
        horizontalStreetsY.forEach((y, yIdx) => {
            verticalStreetsX.forEach((x, xIdx) => {
                if ((yIdx + xIdx) % 2 === 0) {
                    this.addTrafficLight(x - 8, y + 8);
                    this.addTrafficLight(x + 8, y - 8);
                }
            });
        });

        // Resaltos de velocidad en ciertas areas
        const speedBumpLocations = [
            { x: -40, y: 80 },
            { x: 40, y: 40 },
            { x: 0, y: 10 },
            { x: -80, y: -30 }
        ];

        speedBumpLocations.forEach((loc) => {
            this.addSpeedBump(loc.x, loc.y);
        });
    }

    addTrafficLight(x, y) {
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 3.1, 10),
            new THREE.MeshStandardMaterial({ color: 0x30343b })
        );
        pole.position.set(x, 1.55, y);
        this.scene.add(pole);

        const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.36, 0.9, 0.28),
            new THREE.MeshStandardMaterial({ color: 0x1d2128 })
        );
        box.position.set(x, 2.5, y);
        this.scene.add(box);

        const red = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 10, 10),
            new THREE.MeshStandardMaterial({ color: 0xff5e5e, emissive: 0x661515, emissiveIntensity: 0.55 })
        );
        red.position.set(x, 2.72, y + 0.15);
        this.scene.add(red);

        this.trafficLights.push({ mesh: box, position: { x, y } });
    }

    addSpeedBump(x, y) {
        const bump = new THREE.Mesh(
            new THREE.BoxGeometry(16, 0.14, 0.65),
            new THREE.MeshStandardMaterial({ color: 0xe5bf3f })
        );
        bump.position.set(x, 0.08, y);
        this.scene.add(bump);
        this.speedBumps.push(bump);
    }

    getRoadAt(x, y) {
        const tolerance = 10;
        for (const road of this.roads) {
            if (road.direction === 'horizontal') {
                if (Math.abs(y - road.y) < tolerance && x >= road.x1 && x <= road.x2) {
                    return road;
                }
            } else if (road.direction === 'vertical') {
                if (Math.abs(x - road.x) < tolerance && y >= road.y1 && y <= road.y2) {
                    return road;
                }
            }
        }
        return null;
    }

    getSurroundingIntersections(x, y, range = 30) {
        return this.intersections.filter((inter) => {
            const dist = Math.sqrt((inter.x - x) ** 2 + (inter.y - y) ** 2);
            return dist <= range;
        });
    }
}
