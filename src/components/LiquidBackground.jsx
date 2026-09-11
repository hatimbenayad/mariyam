import { useEffect, useRef } from 'react';

// --- Vertex Shader ---
const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  varying highp vec2 vTextureCoord;
  void main(void) {
    gl_Position = aVertexPosition;
    vTextureCoord = aTextureCoord;
  }
`;

// --- Fragment Shader ---
const fsSource = `
  precision mediump float;
  varying highp vec2 vTextureCoord;
  
  uniform sampler2D uSampler;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uHoverState;
  
  // Basic random function
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  // Value noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  // Fractal Brownian Motion
  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 4; ++i) {
      v += a * noise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main(void) {
    // Normalize coordinates based on resolution to maintain aspect ratio
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 imgUv = vec2(uv.x, 1.0 - uv.y); // Flip Y for image sampling
    
    vec2 mouseUv = uMouse / uResolution.xy;
    mouseUv.y = 1.0 - mouseUv.y;
    
    float dist = distance(uv * aspect, mouseUv * aspect);
    
    // Generate organic noise pattern moving over time
    float n = fbm(uv * 4.0 + uTime * 0.4);
    
    // Expanding radius based on hover state (max radius 0.4 * screen height)
    float baseRadius = uHoverState * 0.4;
    
    // The edge of the liquid mask is the distance minus some noise distortion
    float edge = dist - (n * 0.2);
    
    // Smoothstep creates the soft, anti-aliased, fiery edge
    float alpha = smoothstep(baseRadius + 0.08, baseRadius, edge);
    
    // Optional: refract the UV coordinates within the liquid slightly based on noise
    vec2 refractedUv = imgUv + (n * 0.03 * alpha);
    
    vec4 texColor = texture2D(uSampler, refractedUv);
    
    // Output: mix image color with calculated alpha mask
    gl_FragColor = vec4(texColor.rgb, texColor.a * alpha);
  }
`;

export default function LiquidBackground({ imageUrl, className }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Do not initialize WebGL if user prefers reduced motion

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    
    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    let animationFrameId;
    let targetHover = 0;
    let currentHover = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    const startTime = Date.now();

    // 1. Compile Shaders
    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);

    // 2. Create Program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(shaderProgram));
      return;
    }

    gl.useProgram(shaderProgram);

    // 3. Set up geometry (a full-screen quad)
    const positions = new Float32Array([
      -1.0,  1.0,
       1.0,  1.0,
      -1.0, -1.0,
       1.0, -1.0,
    ]);
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPosition);
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

    // 4. Set up texture UVs
    const texCoords = new Float32Array([
       0.0,  0.0,
       1.0,  0.0,
       0.0,  1.0,
       1.0,  1.0,
    ]);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const textureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
    gl.enableVertexAttribArray(textureCoord);
    gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);

    // 5. Load Texture
    const texture = gl.createTexture();
    const image = new Image();
    // Allow cross-origin if needed, but local is fine
    image.src = imageUrl;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Flip Y is handled in shader
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      
      // Setup wrapping and filtering
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    // 6. Setup Uniforms
    const uResolution = gl.getUniformLocation(shaderProgram, 'uResolution');
    const uMouse = gl.getUniformLocation(shaderProgram, 'uMouse');
    const uTime = gl.getUniformLocation(shaderProgram, 'uTime');
    const uHoverState = gl.getUniformLocation(shaderProgram, 'uHoverState');
    const uSampler = gl.getUniformLocation(shaderProgram, 'uSampler');

    // 7. Resize Handler
    function resize() {
      // The section height might be taller than viewport
      const parent = canvas.parentElement;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      
      // Match canvas internal resolution to display size
      canvas.width = width;
      canvas.height = height;
      
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uResolution, width, height);
    }
    
    // Initial size
    resize();
    window.addEventListener('resize', resize);

    // 8. Event Listeners for the parent section
    const parent = canvas.parentElement;
    
    const onMouseMove = (e) => {
      const rect = parent.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    
    const onMouseEnter = () => {
      targetHover = 1.0;
    };
    
    const onMouseLeave = () => {
      targetHover = 0.0;
    };

    parent.addEventListener('mousemove', onMouseMove);
    parent.addEventListener('mouseenter', onMouseEnter);
    parent.addEventListener('mouseleave', onMouseLeave);

    // 9. Render Loop
    function render() {
      const time = (Date.now() - startTime) / 1000.0;
      
      // Smoothly interpolate hover state
      currentHover += (targetHover - currentHover) * 0.05;
      
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uSampler, 0);

      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uHoverState, currentHover);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    // 10. Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      parent.removeEventListener('mousemove', onMouseMove);
      parent.removeEventListener('mouseenter', onMouseEnter);
      parent.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
      
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texCoordBuffer);
      gl.deleteTexture(texture);
      gl.deleteProgram(shaderProgram);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [imageUrl]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
