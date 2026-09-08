import React, { useEffect, useRef, useCallback } from 'react';
import {
  DollarItem,
  ObstacleItem,
  PowerUpItem,
  Particle,
  FloatingText,
  HeroState,
  GameStats,
  GameStatus,
  DollarType,
  ObstacleType,
  PowerUpType,
} from '../types';
import { soundManager } from '../utils/audio';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: (stats: GameStats) => void;
  onStatsUpdate: (stats: GameStats, hero: HeroState) => void;
  onPauseToggle: () => void;
}

const CANVAS_WIDTH = 540;
const CANVAS_HEIGHT = 800;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  status,
  onGameOver,
  onStatsUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Persistent game state stored in refs to avoid React re-renders in 60fps loop
  const heroRef = useRef<HeroState>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 120,
    width: 44,
    height: 52,
    vx: 0,
    vy: 0,
    speed: 7.5,
    lives: 3,
    maxLives: 3,
    invulnerableTimer: 0,
    tilt: 0,
    hasShield: false,
    magnetTimer: 0,
    speedBoostTimer: 0,
    trail: [],
  });

  const statsRef = useRef<GameStats>({
    score: 0,
    dollarsCount: 0,
    distanceMeters: 0,
    combo: 1,
    maxCombo: 1,
    comboTimer: 0,
    highScore: 0,
  });

  const keysRef = useRef<{ [key: string]: boolean }>({});
  const touchPosRef = useRef<{ x: number; y: number; active: boolean } | null>(null);

  const dollarsRef = useRef<DollarItem[]>([]);
  const obstaclesRef = useRef<ObstacleItem[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Environment and pacing
  const gameSpeedRef = useRef<number>(4.2);
  const frameCountRef = useRef<number>(0);
  const screenShakeRef = useRef<number>(0);
  const roadOffsetRef = useRef<number>(0);

  // Load high score once
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dollar_dodger_highscore');
      if (saved) {
        statsRef.current.highScore = parseInt(saved, 10) || 0;
      }
    } catch {
      // ignore
    }
  }, []);

  // Spawn functions
  const spawnDollar = useCallback(() => {
    const lanePadding = 45;
    const x = lanePadding + Math.random() * (CANVAS_WIDTH - lanePadding * 2);
    const rand = Math.random();
    let type: DollarType = 'single';
    let value = 10;
    let width = 34;
    let height = 20;

    if (rand > 0.88) {
      type = 'bag';
      value = 100;
      width = 38;
      height = 42;
    } else if (rand > 0.65) {
      type = 'bundle';
      value = 50;
      width = 36;
      height = 24;
    }

    dollarsRef.current.push({
      id: Math.random().toString(),
      x,
      y: -50,
      width,
      height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: gameSpeedRef.current * (0.85 + Math.random() * 0.25),
      type,
      value,
      rotation: (Math.random() - 0.5) * 0.4,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
    });
  }, []);

  const spawnObstacle = useCallback(() => {
    const lanePadding = 50;
    const x = lanePadding + Math.random() * (CANVAS_WIDTH - lanePadding * 2);
    const types: ObstacleType[] = ['boulder', 'spike_ball', 'bomb', 'electric_mine'];
    const type = types[Math.floor(Math.random() * types.length)];

    let radius = 22;
    let vyMultiplier = 1.0;

    if (type === 'boulder') {
      radius = 24 + Math.random() * 8;
      vyMultiplier = 0.95;
    } else if (type === 'spike_ball') {
      radius = 20 + Math.random() * 6;
      vyMultiplier = 1.1;
    } else if (type === 'bomb') {
      radius = 18;
      vyMultiplier = 1.25;
    } else if (type === 'electric_mine') {
      radius = 20;
      vyMultiplier = 0.85;
    }

    obstaclesRef.current.push({
      id: Math.random().toString(),
      x,
      y: -60,
      radius,
      vx: type === 'electric_mine' ? (Math.random() > 0.5 ? 1.5 : -1.5) : (Math.random() - 0.5) * 0.8,
      vy: gameSpeedRef.current * vyMultiplier,
      type,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      pulseTimer: 0,
    });
  }, []);

  const spawnPowerUp = useCallback(() => {
    // Rare spawn
    if (Math.random() > 0.35) return;
    const lanePadding = 60;
    const x = lanePadding + Math.random() * (CANVAS_WIDTH - lanePadding * 2);
    const types: PowerUpType[] = ['magnet', 'shield', 'speed_boost'];
    const type = types[Math.floor(Math.random() * types.length)];

    powerUpsRef.current.push({
      id: Math.random().toString(),
      x,
      y: -50,
      radius: 18,
      vy: gameSpeedRef.current * 0.9,
      type,
      pulseTimer: 0,
    });
  }, []);

  const addParticles = useCallback((x: number, y: number, color: string, count: number, type?: 'circle' | 'spark' | 'dollar') => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        color,
        size: 2.5 + Math.random() * 3.5,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 25,
        type: type || 'circle',
      });
    }
  }, []);

  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      alpha: 1,
      scale: 1.2,
      vy: -1.6,
    });
  }, []);

  // Reset all objects for a new game
  const resetGame = useCallback(() => {
    heroRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 120,
      width: 44,
      height: 52,
      vx: 0,
      vy: 0,
      speed: 7.5,
      lives: 3,
      maxLives: 3,
      invulnerableTimer: 60, // brief spawn shield
      tilt: 0,
      hasShield: false,
      magnetTimer: 0,
      speedBoostTimer: 0,
      trail: [],
    };

    let high = 0;
    try {
      const saved = localStorage.getItem('dollar_dodger_highscore');
      if (saved) high = parseInt(saved, 10) || 0;
    } catch {
      // ignore
    }

    statsRef.current = {
      score: 0,
      dollarsCount: 0,
      distanceMeters: 0,
      combo: 1,
      maxCombo: 1,
      comboTimer: 0,
      highScore: high,
    };

    dollarsRef.current = [];
    obstaclesRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    gameSpeedRef.current = 4.2;
    frameCountRef.current = 0;
    screenShakeRef.current = 0;
    touchPosRef.current = null;
  }, []);

  // When status changes to playing from idle or gameover, reset
  useEffect(() => {
    if (status === 'playing') {
      resetGame();
    }
  }, [status, resetGame]);

  // Keyboard and Touch listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      keysRef.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch and pointer tracking on canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    touchPosRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      active: true,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!touchPosRef.current?.active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    touchPosRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      active: true,
    };
  };

  const handlePointerUp = () => {
    if (touchPosRef.current) {
      touchPosRef.current.active = false;
    }
  };

  // Main game animation loop
  useEffect(() => {
    let animationFrameId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateAndRender = () => {
      if (status === 'playing') {
        frameCountRef.current++;
        const hero = heroRef.current;
        const stats = statsRef.current;

        // Difficulty progression: gradually increase game speed
        gameSpeedRef.current = 4.2 + Math.min(8.0, (stats.distanceMeters / 150) * 0.45);
        const currentSpeed = hero.speedBoostTimer > 0 ? hero.speed * 1.35 : hero.speed;

        // Update timers
        if (hero.invulnerableTimer > 0) hero.invulnerableTimer--;
        if (hero.magnetTimer > 0) hero.magnetTimer--;
        if (hero.speedBoostTimer > 0) hero.speedBoostTimer--;

        // Combo timeout decay
        if (stats.comboTimer > 0) {
          stats.comboTimer--;
          if (stats.comboTimer === 0 && stats.combo > 1) {
            stats.combo = 1;
          }
        }

        // Distance traveled
        stats.distanceMeters += Math.round(gameSpeedRef.current * 0.12);
        roadOffsetRef.current = (roadOffsetRef.current + gameSpeedRef.current) % 60;

        // Handle Player Input
        let moveX = 0;
        let moveY = 0;

        // Keys
        const k = keysRef.current;
        if (k['ArrowLeft'] || k['KeyA']) moveX -= 1;
        if (k['ArrowRight'] || k['KeyD']) moveX += 1;
        if (k['ArrowUp'] || k['KeyW']) moveY -= 1;
        if (k['ArrowDown'] || k['KeyS']) moveY += 1;

        // Touch / Mouse Pointer drag
        if (touchPosRef.current && touchPosRef.current.active) {
          const targetX = touchPosRef.current.x;
          const targetY = touchPosRef.current.y - 30; // Finger offset so hero is visible
          const dx = targetX - hero.x;
          const dy = targetY - hero.y;
          if (Math.abs(dx) > 4) moveX = Math.sign(dx) * Math.min(1, Math.abs(dx) / 30);
          if (Math.abs(dy) > 4) moveY = Math.sign(dy) * Math.min(1, Math.abs(dy) / 30);
        }

        // Apply velocity with smooth acceleration and damping
        hero.vx = moveX * currentSpeed;
        hero.vy = moveY * (currentSpeed * 0.8);

        hero.x += hero.vx;
        hero.y += hero.vy;

        // Boundaries
        const halfW = hero.width / 2;
        const halfH = hero.height / 2;
        const minX = 25 + halfW;
        const maxX = CANVAS_WIDTH - 25 - halfW;
        const minY = 60 + halfH;
        const maxY = CANVAS_HEIGHT - 35 - halfH;

        if (hero.x < minX) hero.x = minX;
        if (hero.x > maxX) hero.x = maxX;
        if (hero.y < minY) hero.y = minY;
        if (hero.y > maxY) hero.y = maxY;

        // Hero tilt based on horizontal movement
        const targetTilt = (hero.vx / currentSpeed) * 0.35;
        hero.tilt += (targetTilt - hero.tilt) * 0.2;

        // Player trail
        if (frameCountRef.current % 3 === 0) {
          hero.trail.push({ x: hero.x, y: hero.y, alpha: 0.6 });
          if (hero.trail.length > 6) hero.trail.shift();
        }
        hero.trail.forEach((t) => (t.alpha -= 0.08));
        hero.trail = hero.trail.filter((t) => t.alpha > 0.05);

        // Screen shake decay
        if (screenShakeRef.current > 0) {
          screenShakeRef.current *= 0.88;
          if (screenShakeRef.current < 0.2) screenShakeRef.current = 0;
        }

        // Spawning intervals
        const dollarSpawnInterval = Math.max(26, 48 - Math.floor(stats.distanceMeters / 120));
        if (frameCountRef.current % dollarSpawnInterval === 0) {
          spawnDollar();
        }

        const obstacleSpawnInterval = Math.max(30, 68 - Math.floor(stats.distanceMeters / 90));
        if (frameCountRef.current % obstacleSpawnInterval === 0) {
          spawnObstacle();
        }

        if (frameCountRef.current % 340 === 0) {
          spawnPowerUp();
        }

        // --- UPDATE DOLLARS ---
        for (let i = dollarsRef.current.length - 1; i >= 0; i--) {
          const d = dollarsRef.current[i];
          d.y += d.vy;
          d.x += d.vx;
          d.rotation += d.rotationSpeed;

          // Magnet suction effect
          if (hero.magnetTimer > 0) {
            const dx = hero.x - d.x;
            const dy = hero.y - d.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 230 && dist > 1) {
              const pull = 8.5 * (1 - dist / 230);
              d.x += (dx / dist) * pull;
              d.y += (dy / dist) * pull;
            }
          }

          // Check collection
          const dx = hero.x - d.x;
          const dy = hero.y - d.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const collectRadius = 34;

          if (dist < collectRadius) {
            // Collected!
            const earnedValue = d.value * stats.combo;
            stats.score += earnedValue;
            stats.dollarsCount += 1;

            // Combo growth
            stats.combo = Math.min(5, stats.combo + 1);
            if (stats.combo > stats.maxCombo) {
              stats.maxCombo = stats.combo;
            }
            stats.comboTimer = 180; // 3 seconds at 60fps

            // Update high score in real time
            if (stats.score > stats.highScore) {
              stats.highScore = stats.score;
              try {
                localStorage.setItem('dollar_dodger_highscore', String(stats.highScore));
              } catch {
                // ignore
              }
            }

            // Sound
            if (d.type === 'bag') {
              soundManager.playBigCash();
              addParticles(d.x, d.y, '#facc15', 18, 'spark');
              addParticles(d.x, d.y, '#22c55e', 10, 'dollar');
              addFloatingText(d.x, d.y, `+$${earnedValue} MEGA!`, '#facc15');
            } else if (d.type === 'bundle') {
              soundManager.playBigCash();
              addParticles(d.x, d.y, '#22c55e', 14, 'spark');
              addFloatingText(d.x, d.y, `+$${earnedValue}`, '#4ade80');
            } else {
              soundManager.playDollarCollect(stats.combo);
              addParticles(d.x, d.y, '#4ade80', 8, 'spark');
              addFloatingText(d.x, d.y, `+$${earnedValue}`, '#86efac');
            }

            dollarsRef.current.splice(i, 1);
            continue;
          }

          // Remove if off screen
          if (d.y > CANVAS_HEIGHT + 60) {
            dollarsRef.current.splice(i, 1);
          }
        }

        // --- UPDATE OBSTACLES ---
        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current[i];
          obs.y += obs.vy;
          obs.x += obs.vx;
          obs.rotation += obs.rotationSpeed;
          if (obs.pulseTimer !== undefined) obs.pulseTimer += 0.05;

          // Bounce off side barriers
          if (obs.x < 35 + obs.radius || obs.x > CANVAS_WIDTH - 35 - obs.radius) {
            obs.vx = -obs.vx;
          }

          // Collision with Hero
          const dx = hero.x - obs.x;
          const dy = hero.y - obs.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const hitRadius = (hero.width / 2.2) + (obs.radius * 0.85);

          if (dist < hitRadius && hero.invulnerableTimer === 0) {
            // Hero hit!
            if (hero.hasShield) {
              // Shield absorbs the blow
              hero.hasShield = false;
              hero.invulnerableTimer = 45; // brief grace period
              soundManager.playShieldBlock();
              screenShakeRef.current = 8;
              addParticles(hero.x, hero.y, '#38bdf8', 22, 'spark');
              addFloatingText(hero.x, hero.y - 20, 'SHIELD BROKEN!', '#38bdf8');
              obstaclesRef.current.splice(i, 1);
              continue;
            }

            // Normal damage
            hero.lives -= 1;
            hero.invulnerableTimer = 90; // 1.5 seconds invulnerability
            stats.combo = 1; // reset combo
            stats.comboTimer = 0;
            screenShakeRef.current = 16;
            soundManager.playHit();
            addParticles(hero.x, hero.y, '#ef4444', 24, 'circle');
            addFloatingText(hero.x, hero.y - 20, '-1 LIFE!', '#f87171');

            obstaclesRef.current.splice(i, 1);

            if (hero.lives <= 0) {
              // Game over!
              soundManager.playGameOver();
              onGameOver(stats);
              break;
            }
            continue;
          }

          // Remove if off screen
          if (obs.y > CANVAS_HEIGHT + 80) {
            obstaclesRef.current.splice(i, 1);
          }
        }

        // --- UPDATE POWER-UPS ---
        for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
          const p = powerUpsRef.current[i];
          p.y += p.vy;
          p.pulseTimer += 0.06;

          const dx = hero.x - p.x;
          const dy = hero.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 36) {
            // Powerup collected
            soundManager.playPowerUp();
            if (p.type === 'magnet') {
              hero.magnetTimer = 540; // ~9 seconds
              addFloatingText(hero.x, hero.y - 25, 'MAGNET ACTIVE!', '#60a5fa');
              addParticles(p.x, p.y, '#60a5fa', 16, 'spark');
            } else if (p.type === 'shield') {
              hero.hasShield = true;
              addFloatingText(hero.x, hero.y - 25, 'SHIELD READY!', '#38bdf8');
              addParticles(p.x, p.y, '#38bdf8', 16, 'spark');
            } else if (p.type === 'speed_boost') {
              hero.speedBoostTimer = 420; // 7 seconds
              addFloatingText(hero.x, hero.y - 25, 'TURBO BOOST!', '#fbbf24');
              addParticles(p.x, p.y, '#fbbf24', 16, 'spark');
            }
            powerUpsRef.current.splice(i, 1);
            continue;
          }

          if (p.y > CANVAS_HEIGHT + 50) {
            powerUpsRef.current.splice(i, 1);
          }
        }

        // --- UPDATE PARTICLES ---
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const pt = particlesRef.current[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.12; // gravity
          pt.life++;
          pt.alpha = 1 - pt.life / pt.maxLife;

          if (pt.life >= pt.maxLife) {
            particlesRef.current.splice(i, 1);
          }
        }

        // --- UPDATE FLOATING TEXT ---
        for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
          const ft = floatingTextsRef.current[i];
          ft.y += ft.vy;
          ft.alpha -= 0.024;
          if (ft.alpha <= 0) {
            floatingTextsRef.current.splice(i, 1);
          }
        }

        // Periodic callback to update outer HUD (every 4 frames)
        if (frameCountRef.current % 4 === 0) {
          onStatsUpdate({ ...stats }, { ...hero });
        }
      }

      // ==========================================
      // --- RENDER PIPELINE ---
      // ==========================================
      ctx.save();

      // Screen shake transform
      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(shakeX, shakeY);
      }

      // Background asphalt
      ctx.fillStyle = '#0f172a'; // Slate 900
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Scrolling road track
      const trackPadding = 25;
      const trackW = CANVAS_WIDTH - trackPadding * 2;
      const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(trackPadding, 0, trackW, CANVAS_HEIGHT);

      // Track borders (curbs with hazard stripes)
      const curbW = 12;
      ctx.fillStyle = '#334155';
      ctx.fillRect(trackPadding - curbW, 0, curbW, CANVAS_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH - trackPadding, 0, curbW, CANVAS_HEIGHT);

      // Neon lane guide stripes
      ctx.strokeStyle = '#38bdf822';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trackPadding + 4, 0);
      ctx.lineTo(trackPadding + 4, CANVAS_HEIGHT);
      ctx.moveTo(CANVAS_WIDTH - trackPadding - 4, 0);
      ctx.lineTo(CANVAS_WIDTH - trackPadding - 4, CANVAS_HEIGHT);
      ctx.stroke();

      // Road dash markings (scrolling)
      const dashLanes = [CANVAS_WIDTH * 0.33, CANVAS_WIDTH * 0.67];
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.setLineDash([28, 28]);
      ctx.lineDashOffset = -roadOffsetRef.current;

      dashLanes.forEach((lx) => {
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, CANVAS_HEIGHT);
        ctx.stroke();
      });
      ctx.setLineDash([]); // Reset line dash

      // Speed lines when turbo boost is active
      if (heroRef.current.speedBoostTimer > 0) {
        ctx.strokeStyle = '#fbbf2433';
        ctx.lineWidth = 2;
        for (let l = 0; l < 8; l++) {
          const sx = trackPadding + (l * trackW) / 8 + 15;
          const sy = ((frameCountRef.current * 14 + l * 80) % CANVAS_HEIGHT);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx, sy + 50);
          ctx.stroke();
        }
      }

      // --- RENDER DOLLARS ---
      dollarsRef.current.forEach((d) => {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);

        if (d.type === 'single') {
          // Dollar bill
          ctx.shadowColor = '#4ade80';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#15803d'; // dark green border
          ctx.beginPath();
          ctx.roundRect(-d.width / 2, -d.height / 2, d.width, d.height, 4);
          ctx.fill();

          ctx.fillStyle = '#22c55e'; // vivid green
          ctx.beginPath();
          ctx.roundRect(-d.width / 2 + 2, -d.height / 2 + 2, d.width - 4, d.height - 4, 2);
          ctx.fill();

          // $ symbol
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#f0fdf4';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 0);
        } else if (d.type === 'bundle') {
          // Stack of cash
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 12;

          // Bottom layers (depth)
          ctx.fillStyle = '#14532d';
          ctx.fillRect(-d.width / 2 + 2, -d.height / 2 + 4, d.width, d.height);
          ctx.fillStyle = '#166534';
          ctx.fillRect(-d.width / 2 + 1, -d.height / 2 + 2, d.width, d.height);

          // Top bill
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.roundRect(-d.width / 2, -d.height / 2, d.width, d.height, 4);
          ctx.fill();

          // Gold paper strap
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-5, -d.height / 2, 10, d.height);

          // Value
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$50', 0, 0);
        } else {
          // Money Bag ($100)
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 14;

          // Bag body
          ctx.fillStyle = '#ca8a04';
          ctx.beginPath();
          ctx.ellipse(0, 4, d.width / 2.2, d.height / 2.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Gold shine highlight
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(-d.width / 4, -2, 5, 0, Math.PI * 2);
          ctx.fill();

          // Tied neck
          ctx.fillStyle = '#a16207';
          ctx.fillRect(-d.width / 3.5, -d.height / 2.2, d.width / 1.75, 7);

          // Dollar insignia
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#451a03';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 5);
        }

        ctx.restore();
      });

      // --- RENDER POWER-UPS ---
      powerUpsRef.current.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        const pulse = 1 + Math.sin(p.pulseTimer * 4) * 0.12;
        ctx.scale(pulse, pulse);

        if (p.type === 'magnet') {
          // Blue glowing orb
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#1e3a8a';
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius - 2, 0, Math.PI * 2);
          ctx.stroke();

          // Magnet U shape
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 1, 8, Math.PI, 0, true);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-10, -5, 4, 5);
          ctx.fillRect(6, -5, 4, 5);
        } else if (p.type === 'shield') {
          // Cyan shield orb
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#0369a1';
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius - 2, 0, Math.PI * 2);
          ctx.stroke();

          // Shield emblem
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.moveTo(0, -9);
          ctx.lineTo(8, -4);
          ctx.lineTo(6, 4);
          ctx.lineTo(0, 9);
          ctx.lineTo(-6, 4);
          ctx.lineTo(-8, -4);
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'speed_boost') {
          // Amber speed lightning
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#fde68a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius - 2, 0, Math.PI * 2);
          ctx.stroke();

          // Lightning bolt
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fffbeb';
          ctx.beginPath();
          ctx.moveTo(1, -9);
          ctx.lineTo(-5, 0);
          ctx.lineTo(1, 0);
          ctx.lineTo(-1, 9);
          ctx.lineTo(5, -1);
          ctx.lineTo(-1, -1);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      // --- RENDER OBSTACLES ---
      obstaclesRef.current.forEach((obs) => {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        ctx.rotate(obs.rotation);

        if (obs.type === 'boulder') {
          // Craggy rock
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#64748b'; // Slate rock
          ctx.beginPath();
          const points = 7;
          for (let p = 0; p < points; p++) {
            const angle = (p / points) * Math.PI * 2;
            const r = obs.radius * (0.8 + 0.25 * Math.sin(p * 2.8));
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();

          // Dark crevices
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-obs.radius * 0.4, -obs.radius * 0.2);
          ctx.lineTo(obs.radius * 0.3, obs.radius * 0.4);
          ctx.moveTo(0, -obs.radius * 0.5);
          ctx.lineTo(obs.radius * 0.5, -obs.radius * 0.1);
          ctx.stroke();
        } else if (obs.type === 'spike_ball') {
          // Spiked iron mace
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#3f3f46';
          ctx.beginPath();
          ctx.arc(0, 0, obs.radius * 0.72, 0, Math.PI * 2);
          ctx.fill();

          // Protruding spikes
          ctx.fillStyle = '#dc2626';
          const spikes = 8;
          for (let s = 0; s < spikes; s++) {
            const angle = (s / spikes) * Math.PI * 2;
            const sx = Math.cos(angle) * (obs.radius * 1.05);
            const sy = Math.sin(angle) * (obs.radius * 1.05);
            const base1X = Math.cos(angle - 0.25) * (obs.radius * 0.65);
            const base1Y = Math.sin(angle - 0.25) * (obs.radius * 0.65);
            const base2X = Math.cos(angle + 0.25) * (obs.radius * 0.65);
            const base2Y = Math.sin(angle + 0.25) * (obs.radius * 0.65);

            ctx.beginPath();
            ctx.moveTo(base1X, base1Y);
            ctx.lineTo(sx, sy);
            ctx.lineTo(base2X, base2Y);
            ctx.closePath();
            ctx.fill();
          }

          // Center metallic ring
          ctx.fillStyle = '#71717a';
          ctx.beginPath();
          ctx.arc(0, 0, obs.radius * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'bomb') {
          // Red ticking bomb
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;

          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.arc(0, 2, obs.radius, 0, Math.PI * 2);
          ctx.fill();

          // Cap & fuse
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-3, -obs.radius - 4, 6, 5);

          // Hazard symbol or blinking core
          ctx.fillStyle = '#fef2f2';
          ctx.beginPath();
          ctx.arc(0, 2, obs.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', 0, 2);
        } else {
          // Electric mine
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 14;

          ctx.fillStyle = '#581c87';
          ctx.beginPath();
          ctx.arc(0, 0, obs.radius * 0.75, 0, Math.PI * 2);
          ctx.fill();

          // Electric arcing nodes
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2.5;
          const nodes = 4;
          for (let n = 0; n < nodes; n++) {
            const angle = (n / nodes) * Math.PI * 2;
            const nx = Math.cos(angle) * (obs.radius * 0.95);
            const ny = Math.sin(angle) * (obs.radius * 0.95);
            ctx.beginPath();
            ctx.arc(nx, ny, 3, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        ctx.restore();
      });

      // --- RENDER HERO ---
      const hero = heroRef.current;
      const isInvulnerable = hero.invulnerableTimer > 0;
      const shouldDrawHero = !isInvulnerable || Math.floor(frameCountRef.current / 4) % 2 === 0;

      // Draw Hero Trail
      hero.trail.forEach((t) => {
        ctx.save();
        ctx.globalAlpha = t.alpha * 0.5;
        ctx.fillStyle = hero.speedBoostTimer > 0 ? '#f59e0b' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(t.x, t.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (shouldDrawHero) {
        ctx.save();
        ctx.translate(hero.x, hero.y);
        ctx.rotate(hero.tilt);

        // Active Magnet field visualization
        if (hero.magnetTimer > 0) {
          ctx.save();
          const magnetRadius = 60 + Math.sin(frameCountRef.current * 0.15) * 6;
          ctx.strokeStyle = '#60a5fa44';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(0, 0, magnetRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Hero Billowing Cape (running physics)
        const capeWave = Math.sin(frameCountRef.current * 0.25) * 5;
        ctx.fillStyle = '#dc2626'; // Vivid crimson cape
        ctx.beginPath();
        ctx.moveTo(-12, -4);
        ctx.lineTo(-18 + capeWave, 26);
        ctx.lineTo(18 - capeWave, 26);
        ctx.lineTo(12, -4);
        ctx.closePath();
        ctx.fill();

        // Hero Torso & Suit
        ctx.fillStyle = '#1e293b'; // dark tactical runner suit
        ctx.beginPath();
        ctx.roundRect(-14, -10, 28, 30, 6);
        ctx.fill();

        // High-contrast gold chest emblem
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(7, 2);
        ctx.lineTo(0, 10);
        ctx.lineTo(-7, 2);
        ctx.closePath();
        ctx.fill();

        // Running Legs / Shoes
        const legOffset = Math.sin(frameCountRef.current * 0.3) * 6;
        ctx.fillStyle = '#f8fafc'; // White sneakers
        ctx.beginPath();
        ctx.roundRect(-12, 18 + legOffset, 8, 12, 3);
        ctx.roundRect(4, 18 - legOffset, 8, 12, 3);
        ctx.fill();

        // Hero Head & Helmet / Visor
        ctx.fillStyle = '#0284c7'; // Electric cyan athletic helmet
        ctx.beginPath();
        ctx.arc(0, -18, 14, 0, Math.PI * 2);
        ctx.fill();

        // Neon Visor (eyes looking forward)
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(-9, -21, 18, 7, 3);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Shield Bubble if active
        if (hero.hasShield) {
          ctx.save();
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 18;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.fillStyle = '#38bdf822';
          ctx.beginPath();
          ctx.arc(0, 2, 32, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Hex energy orbit
          const orbitAngle = frameCountRef.current * 0.05;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(Math.cos(orbitAngle) * 32, Math.sin(orbitAngle) * 32, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }

      // --- RENDER PARTICLES ---
      particlesRef.current.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 6;

        if (pt.type === 'spark') {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (pt.type === 'dollar') {
          ctx.font = `bold ${Math.round(pt.size * 3)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('$', pt.x, pt.y);
        } else {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // --- RENDER FLOATING TEXTS ---
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = ft.color;
        ctx.font = '900 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(updateAndRender);
    };

    animationFrameId = requestAnimationFrame(updateAndRender);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [status, onGameOver, onStatsUpdate, spawnDollar, spawnObstacle, spawnPowerUp, addParticles, addFloatingText]);

  return (
    <div
      ref={containerRef}
      id="game-canvas-container"
      className="relative w-full h-full max-w-[540px] max-h-[800px] flex items-center justify-center select-none overflow-hidden rounded-2xl shadow-2xl bg-slate-950 border border-slate-800"
    >
      <canvas
        ref={canvasRef}
        id="game-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full object-contain cursor-crosshair touch-none"
      />
    </div>
  );
};
