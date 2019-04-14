// vertex-color+noise-vert.glsl - vertex shader
// Copyright © 2019 P. Douglas Reeder under the MIT License

uniform vec3 sunNormal;

varying vec3 interpColor;
varying vec3 interpPosition;
varying float sunFactor;

void main() {
    interpColor = color;
    interpPosition = position;

    sunFactor = 0.5 + max(dot(normal, sunNormal), 0.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
