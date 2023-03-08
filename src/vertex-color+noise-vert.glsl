// vertex-color+noise-vert.glsl - vertex shader
// Copyright © 2019,2023 P. Douglas Reeder under the MIT License

uniform vec3 sunNormal;
uniform vec3 wavesOffset;

#ifndef USE_COLOR
attribute vec3 color;
#endif
attribute float behavior;

varying vec3 interpColor;
varying vec3 noisePosition;
varying float sunFactor;

void main() {
    interpColor = color;

    const vec3 zero = vec3(0.0, 0.0, 0.0);
    noisePosition = position + ((behavior > 0.0) ? wavesOffset : zero);

    sunFactor = 0.5 + max(dot(normal, sunNormal), 0.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
