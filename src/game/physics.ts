import { DOLL_TEMPLATES } from './dolls';
import { ClawState, DollTemplate, MachineConfig, PhysicalDoll } from '../types/game';
import { sound } from '../services/sound';
import { haptics } from '../services/haptics';

export const WORLD = {
  width: 480,
  height: 620,
  floorY: 550,
  ceilingY: 85,
  minX: 135,          // Right side of acrylic barrier
  maxX: 440,
  trolleyMinX: 70,    // Can travel over chute
  trolleyMaxX: 430,
  chuteLeft: 25,
  chuteRight: 115,
  chuteBarrierX: 118, // Acrylic barrier top
  chuteBarrierTopY: 385,
  gravity: 0.28,
  cableDropSpeed: 4.8,
  cableLiftSpeed: 4.0,
  trolleySpeed: 3.8,
};

export class ClawPhysicsEngine {
  public dolls: PhysicalDoll[] = [];
  public claw: ClawState = {
    trolleyX: 280,
    trolleyVx: 0,
    cableLength: 30,
    cableVelocity: 0,
    swayAngle: 0,
    swayVelocity: 0,
    clawAngle: 0.85,        // 0.85 = open, 0.15 = closed
    clawTargetAngle: 0.85,
    tension: 80,            // 0 - 100%
    grippedDollUid: null,
    heldOffset: null,
    slipRiskFactor: 0
  };

  public isPayoutCycle: boolean = false;
  public config: MachineConfig = {
    difficulty: 'hard',
    maxWinRatePercent: 25,   // Strictly under 30%
    topShakeChance: 0.72,    // 72% chance of top tension slack if not payout
    slipChanceOnTilt: 0.65,
    timerSeconds: 30
  };

  private lastTrolleyX: number = 280;
  private shakeTimer: number = 0;
  public hasTriggeredMidSlip: boolean = false;
  public hasTriggeredTopShake: boolean = false;

  constructor() {
    this.initDollPile();
  }

  /**
   * Determine whether the current coin inserted qualifies for the payout cycle
   */
  public rollPayoutCycle(): boolean {
    if (this.config.difficulty === 'practice') {
      this.isPayoutCycle = true;
      return true;
    }
    // Hard mode: payout cycle strictly capped under 30% (nominal 22%~25%)
    const roll = Math.random() * 100;
    this.isPayoutCycle = roll <= this.config.maxWinRatePercent;
    this.hasTriggeredMidSlip = false;
    this.hasTriggeredTopShake = false;
    return this.isPayoutCycle;
  }

  /**
   * Spawn a rich, messy, realistic pile of plush dolls with random tilts and interlocks
   */
  public initDollPile() {
    this.dolls = [];
    const templateKeys = Object.keys(DOLL_TEMPLATES);
    
    // Spawn 14-16 dolls in 3-4 natural cascading layers
    const pileWidth = WORLD.maxX - WORLD.minX;
    const startX = WORLD.minX + 25;
    
    // Bottom base layer
    for (let i = 0; i < 6; i++) {
      const tmplKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];
      const tmpl = DOLL_TEMPLATES[tmplKey];
      const x = startX + (i / 5) * (pileWidth - 50) + (Math.random() * 20 - 10);
      const y = WORLD.floorY - tmpl.height * 0.45;
      this.dolls.push(this.createPhysicalDoll(tmpl, x, y, (Math.random() - 0.5) * 0.4));
    }

    // Second stacked layer
    for (let i = 0; i < 5; i++) {
      const tmplKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];
      const tmpl = DOLL_TEMPLATES[tmplKey];
      const x = startX + 20 + (i / 4) * (pileWidth - 90) + (Math.random() * 20 - 10);
      const y = WORLD.floorY - 55 - (Math.random() * 20);
      this.dolls.push(this.createPhysicalDoll(tmpl, x, y, (Math.random() - 0.5) * 0.8));
    }

    // Top layer (teasing targets)
    for (let i = 0; i < 4; i++) {
      // Make at least one golden piggy or rare dino on top
      const tmplKey = i === 1 ? 'golden_piggy' : i === 2 ? 'baby_dino' : templateKeys[Math.floor(Math.random() * templateKeys.length)];
      const tmpl = DOLL_TEMPLATES[tmplKey];
      const x = startX + 35 + (i / 3) * (pileWidth - 120) + (Math.random() * 15 - 7);
      const y = WORLD.floorY - 110 - (Math.random() * 25);
      this.dolls.push(this.createPhysicalDoll(tmpl, x, y, (Math.random() - 0.5) * 1.1));
    }

    // Settle pile with 40 fast physics steps
    for (let step = 0; step < 40; step++) {
      this.updateDollPhysicsOnly();
    }
  }

  private createPhysicalDoll(tmpl: DollTemplate, x: number, y: number, angle = 0): PhysicalDoll {
    return {
      uid: 'doll_' + Math.random().toString(36).substring(2, 9),
      templateId: tmpl.id,
      x,
      y,
      vx: 0,
      vy: 0,
      angle,
      angularVelocity: 0,
      width: tmpl.width,
      height: tmpl.height,
      radius: (tmpl.width + tmpl.height) * 0.25,
      mass: tmpl.mass,
      friction: tmpl.friction,
      isGripped: false,
      isCaught: false,
      squishX: 1.0,
      squishY: 1.0,
      settled: false
    };
  }

  /**
   * Reshuffle / shake the cabinet dolls
   */
  public shakeCabinet() {
    sound.playCabinetShake();
    haptics.cabinetShake();
    this.shakeTimer = 18;

    for (const d of this.dolls) {
      if (!d.isCaught && !d.isGripped) {
        d.vx += (Math.random() - 0.5) * 4.5;
        d.vy -= Math.random() * 4.0 + 2.0;
        d.angularVelocity += (Math.random() - 0.5) * 0.25;
        d.settled = false;
      }
    }
  }

  /**
   * Main Physics Tick (60 FPS)
   */
  public update(
    inputX: number,
    isManualMoving: boolean,
    gameState: string
  ) {
    if (this.shakeTimer > 0) {
      this.shakeTimer--;
    }

    // 1. Trolley kinematics
    this.updateTrolley(inputX, isManualMoving, gameState);

    // 2. Pendulum sway physics
    this.updatePendulumSway();

    // 3. Claw finger articulation & grip tension
    this.updateClawFingers();

    // 4. Gripped doll behavior & realistic drop mechanics
    this.updateGrippedDoll(gameState);

    // 5. Doll collisions and pile physics
    this.updateDolls();
  }

  private updateTrolley(inputX: number, isManualMoving: boolean, gameState: string) {
    if (gameState === 'READY') {
      const targetVx = inputX * WORLD.trolleySpeed;
      this.claw.trolleyVx += (targetVx - this.claw.trolleyVx) * 0.22;
      this.claw.trolleyX += this.claw.trolleyVx;

      // Restrict within right playable region
      if (this.claw.trolleyX < WORLD.minX + 15) {
        this.claw.trolleyX = WORLD.minX + 15;
        this.claw.trolleyVx = 0;
      }
      if (this.claw.trolleyX > WORLD.trolleyMaxX) {
        this.claw.trolleyX = WORLD.trolleyMaxX;
        this.claw.trolleyVx = 0;
      }

      if (Math.abs(this.claw.trolleyVx) > 0.4) {
        sound.startMotor(1.0);
      } else if (!isManualMoving) {
        sound.stopMotor();
      }
    } else if (gameState === 'RETURNING') {
      // Autopilot moving back towards chute (x = 75)
      const targetX = 75;
      const dx = targetX - this.claw.trolleyX;
      if (Math.abs(dx) > 2) {
        this.claw.trolleyVx = -WORLD.trolleySpeed * 0.85;
        this.claw.trolleyX += this.claw.trolleyVx;
        sound.startMotor(0.9);
      } else {
        this.claw.trolleyX = targetX;
        this.claw.trolleyVx = 0;
        sound.stopMotor();
      }
    } else {
      // Natural trolley friction
      this.claw.trolleyVx *= 0.8;
      this.claw.trolleyX += this.claw.trolleyVx;
    }
  }

  private updatePendulumSway() {
    // Trolley acceleration induces sway
    const trolleyAccel = (this.claw.trolleyX - this.lastTrolleyX) - this.claw.trolleyVx;
    this.lastTrolleyX = this.claw.trolleyX;

    const length = Math.max(40, this.claw.cableLength);
    const pendulumGravity = 0.35;
    
    // d2theta/dt2 = -(g/L)*sin(theta) - (a/L)*cos(theta) - damping
    const angularAccel = (-pendulumGravity / length) * Math.sin(this.claw.swayAngle) 
                         - (trolleyAccel / length) * 1.8 
                         - this.claw.swayVelocity * 0.035;

    this.claw.swayVelocity += angularAccel;
    this.claw.swayAngle += this.claw.swayVelocity;

    // Hard limit on sway to prevent unnatural flipping
    this.claw.swayAngle = Math.max(-0.45, Math.min(0.45, this.claw.swayAngle));
  }

  private updateClawFingers() {
    // Smooth transition between current angle and target angle
    const diff = this.claw.clawTargetAngle - this.claw.clawAngle;
    this.claw.clawAngle += diff * 0.16;
  }

  /**
   * Get the current claw hub tip position in world coordinates
   */
  public getClawHubPosition(): { x: number; y: number } {
    const cableY = WORLD.ceilingY + this.claw.cableLength;
    const swayX = Math.sin(this.claw.swayAngle) * (this.claw.cableLength * 0.5);
    return {
      x: this.claw.trolleyX + swayX,
      y: cableY
    };
  }

  /**
   * Check contact between claw and doll pile during descent
   */
  public checkDescentContact(): boolean {
    const hub = this.getClawHubPosition();
    const probeY = hub.y + 45; // Bottom prong reach

    // Floor contact
    if (probeY >= WORLD.floorY - 10) {
      return true;
    }

    // Plush pile surface contact
    for (const d of this.dolls) {
      if (d.isCaught) continue;
      const dx = d.x - hub.x;
      const dy = d.y - probeY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < d.radius + 15) {
        haptics.clawTouch();
        return true;
      }
    }
    return false;
  }

  /**
   * Attempt to grip a doll when claw prongs close
   */
  public attemptGrip(timingBonus: number = 0): PhysicalDoll | null {
    const hub = this.getClawHubPosition();
    const grabCenterY = hub.y + 35;

    // Find candidate dolls within prong radius
    let bestDoll: PhysicalDoll | null = null;
    let minDistance = 9999;

    for (const d of this.dolls) {
      if (d.isCaught) continue;
      const dx = d.x - hub.x;
      const dy = d.y - grabCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < d.radius + 28 && dist < minDistance) {
        bestDoll = d;
        minDistance = dist;
      }
    }

    if (!bestDoll) {
      this.claw.clawTargetAngle = 0.15; // Closes empty
      this.claw.grippedDollUid = null;
      sound.playClawGrab(false);
      haptics.clawGrip();
      return null;
    }

    // Evaluate grip quality
    const tmpl = DOLL_TEMPLATES[bestDoll.templateId];
    const dx = bestDoll.x - hub.x;
    const dy = bestDoll.y - grabCenterY;
    const eccentricity = Math.sqrt(dx * dx + dy * dy) / bestDoll.radius; // 0 = dead center, 1 = rim

    // How many prongs make firm contact?
    // Left prong (x < hub), Right prong (x > hub), Center/depth
    let prongsContact = 3;
    if (eccentricity > 0.45) prongsContact = 2;
    if (eccentricity > 0.85) prongsContact = 1;

    // Surface friction & weight penalty
    const slipRisk = (1.0 - tmpl.friction) * 0.4 + (tmpl.mass - 0.8) * 0.35 + eccentricity * 0.4 - timingBonus * 0.2;
    this.claw.slipRiskFactor = Math.max(0.05, Math.min(0.95, slipRisk));

    // Clamp prongs against doll surface
    this.claw.clawTargetAngle = 0.28 + (bestDoll.radius / 65) * 0.18;
    this.claw.grippedDollUid = bestDoll.uid;
    bestDoll.isGripped = true;

    // Relative offset to preserve during lift
    this.claw.heldOffset = {
      x: bestDoll.x - hub.x,
      y: bestDoll.y - hub.y,
      angle: bestDoll.angle - this.claw.swayAngle
    };

    // Soft squish deformation
    bestDoll.squishY = 0.82;
    bestDoll.squishX = 1.14;

    sound.playClawGrab(true);
    haptics.clawGrip();

    return bestDoll;
  }

  /**
   * Gripped doll tracking & authentic mid-air dropping logic
   */
  private updateGrippedDoll(gameState: string) {
    if (!this.claw.grippedDollUid) return;

    const doll = this.dolls.find(d => d.uid === this.claw.grippedDollUid);
    if (!doll) {
      this.claw.grippedDollUid = null;
      return;
    }

    const hub = this.getClawHubPosition();

    // 1. Check for Mid-Air Slip ("중간에 놓아버리는 확률")
    if (gameState === 'LIFTING' && !this.hasTriggeredMidSlip) {
      // Between 40% and 80% height
      const liftProgress = 1 - (this.claw.cableLength - 30) / (WORLD.floorY - 100);
      
      if (liftProgress > 0.45 && liftProgress < 0.85) {
        // Tension heartbeat sound
        if (Math.random() < 0.12) {
          sound.playTensionPulse();
          haptics.liftPulse();
        }

        // Drop test:
        // If not in payout cycle AND high slip risk OR random mid-drop check
        const shouldSlipNow = (!this.isPayoutCycle && Math.random() < 0.025 * (this.claw.slipRiskFactor * 4)) ||
                              (this.claw.slipRiskFactor > 0.65 && Math.random() < 0.03);

        if (shouldSlipNow) {
          this.hasTriggeredMidSlip = true;
          this.releaseGrippedDoll(true, 'mid_air_slip');
          return;
        }
      }
    }

    // 2. Top Shake ("탑털기" - sudden deceleration at apex)
    if (gameState === 'LIFTING' && this.claw.cableLength <= 38 && !this.hasTriggeredTopShake) {
      this.hasTriggeredTopShake = true;
      if (!this.isPayoutCycle && Math.random() < this.config.topShakeChance) {
        // Famous arcade top shaker: sudden jerk loosens claw prongs!
        setTimeout(() => {
          this.releaseGrippedDoll(true, 'top_shake');
        }, 150);
        return;
      }
    }

    // 3. Movement Shake en-route to chute
    if (gameState === 'RETURNING') {
      // Sway momentum exerts centrifugal torque
      const swayForce = Math.abs(this.claw.swayVelocity) * 10;
      if (!this.isPayoutCycle && (this.claw.trolleyX > 130 && this.claw.trolleyX < 240)) {
        if (Math.random() < 0.035 || swayForce > 1.2) {
          this.releaseGrippedDoll(true, 'travel_drop');
          return;
        }
      }
    }

    // Keep doll synced with claw position while gripped
    if (this.claw.heldOffset) {
      doll.x = hub.x + this.claw.heldOffset.x;
      doll.y = hub.y + this.claw.heldOffset.y;
      doll.vx = this.claw.trolleyVx;
      doll.vy = this.claw.cableVelocity;
      doll.angle = this.claw.swayAngle + this.claw.heldOffset.angle;

      // Gradual relaxation of squish
      doll.squishY += (1.0 - doll.squishY) * 0.05;
      doll.squishX += (1.0 - doll.squishX) * 0.05;
    }
  }

  /**
   * Release doll (either dropped en-route or dropped at chute)
   */
  public releaseGrippedDoll(isSlip: boolean = false, reason: string = 'manual') {
    if (!this.claw.grippedDollUid) return;

    const doll = this.dolls.find(d => d.uid === this.claw.grippedDollUid);
    this.claw.grippedDollUid = null;
    this.claw.heldOffset = null;
    this.claw.clawTargetAngle = 0.85; // Open wide

    if (doll) {
      doll.isGripped = false;
      doll.settled = false;
      doll.vx = this.claw.trolleyVx * 1.2 + (Math.random() - 0.5) * 1.5;
      doll.vy = isSlip ? 1.0 : 0.5;
      doll.angularVelocity = (Math.random() - 0.5) * 0.18;

      if (isSlip) {
        sound.playSlip();
        haptics.dollSlip();
        // Give claw a sudden upward twitch reaction
        this.claw.swayVelocity += (Math.random() - 0.5) * 0.12;
      }
    }
  }

  /**
   * Update doll physics (gravity, doll-to-doll collisions, wall collisions, chute falling)
   */
  private updateDolls() {
    for (let i = 0; i < this.dolls.length; i++) {
      const d = this.dolls[i];
      if (d.isGripped) continue;

      // Apply gravity
      d.vy += WORLD.gravity * d.mass;
      d.vx *= 0.96; // air friction
      d.vy *= 0.98;
      d.angularVelocity *= 0.92;

      d.x += d.vx;
      d.y += d.vy;
      d.angle += d.angularVelocity;

      // Spring squish back to normal
      d.squishX += (1.0 - d.squishX) * 0.12;
      d.squishY += (1.0 - d.squishY) * 0.12;

      // Check Prize Chute Falling:
      // If doll is above chute opening (x between chuteLeft and chuteBarrierX)
      if (d.x >= WORLD.chuteLeft && d.x <= WORLD.chuteBarrierX - 5) {
        // Doll is over chute opening!
        if (d.y > WORLD.chuteBarrierTopY) {
          // Falling into prize chute!
          if (!d.isCaught && d.y > WORLD.floorY - 20) {
            d.isCaught = true;
            sound.playChuteDrop();
            haptics.chuteDrop();
          }
        }
      }

      // Acrylic Barrier Lip Collision (x = chuteBarrierX, top = chuteBarrierTopY)
      // Classic heartbreaking bounce off the acrylic edge!
      if (d.x < WORLD.chuteBarrierX + 15 && d.x > WORLD.chuteBarrierX - 15) {
        if (d.y >= WORLD.chuteBarrierTopY - 10 && d.y <= WORLD.floorY) {
          // Collision with barrier top edge or side
          if (d.y < WORLD.chuteBarrierTopY + 12) {
            // Hit top lip: bounce with high restitution
            d.y = WORLD.chuteBarrierTopY - 10;
            d.vy = -Math.abs(d.vy) * 0.45;
            // Chance to bounce back right into the pit or into chute
            d.vx += (d.x < WORLD.chuteBarrierX ? -2.2 : 2.5);
            d.angularVelocity += 0.2;
            sound.playButtonClick();
          } else {
            // Hit vertical barrier side
            if (d.x > WORLD.chuteBarrierX) {
              d.x = WORLD.chuteBarrierX + 15;
              d.vx = Math.abs(d.vx) * 0.5;
            } else {
              d.x = WORLD.chuteBarrierX - 15;
              d.vx = -Math.abs(d.vx) * 0.5;
            }
          }
        }
      }

      // Left Wall (for main cabinet or chute)
      if (d.x < WORLD.chuteLeft + d.radius * 0.5) {
        d.x = WORLD.chuteLeft + d.radius * 0.5;
        d.vx = Math.abs(d.vx) * 0.35;
      }

      // Right Glass Wall
      if (d.x > WORLD.maxX - d.radius * 0.5) {
        d.x = WORLD.maxX - d.radius * 0.5;
        d.vx = -Math.abs(d.vx) * 0.35;
      }

      // Main Floor (if to the right of acrylic barrier)
      if (d.x >= WORLD.chuteBarrierX - 5 && d.y > WORLD.floorY - d.height * 0.4) {
        d.y = WORLD.floorY - d.height * 0.4;
        d.vy = -d.vy * 0.22;
        d.vx *= d.friction;
        if (Math.abs(d.vy) < 0.4) d.vy = 0;
      }

      // Doll-to-Doll Collisions (smooth soft-body repulsion)
      for (let j = i + 1; j < this.dolls.length; j++) {
        const d2 = this.dolls[j];
        if (d2.isGripped) continue;

        const dx = d2.x - d.x;
        const dy = d2.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = (d.radius + d2.radius) * 0.92;

        if (dist < minDist && dist > 0.001) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          const totalMass = d.mass + d2.mass;
          const m1Ratio = d2.mass / totalMass;
          const m2Ratio = d.mass / totalMass;

          d.x -= nx * overlap * m1Ratio * 0.8;
          d.y -= ny * overlap * m1Ratio * 0.8;
          d2.x += nx * overlap * m2Ratio * 0.8;
          d2.y += ny * overlap * m2Ratio * 0.8;

          // Velocity impulse
          const relativeVx = d2.vx - d.vx;
          const relativeVy = d2.vy - d.vy;
          const impulse = (relativeVx * nx + relativeVy * ny) * 0.35;

          if (impulse < 0) {
            d.vx += nx * impulse * m1Ratio;
            d.vy += ny * impulse * m1Ratio;
            d2.vx -= nx * impulse * m2Ratio;
            d2.vy -= ny * impulse * m2Ratio;
          }

          // Friction shear
          d.angularVelocity += (Math.random() - 0.5) * 0.02;
        }
      }
    }
  }

  /**
   * Fast step without claw (for initial pile settling)
   */
  private updateDollPhysicsOnly() {
    this.updateDolls();
  }
}
