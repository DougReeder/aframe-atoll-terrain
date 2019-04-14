
varying vec3 interpColor;
varying vec3 interpPosition;
varying float sunFactor;

void main() {

    vec3 inherentColor = interpColor;

    gl_FragColor = vec4(inherentColor * sunFactor, 1.0);
}
