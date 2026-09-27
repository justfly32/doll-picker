/**
 * Type definitions for Arcade Claw Machine (인형뽑기)
 */

export type GameState =
  | 'IDLE'          // Waiting for coin insert
  | 'READY'         // Coin inserted, player can move crane (timer running)
  | 'DROPPING'      // Claw descending to grab
  | 'GRABBING'      // Prongs closing & evaluating grip
  | 'LIFTING'       // Lifting doll up (mid-air drop checks)
  | 'RETURNING'     // Moving horizontally back to prize chute
  | 'OPENING'       // Claw opening at chute drop point
  | 'EVALUATING'    // Checking if doll landed in chute
  | 'RESULT';       // Win or heartbreak fail outcome

export type DollRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';

export interface DollTemplate {
  id: string;
  name: string;
  category: string;
  rarity: DollRarity;
  description: string;
  color: string;
  secondaryColor: string;
  earColor?: string;
  accentColor: string;
  width: number;       // Base visual width in pixels
  height: number;      // Base visual height in pixels
  mass: number;        // Physical weight (1.0 = normal, 1.8 = heavy)
  friction: number;    // Surface friction (0.28 = very slippery, 0.55 = good grip)
  gripDifficulty: number; // 1 to 5 stars (5 = hardest to hold)
  centerOffset: { x: number; y: number }; // Center of mass offset from center
  catchQuote: string;
}

export interface PhysicalDoll {
  uid: string;
  templateId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;       // in radians
  angularVelocity: number;
  width: number;
  height: number;
  radius: number;      // effective collision radius
  mass: number;
  friction: number;
  isGripped: boolean;  // currently held by claw
  isCaught: boolean;   // fell into prize chute
  squishX: number;     // soft-body deformation factor (1.0 = normal)
  squishY: number;
  settled: boolean;
}

export interface ClawState {
  trolleyX: number;       // 0 to cabinet width
  trolleyVx: number;
  cableLength: number;    // current cable extension (from top)
  cableVelocity: number;
  swayAngle: number;      // pendulum sway angle in radians
  swayVelocity: number;
  clawAngle: number;      // 0 = tightly closed, 1 = wide open
  clawTargetAngle: number;
  tension: number;        // current grip force (0 to 100%)
  grippedDollUid: string | null;
  heldOffset: { x: number; y: number; angle: number } | null;
  slipRiskFactor: number; // how likely to slip (based on grip quality)
}

export interface GameStats {
  gamesPlayed: number;
  dollsWon: number;
  coinsSpent: number;
  currentStreak: number;
  bestStreak: number;
}

export interface MachineConfig {
  difficulty: 'hard' | 'practice';
  maxWinRatePercent: number; // strictly 28% for hard mode
  topShakeChance: number;    // probability of intermediate tension drop
  slipChanceOnTilt: number;  // chance of slipping if doll tilts
  timerSeconds: number;      // 30s per coin
}
