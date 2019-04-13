// aframe-terrain-plain - An A-Frame WebVR primitive with high-resolution terrain surrounded by a low-res plain
// Copyright © 2019 P. Douglas Reeder under the MIT License
// Written using Perlin noise & ideas from aframe-mountain-component by Kevin Ngo.

import GeometryTerrainPlain from './geometry-terrain-plain';



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
        'sea-yin-color': 'geometry.seaYinColor',
        'sea-yang-color': 'geometry.seaYangColor',
        'metalness': 'material.metalness',
        'roughness': 'material.roughness',
        'src': 'material.src',
        'flat-shading': 'material.flatShading'
    }
});
