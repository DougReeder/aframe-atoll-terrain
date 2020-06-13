// geometry-atoll-terrain.js - geometry for aframe-atoll-terrain component
// Copyright © 2019 P. Douglas Reeder under the MIT License

import ImprovedNoise from './ImprovedNoise';

AFRAME.registerGeometry('atoll-terrain', {
    schema: {
        buffer: {type: 'boolean', default: false},
        meanElevation: {type: 'number', default: 10},
        plateauRadius: {type: 'number', default: 10, min: 0},
        plateauElevation: {type: 'number', default: 1},
        plateauYinColor: {type: 'color', default: undefined},
        plateauYangColor: {type: 'color', default: undefined},
        middleRadius: {type: 'number', default: 100, min: 10},
        unitSize: {type: 'number', default: 1, min: 0.1, max: 1000},
        far: {type: 'number', default: 4000},
        landYinColor: {type: 'color', default: '#528d04'},
        landYangColor: {type: 'color', default: '#278d53'},
        seaYinColor: {type: 'color', default: '#005e85'},
        seaYangColor: {type: 'color', default: '#2571cf'},
        log: {type: 'boolean', default: false}
    },
    init: function (data) {
        const perlin = new ImprovedNoise();
        const SEED = Math.random() * 100;
        const SQRT3HALF = Math.sqrt(3) / 2;

        const SIZE = Math.round(data.middleRadius / data.unitSize);
        const UNIT_SIZE = data.middleRadius / SIZE;

        const PLATEAU_RADIUS = data.plateauRadius < data.middleRadius-2*UNIT_SIZE ? data.plateauRadius : data.middleRadius-2*UNIT_SIZE;
        const PLATEAU_EDGE = PLATEAU_RADIUS + UNIT_SIZE;

        const INNER_RADIUS = (SIZE-1) * UNIT_SIZE + 0.0001;
        const OUTER_RADIUS = (SIZE+1) * UNIT_SIZE + 0.0001;
        const FAR = data.far > OUTER_RADIUS ? data.far : OUTER_RADIUS;
        const MASK_EDGE = INNER_RADIUS / 4;
        const SCAN_SIZE = Math.ceil(SIZE * 1.16);   // empirically determined

        const LAND_YIN_COLOR = new THREE.Color(data.landYinColor);
        const LAND_YANG_COLOR = new THREE.Color(data.landYangColor);
        const PLATEAU_YIN_COLOR = new THREE.Color(data.plateauYinColor ? data.plateauYinColor : data.landYinColor);
        const PLATEAU_YANG_COLOR = new THREE.Color(data.plateauYangColor ? data.plateauYangColor : data.landYangColor);
        const SEA_YIN_COLOR = new THREE.Color(data.seaYinColor);
        const SEA_YANG_COLOR = new THREE.Color(data.seaYangColor);
        let seaAverageColor = SEA_YIN_COLOR.clone();
        seaAverageColor.lerp(SEA_YANG_COLOR, 0.5);
        const BEACH_COLOR = new THREE.Color(0x71615b);   // brownish-gray beach
        const ROCK_COLOR = new THREE.Color(0x837E7C);   // granite

        if (data.log) {
            console.log("atoll-terrain", "PLATEAU_EDGE="+PLATEAU_EDGE, "plateauElevation="+data.plateauElevation,
                "SIZE="+SIZE, "SCAN_SIZE="+SCAN_SIZE, "UNIT_SIZE="+UNIT_SIZE,
                "middleRadius="+data.middleRadius, "FAR="+FAR);
        }

        let vertices = [];    // one element (THREE.Vector3) per vertex; temporary storage during generation
        let positions = [];   // three elements (x,y,z) per vertex

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
                        y = data.meanElevation;
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
                    vertices.push(new THREE.Vector3(x, y, z));
                    positions.push(x, y, z);
                }
            }
        }
        vertexLookup[SCAN_SIZE+1] = {};

        // vertex colors & behaviors, and faces
        let pitColor = new THREE.Color(0x404040);   // dark gray
        pitColor.lerp(LAND_YIN_COLOR, 0.75);
        const SCALE5 = UNIT_SIZE * 5, SCALE25 = UNIT_SIZE * 25;
        const SCALE3 = UNIT_SIZE * 3, SCALE12 = UNIT_SIZE * 12;

        let colors = [];   // three elements (r,g,b) per vertex

        const BEHAVIOR_STATIONARY = 0;
        const BEHAVIOR_WAVES = 10;
        let vertexBehavior = new Array(vertices.length);   // one element (behavior enum) per vertex

        let faceIndices = [];   // three elements (vertex indexes) per face

        for (let i= -SCAN_SIZE; i<=SCAN_SIZE; ++i) {
            for (let j = -SCAN_SIZE; j <= SCAN_SIZE; ++j) {
                let vertexAInd = vertexLookup[i][j];
                let vertexA = vertices[vertexAInd];
                if (vertexA) {
                    let r = Math.sqrt(vertexA.x*vertexA.x + vertexA.z*vertexA.z);
                    let vertexBInd = vertexLookup[i][j-1];
                    let vertexCInd = vertexLookup[i-1][j-1];
                    let vertexDInd = vertexLookup[i-1][j];
                    if (data.plateauRadius > 0 && r < PLATEAU_RADIUS && (data.plateauYinColor || data.plateauYangColor)) {
                        let mix = (1.73205 + perlin.noise((vertexA.x + data.middleRadius) / SCALE3, (vertexA.z + data.middleRadius) / SCALE3, SEED)
                            + perlin.noise((vertexA.x + data.middleRadius) / SCALE12, (vertexA.z + data.middleRadius) / SCALE12, SEED)) / 3.4641;
                        let color = PLATEAU_YIN_COLOR.clone();
                        color.lerp(PLATEAU_YANG_COLOR, mix);
                        colors.push(color.r, color.g, color.b);
                        vertexBehavior[vertexAInd] = vertexA.y > 0 ? BEHAVIOR_STATIONARY : BEHAVIOR_WAVES;
                    } else if (vertexA.y > 0) {   // above sea level
                        let neighbors = new Array(6);
                        neighbors[0] = vertices[vertexBInd];
                        neighbors[1] = vertices[vertexCInd];
                        neighbors[2] = vertices[vertexDInd];
                        neighbors[3] = vertices[vertexLookup[i][j + 1]];
                        neighbors[4] = vertices[vertexLookup[i + 1][j + 1]];
                        neighbors[5] = vertices[vertexLookup[i + 1][j]];
                        let nearby = new Array(12);
                        nearby[ 0] = vertices[vertexLookup[i  ][j-2]];
                        nearby[ 1] = vertices[vertexLookup[i-1][j-2]];
                        nearby[ 2] = vertices[vertexLookup[i-2][j-2]];
                        nearby[ 3] = vertices[vertexLookup[i-2][j-1]];
                        nearby[ 4] = vertices[vertexLookup[i-2][j  ]];
                        nearby[ 5] = vertices[vertexLookup[i-1][j+1]];
                        nearby[ 6] = vertices[vertexLookup[i  ][j+2]];
                        nearby[ 7] = vertices[vertexLookup[i+1][j+2]];
                        nearby[ 8] = vertices[vertexLookup[i+2][j+2]];
                        nearby[ 9] = vertices[vertexLookup[i+2][j+1]];
                        nearby[10] = vertices[vertexLookup[i+2][j  ]];
                        nearby[11] = vertices[vertexLookup[i+1][j-1]];
                        let convolution = vertexA.y * 7;   // 1 extra to skew toward higher elevations
                        for (let p=0; p<6; ++p) {
                            convolution += neighbors[p].y * 3;
                        }
                        for (let p=0; p<12; ++p) {
                            convolution += nearby[p].y * -2;
                        }
                        if (convolution > 70) {   // local peak and/or high elevation
                            colors.push(ROCK_COLOR.r, ROCK_COLOR.g, ROCK_COLOR.b);
                        } else {
                            let mix = (1.73205 + perlin.noise((vertexA.x + data.middleRadius) / SCALE5, (vertexA.z + data.middleRadius) / SCALE5, SEED)
                                + perlin.noise((vertexA.x + data.middleRadius) / SCALE25, (vertexA.z + data.middleRadius) / SCALE25, SEED)) / 3.4641;
                            let color = LAND_YIN_COLOR.clone();
                            color.lerp(LAND_YANG_COLOR, mix);
                            colors.push(color.r, color.g, color.b);
                        }
                        vertexBehavior[vertexAInd] = BEHAVIOR_STATIONARY;
                    } else {   // sea level
                        if (r > INNER_RADIUS) {
                            colors.push(seaAverageColor.r, seaAverageColor.g, seaAverageColor.b);
                            vertexBehavior[vertexAInd] = BEHAVIOR_WAVES;
                        } else {
                            let neighbors = [];
                            neighbors[0] = vertices[vertexBInd];
                            neighbors[1] = vertices[vertexCInd];
                            neighbors[2] = vertices[vertexDInd];
                            neighbors[3] = vertices[vertexLookup[i][j + 1]];
                            neighbors[4] = vertices[vertexLookup[i + 1][j + 1]];
                            neighbors[5] = vertices[vertexLookup[i + 1][j]];
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
                                let mix = (1.73205 + perlin.noise((vertexA.x+FAR) / SCALE3, (vertexA.z+FAR) / SCALE3, SEED)
                                    + perlin.noise((vertexA.x+FAR) / SCALE12, (vertexA.z+FAR) / SCALE12, SEED)) / 3.4641;
                                let color = SEA_YIN_COLOR.clone();
                                color.lerp(SEA_YANG_COLOR, mix);
                                colors.push(color.r, color.g, color.b);
                                vertexBehavior[vertexAInd] = BEHAVIOR_WAVES;
                            } else if (sea === 0) {   // pit completely surrounded by land
                                colors.push(pitColor.r, pitColor.g, pitColor.b);
                                vertexBehavior[vertexAInd] = BEHAVIOR_STATIONARY;
                            } else {
                                let color = BEACH_COLOR.clone();
                                color.lerp(LAND_YIN_COLOR, land / (land+sea));
                                colors.push(color.r, color.g, color.b);
                                vertexBehavior[vertexAInd] = BEHAVIOR_STATIONARY;
                            }
                        }
                    }
                    if (typeof vertexBInd !== 'undefined' && typeof vertexCInd !== 'undefined') {
                        faceIndices.push(vertexAInd, vertexBInd, vertexCInd);
                    }
                    if (typeof vertexCInd !== 'undefined' && typeof vertexDInd !== 'undefined') {
                        faceIndices.push(vertexAInd, vertexCInd, vertexDInd);
                    }
                }
            }
        }


        // console.log("positions.length="+positions.length,
        //     "colors.length="+colors.length, "behavior.length="+behavior.length);

        let bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.setIndex(faceIndices);
        bufferGeometry.addAttribute('position', new THREE.Float32BufferAttribute( positions, 3 ) );
        bufferGeometry.computeVertexNormals();
        // geometry.computeBoundingBox();
        bufferGeometry.addAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ) );
        bufferGeometry.addAttribute('behavior', new THREE.Float32BufferAttribute(vertexBehavior,  1));
        this.geometry = bufferGeometry;

        data.getElevation = (x,z) => {
            const i = x / SQRT3HALF / UNIT_SIZE;
            const j = (z + (x/SQRT3HALF/2)) / UNIT_SIZE;
            const nearVertices = [];
            let index;
            if (vertexLookup[Math.floor(i)] && (index = vertexLookup[Math.floor(i)][Math.floor(j)])) {
                nearVertices.push(vertices[index]);
            }
            if (vertexLookup[Math.floor(i)] && (index = vertexLookup[Math.floor(i)][Math.ceil(j)])) {
                nearVertices.push(vertices[index]);
            }
            if (vertexLookup[Math.ceil(i)] && (index = vertexLookup[Math.ceil(i)][Math.floor(j)])) {
                nearVertices.push(vertices[index]);
            }
            if (vertexLookup[Math.ceil(i)] && (index = vertexLookup[Math.ceil(i)][Math.ceil(j)])) {
                nearVertices.push(vertices[index]);
            }

            let elevSum = 0;
            let scoreSum = 0;
            nearVertices.forEach( vert => {
                let score = 1 - (Math.sqrt(Math.pow(x-vert.x, 2) + Math.pow(z-vert.z, 2)) / UNIT_SIZE);
                if (score < 0) {score = 0}
                elevSum += vert.y * score;
                scoreSum += score;
            });
            // if (nearVertices.length < 4) {
            //     console.log("scoreSum:", scoreSum.toFixed(2), "   ", nearVertices.map(v => v.x.toFixed(2) + "," + v.z.toFixed(2) + " " + v.y.toFixed(2)));
            // }
            if (scoreSum > 0) {   // at least one vertex was near
                return elevSum / scoreSum;
            } else {   // outside all usable vertices, the elevation is 0
                return 0;
            }
        }
    }
});
