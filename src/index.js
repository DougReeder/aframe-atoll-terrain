// aframe-terrain-plain - An A-Frame WebVR primitive with high-resolution terrain surrounded by a low-res plain
// Copyright © 2019 P. Douglas Reeder under the MIT License
// Written using Perlin noise & ideas from aframe-mountain-component by Kevin Ngo.

import ImprovedNoise from './ImprovedNoise';

AFRAME.registerGeometry('terrain-plain', {
    schema: {
        middleRadius: {type: 'number', default: 100, min: 10},
        unitSize: {type: 'number', default: 1, min: 0.1, max: 1000},
        far: {type: 'number', default: 4000},
        landYinColor: {type: 'color', default: '#528d04'},
        landYangColor: {type: 'color', default: '#278d53'},
        seaColor: {type: 'color'},
        log: {type: 'boolean', default: false}
    },
    init: function (data) {
        const perlin = new ImprovedNoise();
        const SEED = Math.random() * 100;
        const SQRT3HALF = Math.sqrt(3) / 2;

        const SIZE = Math.round(data.middleRadius / data.unitSize);
        const UNIT_SIZE = data.middleRadius / SIZE;

        const INNER_RADIUS = (SIZE-1) * UNIT_SIZE + 0.0001;
        const OUTER_RADIUS = (SIZE+1) * UNIT_SIZE + 0.0001;
        const FAR = data.far > OUTER_RADIUS ? data.far : OUTER_RADIUS;
        const PLATEAU_EDGE = INNER_RADIUS / 4;
        const SCAN_SIZE = Math.ceil(SIZE * 1.16);   // empirically determined

        const LAND_YIN_COLOR = new THREE.Color(data.landYinColor);
        const LAND_YANG_COLOR = new THREE.Color(data.landYangColor);
        const SEA_COLOR = new THREE.Color(data.seaColor);

        if (data.log) {
            console.log("terrain-plain", "SIZE="+SIZE, "SCAN_SIZE="+SCAN_SIZE, "UNIT_SIZE="+UNIT_SIZE,
                "middleRadius="+data.middleRadius, "FAR="+FAR);
        }

        let geometry = new THREE.Geometry();

        // vertex locations
        let vertexLookup = {};
        vertexLookup[-SCAN_SIZE-1] = {};
        let vertexInd = 0;
        for (let i= -SCAN_SIZE; i<=SCAN_SIZE; ++i) {
            vertexLookup[i] = {};
            for (let j= -SCAN_SIZE; j<=SCAN_SIZE; ++j) {
                let x = i * SQRT3HALF * UNIT_SIZE;
                let z = (j - i/2) * UNIT_SIZE;
                let r = Math.sqrt(x*x + z*z);
                if (r <= OUTER_RADIUS) {
                    let y;
                    if (r <= INNER_RADIUS) {
                        y = 10;
                        // generates smooth noisy terrain
                        for (let quality = 25; quality <= 1500; quality *= 5) {
                            y += perlin.noise((x+data.middleRadius) / quality, (z+data.middleRadius) / quality, SEED) * Math.min(quality / 2, 150);
                        }

                        y *= Math.min(INNER_RADIUS - r, PLATEAU_EDGE) / PLATEAU_EDGE;

                        if (y > 0) {
                            let quality = 5;
                            y += perlin.noise((x + data.middleRadius) / quality, (z + data.middleRadius) / quality, SEED) * quality / 2;
                        }

                        // flattens the bottom, so it's continuous with the plain
                        if (y < 0) {
                            y = 0;
                        }
                    } else if (r <= data.middleRadius) {
                        y = 0;
                    } else {
                        x *= FAR / r;
                        z *= FAR / r;
                        y = 0;
                    }

                    vertexLookup[i][j] = vertexInd++;
                    geometry.vertices.push(new THREE.Vector3(x, y, z));
                }
            }
        }
        vertexLookup[SCAN_SIZE+1] = {};

        // vertex colors
        let pitColor = new THREE.Color(0x404040);   // dark gray
        pitColor.lerp(LAND_YIN_COLOR, 0.75);
        const QUALITY1 = UNIT_SIZE * 5, QUALITY2 = UNIT_SIZE * 25;

        let vertexColor = {};
        for (let i= -SCAN_SIZE; i<=SCAN_SIZE; ++i) {
            vertexColor[i] = {};
            for (let j = -SCAN_SIZE; j <= SCAN_SIZE; ++j) {
                let vertex = geometry.vertices[vertexLookup[i][j]];
                if (vertex) {
                    if (vertex.y > 0) {
                        let mix = (1.73205 + perlin.noise((vertex.x+data.middleRadius) / QUALITY1, (vertex.z+data.middleRadius) / QUALITY1, SEED)
                            + perlin.noise((vertex.x+data.middleRadius) / QUALITY2, (vertex.z+data.middleRadius) / QUALITY2, SEED)) / 3.4641;
                        let color = LAND_YIN_COLOR.clone();
                        vertexColor[i][j] = color.lerp(LAND_YANG_COLOR, mix);
                    } else {
                        let r = Math.sqrt(vertex.x*vertex.x + vertex.z*vertex.z);
                        if (r > INNER_RADIUS) {
                            vertexColor[i][j] = SEA_COLOR;
                        } else {
                            let neighbors = [];
                            neighbors[0] = geometry.vertices[vertexLookup[i][j - 1]];
                            neighbors[1] = geometry.vertices[vertexLookup[i - 1][j - 1]];
                            neighbors[2] = geometry.vertices[vertexLookup[i - 1][j]];
                            neighbors[3] = geometry.vertices[vertexLookup[i][j + 1]];
                            neighbors[4] = geometry.vertices[vertexLookup[i + 1][j + 1]];
                            neighbors[5] = geometry.vertices[vertexLookup[i + 1][j]];
                            let land = 0, sea = 0;
                            for (let n = 0; n < 6; ++n) {
                                if (neighbors[n]) {
                                    if (neighbors[n].y > 0) {
                                        ++land;
                                    } else {
                                        ++sea;
                                    }
                                }
                            }
                            if (land === 0) {   // open sea
                                vertexColor[i][j] = SEA_COLOR;
                            } else if (sea === 0) {   // pit completely surrounded by land
                                vertexColor[i][j] = pitColor;
                            } else {
                                let color = new THREE.Color(0x71615b);   // brownish-gray beach
                                color.lerp(LAND_YIN_COLOR, land / (land+sea));
                                vertexColor[i][j] = color;
                            }
                        }
                    }
                }
            }
        }

        // faces
        for (let i= -SCAN_SIZE; i<=SCAN_SIZE; ++i) {
            for (let j = -SCAN_SIZE; j <= SCAN_SIZE; ++j) {
                let vertexAInd = vertexLookup[i][j];
                if (geometry.vertices[vertexAInd]) {
                    let vertexBInd = vertexLookup[i][j-1];

                    let vertexCInd = vertexLookup[i-1][j-1];

                    let vertexDInd = vertexLookup[i-1][j];

                    if (typeof vertexBInd !== 'undefined' && typeof vertexCInd !== 'undefined') {
                        let face = new THREE.Face3(vertexAInd, vertexBInd, vertexCInd);
                        face.vertexColors[0] = vertexColor[i  ][j  ];
                        face.vertexColors[1] = vertexColor[i  ][j-1];
                        face.vertexColors[2] = vertexColor[i-1][j-1];

                        geometry.faces.push(face);
                    }
                    if (typeof vertexCInd !== 'undefined' && typeof vertexDInd !== 'undefined') {
                        let face = new THREE.Face3(vertexAInd, vertexCInd, vertexDInd);
                        face.vertexColors[0] = vertexColor[i  ][j  ];
                        face.vertexColors[1] = vertexColor[i-1][j-1];
                        face.vertexColors[2] = vertexColor[i-1][j  ];

                        geometry.faces.push(face);
                    }
                }
            }
        }

        geometry.computeBoundingBox();
        geometry.mergeVertices();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        this.geometry = geometry;
    }
});


AFRAME.registerPrimitive('a-terrain-plain', {
    defaultComponents: {
        geometry: {
            primitive: 'terrain-plain',
            middleRadius: 100,
            unitSize: 1,
            log: false
        },
        material: {
            vertexColors: 'vertex'
        }
    },

    mappings: {
        'middle-radius': 'geometry.middleRadius',
        'unit-size': 'geometry.unitSize',
        'far': 'geometry.far',
        'log': 'geometry.log',
        'shader': 'material.shader',
        'land-yin-color': 'geometry.landYinColor',
        'land-yang-color': 'geometry.landYangColor',
        'sea-color': 'geometry.seaColor',
        'metalness': 'material.metalness',
        'roughness': 'material.roughness',
        'src': 'material.src',
        'flat-shading': 'material.flatShading'
    }
});
