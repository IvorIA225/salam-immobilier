/* ==========================================================================
   Salam Immobilier Bouaké · Act 3 WebGL Architectural Maquette
   Zero-dependency raw WebGL1 renderer driven by #maquette's --sc-p (0 -> 1).
   1. Plan state (p = 0.0 -> 0.25): top-down blueprint grid of Bouaké lotissement,
      Lot 14 highlighted in terracotta.
   2. Tilt + survey markers (p = 0.20 -> 0.50): camera pitches into isometric
      architectural view; 4 red-and-white corner bornes rise with boundary lines.
   3. Construction (p = 0.45 -> 0.78): foundation slab, ground floor walls,
      veranda columns, upper storey, parapet roof, and warm wood louvers rise.
   4. Dusk + interior lights (p = 0.72 -> 1.0): ambient light cools to evening,
      warm golden windows and veranda lights turn on, casting warm light on the
      red laterite earth.
   ========================================================================== */

(function () {
  'use strict';

  var sec = document.getElementById('maquette');
  if (!sec) return;
  var canvas = sec.querySelector('.peak__gl');
  var hOut = sec.querySelector('.peak__h');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'high-performance' })
        || canvas.getContext('experimental-webgl', { alpha: true, antialias: true });
  if (!gl) return; // Poster fallback stays visible if WebGL is unavailable

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function win(p, a, b) { return smooth((p - a) / Math.max(b - a, 0.0001)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ---- shaders ------------------------------------------------------------
  var vsSrc = [
    'attribute vec3 aPos;',
    'attribute vec3 aNorm;',
    'attribute vec4 aCol;',
    'uniform mat4 uProj;',
    'uniform mat4 uView;',
    'uniform vec3 uScale;',
    'uniform vec3 uOffset;',
    'varying vec3 vNorm;',
    'varying vec3 vWorld;',
    'varying vec4 vCol;',
    'void main() {',
    '  vec3 w = aPos * uScale + uOffset;',
    '  vWorld = w;',
    '  vNorm = aNorm;',
    '  vCol = aCol;',
    '  gl_Position = uProj * uView * vec4(w, 1.0);',
    '}'
  ].join('\n');

  var fsSrc = [
    'precision mediump float;',
    'varying vec3 vNorm;',
    'varying vec3 vWorld;',
    'varying vec4 vCol;',
    'uniform vec3 uSunDir;',
    'uniform float uDusk;',
    'uniform float uGlow;',
    'void main() {',
    '  vec3 n = normalize(vNorm);',
    '  float ndl = max(dot(n, normalize(uSunDir)), 0.0);',
    '  float up = n.y * 0.5 + 0.5;',
    '  vec3 daySky = mix(vec3(0.45, 0.42, 0.38), vec3(0.95, 0.88, 0.76), up);',
    '  vec3 nightSky = mix(vec3(0.08, 0.11, 0.13), vec3(0.18, 0.24, 0.28), up);',
    '  vec3 amb = mix(daySky * 0.62, nightSky * 0.72, uDusk);',
    '  vec3 sunCol = mix(vec3(1.0, 0.82, 0.58), vec3(0.85, 0.45, 0.25), uDusk) * (1.0 - uDusk * 0.68);',
    '  float porchDist = length(vWorld - vec3(0.2, 0.55, 1.15));',
    '  float porchLight = uGlow * (1.5 / (1.0 + porchDist * porchDist * 1.45));',
    '  vec3 warmGlow = vec3(1.0, 0.68, 0.30) * porchLight;',
    '  vec3 lit = vCol.rgb * (amb + sunCol * ndl * 0.78) + vCol.rgb * warmGlow * 0.85;',
    '  if (vCol.a < 0.0) {',
    '    lit = mix(vCol.rgb * 0.35, vCol.rgb * 1.35, uGlow);',
    '    gl_FragColor = vec4(lit, 1.0);',
    '    return;',
    '  }',
    '  gl_FragColor = vec4(lit, vCol.a);',
    '}'
  ].join('\n');

  var lineVsSrc = [
    'attribute vec3 aPos;',
    'attribute vec4 aCol;',
    'uniform mat4 uProj;',
    'uniform mat4 uView;',
    'varying vec4 vCol;',
    'void main() {',
    '  vCol = aCol;',
    '  gl_Position = uProj * uView * vec4(aPos, 1.0);',
    '}'
  ].join('\n');

  var lineFsSrc = [
    'precision mediump float;',
    'varying vec4 vCol;',
    'uniform float uAlpha;',
    'void main() {',
    '  gl_FragColor = vec4(vCol.rgb, vCol.a * uAlpha);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  function link(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    return p;
  }

  var prog = link(vsSrc, fsSrc);
  var loc = {
    aPos: gl.getAttribLocation(prog, 'aPos'),
    aNorm: gl.getAttribLocation(prog, 'aNorm'),
    aCol: gl.getAttribLocation(prog, 'aCol'),
    uProj: gl.getUniformLocation(prog, 'uProj'),
    uView: gl.getUniformLocation(prog, 'uView'),
    uScale: gl.getUniformLocation(prog, 'uScale'),
    uOffset: gl.getUniformLocation(prog, 'uOffset'),
    uSunDir: gl.getUniformLocation(prog, 'uSunDir'),
    uDusk: gl.getUniformLocation(prog, 'uDusk'),
    uGlow: gl.getUniformLocation(prog, 'uGlow')
  };

  var lProg = link(lineVsSrc, lineFsSrc);
  var lLoc = {
    aPos: gl.getAttribLocation(lProg, 'aPos'),
    aCol: gl.getAttribLocation(lProg, 'aCol'),
    uProj: gl.getUniformLocation(lProg, 'uProj'),
    uView: gl.getUniformLocation(lProg, 'uView'),
    uAlpha: gl.getUniformLocation(lProg, 'uAlpha')
  };

  // ---- geometry builders --------------------------------------------------
  // Each group holds boxes that grow in Y from their base (y from 0..1 inside local group)
  function makeGroup() { return { verts: [], count: 0, buf: null }; }

  // Box: x0..x1, y0..y1, z0..z1, color [r,g,b,a] (a < 0 means emissive window!)
  function pushBox(g, x0, y0, z0, x1, y1, z1, col) {
    var faces = [
      // +Y top
      [x0,y1,z1, x1,y1,z1, x1,y1,z0, x0,y1,z0,  0, 1, 0],
      // -Y bottom
      [x0,y0,z0, x1,y0,z0, x1,y0,z1, x0,y0,z1,  0,-1, 0],
      // +Z front
      [x0,y0,z1, x1,y0,z1, x1,y1,z1, x0,y1,z1,  0, 0, 1],
      // -Z back
      [x1,y0,z0, x0,y0,z0, x0,y1,z0, x1,y1,z0,  0, 0,-1],
      // +X right
      [x1,y0,z1, x1,y0,z0, x1,y1,z0, x1,y1,z1,  1, 0, 0],
      // -X left
      [x0,y0,z0, x0,y0,z1, x0,y1,z1, x0,y1,z0, -1, 0, 0]
    ];
    for (var f = 0; f < 6; f++) {
      var d = faces[f];
      var nx = d[12], ny = d[13], nz = d[14];
      var idx = [0, 1, 2, 0, 2, 3];
      for (var k = 0; k < 6; k++) {
        var vi = idx[k] * 3;
        g.verts.push(
          d[vi], d[vi+1], d[vi+2],
          nx, ny, nz,
          col[0], col[1], col[2], col[3]
        );
        g.count++;
      }
    }
  }

  // Helper to add horizontal louver slats and vertical mullion across a glowing window opening
  function pushLouvers(g, x0, y0, x1, y1, zFront, count, col) {
    var step = (y1 - y0) / (count + 1);
    for (var s = 1; s <= count; s++) {
      var sy = y0 + step * s;
      pushBox(g, x0, sy - 0.012, zFront, x1, sy + 0.012, zFront + 0.025, col);
    }
    var xMid = (x0 + x1) * 0.5;
    pushBox(g, xMid - 0.016, y0, zFront, xMid + 0.016, y1, zFront + 0.025, col);
  }

  function uploadGroup(g) {
    g.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, g.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.verts), gl.STATIC_DRAW);
    return g;
  }

  // Palette
  var C_SLAB     = [0.16, 0.20, 0.18, 1.0];
  var C_EARTH    = [0.68, 0.34, 0.20, 1.0];
  var C_LAWN     = [0.24, 0.38, 0.24, 1.0];
  var C_WALL     = [0.95, 0.92, 0.86, 1.0];
  var C_WALL_SH  = [0.87, 0.83, 0.76, 1.0];
  var C_CONCRETE = [0.76, 0.73, 0.68, 1.0];
  var C_WOOD     = [0.42, 0.25, 0.14, 1.0];
  var C_WHITE    = [0.96, 0.95, 0.92, 1.0];
  var C_RED      = [0.89, 0.35, 0.18, 1.0];
  var C_WIN_GLOW = [1.00, 0.76, 0.36, -1.0]; // negative alpha = emissive window

  // 1. Base table & Lot 14 earth pad
  var gBase = makeGroup();
  pushBox(gBase, -5.8, -0.22, -4.6,  5.8, -0.02, 4.6, C_SLAB);
  // Subtle neighbor plot pads
  var neighborPads = [
    [-5.0, -3.8, -2.2, -1.6], [2.2, -3.8, 5.0, -1.6],
    [-5.0, -0.9, -2.2,  1.6], [2.2, -0.9, 5.0,  1.6],
    [-5.0,  2.2, -2.2,  4.1], [-1.7, 2.2, 1.7,  4.1], [2.2, 2.2, 5.0, 4.1]
  ];
  for (var np = 0; np < neighborPads.length; np++) {
    var b = neighborPads[np];
    pushBox(gBase, b[0], -0.02, b[1], b[2], 0.01, b[3], [0.20, 0.25, 0.22, 1.0]);
  }
  uploadGroup(gBase);

  // Lot 14 laterite earth + lawn pad (rises slightly as lot is selected)
  var gPlot = makeGroup();
  pushBox(gPlot, -1.75, 0.0, -1.55, 1.75, 0.10, 1.55, C_EARTH);
  pushBox(gPlot, -0.35, 0.10, 0.65, 1.45, 0.125, 1.38, C_LAWN);
  // Stepping path
  pushBox(gPlot, -0.85, 0.10, 0.55, -0.42, 0.125, 1.48, C_CONCRETE);
  uploadGroup(gPlot);

  // 2. Corner survey markers (4 bornes at corners of Lot 14)
  var gBornes = makeGroup();
  var corners = [[-1.68, -1.48], [1.68, -1.48], [1.68, 1.48], [-1.68, 1.48]];
  for (var ci = 0; ci < 4; ci++) {
    var cx = corners[ci][0], cz = corners[ci][1];
    pushBox(gBornes, cx - 0.11, 0.0, cz - 0.11, cx + 0.11, 0.06, cz + 0.11, C_CONCRETE);
    pushBox(gBornes, cx - 0.07, 0.06, cz - 0.07, cx + 0.07, 0.25, cz + 0.07, C_WHITE);
    pushBox(gBornes, cx - 0.072, 0.25, cz - 0.072, cx + 0.072, 0.36, cz + 0.072, C_RED);
  }
  uploadGroup(gBornes);

  // 3. Foundation & low compound perimeter wall
  var gFound = makeGroup();
  // Main house plinth
  pushBox(gFound, -1.35, 0.0, -1.10, 1.35, 0.18, 0.72, C_CONCRETE);
  // Veranda steps
  pushBox(gFound, -0.92, 0.0, 0.72, -0.32, 0.10, 0.90, C_CONCRETE);
  // Low front & side boundary wall
  pushBox(gFound, -1.70, 0.0, -1.50, -1.62, 0.38, 1.50, C_WALL_SH);
  pushBox(gFound,  1.62, 0.0, -1.50,  1.70, 0.38, 1.50, C_WALL_SH);
  pushBox(gFound, -1.70, 0.0, -1.50,  1.70, 0.38, -1.42, C_WALL_SH);
  pushBox(gFound, -1.70, 0.0,  1.42, -1.00, 0.38,  1.50, C_WALL);
  pushBox(gFound, -0.25, 0.0,  1.42,  1.70, 0.38,  1.50, C_WALL);
  uploadGroup(gFound);

  // 4. Ground floor walls, veranda columns, doors & windows
  var gGround = makeGroup();
  // Left wing block (full depth)
  pushBox(gGround, -1.30, 0.0, -1.05, -0.35, 1.05, 0.55, C_WALL);
  // Right main block (set back behind veranda)
  pushBox(gGround, -0.35, 0.0, -1.05,  1.30, 1.05, 0.08, C_WALL);
  // Far right volume
  pushBox(gGround,  0.55, 0.0,  0.08,  1.30, 1.05, 0.55, C_WALL);
  // 3 veranda columns along z = 0.62
  var colsX = [-0.32, 0.46, 1.24];
  for (var k = 0; k < colsX.length; k++) {
    pushBox(gGround, colsX[k] - 0.05, 0.0, 0.56, colsX[k] + 0.05, 1.05, 0.66, C_WALL);
  }
  // Veranda slab beam
  pushBox(gGround, -0.38, 0.96, 0.05, 1.34, 1.12, 0.72, C_WALL);
  // Wood louver frames & glowing windows on ground floor
  pushBox(gGround, -1.08, 0.28, 0.54, -0.56, 0.76, 0.58, C_WOOD);
  pushBox(gGround, -1.02, 0.33, 0.55, -0.62, 0.71, 0.59, C_WIN_GLOW);
  pushLouvers(gGround, -1.02, 0.33, -0.62, 0.71, 0.585, 4, C_WOOD);
  // Entrance door & living room window under veranda
  pushBox(gGround, -0.24, 0.02, 0.07,  0.05, 0.82, 0.12, C_WOOD);
  pushBox(gGround, -0.20, 0.06, 0.08,  0.01, 0.78, 0.13, C_WIN_GLOW);
  pushBox(gGround,  0.14, 0.24, 0.07,  0.50, 0.78, 0.12, C_WOOD);
  pushBox(gGround,  0.18, 0.28, 0.08,  0.46, 0.74, 0.13, C_WIN_GLOW);
  pushLouvers(gGround, 0.18, 0.28, 0.46, 0.74, 0.125, 4, C_WOOD);
  // Right wing window
  pushBox(gGround,  0.72, 0.28, 0.54,  1.14, 0.76, 0.58, C_WOOD);
  pushBox(gGround,  0.76, 0.33, 0.55,  1.10, 0.71, 0.59, C_WIN_GLOW);
  pushLouvers(gGround, 0.76, 0.33, 1.10, 0.71, 0.585, 4, C_WOOD);
  uploadGroup(gGround);

  // 5. Upper floor + parapet roofs (matches the 2-storey hero villa silhouette)
  var gUpper = makeGroup();
  // Left higher tower
  pushBox(gUpper, -1.30, 0.0, -1.05, -0.32, 0.98, 0.55, C_WALL);
  // Left tower overhanging roof parapet
  pushBox(gUpper, -1.38, 0.95, -1.12, -0.24, 1.12, 0.63, C_WALL);
  // Center upper volume
  pushBox(gUpper, -0.32, 0.0, -1.05,  0.68, 0.84, 0.15, C_WALL);
  pushBox(gUpper, -0.36, 0.82, -1.10, 0.74, 0.96, 0.22, C_WALL);
  // Right lower terrace parapet
  pushBox(gUpper,  0.65, 0.0, -1.05,  1.30, 0.26, 0.55, C_WALL_SH);
  // Upper windows (wood shutters + warm inner glass)
  pushBox(gUpper, -1.08, 0.26, 0.54, -0.54, 0.72, 0.58, C_WOOD);
  pushBox(gUpper, -1.02, 0.31, 0.55, -0.60, 0.67, 0.59, C_WIN_GLOW);
  pushLouvers(gUpper, -1.02, 0.31, -0.60, 0.67, 0.585, 4, C_WOOD);
  pushBox(gUpper, -0.18, 0.22, 0.14,  0.52, 0.66, 0.18, C_WOOD);
  pushBox(gUpper, -0.12, 0.27, 0.15,  0.46, 0.61, 0.19, C_WIN_GLOW);
  pushLouvers(gUpper, -0.12, 0.27, 0.46, 0.61, 0.185, 4, C_WOOD);
  uploadGroup(gUpper);

  // ---- blueprint & boundary line buffers ----------------------------------
  function makeLines(arr) {
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
    return { buf: b, count: arr.length / 7 };
  }

  // Grid & subdivision plan lines on y = 0.015
  var gridArr = [];
  function addLine(arr, x0, y0, z0, x1, y1, z1, r, g, b, a) {
    arr.push(x0, y0, z0, r, g, b, a, x1, y1, z1, r, g, b, a);
  }
  for (var gx = -5.5; gx <= 5.5; gx += 0.5) {
    var maj = Math.abs(gx - Math.round(gx)) < 0.01;
    addLine(gridArr, gx, 0.005, -4.4, gx, 0.005, 4.4, 0.65, 0.72, 0.67, maj ? 0.26 : 0.11);
  }
  for (var gz = -4.0; gz <= 4.0; gz += 0.5) {
    var majz = Math.abs(gz - Math.round(gz)) < 0.01;
    addLine(gridArr, -5.5, 0.005, gz, 5.5, 0.005, gz, 0.65, 0.72, 0.67, majz ? 0.26 : 0.11);
  }
  // Neighbor plot outlines
  for (var i = 0; i < neighborPads.length; i++) {
    var p = neighborPads[i];
    addLine(gridArr, p[0], 0.02, p[1], p[2], 0.02, p[1], 0.78, 0.84, 0.78, 0.45);
    addLine(gridArr, p[2], 0.02, p[1], p[2], 0.02, p[3], 0.78, 0.84, 0.78, 0.45);
    addLine(gridArr, p[2], 0.02, p[3], p[0], 0.02, p[3], 0.78, 0.84, 0.78, 0.45);
    addLine(gridArr, p[0], 0.02, p[3], p[0], 0.02, p[1], 0.78, 0.84, 0.78, 0.45);
  }
  // Highlighted Lot 14 plan outline + blueprint room footprint
  var lotRects = [
    [-1.75, -1.55, 1.75, 1.55, 0.92, 0.44, 0.22, 0.95],
    [-1.30, -1.05, 1.30, 0.55, 0.95, 0.62, 0.38, 0.70],
    [-1.30, -1.05,-0.32, 0.55, 0.95, 0.62, 0.38, 0.55],
    [-0.32,  0.08, 1.30, 0.66, 0.95, 0.62, 0.38, 0.55]
  ];
  for (var lr = 0; lr < lotRects.length; lr++) {
    var R = lotRects[lr];
    addLine(gridArr, R[0], 0.12, R[1], R[2], 0.12, R[1], R[4], R[5], R[6], R[7]);
    addLine(gridArr, R[2], 0.12, R[1], R[2], 0.12, R[3], R[4], R[5], R[6], R[7]);
    addLine(gridArr, R[2], 0.12, R[3], R[0], 0.12, R[3], R[4], R[5], R[6], R[7]);
    addLine(gridArr, R[0], 0.12, R[3], R[0], 0.12, R[1], R[4], R[5], R[6], R[7]);
  }
  var planLines = makeLines(gridArr);

  // Taut surveyor string between the 4 corner bornes at y = 0.34
  var stringArr = [];
  for (var sc = 0; sc < 4; sc++) {
    var c0 = corners[sc], c1 = corners[(sc + 1) % 4];
    addLine(stringArr, c0[0], 0.34, c0[1], c1[0], 0.34, c1[1], 0.95, 0.48, 0.24, 0.95);
  }
  var stringLines = makeLines(stringArr);

  // ---- matrix math --------------------------------------------------------
  function perspective(fovRad, aspect, near, far) {
    var f = 1.0 / Math.tan(fovRad / 2);
    var nf = 1.0 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ]);
  }

  function lookAt(eye, target, up) {
    var zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2];
    var zl = Math.hypot(zx, zy, zz) || 1;
    zx /= zl; zy /= zl; zz /= zl;
    var xx = up[1] * zz - up[2] * zy;
    var xy = up[2] * xx - up[0] * zz; // wait: up cross z
    xx = up[1] * zz - up[2] * zy;
    xy = up[2] * zx - up[0] * zz;
    var xz = up[0] * zy - up[1] * zx;
    var xl = Math.hypot(xx, xy, xz) || 1;
    xx /= xl; xy /= xl; xz /= xl;
    var yx = zy * xz - zz * xy;
    var yy = zz * xx - zx * xz;
    var yz = zx * xy - zy * xx;
    return new Float32Array([
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
      1
    ]);
  }

  // ---- render state -------------------------------------------------------
  var width = 0, height = 0, lastP = -1;
  var STRIDE = 10 * 4;

  function resize() {
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(r.width * dpr));
    var h = Math.max(1, Math.round(r.height * dpr));
    if (w !== width || h !== height) {
      width = canvas.width = w;
      height = canvas.height = h;
      lastP = -1;
    }
  }

  function drawGroup(g, sx, sy, sz, ox, oy, oz) {
    if (sy <= 0.001) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, g.buf);
    gl.enableVertexAttribArray(loc.aPos);
    gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, STRIDE, 0);
    gl.enableVertexAttribArray(loc.aNorm);
    gl.vertexAttribPointer(loc.aNorm, 3, gl.FLOAT, false, STRIDE, 12);
    gl.enableVertexAttribArray(loc.aCol);
    gl.vertexAttribPointer(loc.aCol, 4, gl.FLOAT, false, STRIDE, 24);
    gl.uniform3f(loc.uScale, sx, sy, sz);
    gl.uniform3f(loc.uOffset, ox, oy, oz);
    gl.drawArrays(gl.TRIANGLES, 0, g.count);
  }

  function drawLines(ln, alpha) {
    if (alpha <= 0.01) return;
    gl.useProgram(lProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, ln.buf);
    gl.enableVertexAttribArray(lLoc.aPos);
    gl.vertexAttribPointer(lLoc.aPos, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(lLoc.aCol);
    gl.vertexAttribPointer(lLoc.aCol, 4, gl.FLOAT, false, 28, 12);
    gl.uniform1f(lLoc.uAlpha, alpha);
    gl.drawArrays(gl.LINES, 0, ln.count);
  }

  function renderAt(p) {
    resize();
    gl.viewport(0, 0, width, height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Stage timings across p = 0..1
    var tTilt   = win(p, 0.08, 0.46);
    var tPlot   = win(p, 0.02, 0.26);
    var tBornes = win(p, 0.22, 0.44);
    var tFound  = win(p, 0.42, 0.56);
    var tGround = win(p, 0.50, 0.68);
    var tUpper  = win(p, 0.62, 0.78);
    var tDusk   = win(p, 0.70, 0.92);
    var tGlow   = win(p, 0.74, 0.94);

    // Update architectural elevation readout (+0,00 m to +6,40 m)
    var meters = tFound * 0.45 + tGround * 3.05 + tUpper * 2.90;
    if (hOut) {
      hOut.textContent = '+' + meters.toFixed(2).replace('.', ',') + ' m';
    }
    var pStage = sec.querySelector('.peak__stage');
    if (pStage) {
      pStage.setAttribute('data-sc-verify-state',
        'maq:tilt=' + tTilt.toFixed(2) + ':b=' + tBornes.toFixed(2) + ':h=' + meters.toFixed(2) + ':g=' + tGlow.toFixed(2));
    }

    // Camera choreography:
    // At p=0: high overhead plan view, offset to the right on desktop so left copy has clean dark ground
    var isDesktop = (width / Math.max(height, 1)) > 1.15;
    var panLeftX = isDesktop ? -1.35 : 0.0;
    var panLeftY = isDesktop ? -0.10 : -0.28;

    // Top-down pitch (nearly vertical) -> architectural 3/4 view
    var pitch = lerp(1.46, 0.52, tTilt);
    var yaw   = lerp(0.04, 0.56, tTilt) + win(p, 0.46, 0.96) * 0.24;
    var dist  = lerp(8.0, 6.4, tTilt);

    var target = [
      panLeftX,
      lerp(0.0, 0.48, win(p, 0.42, 0.78)) + panLeftY,
      0.05
    ];
    var eye = [
      target[0] + Math.sin(yaw) * Math.cos(pitch) * dist,
      target[1] + Math.sin(pitch) * dist,
      target[2] + Math.cos(yaw) * Math.cos(pitch) * dist
    ];

    var proj = perspective(0.66, width / Math.max(height, 1), 0.2, 40.0);
    var view = lookAt(eye, target, [0, 1, 0]);

    // 1. Solid geometry pass
    gl.useProgram(prog);
    gl.uniformMatrix4fv(loc.uProj, false, proj);
    gl.uniformMatrix4fv(loc.uView, false, view);
    gl.uniform3f(loc.uSunDir, -0.75, lerp(0.85, 0.28, tDusk), 0.48);
    gl.uniform1f(loc.uDusk, tDusk);
    gl.uniform1f(loc.uGlow, tGlow);

    drawGroup(gBase,   1, 1, 1, 0, 0, 0);
    drawGroup(gPlot,   1, Math.max(0.15, tPlot), 1, 0, 0, 0);
    drawGroup(gBornes, 1, tBornes, 1, 0, 0.10, 0);
    drawGroup(gFound,  1, tFound,  1, 0, 0.10, 0);
    drawGroup(gGround, 1, tGround, 1, 0, 0.10 + 0.18 * tFound, 0);
    drawGroup(gUpper,  1, tUpper,  1, 0, 0.10 + 0.18 * tFound + 1.05 * tGround, 0);

    // 2. Crisp architectural plan & surveyor lines pass
    gl.useProgram(lProg);
    gl.uniformMatrix4fv(lLoc.uProj, false, proj);
    gl.uniformMatrix4fv(lLoc.uView, false, view);
    drawLines(planLines, 1.0 - tDusk * 0.45);
    drawLines(stringLines, tBornes * (1.0 - tFound * 0.65));
  }

  function tick() {
    var r = sec.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    if (r.bottom > -vh * 0.5 && r.top < vh * 1.5) {
      var pStr = sec.style.getPropertyValue('--sc-p');
      var p = parseFloat(pStr);
      if (isNaN(p)) p = 0;
      if (Math.abs(p - lastP) > 0.0005) {
        lastP = p;
        renderAt(p);
      }
    }
    requestAnimationFrame(tick);
  }

  // Paint initial frame and mark WebGL ready
  renderAt(0);
  sec.classList.add('gl-on');
  window.addEventListener('resize', function () {
    resize();
    renderAt(lastP < 0 ? 0 : lastP);
  }, { passive: true });
  requestAnimationFrame(tick);

  // Expose helper for poster capture if needed
  window.__renderMaquetteAt = renderAt;
})();
