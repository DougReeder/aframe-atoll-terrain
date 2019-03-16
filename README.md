aframe-terrain-plain
====================

An [A-Frame](https://aframe.io) [WebVR](https://webvr.info/) primitive that has a circle of high-resolution terrain near the origin, 
surrounded by a low-resolution plain that stretches to the horizon.
Uses equilateral triangles for efficiency.


[live example scene](https://dougreeder.github.io/aframe-terrain-plain/example.html)

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


### log
default: false

Whether to write debugging data to the console. 
