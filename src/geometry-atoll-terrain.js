// geometry-atoll-terrain.js - geometry for aframe-atoll-terrain component
// Copyright © 2019 P. Douglas Reeder under the MIT License

import ImprovedNoise from './ImprovedNoise';

AFRAME.registerGeometry('atoll-terrain', {
    schema: {
        plateauRadius: {type: 'number', default: 10, min: 0},
        plateauElevation: {type: 'number', default: 1},
        middleRadius: {type: 'number', default: 100, min: 10},
        unitSize: {type: 'number', default: 1, min: 0.1, max: 1000},
        far: {type: 'number', default: 4000},
        landYinColor: {type: 'color', default: '#528d04'},
        landYangColor: {type: 'color', default: '#278d53'},
        seaYinColor: {type: 'color'},
        seaYangColor: {type: 'color'},
        log: {type: 'boolean', default: false}
    },
    init: function (data) {
        const perlin = new ImprovedNoise();
        const SEED = Math.random() * 100;
        const SQRT3HALF = Math.sqrt(3) / 2;

        const SIZE = Math.round(data.middleRadius / data.unitSize);
        const UNIT_SIZE = data.middleRadius / SIZE;

        const PLATEAU_EDGE = data.plateauRadius + UNIT_SIZE;

        const INNER_RADIUS = (SIZE-1) * UNIT_SIZE + 0.0001;
        const OUTER_RADIUS = (SIZE+1) * UNIT_SIZE + 0.0001;
        const FAR = data.far > OUTER_RADIUS ? data.far : OUTER_RADIUS;
        const MASK_EDGE = INNER_RADIUS / 4;
        const SCAN_SIZE = Math.ceil(SIZE * 1.16);   // empirically determined

        const LAND_YIN_COLOR = new THREE.Color(data.landYinColor);
        const LAND_YANG_COLOR = new THREE.Color(data.landYangColor);
        const SEA_YIN_COLOR = new THREE.Color(data.seaYinColor);
        const SEA_YANG_COLOR = new THREE.Color(data.seaYangColor);
        let seaAverageColor = SEA_YIN_COLOR.clone();
        seaAverageColor.lerp(SEA_YANG_COLOR, 0.5);
        const BEACH_COLOR = new THREE.Color(0x71615b);   // brownish-gray beach

        if (data.log) {
            console.log("atoll-terrain", "plateauRadius="+data.plateauRadius, "plateauElevation="+data.plateauElevation,
                "SIZE="+SIZE, "SCAN_SIZE="+SCAN_SIZE, "UNIT_SIZE="+UNIT_SIZE,
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
                    if (data.plateauRadius > 0 && r <= PLATEAU_EDGE) {
                        y = data.plateauElevation;
                    } else if (r <= INNER_RADIUS) {
                        y = 10;
                        // generates smooth noisy terrain
                        for (let quality = 25; quality <= 1500; quality *= 5) {
                            y += perlin.noise((x+data.middleRadius) / quality, (z+data.middleRadius) / quality, SEED) * Math.min(quality / 2, 150);
                        }

                        if (data.plateauRadius > 0) {
                            y = data.plateauElevation + (y - data.plateauElevation) * Math.min(r - PLATEAU_EDGE, MASK_EDGE) / MASK_EDGE;
                        }
                        y *= Math.min(INNER_RADIUS - r, MASK_EDGE) / MASK_EDGE;

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
        const SCALE5 = UNIT_SIZE * 5, SCALE25 = UNIT_SIZE * 25;
        const SCALE3 = UNIT_SIZE * 3, SCALE12 = UNIT_SIZE * 12;

        let vertexColor = {};
        for (let i= -SCAN_SIZE; i<=SCAN_SIZE; ++i) {
            vertexColor[i] = {};
            for (let j = -SCAN_SIZE; j <= SCAN_SIZE; ++j) {
                let vertex = geometry.vertices[vertexLookup[i][j]];
                if (vertex) {
                    if (vertex.y > 0) {   // above sea level
                        let mix = (1.73205 + perlin.noise((vertex.x+data.middleRadius) / SCALE5, (vertex.z+data.middleRadius) / SCALE5, SEED)
                            + perlin.noise((vertex.x+data.middleRadius) / SCALE25, (vertex.z+data.middleRadius) / SCALE25, SEED)) / 3.4641;
                        let color = LAND_YIN_COLOR.clone();
                        vertexColor[i][j] = color.lerp(LAND_YANG_COLOR, mix);
                    } else {   // sea level
                        let r = Math.sqrt(vertex.x*vertex.x + vertex.z*vertex.z);
                        if (r > INNER_RADIUS) {
                            vertexColor[i][j] = seaAverageColor;
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
                            if (land === 0) {   // away from shore
                                let mix = (1.73205 + perlin.noise((vertex.x+FAR) / SCALE3, (vertex.z+FAR) / SCALE3, SEED)
                                    + perlin.noise((vertex.x+FAR) / SCALE12, (vertex.z+FAR) / SCALE12, SEED)) / 3.4641;
                                let color = SEA_YIN_COLOR.clone();
                                vertexColor[i][j] = color.lerp(SEA_YANG_COLOR, mix);
                            } else if (sea === 0) {   // pit completely surrounded by land
                                vertexColor[i][j] = pitColor;
                            } else {
                                let color = BEACH_COLOR.clone();
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
