aframe-atoll-terrain
====================

An [A-Frame](https://aframe.io) [WebVR](https://webvr.info/) primitive that has a circle of high-resolution terrain near the origin, 
surrounded by a low-resolution sea or plain that stretches to the horizon.
Uses equilateral triangles for efficiency.


[live example scene](https://dougreeder.github.io/aframe-atoll-terrain/example.html)

Written using Perlin noise &amp; ideas from [aframe-mountain-component](https://www.npmjs.com/package/aframe-mountain-component) 
by Kevin Ngo.


Parameters 
---
Typically, you'll leave the entity position and rotation as zero, but you don't have to.


### middle-radius
default: 100

Radius of the high-resolution area, in meters.


### unit-size
default: 1

Distance between vertexes in the high-resolution area, in meters.

Will be adjusted to be a simple fraction of middle-radius, if necessary.


### far
default: 4000
minimum: middle-radius + unit-size

Radius of the low-resolution plain, in meters. 
Thus, it's also the distance to the effective horizon. 
Should be about 80% of the radius of your sky sphere.


### land-yin-color, land-yang-color
defaults: #528d04, #278d53

The color of the land smoothly varies between these two extremes.
Typically, you'll want them to vary mostly by hue and saturation, rather than intensity.


### sea-yin-color, sea-yang-color
defaults:

The color of the sea smoothly varies between these two extremes.


### sun-position

The direction from which the sun is shining.
This primitive ignores directional lights, but others may use them.
If you're using one of the *-sun-sky primitives, set its sun-position to the same value.


### log
default: false

Whether to write diagnostic data to the console. 
