export const vertexShader = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const fragmentShader = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;

vec3 mod289v(vec3 x) { return x - floor(x / 289.0) * 289.0; }
vec2 mod289f(vec2 x) { return x - floor(x / 289.0) * 289.0; }
vec3 permute(vec3 x) { return mod289v((x * 34.0 + 1.0) * x); }

float snoise(vec2 v) {
    vec4 C = vec4(0.211324865405187, 0.366025403784439,
                  -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289f(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float blob(vec2 uv, vec2 center, float radius, float t, float seed) {
    vec2 d = uv - center;
    float angle = atan(d.y, d.x);
    float deform = 1.0
        + 0.18 * sin(angle * 3.0 + t * 1.2 + seed)
        + 0.12 * sin(angle * 5.0 - t * 0.9 + seed * 2.0)
        + 0.09 * sin(angle * 7.0 + t * 1.5 + seed * 3.0);
    float dist = length(d) / (radius * deform);
    return smoothstep(1.0, 0.0, dist);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = u_time * 0.5;

    float n1 = snoise(p * 1.5 + t * 0.15) * 0.035;
    float n2 = snoise(p * 2.5 - t * 0.1) * 0.02;
    vec2 pn = p + n1 + n2;

    vec2 c1 = vec2(aspect * (0.3 + 0.25 * sin(t * 0.7 + 1.0) + 0.08 * cos(t * 1.3)), 0.72 + 0.2 * cos(t * 0.5) + 0.06 * sin(t * 1.2));
    vec2 c2 = vec2(aspect * (0.7 + 0.2 * cos(t * 0.6) + 0.09 * sin(t * 1.4)), 0.28 + 0.22 * sin(t * 0.9 + 2.0) + 0.07 * cos(t * 1.1));
    vec2 c3 = vec2(aspect * (0.5 + 0.22 * sin(t * 0.5 + 3.0) + 0.1 * cos(t * 1.2 + 1.0)), 0.5 + 0.18 * cos(t * 0.8 + 1.0) + 0.08 * sin(t * 1.3));

    float r1 = 0.5 + 0.08 * sin(t * 0.7);
    float r2 = 0.46 + 0.09 * cos(t * 0.9 + 1.0);
    float r3 = 0.52 + 0.1 * sin(t * 0.6 + 2.0);

    float b1 = blob(pn, c1, r1, t, 0.0);
    float b2 = blob(pn, c2, r2, t, 12.0);
    float b3 = blob(pn, c3, r3, t, 24.0);

    vec3 bg = vec3(0.94, 0.94, 0.95);
    vec3 color = bg;
    color = mix(color, u_c1, b1 * 0.58);
    color = mix(color, u_c2, b2 * 0.52);
    color = mix(color, u_c3, b3 * 0.48);

    color = mix(bg, color, 0.9 + 0.08 * sin(u_time * 0.3));

    gl_FragColor = vec4(color, 1.0);
}
`;
