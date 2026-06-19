/**
 * BNYA — Bharath Nava Yuva Association
 * Interactive Inauguration landing page Controller
 */

(function () {
  'use strict';

  /* ── DOM REFS ─────────────────────────────────────────── */
  const revealBtn       = document.getElementById('revealBtn');
  const landingScreen   = document.getElementById('landingScreen');
  const scrollStage     = document.getElementById('scrollStage');
  const rodTop          = document.getElementById('rodTop');
  const rodBottom       = document.getElementById('rodBottom');
  const scrollParchment = document.getElementById('scrollParchment');
  const logoWrap        = document.getElementById('logoWrap');
  const ngoNameEl       = document.getElementById('ngoName');
  const typeCursor      = document.getElementById('typeCursor');
  const ngoTagline      = document.getElementById('ngoTagline');
  const featuredWrap    = document.getElementById('featuredImageWrap');
  const scrollFooter    = document.getElementById('scrollFooter');
  
  // New Interactive Elements
  const audioToggle     = document.getElementById('audioToggle');
  const audioToggleText = document.getElementById('audioToggleText');
  const particleCanvas  = document.getElementById('particleCanvas');
  const lampInstruction = document.getElementById('lampInstruction');
  const sacredLamp      = document.getElementById('sacredLamp');
  const wicks           = document.querySelectorAll('.wick-hotspot');
  
  const pillarCards     = document.querySelectorAll('.pillar-card');
  const pillarHeaders   = document.querySelectorAll('.pillar-header');
  
  const signerNameInput = document.getElementById('signerName');
  const signPledgeBtn   = document.getElementById('signPledgeBtn');
  const certificateWrap = document.getElementById('certificateWrap');
  const certCanvas      = document.getElementById('certCanvas');
  const certImage       = document.getElementById('certImage');
  const downloadCertBtn = document.getElementById('downloadCertBtn');
  
  const featuredImageInner = document.getElementById('featuredImageInner');

  /* ── CONSTANTS ───────────────────────────────────────── */
  const NGO_NAME      = 'BHARATH NAVA YUVA ASSOCIATION';
  const TYPE_DELAY    = 60;   // ms per character
  const POST_PAUSE    = 1000; // ms after full name before next step
  
  /* ── STATE ───────────────────────────────────────────── */
  let audioCtx        = null;
  let ambientSynth    = null;
  let isMuted         = true;
  const litWicks      = new Set();
  let isParchmentUnrolled = false;

  /* ── WEB AUDIO SYNTHESIZER ───────────────────────────── */
  
  /**
   * Initializes the AudioContext on first user interaction.
   */
  const initAudio = () => {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  };

  /**
   * Synthesizes a flame ignition sound (sweep + crackle).
   */
  const playIgniteSound = () => {
    if (!audioCtx || isMuted) return;
    const now = audioCtx.currentTime;

    // Pitch sweep
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.3);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.06, now + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Noise buffer for flame sizzle
    const bufferSize = audioCtx.sampleRate * 0.3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(350, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(900, now + 0.3);
    noiseFilter.Q.value = 3;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.015, now);
    noiseGain.gain.linearRampToValueAtTime(0.05, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.3);
    noise.stop(now + 0.3);
  };

  /**
   * Synthesizes a traditional brass bell chime.
   */
  const playBellChime = (frequency = 587.33) => {
    if (!audioCtx || isMuted) return;
    const now = audioCtx.currentTime;

    const ratios = [1.0, 1.2, 1.5, 2.0, 2.62];
    const gains =  [0.18, 0.09, 0.07, 0.05, 0.03];
    const decays = [2.2, 1.6, 1.3, 0.9, 0.6];

    ratios.forEach((ratio, i) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = (i === 1) ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(frequency * ratio, now);

      gainNode.gain.setValueAtTime(gains[i], now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + decays[i]);
    });
  };

  /**
   * Synthesizes an arpeggiated celebratory bell chime.
   */
  const playCelebrationChime = () => {
    const notes = [293.66, 349.23, 440.00, 587.33]; // D4, F4, A4, D5 chord
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playBellChime(freq);
      }, index * 160);
    });
  };

  /**
   * Synthesizes a paper unroll swoosh.
   */
  const playUnrollSound = () => {
    if (!audioCtx || isMuted) return;
    const now = audioCtx.currentTime;

    const bufferSize = audioCtx.sampleRate * 1.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + 1.2);
    filter.Q.value = 1.8;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.25);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noise.start(now);
    noise.stop(now + 1.2);
  };

  /**
   * Starts a rich background drone simulating a Tanpura.
   */
  const startDrone = () => {
    if (!audioCtx || isMuted || ambientSynth) return;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const osc3 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const masterGain = audioCtx.createGain();

    // A2 (110Hz), E3 (165Hz), A3 (220Hz)
    osc1.type = 'sawtooth';
    osc1.frequency.value = 110;

    osc2.type = 'triangle';
    osc2.frequency.value = 165;

    osc3.type = 'sine';
    osc3.frequency.value = 220;

    const g1 = audioCtx.createGain();
    const g2 = audioCtx.createGain();
    const g3 = audioCtx.createGain();
    g1.gain.value = 0.02;
    g2.gain.value = 0.03;
    g3.gain.value = 0.02;

    filter.type = 'lowpass';
    filter.frequency.value = 320;
    filter.Q.value = 1;

    osc1.connect(g1);
    osc2.connect(g2);
    osc3.connect(g3);

    g1.connect(filter);
    g2.connect(filter);
    g3.connect(filter);

    filter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    // Filter frequency LFO modulation (creates a warm swell)
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.2; // 5-second swell cycles
    lfoGain.gain.value = 80;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();

    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 2.0);

    ambientSynth = {
      osc1, osc2, osc3, lfo, filter, masterGain,
      stop: function () {
        const time = audioCtx.currentTime;
        masterGain.gain.setValueAtTime(masterGain.gain.value, time);
        masterGain.gain.linearRampToValueAtTime(0, time + 1.0);
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            osc3.stop();
            lfo.stop();
          } catch (e) {}
        }, 1000);
      }
    };
  };

  /**
   * Stops the background drone.
   */
  const stopDrone = () => {
    if (ambientSynth) {
      ambientSynth.stop();
      ambientSynth = null;
    }
  };

  /* ── AUDIO CONTROL INTERACTION ────────────────────────── */

  const toggleMute = () => {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isMuted = !isMuted;

    if (isMuted) {
      audioToggle.classList.remove('playing');
      audioToggleText.textContent = 'Unmute';
      stopDrone();
    } else {
      audioToggle.classList.add('playing');
      audioToggleText.textContent = 'Mute';
      startDrone();
      playBellChime(440); // play feedback chime
    }
  };

  audioToggle.addEventListener('click', toggleMute);

  /* ── CANVAS FLOWER PETALS & SPARKS SYSTEM ──────────────── */
  const ctx = particleCanvas.getContext('2d');
  let particles = [];
  let mouseX = undefined;
  let mouseY = undefined;
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;

  const resizeCanvas = () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    particleCanvas.width = canvasWidth;
    particleCanvas.height = canvasHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, type = 'rose', source = 'spawner') {
      this.x = x;
      this.y = y;
      this.type = type; // 'rose', 'marigold', or 'spark'
      this.size = type === 'spark' ? Math.random() * 2.5 + 1.5 : Math.random() * 8 + 5;
      
      this.vx = (Math.random() - 0.5) * (source === 'burst' ? 5 : 1.5);
      this.vy = source === 'burst' ? (Math.random() - 0.5) * 5 - 1.5 : Math.random() * 1.2 + 0.8;
      
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.04;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.02 + 0.01;
      
      this.alpha = 1;
      this.decay = type === 'spark' ? Math.random() * 0.025 + 0.015 : Math.random() * 0.004 + 0.002;
      
      if (type === 'rose') {
        this.color = `rgba(${160 + Math.floor(Math.random() * 40)}, ${24 + Math.floor(Math.random() * 16)}, ${24 + Math.floor(Math.random() * 16)}, `;
      } else if (type === 'marigold') {
        if (Math.random() > 0.5) {
          this.color = `rgba(232, 115, 10, `; // saffron
        } else {
          this.color = `rgba(229, 178, 37, `; // gold
        }
      } else { // spark
        this.color = `rgba(255, 239, 166, `;
      }
    }

    update() {
      if (this.type !== 'spark') {
        this.vy += 0.008; // slow gravity
        this.wobble += this.wobbleSpeed;
        this.vx += Math.sin(this.wobble) * 0.03;
      } else {
        this.vy += 0.003;
        this.vx *= 0.98;
        this.vy *= 0.98;
      }
      
      // Mouse repulsion
      if (mouseX !== undefined && mouseY !== undefined) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 0.6;
          this.vy += Math.sin(angle) * force * 0.6;
        }
      }

      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color + this.alpha + ')';
      
      if (this.type === 'spark') {
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'rose') {
        // Heart half / organic petal shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size, this.size, 0, this.size * 1.4);
        ctx.bezierCurveTo(this.size, this.size, this.size, -this.size / 2, 0, 0);
        ctx.fill();
      } else { // marigold
        // Elliptical petal
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(130, 60, 0, ${this.alpha * 0.25})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
      }
      
      ctx.restore();
    }
  }

  const spawnBurst = (x, y, count = 12, type = null) => {
    const types = ['rose', 'marigold', 'spark'];
    for (let i = 0; i < count; i++) {
      const pType = type || types[Math.floor(Math.random() * types.length)];
      particles.push(new Particle(x, y, pType, 'burst'));
    }
  };

  // Passive falling timer
  let frameCount = 0;

  const animateParticles = () => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Continuous spawning of petals when parchment is unrolled
    if (isParchmentUnrolled) {
      frameCount++;
      if (frameCount % 10 === 0) {
        const types = ['rose', 'marigold'];
        const rType = types[Math.floor(Math.random() * types.length)];
        particles.push(new Particle(Math.random() * canvasWidth, -20, rType, 'spawner'));
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    // Remove faded/out of screen particles
    particles = particles.filter(p => p.alpha > 0 && p.y < canvasHeight + 20 && p.x > -20 && p.x < canvasWidth + 20);

    requestAnimationFrame(animateParticles);
  };

  animateParticles();

  // Mouse move tracker
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouseX = undefined;
    mouseY = undefined;
  });

  // Spawn petals on click/touch
  window.addEventListener('click', (e) => {
    // Avoid spawning bursts when clicking buttons or inputs to keep UI clean
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.classList.contains('wick-hotspot')) {
      return;
    }
    spawnBurst(e.clientX, e.clientY, 15);
  });

  /* ── SACRED LAMP (SAMAI) CEREMONY ──────────────────────── */

  const checkLampState = () => {
    if (litWicks.size === 5) {
      // 1. All wicks are lit
      lampInstruction.textContent = "The sacred lamp is lit! You may now reveal the banner.";
      lampInstruction.style.color = '#FFEFA6';
      
      // 2. Play celebratory sounds
      playCelebrationChime();
      
      // 3. Enable Reveal button and add glow animation
      revealBtn.disabled = false;
      revealBtn.classList.add('btn-unlocked');
      
      // 4. Burst sparks from the lamp center
      const rect = sacredLamp.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      spawnBurst(cx, cy, 30, 'spark');
    }
  };

  wicks.forEach(wick => {
    wick.addEventListener('click', (e) => {
      e.stopPropagation();
      initAudio();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const index = parseInt(wick.parentNode.getAttribute('data-wick'));
      const group = document.getElementById(`wickGroup-${index}`);
      
      if (!litWicks.has(index)) {
        litWicks.add(index);
        group.classList.add('lit');
        
        // Sound and spark effects
        playIgniteSound();
        
        const rect = wick.getBoundingClientRect();
        const wx = rect.left + rect.width / 2;
        const wy = rect.top + rect.height / 2;
        spawnBurst(wx, wy, 8, 'spark');
        
        checkLampState();
      }
    });
  });

  /* ── 3D PARALLAX TILT EFFECT ───────────────────────────── */

  const applyParallaxTilt = (element, maxRotation = 12) => {
    if (!element) return;
    
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within element
      const y = e.clientY - rect.top;  // y coordinate within element
      
      const px = x / rect.width;  // percentage X (0 to 1)
      const py = y / rect.height; // percentage Y (0 to 1)
      
      // Calculate rotation (-maxRotation to +maxRotation)
      const rotY = (px - 0.5) * 2 * maxRotation;
      const rotX = (0.5 - py) * 2 * maxRotation; // inverted
      
      element.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`;
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  };

  // Enable tilt on featured image and logo
  applyParallaxTilt(featuredImageInner, 10);
  applyParallaxTilt(logoWrap, 15);

  /* ── MAIN REVEAL SEQUENCE ─────────────────────────────── */

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const typeText = (targetEl, text, delayMs) => {
    return new Promise((resolve) => {
      let i = 0;
      const tick = () => {
        if (i < text.length) {
          targetEl.textContent += text[i];
          i++;
          setTimeout(tick, delayMs);
        } else {
          resolve();
        }
      };
      tick();
    });
  };

  const startReveal = async () => {
    revealBtn.disabled = true;

    // ── STEP 1: Fade out landing screen ──────────────────
    landingScreen.classList.add('hidden');

    // ── STEP 2: Show scroll stage ─────────────────────────
    await wait(400);
    scrollStage.classList.add('visible');

    // ── STEP 3: Trigger parchment unroll ──────────────────
    await wait(100);
    rodTop.classList.add('unrolled');
    rodBottom.classList.add('unrolled');
    scrollParchment.classList.add('unrolled');
    
    playUnrollSound();
    isParchmentUnrolled = true; // starts falling petals continuous shower

    // ── STEP 4: Reveal logo ───────────────────────────────
    await wait(1000);
    logoWrap.classList.add('revealed');

    // ── STEP 5: Start typing the NGO name ─────────────────
    await wait(600);
    ngoNameEl.textContent = '';
    await typeText(ngoNameEl, NGO_NAME, TYPE_DELAY);

    // ── STEP 6: Pause after full name, then hide cursor ───
    await wait(POST_PAUSE);
    typeCursor.classList.add('hidden');

    // ── STEP 7: Fade in tagline ───────────────────────────
    ngoTagline.classList.add('revealed');
    await wait(300);

    // ── STEP 8: Fade in featured image ───────────────────
    featuredWrap.classList.add('revealed');
    await wait(600);

    // ── STEP 9: Fade in Vision Pillars Accordion ──────────
    document.getElementById('pillarsSection').classList.add('revealed');
    await wait(500);

    // ── STEP 10: Fade in Pledge & Signature Card ──────────
    document.getElementById('pledgeSection').classList.add('revealed');
    await wait(500);

    // ── STEP 11: Fade in footer ────────────────────────────
    scrollFooter.classList.add('revealed');
  };

  revealBtn.addEventListener('click', startReveal);

  /* ── VISION PILLARS ACCORDION ──────────────────────────── */

  pillarHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const card = header.parentElement;
      const isCurrentlyActive = card.classList.contains('active');
      
      // Collapse all other cards
      pillarCards.forEach(c => {
        c.classList.remove('active');
        c.querySelector('.pillar-header').setAttribute('aria-expanded', 'false');
      });
      
      // Toggle clicked card
      if (!isCurrentlyActive) {
        card.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        
        // Play soft click chime
        if (audioCtx && !isMuted) {
          playBellChime(784); // G5 chime
        }
      }
    });
  });

  /* ── PLEDGE & CANVAS CERTIFICATE GENERATOR ──────────────── */

  const generateCertificate = (name) => {
    const canvasContext = certCanvas.getContext('2d');
    const w = certCanvas.width;
    const h = certCanvas.height;

    // Draw parchment paper texture
    canvasContext.fillStyle = '#fdf6e3';
    canvasContext.fillRect(0, 0, w, h);
    
    // Draw gold outer border
    canvasContext.strokeStyle = '#D4A017';
    canvasContext.lineWidth = 4;
    canvasContext.strokeRect(20, 20, w - 40, h - 40);

    // Draw thin maroon inner border
    canvasContext.strokeStyle = '#5C1010';
    canvasContext.lineWidth = 1.5;
    canvasContext.strokeRect(28, 28, w - 56, h - 56);

    // Draw corner diamond flourishes
    const drawDiamond = (x, y) => {
      canvasContext.fillStyle = '#D4A017';
      canvasContext.beginPath();
      canvasContext.moveTo(x, y - 9);
      canvasContext.lineTo(x + 9, y);
      canvasContext.lineTo(x, y + 9);
      canvasContext.lineTo(x - 9, y);
      canvasContext.closePath();
      canvasContext.fill();
    };
    drawDiamond(28, 28);
    drawDiamond(w - 28, 28);
    drawDiamond(28, h - 28);
    drawDiamond(w - 28, h - 28);

    // Logo image loading
    const logo = new Image();
    logo.src = 'logo.png';
    logo.onload = function() {
      const logoSize = 65;
      canvasContext.drawImage(logo, w / 2 - logoSize / 2, 45, logoSize, logoSize);
      drawCertText();
    };
    logo.onerror = function() {
      // Golden mandala vector fallback if file fails to load
      canvasContext.fillStyle = '#D4A017';
      canvasContext.beginPath();
      canvasContext.arc(w / 2, 77, 25, 0, Math.PI * 2);
      canvasContext.fill();
      drawCertText();
    };

    function drawCertText() {
      canvasContext.textAlign = 'center';
      
      // Heading
      canvasContext.fillStyle = '#5C1010';
      canvasContext.font = 'bold 22px Cinzel, Georgia, serif';
      canvasContext.fillText('BHARATH NAVA YUVA ASSOCIATION', w / 2, 145);
      
      // Tagline
      canvasContext.fillStyle = '#E8730A';
      canvasContext.font = 'italic 15px "Cormorant Garamond", Georgia, serif';
      canvasContext.fillText('Empowering Youth  ·  Serving Bharat', w / 2, 172);

      // Separator Line
      canvasContext.strokeStyle = '#D4A017';
      canvasContext.lineWidth = 1;
      canvasContext.beginPath();
      canvasContext.moveTo(w / 2 - 100, 192);
      canvasContext.lineTo(w / 2 + 100, 192);
      canvasContext.stroke();

      // Certificate title
      canvasContext.fillStyle = '#5C1010';
      canvasContext.font = 'bold 18px Cinzel, Georgia, serif';
      canvasContext.fillText('PLEDGE OF ASSOCIATION', w / 2, 225);

      // Certificate body 1
      canvasContext.fillStyle = '#4a3424';
      canvasContext.font = 'italic 16px "Cormorant Garamond", Georgia, serif';
      canvasContext.fillText('This is to certify that', w / 2, 265);

      // Signer's Name in handwritten calligraphy style (Alex Brush)
      canvasContext.fillStyle = '#E8730A';
      canvasContext.font = '52px "Alex Brush", cursive';
      canvasContext.fillText(name, w / 2, 335);

      // Signer name underline
      canvasContext.strokeStyle = 'rgba(212, 160, 23, 0.4)';
      canvasContext.lineWidth = 2;
      canvasContext.beginPath();
      canvasContext.moveTo(w / 2 - 170, 348);
      canvasContext.lineTo(w / 2 + 170, 348);
      canvasContext.stroke();

      // Certificate body 2 (wrapped)
      canvasContext.fillStyle = '#4a3424';
      canvasContext.font = '16px "Cormorant Garamond", Georgia, serif';
      
      const wrapText = (text, x, y, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = canvasContext.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            canvasContext.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        canvasContext.fillText(line, x, currentY);
      };

      const pledgeTxt = 'has solemnly taken the BNYA Pledge, promising to work dedicatedly for the empowerment of youth, preservation of national heritage, and selfless service of Bharath.';
      wrapText(pledgeTxt, w / 2, 380, 520, 24);

      // Date string
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      canvasContext.fillStyle = '#5C1010';
      canvasContext.font = '13px "Cormorant Garamond", Georgia, serif';
      canvasContext.fillText('Date: ' + dateStr, 150, 510);
      canvasContext.strokeStyle = '#D4A017';
      canvasContext.lineWidth = 1;
      canvasContext.beginPath();
      canvasContext.moveTo(90, 518);
      canvasContext.lineTo(210, 518);
      canvasContext.stroke();

      // Signature Placeholder
      canvasContext.fillStyle = '#5C1010';
      canvasContext.font = 'italic 16px "Alex Brush", cursive';
      canvasContext.fillText('BNYA Founding Board', w - 150, 498);
      canvasContext.font = '13px "Cormorant Garamond", Georgia, serif';
      canvasContext.fillText('Authorized Signature', w - 150, 512);
      canvasContext.beginPath();
      canvasContext.moveTo(w - 210, 518);
      canvasContext.lineTo(w - 90, 518);
      canvasContext.stroke();

      // Draw red/orange BNYA Seal
      canvasContext.strokeStyle = 'rgba(232, 115, 10, 0.4)';
      canvasContext.lineWidth = 1.5;
      canvasContext.beginPath();
      canvasContext.arc(w / 2, 505, 28, 0, Math.PI * 2);
      canvasContext.stroke();
      canvasContext.fillStyle = 'rgba(232, 115, 10, 0.4)';
      canvasContext.font = '8px Cinzel, sans-serif';
      canvasContext.fillText('BNYA SEAL', w / 2, 503);
      canvasContext.font = '6px Cinzel, sans-serif';
      canvasContext.fillText('INAUGURATED', w / 2, 511);

      // Render image output
      certImage.src = certCanvas.toDataURL('image/png');
    }
  };

  const handleSignPledge = () => {
    const name = signerNameInput.value.trim();
    if (!name) {
      signerNameInput.focus();
      signerNameInput.style.borderColor = 'red';
      return;
    }

    signerNameInput.style.borderColor = '';
    
    // Play celebratory chimed arpeggio
    playCelebrationChime();
    
    // Hide form, show certificate block
    document.getElementById('pledgeForm').classList.add('hidden');
    certificateWrap.classList.remove('hidden');

    // Wait for fonts to be ready so signature renders correctly in "Alex Brush"
    document.fonts.ready.then(() => {
      generateCertificate(name);
      
      // Trigger spark shower around certificate
      const rect = certificateWrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      spawnBurst(cx, cy, 25, 'spark');
    });
  };

  signPledgeBtn.addEventListener('click', handleSignPledge);

  signerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSignPledge();
    }
  });

  const handleDownloadCert = () => {
    const name = signerNameInput.value.trim().replace(/\s+/g, '_');
    const link = document.createElement('a');
    link.download = `BNYA_Pledge_Certificate_${name}.png`;
    link.href = certImage.src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Play feedback sound
    playBellChime(880); // high note
  };

  downloadCertBtn.addEventListener('click', handleDownloadCert);

})();
