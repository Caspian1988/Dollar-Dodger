export type DollarType = 'single' | 'bundle' | 'bag';

export interface DollarItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  type: DollarType;
  value: number;
  rotation: number;
  rotationSpeed: number;
}

export type ObstacleType = 'boulder' | 'spike_ball' | 'bomb' | 'electric_mine';

export interface ObstacleItem {
  id: string;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  type: ObstacleType;
  rotation: number;
  rotationSpeed: number;
  pulseTimer?: number;
}

export type PowerUpType = 'magnet' | 'shield' | 'speed_boost';

export interface PowerUpItem {
  id: string;
  x: number;
  y: number;
  radius: number;
  vy: number;
  type: PowerUpType;
  pulseTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'circle' | 'spark' | 'dollar';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
}

export interface HeroState {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  speed: number;
  lives: number;
  maxLives: number;
  invulnerableTimer: number;
  tilt: number;
  hasShield: boolean;
  magnetTimer: number;
  speedBoostTimer: number;
  trail: { x: number; y: number; alpha: number }[];
}

export interface GameStats {
  score: number;
  dollarsCount: number;
  distanceMeters: number;
  combo: number;
  maxCombo: number;
  comboTimer: number;
  highScore: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';
