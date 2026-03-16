(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060606, 0.0012);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 380;

  const isMobile = window.innerWidth < 768;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const PARTICLE_COUNT = isMobile ? 700 : 1800;
  const GLOW_COUNT = isMobile ? 6 : 16;
  const CONNECTION_DISTANCE = isMobile ? 90 : 115;
  const FIELD_X = isMobile ? 450 : 650;
  const FIELD_Y = isMobile ? 350 : 450;
  const FIELD_Z = 200;

  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };

  document.addEventListener('mousemove', function (e) {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    mouse.active = true;
  });
  document.addEventListener('mouseleave', function () { mouse.active = false; });

  document.addEventListener('touchmove', function (e) {
    var touch = e.touches[0];
    mouse.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;
    mouse.active = true;
  }, { passive: true });
  document.addEventListener('touchend', function () { mouse.active = false; });

  function createParticleTexture() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.15)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  function createGlowTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  const particleTexture = createParticleTexture();
  const glowTexture = createGlowTexture();

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  const palette = [
    new THREE.Color(0x6366F1),
    new THREE.Color(0x818CF8),
    new THREE.Color(0x4F46E5),
    new THREE.Color(0xa5b4fc),
    new THREE.Color(0x7c7caa),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * FIELD_X;
    positions[i3 + 1] = (Math.random() - 0.5) * FIELD_Y;
    positions[i3 + 2] = (Math.random() - 0.5) * FIELD_Z;

    velocities[i3]     = (Math.random() - 0.5) * (isMobile ? 0.35 : 0.18);
    velocities[i3 + 1] = (Math.random() - 0.5) * (isMobile ? 0.35 : 0.18);
    velocities[i3 + 2] = (Math.random() - 0.5) * (isMobile ? 0.14 : 0.07);

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i3]     = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: isMobile ? 3 : 4,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  const glowPositions = new Float32Array(GLOW_COUNT * 3);
  const glowVelocities = new Float32Array(GLOW_COUNT * 3);
  const glowColors = new Float32Array(GLOW_COUNT * 3);

  for (let i = 0; i < GLOW_COUNT; i++) {
    const i3 = i * 3;
    glowPositions[i3]     = (Math.random() - 0.5) * FIELD_X * 0.7;
    glowPositions[i3 + 1] = (Math.random() - 0.5) * FIELD_Y * 0.7;
    glowPositions[i3 + 2] = (Math.random() - 0.5) * FIELD_Z * 0.5;

    glowVelocities[i3]     = (Math.random() - 0.5) * 0.06;
    glowVelocities[i3 + 1] = (Math.random() - 0.5) * 0.06;
    glowVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

    const c = palette[Math.floor(Math.random() * 3)];
    glowColors[i3]     = c.r;
    glowColors[i3 + 1] = c.g;
    glowColors[i3 + 2] = c.b;
  }

  const glowGeo = new THREE.BufferGeometry();
  glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
  glowGeo.setAttribute('color', new THREE.BufferAttribute(glowColors, 3));

  const glowMat = new THREE.PointsMaterial({
    size: isMobile ? 40 : 70,
    map: glowTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.25,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const glowPoints = new THREE.Points(glowGeo, glowMat);
  scene.add(glowPoints);

  const MAX_LINES = isMobile ? 1500 : 4500;
  const linePositions = new Float32Array(MAX_LINES * 6);
  const lineColors = new Float32Array(MAX_LINES * 6);

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  let frameCount = 0;
  function animate() {
    requestAnimationFrame(animate);
    if (isMobile && ++frameCount % 2 !== 0) return;

    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    const posArr = particleGeo.attributes.position.array;
    const halfX = FIELD_X * 0.5;
    const halfY = FIELD_Y * 0.5;
    const halfZ = FIELD_Z * 0.5;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      posArr[i3]     += velocities[i3];
      posArr[i3 + 1] += velocities[i3 + 1];
      posArr[i3 + 2] += velocities[i3 + 2];

      if (posArr[i3]     >  halfX) posArr[i3]     = -halfX;
      if (posArr[i3]     < -halfX) posArr[i3]     =  halfX;
      if (posArr[i3 + 1] >  halfY) posArr[i3 + 1] = -halfY;
      if (posArr[i3 + 1] < -halfY) posArr[i3 + 1] =  halfY;
      if (posArr[i3 + 2] >  halfZ) posArr[i3 + 2] = -halfZ;
      if (posArr[i3 + 2] < -halfZ) posArr[i3 + 2] =  halfZ;
    }

    if (mouse.active) {
      const mx = mouse.x * halfX;
      const my = mouse.y * halfY;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const dx = posArr[i3] - mx;
        const dy = posArr[i3 + 1] - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          const strength = isMobile ? 0.001 : 0.0004;
          velocities[i3]     += dx * force * force * strength;
          velocities[i3 + 1] += dy * force * force * strength;
        }
      }
    }

    for (let i = 0; i < velocities.length; i++) {
      velocities[i] *= isMobile ? 0.994 : 0.998;
      velocities[i] += (Math.random() - 0.5) * (isMobile ? 0.003 : 0.001);
    }

    particleGeo.attributes.position.needsUpdate = true;

    const glowArr = glowGeo.attributes.position.array;
    for (let i = 0; i < GLOW_COUNT; i++) {
      const i3 = i * 3;
      glowArr[i3]     += glowVelocities[i3];
      glowArr[i3 + 1] += glowVelocities[i3 + 1];
      glowArr[i3 + 2] += glowVelocities[i3 + 2];
      if (Math.abs(glowArr[i3])     > halfX * 0.7) glowVelocities[i3]     *= -1;
      if (Math.abs(glowArr[i3 + 1]) > halfY * 0.7) glowVelocities[i3 + 1] *= -1;
      if (Math.abs(glowArr[i3 + 2]) > halfZ * 0.5) glowVelocities[i3 + 2] *= -1;
    }
    glowGeo.attributes.position.needsUpdate = true;

    let lineIndex = 0;
    const checkLimit = Math.min(PARTICLE_COUNT, isMobile ? 180 : 450);
    const connDist2 = CONNECTION_DISTANCE * CONNECTION_DISTANCE;

    for (let i = 0; i < checkLimit && lineIndex < MAX_LINES; i++) {
      const i3 = i * 3;
      for (let j = i + 1; j < checkLimit && lineIndex < MAX_LINES; j++) {
        const j3 = j * 3;
        const dx = posArr[i3]     - posArr[j3];
        const dy = posArr[i3 + 1] - posArr[j3 + 1];
        const dz = posArr[i3 + 2] - posArr[j3 + 2];
        const dist2 = dx * dx + dy * dy + dz * dz;

        if (dist2 < connDist2) {
          const li = lineIndex * 6;
          linePositions[li]     = posArr[i3];
          linePositions[li + 1] = posArr[i3 + 1];
          linePositions[li + 2] = posArr[i3 + 2];
          linePositions[li + 3] = posArr[j3];
          linePositions[li + 4] = posArr[j3 + 1];
          linePositions[li + 5] = posArr[j3 + 2];

          const alpha = 1.0 - Math.sqrt(dist2) / CONNECTION_DISTANCE;
          lineColors[li]     = 0.35 * alpha;
          lineColors[li + 1] = 0.37 * alpha;
          lineColors[li + 2] = 0.85 * alpha;
          lineColors[li + 3] = 0.35 * alpha;
          lineColors[li + 4] = 0.37 * alpha;
          lineColors[li + 5] = 0.85 * alpha;

          lineIndex++;
        }
      }
    }

    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
    lineGeo.setDrawRange(0, lineIndex * 2);

    const tSpeed = isMobile ? 0.0003 : 0.0001;
    const t = Date.now() * tSpeed;
    camera.position.x = Math.sin(t) * (isMobile ? 35 : 20);
    camera.position.y = Math.cos(t * 0.7) * (isMobile ? 25 : 15);
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
