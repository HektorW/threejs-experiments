uniform sampler2D heightTexture;
uniform float heightValue;

varying vec2 vUv;

/* vec4 grayscale(vec4 color) {
  float val = (color.r + color.g + color.b) / 3.0;
  return vec4(val, val, val, color.a);
}


vec4 luminosity(vec4 color) {
  float v = (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 3.0;
  return vec4(v, v, v, color.a);
} */

void main() {
  vUv = uv;

  vec4 color = luminosity(texture2D(heightTexture, uv));
  vec3 pos = position;
  float value = color.r;

  pos.z = value * heightValue;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}