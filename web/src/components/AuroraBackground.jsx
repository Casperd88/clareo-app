import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import styles from './AuroraBackground.module.css';

export default function AuroraBackground() {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    const vsSource = `
      attribute vec2 a_position;
      void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_dark;

      vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x / 289.0) * 289.0; }
      vec3 permute(vec3 x) { return mod289((x * 34.0 + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
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
          + 0.15 * sin(angle * 3.0 + t * 0.8 + seed)
          + 0.1 * sin(angle * 5.0 - t * 0.6 + seed * 2.0)
          + 0.08 * sin(angle * 7.0 + t * 1.1 + seed * 3.0);
        float dist = length(d) / (radius * deform);
        return smoothstep(1.0, 0.0, dist);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = vec2(uv.x * aspect, uv.y);
        float t = u_time * 0.5;

        float n = snoise(p * 1.0 + t * 0.15) * 0.03;
        vec2 pn = p + n;

        vec2 c1 = vec2(aspect * (0.2 + 0.25 * sin(t * 0.7 + 1.0)), 0.8 + 0.2 * cos(t * 0.5));
        vec2 c2 = vec2(aspect * (0.8 + 0.2 * cos(t * 0.6)), 0.2 + 0.25 * sin(t * 0.8 + 2.0));
        vec2 c3 = vec2(aspect * (0.5 + 0.3 * sin(t * 0.5 + 3.0)), 0.5 + 0.2 * cos(t * 0.7 + 1.0));
        vec2 c4 = vec2(aspect * (0.25 + 0.2 * cos(t * 0.9 + 4.0)), 0.35 + 0.25 * sin(t * 0.6 + 2.0));
        vec2 c5 = vec2(aspect * (0.75 + 0.15 * sin(t * 0.8 + 5.0)), 0.65 + 0.15 * cos(t * 0.5 + 3.0));

        float b1 = blob(pn, c1, 0.45, t, 0.0);
        float b2 = blob(pn, c2, 0.42, t, 10.0);
        float b3 = blob(pn, c3, 0.5, t, 20.0);
        float b4 = blob(pn, c4, 0.38, t, 30.0);
        float b5 = blob(pn, c5, 0.35, t, 40.0);

        vec3 col1 = vec3(1.0, 0.18, 0.42);
        vec3 col2 = vec3(0.0, 0.48, 1.0);
        vec3 col3 = vec3(0.6, 0.1, 0.98);
        vec3 col4 = vec3(0.0, 0.82, 0.65);
        vec3 col5 = vec3(1.0, 0.58, 0.0);

        vec3 bgLight = vec3(0.96, 0.96, 0.965);
        vec3 bgDark = vec3(0.102, 0.114, 0.141);
        vec3 bg = mix(bgLight, bgDark, u_dark);
        
        float intensityLight = 0.45;
        float intensityDark = 0.25;
        float intensity = mix(intensityLight, intensityDark, u_dark);
        
        vec3 color = bg;
        color = mix(color, col1, b1 * intensity);
        color = mix(color, col2, b2 * intensity * 0.9);
        color = mix(color, col3, b3 * intensity * 0.85);
        color = mix(color, col4, b4 * intensity * 0.8);
        color = mix(color, col5, b5 * intensity * 0.75);

        float blendFactor = mix(0.85, 0.7, u_dark) + 0.15 * sin(u_time * 0.25);
        color = mix(bg, color, blendFactor);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uDark = gl.getUniformLocation(prog, 'u_dark');

    resize();
    window.addEventListener('resize', resize);

    let animationId;
    let currentDark = isDarkRef.current ? 1.0 : 0.0;
    
    function frame(ts) {
      const targetDark = isDarkRef.current ? 1.0 : 0.0;
      currentDark += (targetDark - currentDark) * 0.05;
      
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, ts * 0.001);
      gl.uniform1f(uDark, currentDark);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(frame);
    }
    animationId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} />
    </div>
  );
}
