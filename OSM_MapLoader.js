// Cargador de Mapas desde OpenStreetMap (Overpass API)
// Descarga datos reales de calles y edificios de Santiago, Chile

class OSMMapLoader {
    constructor(scene) {
        this.scene = scene;
        this.mapData = null;
        this.ways = [];
        this.buildings = [];
        this.nodes = {};
        this.intersections = [];
        
        // Zona de Santiago (Avenida Providencia y alrededores)
        // Bounding box: [min_lat, min_lon, max_lat, max_lon]
        this.bbox = [-33.4320, -70.6050, -33.4200, -70.5900]; // Centro de Providencia
    }

    async loadMap() {
        try {
            console.log('Descargando datos de OpenStreetMap...');
            const osmData = await this.fetchOSMData();
            if (!osmData) {
                console.warn('No se pudieron cargar datos OSM, usando mapa procedural');
                return false;
            }
            
            this.parseOSMData(osmData);
            this.generateStreets();
            this.generateBuildings();
            this.generateIntersections();
            console.log('Mapa OSM cargado exitosamente');
            return true;
        } catch (error) {
            console.error('Error cargando mapa OSM:', error);
            return false;
        }
    }

    async fetchOSMData() {
        const [minLat, minLon, maxLat, maxLon] = this.bbox;
        const query = `
            [bbox:${minLat},${minLon},${maxLat},${maxLon}];
            (
                way["highway"~"^(primary|secondary|residential|tertiary)$"];
                way["building"];
                node;
            );
            out geom;
        `;

        const url = 'https://overpass-api.de/api/interpreter';
        const encodedQuery = encodeURIComponent(query);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: 'data=' + encodedQuery,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error en Overpass API:', error);
            return null;
        }
    }

    parseOSMData(data) {
        if (!data.elements) return;

        const centerLat = (this.bbox[0] + this.bbox[2]) / 2;
        const centerLon = (this.bbox[1] + this.bbox[3]) / 2;

        data.elements.forEach(element => {
            if (element.type === 'node') {
                const x = (element.lon - centerLon) * 111320 * Math.cos(centerLat * Math.PI / 180);
                const z = (element.lat - centerLat) * 110540;
                this.nodes[element.id] = { lat: element.lat, lon: element.lon, x, z };
            } else if (element.type === 'way') {
                const tags = element.tags || {};
                const geometry = element.geometry || [];

                if (tags.highway) {
                    this.ways.push({
                        id: element.id,
                        type: 'street',
                        highway: tags.highway,
                        name: tags.name || 'Sin nombre',
                        geometry: geometry,
                        nodes: element.nodes || []
                    });
                } else if (tags.building) {
                    this.buildings.push({
                        id: element.id,
                        type: 'building',
                        geometry: geometry,
                        nodes: element.nodes || [],
                        building_type: tags.building,
                        height: parseInt(tags.height) || 12
                    });
                }
            }
        });
    }

    generateStreets() {
        const centerLat = (this.bbox[0] + this.bbox[2]) / 2;
        const centerLon = (this.bbox[1] + this.bbox[3]) / 2;
        
        const roadMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2f2f32,
            roughness: 0.8
        });
        
        const laneMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffe16a,
            roughness: 0.5
        });

        this.ways.forEach(way => {
            if (way.geometry && way.geometry.length > 1) {
                const points = way.geometry.map(node => {
                    const x = (node.lon - centerLon) * 111320 * Math.cos(centerLat * Math.PI / 180);
                    const z = (node.lat - centerLat) * 110540;
                    return new THREE.Vector3(x, 0.01, z);
                });

                const roadWidth = way.highway === 'primary' ? 16 : way.highway === 'secondary' ? 12 : 8;
                this.drawRoad(points, roadWidth, roadMaterial);
                this.drawLaneMarkings(points, laneMaterial);
            }
        });
    }

    drawRoad(points, width, material) {
        const shape = new THREE.Shape();
        const side1 = [];
        const side2 = [];

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
            const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(width / 2);

            const s1 = new THREE.Vector3().addVectors(p1, perp);
            const s2 = new THREE.Vector3().subVectors(p1, perp);

            side1.push(s1);
            side2.push(s2);
        }

        for (let i = 0; i < side1.length; i++) {
            const p1 = side1[i];
            const p2 = side1[(i + 1) % side1.length];
            const p3 = side2[(i + 1) % side2.length];
            const p4 = side2[i];

            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                p1.x, p1.y, p1.z,
                p2.x, p2.y, p2.z,
                p3.x, p3.y, p3.z,
                p4.x, p4.y, p4.z
            ]);

            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.computeVertexNormals();

            const mesh = new THREE.Mesh(geometry, material);
            this.scene.add(mesh);
        }
    }

    drawLaneMarkings(points, material) {
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const dist = p1.distanceTo(p2);
            const segments = Math.floor(dist / 8);

            for (let j = 0; j < segments; j++) {
                const t = j / segments;
                const pos = new THREE.Vector3().lerpVectors(p1, p2, t);
                
                const marking = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.4, 4),
                    material
                );
                marking.rotation.x = -Math.PI / 2;
                marking.position.copy(pos);
                marking.position.y = 0.03;
                this.scene.add(marking);
            }
        }
    }

    generateBuildings() {
        const centerLat = (this.bbox[0] + this.bbox[2]) / 2;
        const centerLon = (this.bbox[1] + this.bbox[3]) / 2;

        this.buildings.forEach(building => {
            if (!building.geometry || building.geometry.length < 3) return;

            const points = building.geometry.map(node => {
                const x = (node.lon - centerLon) * 111320 * Math.cos(centerLat * Math.PI / 180);
                const z = (node.lat - centerLat) * 110540;
                return new THREE.Vector2(x, z);
            });

            const area = this.calculatePolygonArea(points);
            const avgDim = Math.sqrt(area);
            const height = Math.min(building.height || 12, Math.max(4, avgDim / 3));

            const shape = new THREE.Shape(points);
            const geometry = new THREE.ExtrudeGeometry(shape, {
                depth: height,
                bevelEnabled: false
            });

            const color = 0x888888 + Math.floor(Math.random() * 0x444444);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.6,
                metalness: 0.1
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = 0;
            mesh.rotation.x = -Math.PI / 2;
            this.scene.add(mesh);
        });
    }

    calculatePolygonArea(points) {
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        return Math.abs(area / 2);
    }

    generateIntersections() {
        const intersectionSpacing = 100;
        const centerLat = (this.bbox[0] + this.bbox[2]) / 2;
        const centerLon = (this.bbox[1] + this.bbox[3]) / 2;

        const bounds = {
            minX: -(this.bbox[3] - this.bbox[1]) * 111320 * Math.cos(centerLat * Math.PI / 180) / 2,
            maxX: (this.bbox[3] - this.bbox[1]) * 111320 * Math.cos(centerLat * Math.PI / 180) / 2,
            minZ: -(this.bbox[2] - this.bbox[0]) * 110540 / 2,
            maxZ: (this.bbox[2] - this.bbox[0]) * 110540 / 2
        };

        for (let x = bounds.minX; x < bounds.maxX; x += intersectionSpacing) {
            for (let z = bounds.minZ; z < bounds.maxZ; z += intersectionSpacing) {
                this.intersections.push({ x, z });
            }
        }
    }

    getMapBounds() {
        const centerLat = (this.bbox[0] + this.bbox[2]) / 2;
        const centerLon = (this.bbox[1] + this.bbox[3]) / 2;

        return {
            minX: -(this.bbox[3] - this.bbox[1]) * 111320 * Math.cos(centerLat * Math.PI / 180) / 2,
            maxX: (this.bbox[3] - this.bbox[1]) * 111320 * Math.cos(centerLat * Math.PI / 180) / 2,
            minY: -(this.bbox[2] - this.bbox[0]) * 110540 / 2,
            maxY: (this.bbox[2] - this.bbox[0]) * 110540 / 2,
            centerLat,
            centerLon
        };
    }
}
