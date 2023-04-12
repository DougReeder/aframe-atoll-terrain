// aframe-atoll-terrain - An A-Frame WebVR primitive with high-resolution terrain surrounded by a low-res sea or plain
// Copyright © 2019 P. Douglas Reeder under the MIT License
// Uses equilateral triangles in the high-res area & colors vertexes with sea color at elevation 0

import GeometryAtollTerrain from './geometry-atoll-terrain';

import MaterialVertexColorPlusNoise from './vertex-color+noise'

AFRAME.registerPrimitive('a-atoll-terrain', {
    defaultComponents: {
        geometry: {
            primitive: 'atoll-terrain',
            middleRadius: 100,
            unitSize: 1,
            log: false
        },
        material: {
            shader: 'vertex-color+noise',
            vertexColors: 'vertex'
        }
    },

    mappings: {
        'mean-elevation': 'geometry.meanElevation',
        'plateau-radius': 'geometry.plateauRadius',
        'plateau-elevation-min': 'geometry.plateauElevationMin',
        'plateau-yin-color': 'geometry.plateauYinColor',
        'plateau-yang-color': 'geometry.plateauYangColor',
        'middle-radius': 'geometry.middleRadius',
        'unit-size': 'geometry.unitSize',
        'far': 'geometry.far',
        'seed': 'geometry.seed',
        'log': 'geometry.log',
        'shader': 'material.shader',
        'land-yin-color': 'geometry.landYinColor',
        'land-yang-color': 'geometry.landYangColor',
        'sea-yin-color': 'geometry.seaYinColor',
        'sea-yang-color': 'geometry.seaYangColor',
        'sun-position': 'material.sunPosition',
        'src': 'material.src',
        'flat-shading': 'material.flatShading'
    }
});
