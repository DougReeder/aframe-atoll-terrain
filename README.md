aframe-atoll-terrain
====================

An [A-Frame](https://aframe.io) [WebVR](https://webvr.info/) primitive that has a circle of high-resolution terrain near the origin,
surrounded by a low-resolution sea or plain that stretches to the horizon.
Optionally, the high-resolution area can include a central plateau or sea.

Uses a grid of equilateral triangles for efficiency.
Usable on mobile, with moderate detail.

Pairs well with [aframe-simple-sun-sky](https://www.npmjs.com/package/aframe-simple-sun-sky)
or [aframe-sun-sky](https://www.npmjs.com/package/aframe-sun-sky)

![sample screenshot](aframe-atoll-terrain-sample.png)

[live example scene](https://dougreeder.github.io/aframe-atoll-terrain/example.html)
Use VR controller joystick or touchpad to move around.  On desktop, drag to turn and use WASD keys to move.
Reload several times to see some variations, especially if you don't see water from your initial location.


Usage
---

Include using 
```html
<script src="https://unpkg.com/aframe-atoll-terrain@^1.0.0/dist/aframe-atoll-terrain.js"></script>
```


Declare it as a direct child of the scene (normally):
```html
<a-scene>
    <a-atoll-terrain plateau-radius="5" middle-radius="400" unit-size="4" far="4000"
                     land-yin-color="#528d04" land-yang-color="#278d53" sea-yin-color="#005e85" sea-yang-color="#2571cf"
                     sun-position="0.8 0.6 0">
    </a-atoll-terrain>
    <!-- ... -->
</a-scene>
```


Parameters 
---
Typically, you'll leave the entity position and rotation as zero, but you don't have to.


### plateau-radius
* default: 10
* minimum: 0
* maximum: middle-radius - 2*unit-size

Radius of the central plateau, in meters.
If radius is 0, there is no plateau.


### plateau-elevation
* minimum: 0
* default: 1

Elevation of the plateau.  If zero, forces there to be water in the center of the island.

If this is zero and `plateau-radius` is a large fraction of `middle-radius`, you'll have a ring-shaped island - an atoll!


### elevation-bias
* default: 0

When there is no plateau, this is the elevation of the high-resolution area before noise is applied, in meters.

When there is a plateau, the elevation of the high-resolution area is automatically adjusted so the plateau blends in.
Leave this at zero, unless you want a volcano or an isolated plateau.


### plateau-yin-color, plateau-yang-color
* default: land-yin-color, land-yang-color

Values close to land-yin-color and land-yang-color typically work best.


### middle-radius
* default: 100

Radius of the high-resolution area, in meters.


### unit-size
* default: 1

Distance between vertexes in the high-resolution area, in meters.

Will be adjusted to be a simple fraction of middle-radius, if necessary.


### far
* default: 4000
* minimum: middle-radius + unit-size

Radius of the low-resolution plain, in meters. 
Thus, it's also the distance to the effective horizon. 
Should be about 80% of the radius of your sky sphere.


### land-yin-color, land-yang-color
* defaults: #528d04, #278d53

The color of the land smoothly varies between these two extremes.
Typically, you'll want them to vary mostly by hue and saturation, rather than intensity.
Noise will cause brief excursions outside this range.


### sea-yin-color, sea-yang-color
* defaults: #528d04, #278d53

The color of the sea smoothly varies between these two extremes.


### sun-position
* default: {x:-1.0, y:1.0, z:-1.0}

The direction from which the sun is shining.
This primitive ignores directional lights.
If you're using one of the *-sun-sky primitives, set its sun-position to the same value.


### shader
* default: 'vertex-color+noise'

If you use a different shader, the colors and sun-position will probably be ignored.


### seed
* default: random

A number greater than zero and less than one, from which the terrain will be randomly generated.


### log
* default: false

Whether to write diagnostic data to the console. 


Extracting Elevation data
-------------------------

The geometry component has a `getElevation` method, which returns the approximate elevation of a point:

```javascript
const terrainGeometry = this.el.querySelector('a-atoll-terrain').getAttribute('geometry');
const spherePosition = document.querySelector('a-sphere').getAttribute('position');
spherePosition.y = terrainGeometry.getElevation(spherePosition.x, spherePosition.z) + 1.6;
```


Development
---
`npm install`

edit files

`npm run-script build`


Internals
---
The geometry component sets vertex colors, so you should probably use a material that uses them.
