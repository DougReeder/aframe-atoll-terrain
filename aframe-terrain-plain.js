// aframe-terrain-plain.js - An A-Frame WebVR primitive with high-resolution terrain surrounded by a low-res plain
// Copyright © 2019 P. Douglas Reeder under the MIT License


AFRAME.registerGeometry('terrain-plain', {
    schema: {
        unitSize: {type: 'number', default: 1, min: 0.1, max: 1000},
        size: {type: 'number', default: 10, min: 1},
        far: {type: 'number', default: 4000},
        log: {type: 'boolean', default: false}
    },
    init: function (data) {
        const SQRT3HALF = Math.sqrt(3) / 2;
        const INNER_RADIUS = data.size * data.unitSize + 0.0001;
        const OUTER_RADIUS = (data.size+1) * data.unitSize + 0.0001;
        const FAR = data.far > OUTER_RADIUS ? data.far : OUTER_RADIUS;
        const SCAN_SIZE = Math.ceil(data.size * 1.16);   // empirically determined
        if (data.log) {
            console.log("terrain-plain unitSize="+data.unitSize, "size="+data.size, "SCAN_SIZE="+SCAN_SIZE,
                "FAR="+FAR);
        }

        let geometry = new THREE.Geometry();

        let vertexLookup = {};
        vertexLookup[-SCAN_SIZE-1] = {};
        let vertexInd = 0;
        for (let i= -SCAN_SIZE; i<=SCAN_SIZE; ++i) {
            vertexLookup[i] = {};
            for (let j= -SCAN_SIZE; j<=SCAN_SIZE; ++j) {
                let x = i * SQRT3HALF * data.unitSize;
                let z = (j - i/2) * data.unitSize;
                let r = Math.sqrt(x*x + z*z);
                if (r <= OUTER_RADIUS) {
                    let y;
                    if (r <= INNER_RADIUS) {
                        y = 2 * Math.sin(x/3) * Math.sin(z/4);
                    } else {
                        x *= FAR / r;
                        z *= FAR / r;
                        y = 0;
                    }
                    // if (data.log) {console.log("i=" + i, "j=" + j, "x=" + x, "z=" + z, "y=" + y)}

                    vertexLookup[i][j] = vertexInd++;
                    geometry.vertices.push(new THREE.Vector3(x, y, z));

                    let vertexA = vertexInd - 1;
                    let vertexB = vertexLookup[i][j-1];
                    let vertexC = vertexLookup[i-1][j-1];
                    let vertexD = vertexLookup[i-1][j];
                    if (typeof vertexB !== 'undefined' && typeof vertexC !== 'undefined') {
                        geometry.faces.push(new THREE.Face3(vertexA, vertexB, vertexC));
                    }
                    if (typeof vertexC !== 'undefined' && typeof vertexD !== 'undefined') {
                        geometry.faces.push(new THREE.Face3(vertexA, vertexC, vertexD));
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
            unitSize: 1,
            size: 1,
            log: false
        },
        material: {
            shader: 'standard',
            side: 'front'
        }
    },

    mappings: {
        'unit-size': 'geometry.unitSize',
        'size': 'geometry.size',
        'far': 'geometry.far',
        'log': 'geometry.log',
        'color': 'material.color',
        'metalness': 'material.metalness',
        'roughness': 'material.roughness',
        'src': 'material.src',
        'flat-shading': 'material.flatShading'
    }
});
