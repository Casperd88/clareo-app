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
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_dark;

      vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x / 289.0) * 289.0; }
      vec3 permute(vec3 x) { return mod289((x * 34.0 + 1.0) * x); }

      // sRGB <-> OKLab. Blending in OKLab keeps mixes hue-true and
      // avoids the desaturated grey midpoints you get from RGB mix().
      vec3 rgb2oklab(vec3 c) {
        float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
        float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
        float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
        l = pow(max(l, 0.0), 1.0 / 3.0);
        m = pow(max(m, 0.0), 1.0 / 3.0);
        s = pow(max(s, 0.0), 1.0 / 3.0);
        return vec3(
          0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
          1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
          0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
        );
      }

      vec3 oklab2rgb(vec3 c) {
        float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
        float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
        float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
        float l = l_ * l_ * l_;
        float m = m_ * m_ * m_;
        float s = s_ * s_ * s_;
        return vec3(
           4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
          -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
          -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
        );
      }

      vec3 mixOk(vec3 a, vec3 b, float t) {
        return oklab2rgb(mix(rgb2oklab(a), rgb2oklab(b), clamp(t, 0.0, 1.0)));
      }

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

        // Airiness scales with aspect ratio. Blob radii are in normalised
        // UV units, so a fixed 0.45 radius eats half a phone screen but
        // floats nicely on a wide monitor. Shrink + dim them on narrow
        // viewports to give the same breathing room everywhere.
        float airy = smoothstep(0.55, 1.4, aspect);
        float blobScale = mix(0.55, 1.0, airy);

        float b1 = blob(pn, c1, 0.45 * blobScale, t, 0.0);
        float b2 = blob(pn, c2, 0.42 * blobScale, t, 10.0);
        float b3 = blob(pn, c3, 0.50 * blobScale, t, 20.0);
        float b4 = blob(pn, c4, 0.38 * blobScale, t, 30.0);
        float b5 = blob(pn, c5, 0.35 * blobScale, t, 40.0);

        // Palette is intentionally analogous-leaning: pink -> magenta -> purple
        // -> indigo, with a peach and a mint as accents. There are no exact
        // complementary pairs, so even a 50/50 mix can't land on grey.
        vec3 col1 = vec3(1.00, 0.30, 0.55);  // pink
        vec3 col2 = vec3(0.45, 0.45, 1.00);  // indigo
        vec3 col3 = vec3(0.72, 0.30, 0.98);  // violet
        vec3 col4 = vec3(0.40, 0.85, 0.70);  // mint
        vec3 col5 = vec3(1.00, 0.70, 0.40);  // peach

        vec3 bgLight = vec3(0.96, 0.96, 0.965);
        vec3 bgDark  = vec3(0.102, 0.114, 0.141);
        vec3 bg = mix(bgLight, bgDark, u_dark);

        float intensityLight = 0.50;
        float intensityDark  = 0.22;
        float intensity = mix(intensityLight, intensityDark, u_dark);
        // On narrow viewports the same intensity reads as overwhelming
        // because there's no surrounding empty space to balance it.
        intensity *= mix(0.7, 1.0, airy);

        // Per-blob raw weights. Sharpening with pow() biases overlap zones
        // toward the dominant blob instead of a flat 50/50 average, which
        // is what was producing grey midpoints.
        float w1 = b1 * 1.00;
        float w2 = b2 * 0.95;
        float w3 = b3 * 0.90;
        float w4 = b4 * 0.85;
        float w5 = b5 * 0.80;

        float sharp = mix(1.8, 1.3, u_dark);
        w1 = pow(w1, sharp);
        w2 = pow(w2, sharp);
        w3 = pow(w3, sharp);
        w4 = pow(w4, sharp);
        w5 = pow(w5, sharp);

        float blobSum = w1 + w2 + w3 + w4 + w5;
        float coverage = 1.0 - exp(-blobSum * intensity * 2.5);

        // Convert palette + bg to OKLab once.
        vec3 lab1 = rgb2oklab(col1);
        vec3 lab2 = rgb2oklab(col2);
        vec3 lab3 = rgb2oklab(col3);
        vec3 lab4 = rgb2oklab(col4);
        vec3 lab5 = rgb2oklab(col5);
        vec3 labBg = rgb2oklab(bg);

        float invSum = 1.0 / max(blobSum, 1e-4);

        // Weighted-average lightness: smooth and well-behaved.
        float L = (w1 * lab1.x + w2 * lab2.x + w3 * lab3.x + w4 * lab4.x + w5 * lab5.x) * invSum;

        // Weighted-average chroma direction (a, b in OKLab).
        vec2 ab = (w1 * lab1.yz + w2 * lab2.yz + w3 * lab3.yz + w4 * lab4.yz + w5 * lab5.yz) * invSum;

        // Chroma rescue: when contributors point in opposing hue directions
        // their (a, b) vectors partially cancel, shrinking |chroma| toward 0
        // (= grey). Compute the strongest contributor's chroma magnitude and
        // blend the averaged ab toward that magnitude while keeping its
        // direction. This is the key fix for muddy overlaps.
        float cm1 = length(lab1.yz);
        float cm2 = length(lab2.yz);
        float cm3 = length(lab3.yz);
        float cm4 = length(lab4.yz);
        float cm5 = length(lab5.yz);
        float cMax = max(max(max(max(w1 * cm1, w2 * cm2), w3 * cm3), w4 * cm4), w5 * cm5) * invSum;
        float cAvg = length(ab);

        // Coherence: how aligned the contributing hues are. 1.0 = all hues
        // pointing the same way (safe to rescue), 0.0 = hues fully cancelling
        // (residual direction is numerical noise — rescuing it produces
        // bright "seam" artifacts at blob boundaries, so we back off).
        float coherence = cAvg / max(cMax, 1e-4);
        float rescue = mix(0.85, 0.55, u_dark) * smoothstep(0.15, 0.55, coherence);

        // Cap the rescue ratio so a tiny cAvg can never blow up into a
        // saturated outlier hue.
        float ratio = min(cMax / max(cAvg, 1e-4), 2.0);
        ab *= mix(1.0, ratio, rescue);

        vec3 lab = vec3(L, ab.x, ab.y);

        // Compose blob result over the background using OKLab interpolation,
        // weighted by overall coverage (so empty areas stay bg, dense areas
        // are nearly pure blob colour).
        vec3 labOut = mix(labBg, lab, coverage);

        // Subtle global breathing so it still feels alive.
        labOut.yz *= 1.0 + 0.04 * sin(u_time * 0.25);

        vec3 color = oklab2rgb(labOut);
        gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
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
