import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ClawPhysicsEngine, WORLD } from '../game/physics';
import { ClawRenderer } from '../game/renderer';
import { DOLL_TEMPLATES } from '../game/dolls';
import { GameState, MachineConfig, GameStats } from '../types/game';
import { sound } from '../services/sound';
import { haptics } from '../services/haptics';
import confetti from 'canvas-confetti';
import { Sparkles, AlertCircle, HeartCrack, Award, Coins } from 'lucide-react';

interface ArcadeCabinetProps {
  engine: ClawPhysicsEngine;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  onWinDoll: (templateId: string) => void;
  onGameOver: () => void;
  radarActive: boolean;
  cameraAngle: 'front' | 'radar';
  inputX: number;
  isManualMoving: boolean;
  className?: string;
}

export const ArcadeCabinet: React.FC<ArcadeCabinetProps> = ({
  engine,
  gameState,
  setGameState,
  timeRemaining,
  setTimeRemaining,
  onWinDoll,
  onGameOver,
  radarActive,
  cameraAngle,
  inputX,
  isManualMoving,
  className = "relative w-full max-w-lg mx-auto flex flex-col items-center"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ClawRenderer | null>(null);
  const requestRef = useRef<number | null>(null);

  const [notification, setNotification] = useState<{
    type: 'win' | 'slip' | 'top_shake' | 'rim_bounce' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle HiDPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 480 * dpr;
    canvas.height = 620 * dpr;

    rendererRef.current = new ClawRenderer(canvas);
  }, []);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Advance Physics Engine
      engine.update(inputX, isManualMoving, gameState);

      // 2. State Machine Automation
      handleStateMachineStep();

      // 3. Render Canvas
      if (rendererRef.current) {
        rendererRef.current.render(engine, gameState, 0, cameraAngle);
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [engine, gameState, inputX, isManualMoving, cameraAngle]);

  // State Machine Step Logic
  const handleStateMachineStep = () => {
    if (gameState === 'DROPPING') {
      // Lower cable
      engine.claw.cableVelocity = WORLD.cableDropSpeed;
      engine.claw.cableLength += engine.claw.cableVelocity;
      engine.claw.clawTargetAngle = 0.85; // Open wide during descent

      // Check if claw has hit pile or reached max floor reach
      if (engine.checkDescentContact() || engine.claw.cableLength >= WORLD.floorY - WORLD.ceilingY - 30) {
        // Switch to grabbing
        setGameState('GRABBING');
        engine.claw.cableVelocity = 0;
        sound.stopMotor();

        // Close claws around dolls
        setTimeout(() => {
          const caughtDoll = engine.attemptGrip(0);
          if (caughtDoll) {
            // Gripped a doll!
          }
          // After brief grab clamp pause, begin lifting
          setTimeout(() => {
            setGameState('LIFTING');
          }, 450);
        }, 200);
      }
    } else if (gameState === 'LIFTING') {
      // Retract cable back to top
      engine.claw.cableVelocity = -WORLD.cableLiftSpeed;
      engine.claw.cableLength += engine.claw.cableVelocity;
      sound.startMotor(1.1);

      if (engine.claw.cableLength <= 30) {
        // Reached the top ceiling!
        engine.claw.cableLength = 30;
        engine.claw.cableVelocity = 0;
        sound.stopMotor();

        // Check if doll was lost during lift
        if (!engine.claw.grippedDollUid) {
          showNotification('slip', '놓쳤습니다!', '인형의 무게중심을 버티지 못하고 떨어졌습니다.');
          setTimeout(() => {
            setGameState('RESULT');
            onGameOver();
          }, 1200);
        } else {
          // Still holding doll! Begin moving horizontally toward chute
          setTimeout(() => {
            setGameState('RETURNING');
          }, 300);
        }
      }
    } else if (gameState === 'RETURNING') {
      // Check if gantry reached chute position (x = 75)
      if (Math.abs(engine.claw.trolleyX - 75) <= 3) {
        engine.claw.trolleyX = 75;
        engine.claw.trolleyVx = 0;
        sound.stopMotor();

        // Ready to open claw over chute
        setGameState('OPENING');
        setTimeout(() => {
          engine.releaseGrippedDoll(false, 'chute_drop');

          setGameState('EVALUATING');
          setTimeout(() => {
            evaluateOutcome();
          }, 1400);
        }, 400);
      }
    }
  };

  const evaluateOutcome = () => {
    // Check if any doll has fallen into the prize chute
    const caught = engine.dolls.find(d => d.isCaught);
    if (caught) {
      const tmpl = DOLL_TEMPLATES[caught.templateId];
      sound.playWin();
      haptics.victory();
      
      // Confetti burst!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      showNotification('win', '🎉 축하합니다! 인형 획득!', tmpl ? tmpl.catchQuote : '인형을 성공적으로 뽑았습니다!');
      onWinDoll(caught.templateId);
    } else {
      // Heartbreak! Might have bounced off the acrylic barrier or dropped outside
      showNotification('rim_bounce', '아깝다! 출구 턱걸이!', '출구 아크릴 턱에 부딪혀 통 안으로 다시 들어갔습니다.');
    }

    setGameState('RESULT');
    setTimeout(() => {
      onGameOver();
    }, 2800);
  };

  const showNotification = (
    type: 'win' | 'slip' | 'top_shake' | 'rim_bounce' | 'info',
    title: string,
    message: string
  ) => {
    setNotification({ type, title, message });
    setTimeout(() => {
      setNotification(null);
    }, 3200);
  };

  return (
    <div className={className}>
      {/* Arcade Marquee Header (Top Sign) */}
      <div className="w-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-x-2 border-t-2 border-neutral-700/80 rounded-t-2xl px-4 py-2.5 flex items-center justify-between shadow-lg relative overflow-hidden">
        {/* Neon Marquee Light */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-sky-400 to-amber-400 animate-pulse" />

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <h1 className="text-sm sm:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 uppercase">
            인형뽑기 MASTER
          </h1>
        </div>

        {/* Arcade Digital LED Display */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-black/90 px-2.5 py-1 rounded border border-rose-900/60 flex items-center gap-1 text-rose-500">
            <span className="text-[10px] text-neutral-500">TIMER</span>
            <span className="font-bold text-rose-400">{timeRemaining < 10 ? `0${timeRemaining}` : timeRemaining}</span>
          </div>

          <div className="bg-black/90 px-2.5 py-1 rounded border border-emerald-900/60 flex items-center gap-1 text-emerald-400">
            <span className="text-[10px] text-neutral-500">RATE</span>
            <span className="font-bold text-emerald-400">≤30%</span>
          </div>
        </div>
      </div>

      {/* Main Glass Cabinet Viewport */}
      <div className="relative w-full aspect-[480/620] bg-neutral-950 border-x-4 border-b-2 border-neutral-800 shadow-2xl overflow-hidden">
        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain block select-none"
        />

        {/* Ambient Corner Reflection Frame */}
        <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-sm" />

        {/* In-Game Notifications Toast Overlay */}
        {notification && (
          <div className="absolute top-16 left-4 right-4 z-30 flex items-center justify-center animate-bounce-short">
            <div
              className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md max-w-sm ${
                notification.type === 'win'
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
                  : notification.type === 'slip' || notification.type === 'top_shake'
                  ? 'bg-rose-950/90 border-rose-500 text-rose-100'
                  : 'bg-amber-950/90 border-amber-500 text-amber-100'
              }`}
            >
              {notification.type === 'win' ? (
                <Sparkles className="w-6 h-6 text-amber-300 shrink-0 animate-spin" />
              ) : (
                <HeartCrack className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <div className="text-xs font-black tracking-wide">{notification.title}</div>
                <div className="text-[11px] opacity-90 leading-tight mt-0.5">{notification.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* State Banner (Overlay for Coin Insert) */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-x-0 bottom-12 flex justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-black/80 border border-amber-500/50 backdrop-blur-sm shadow-lg animate-pulse flex items-center gap-2 text-amber-300 text-xs font-bold">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>하단의 [동전 투입] 버튼을 눌러 시작하세요!</span>
            </div>
          </div>
        )}
      </div>

      {/* Cabinet Lower Speaker & Prize Hopper Grille */}
      <div className="w-full bg-neutral-900 border-x-2 border-b-2 border-neutral-700/80 rounded-b-2xl p-2.5 flex items-center justify-between text-[11px] text-neutral-400 shadow-lg">
        <div className="flex items-center gap-2">
          {/* Speaker grille slots */}
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-neutral-800 rounded" />
            <div className="w-1 h-3 bg-neutral-800 rounded" />
            <div className="w-1 h-3 bg-neutral-800 rounded" />
          </div>
          <span className="font-semibold text-neutral-300">정통 아케이드 크레인 시스템</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>솔레노이드 장력 제어 작동 중</span>
        </div>
      </div>
    </div>
  );
};
