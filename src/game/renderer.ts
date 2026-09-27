import { WORLD, ClawPhysicsEngine } from './physics';
import { DOLL_TEMPLATES, drawPlushOnCanvas } from './dolls';
import { GameState } from '../types/game';

export class ClawRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    this.ctx = ctx;
  }

  public render(
    engine: ClawPhysicsEngine,
    gameState: GameState,
    timingGaugeValue: number = 0,
    cameraAngle: 'front' | 'radar' = 'front'
  ) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Scale from virtual coordinates (WORLD.width x WORLD.height) to canvas resolution
    const scaleX = width / WORLD.width;
    const scaleY = height / WORLD.height;
    ctx.scale(scaleX, scaleY);

    // 1. Cabinet Background
    this.drawCabinetBackground(ctx);

    // 2. Prize Chute Box (Left)
    this.drawPrizeChute(ctx);

    // 3. Dynamic Floor & Doll Shadows from Overhead Spotlights
    this.drawShadows(ctx, engine);

    // 4. Doll Pile
    this.drawDolls(ctx, engine);

    // 5. Acrylic Divider Barrier (with glass shine)
    this.drawAcrylicBarrier(ctx);

    // 6. Crane Rails, Trolley, Cable & 3-Prong Claw
    this.drawCrane(ctx, engine, gameState);

    // 7. Glass Reflections & Arcade Cabinet Lighting
    this.drawGlassReflections(ctx);

    // 8. Overhead Radar View overlay (if radar mode is on)
    if (cameraAngle === 'radar') {
      this.drawRadarView(ctx, engine);
    }

    ctx.restore();
  }

  private drawCabinetBackground(ctx: CanvasRenderingContext2D) {
    // Back mirror wall with vertical perspective gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    bgGrad.addColorStop(0, '#0F172A');     // Dark navy slate
    bgGrad.addColorStop(0.6, '#1E293B');   // Mid slate
    bgGrad.addColorStop(1, '#0F172A');     // Floor border

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    // Subtle arcade neon grid on back mirror
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 40; x < WORLD.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 70);
      ctx.lineTo(x, WORLD.floorY);
      ctx.stroke();
    }
    for (let y = 100; y < WORLD.floorY; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD.width, y);
      ctx.stroke();
    }

    // Floor surface
    const floorGrad = ctx.createLinearGradient(0, WORLD.floorY, 0, WORLD.height);
    floorGrad.addColorStop(0, '#1E293B');
    floorGrad.addColorStop(1, '#090D16');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, WORLD.floorY, WORLD.width, WORLD.height - WORLD.floorY);

    // Floor grid texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, WORLD.floorY);
    ctx.lineTo(WORLD.width, WORLD.floorY);
    ctx.stroke();

    // Overhead neon tube light
    const neonGrad = ctx.createLinearGradient(0, 0, WORLD.width, 0);
    neonGrad.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
    neonGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.6)');
    neonGrad.addColorStop(1, 'rgba(168, 85, 247, 0.4)');
    ctx.fillStyle = neonGrad;
    ctx.fillRect(15, 68, WORLD.width - 30, 4);

    // Soft spotlight cone from ceiling
    const spotGrad = ctx.createRadialGradient(
      WORLD.width * 0.5, 70, 20,
      WORLD.width * 0.5, WORLD.floorY * 0.7, 300
    );
    spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
    spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, 70, WORLD.width, WORLD.floorY - 70);
  }

  private drawPrizeChute(ctx: CanvasRenderingContext2D) {
    // Chute entrance cavity
    const chuteGrad = ctx.createLinearGradient(WORLD.chuteLeft, 0, WORLD.chuteRight, 0);
    chuteGrad.addColorStop(0, '#020617');
    chuteGrad.addColorStop(1, '#0B1120');

    ctx.fillStyle = chuteGrad;
    ctx.fillRect(WORLD.chuteLeft, WORLD.chuteBarrierTopY, WORLD.chuteRight - WORLD.chuteLeft, WORLD.height - WORLD.chuteBarrierTopY);

    // Chute border edge
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(WORLD.chuteLeft, WORLD.chuteBarrierTopY, WORLD.chuteRight - WORLD.chuteLeft, WORLD.height - WORLD.chuteBarrierTopY);

    // Glow label inside chute: "EXIT / 경품구"
    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▼ 경품 나오는 곳 ▼', (WORLD.chuteLeft + WORLD.chuteRight) * 0.5, WORLD.chuteBarrierTopY + 35);
    ctx.restore();

    // Red-white caution striped edge on chute threshold
    ctx.save();
    ctx.beginPath();
    ctx.rect(WORLD.chuteLeft, WORLD.chuteBarrierTopY - 4, WORLD.chuteRight - WORLD.chuteLeft, 4);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    ctx.restore();
  }

  private drawAcrylicBarrier(ctx: CanvasRenderingContext2D) {
    const x = WORLD.chuteBarrierX;
    const topY = WORLD.chuteBarrierTopY;
    const bottomY = WORLD.floorY;
    const barrierWidth = 8;

    // Transparent acrylic pillar
    ctx.save();
    const acrylicGrad = ctx.createLinearGradient(x - 2, 0, x + barrierWidth + 2, 0);
    acrylicGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    acrylicGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.2)');
    acrylicGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.1)');
    acrylicGrad.addColorStop(1, 'rgba(255, 255, 255, 0.6)');

    ctx.fillStyle = acrylicGrad;
    ctx.fillRect(x, topY, barrierWidth, bottomY - topY);

    // Acrylic rounded cap on top
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(x + barrierWidth * 0.5, topY, barrierWidth * 0.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle hazard marks on the acrylic barrier
    ctx.fillStyle = 'rgba(245, 158, 11, 0.6)';
    for (let y = topY + 20; y < bottomY; y += 35) {
      ctx.fillRect(x + 1, y, barrierWidth - 2, 6);
    }

    ctx.restore();
  }

  private drawShadows(ctx: CanvasRenderingContext2D, engine: ClawPhysicsEngine) {
    const hub = engine.getClawHubPosition();
    
    // Claw projection shadow on the ground (guides player positioning!)
    const shadowY = WORLD.floorY - 6;
    const shadowDist = WORLD.floorY - hub.y;
    const shadowScale = Math.max(0.4, Math.min(1.4, shadowDist / 200));
    const shadowAlpha = Math.max(0.12, 0.45 - shadowDist / 600);

    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(hub.x, shadowY, 32 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crosshair target in shadow for precise aiming
    ctx.strokeStyle = `rgba(56, 189, 248, ${shadowAlpha * 0.8})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(hub.x, shadowY, 14 * shadowScale, 0, Math.PI * 2);
    ctx.moveTo(hub.x - 18 * shadowScale, shadowY);
    ctx.lineTo(hub.x + 18 * shadowScale, shadowY);
    ctx.moveTo(hub.x, shadowY - 8 * shadowScale);
    ctx.lineTo(hub.x, shadowY + 8 * shadowScale);
    ctx.stroke();
    ctx.restore();
  }

  private drawDolls(ctx: CanvasRenderingContext2D, engine: ClawPhysicsEngine) {
    // Sort dolls: background dolls first, gripped doll on top
    const sorted = [...engine.dolls].sort((a, b) => {
      if (a.isGripped) return 1;
      if (b.isGripped) return -1;
      return a.y - b.y;
    });

    for (const d of sorted) {
      const tmpl = DOLL_TEMPLATES[d.templateId];
      if (!tmpl) continue;

      // If doll is caught and has fallen deep down the chute
      if (d.isCaught && d.y > WORLD.height + 40) continue;

      drawPlushOnCanvas(
        ctx,
        tmpl,
        d.x,
        d.y,
        d.angle,
        d.squishX,
        d.squishY,
        1.0
      );
    }
  }

  private drawCrane(ctx: CanvasRenderingContext2D, engine: ClawPhysicsEngine, gameState: GameState) {
    const claw = engine.claw;
    const trolleyX = claw.trolleyX;
    const hub = engine.getClawHubPosition();

    // 1. Overhead stainless steel gantry rails
    ctx.fillStyle = '#334155';
    ctx.fillRect(10, 72, WORLD.width - 20, 6);
    ctx.fillStyle = '#475569';
    ctx.fillRect(10, 78, WORLD.width - 20, 4);

    // 2. Motor trolley carriage
    ctx.save();
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(trolleyX - 24, 62, 48, 22, 4);
    ctx.fill();
    ctx.stroke();

    // Trolley status LED
    ctx.fillStyle = gameState === 'READY' ? '#10B981' : gameState === 'DROPPING' || gameState === 'GRABBING' ? '#EF4444' : '#F59E0B';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(trolleyX, 72, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // 3. Braided steel hoist cable
    ctx.save();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(trolleyX, 84);
    ctx.lineTo(hub.x, hub.y);
    ctx.stroke();

    // Subtle cable texture segments
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    const cableSteps = Math.floor(claw.cableLength / 8);
    for (let i = 1; i < cableSteps; i++) {
      const t = i / cableSteps;
      const cx = trolleyX + (hub.x - trolleyX) * t;
      const cy = 84 + (hub.y - 84) * t;
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy);
      ctx.lineTo(cx + 2, cy);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Articulated 3-Prong Claw Head
    this.drawArticulatedClaw(ctx, hub.x, hub.y, claw.swayAngle, claw.clawAngle, engine.isPayoutCycle);
  }

  private drawArticulatedClaw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    swayAngle: number,
    clawAngle: number,
    isPayout: boolean
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(swayAngle);

    // Claw Hub & Pneumatic Cylinder
    const cylGrad = ctx.createLinearGradient(-14, 0, 14, 0);
    cylGrad.addColorStop(0, '#64748B');
    cylGrad.addColorStop(0.5, '#E2E8F0');
    cylGrad.addColorStop(1, '#475569');

    // Pneumatic piston shaft
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(-4, -14, 8, 14);

    // Main cylinder bell housing
    ctx.fillStyle = cylGrad;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-16, 0, 32, 18, 5);
    ctx.fill();
    ctx.stroke();

    // Internal spring coils
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, 5);
    ctx.lineTo(8, 7);
    ctx.lineTo(-8, 9);
    ctx.lineTo(8, 11);
    ctx.lineTo(-8, 13);
    ctx.stroke();

    // Central bolt
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(0, 9, 3, 0, Math.PI * 2);
    ctx.fill();

    // 3 Prongs:
    // Prongs spread based on clawAngle (0 = fully closed, 1 = wide open)
    // Arm length: Upper = 28, Lower Hook = 24
    const openFactor = clawAngle; // 0.15 to 0.85
    const baseAngle = 0.2 + openFactor * 0.55; // radians from center

    // Center/Rear prong (drawn first for depth)
    this.drawProng(ctx, 0, 14, 0, 24, 18, '#64748B', 0.8);

    // Left prong
    this.drawProng(ctx, -10, 14, -baseAngle, 30, 22, '#94A3B8', 1.0);

    // Right prong
    this.drawProng(ctx, 10, 14, baseAngle, 30, 22, '#94A3B8', 1.0);

    ctx.restore();
  }

  private drawProng(
    ctx: CanvasRenderingContext2D,
    pivotX: number,
    pivotY: number,
    angle: number,
    upperLen: number,
    hookLen: number,
    color: string,
    scale: number
  ) {
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    // Upper metal arm
    ctx.strokeStyle = color;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, upperLen);
    ctx.stroke();

    // Elbow pivot joint
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, upperLen, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Lower inward-curved hook
    ctx.save();
    ctx.translate(0, upperLen);
    // Inward curve
    const hookAngle = angle >= 0 ? -0.85 : 0.85;
    ctx.rotate(hookAngle);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, hookLen);
    ctx.stroke();

    // High-friction rubberized tip on claw prongs (red or black)
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, hookLen - 6);
    ctx.lineTo(0, hookLen);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  private drawGlassReflections(ctx: CanvasRenderingContext2D) {
    // Elegant diagonal glass sheen across the cabinet
    const glassGrad = ctx.createLinearGradient(0, 0, WORLD.width, WORLD.height);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.09)');
    glassGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
    glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
    glassGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.04)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = glassGrad;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    // Glass perimeter frame highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, WORLD.width - 8, WORLD.height - 8);
  }

  private drawRadarView(ctx: CanvasRenderingContext2D, engine: ClawPhysicsEngine) {
    // Top-down depth radar in upper right corner to assist alignment
    const radarW = 100;
    const radarH = 65;
    const rx = WORLD.width - radarW - 14;
    const ry = 95;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rx, ry, radarW, radarH, 6);
    ctx.fill();
    ctx.stroke();

    // Radar title
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('조감도 (TOP RADAR)', rx + 8, ry + 12);

    // Draw dolls as circles on radar
    const hub = engine.getClawHubPosition();
    for (const d of engine.dolls) {
      if (d.isCaught) continue;
      const dxRatio = (d.x - WORLD.minX) / (WORLD.maxX - WORLD.minX);
      const prX = rx + 10 + dxRatio * (radarW - 20);
      const prY = ry + 25 + (d.radius / 30) * 15;

      ctx.fillStyle = d.isGripped ? '#EF4444' : '#64748B';
      ctx.beginPath();
      ctx.arc(prX, prY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw claw crosshair on radar
    const clawRatio = (hub.x - WORLD.minX) / (WORLD.maxX - WORLD.minX);
    const crX = rx + 10 + Math.max(0, Math.min(1, clawRatio)) * (radarW - 20);
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(crX, ry + 32, 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
