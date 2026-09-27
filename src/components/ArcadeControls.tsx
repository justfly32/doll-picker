import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState } from '../types/game';
import { sound } from '../services/sound';
import { haptics } from '../services/haptics';
import { 
  Coins, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  VibrateOff, 
  Eye, 
  Award, 
  Sliders,
  Maximize,
  Minimize
} from 'lucide-react';

interface ArcadeControlsProps {
  gameState: GameState;
  coins: number;
  timeRemaining: number;
  isPayoutCycle: boolean;
  onMoveInput: (x: number, isMoving: boolean) => void;
  onGrabPress: () => void;
  onInsertCoin: () => void;
  onShakeCabinet: () => void;
  onToggleCamera: () => void;
  onOpenCollection: () => void;
  onOpenInspector: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  radarActive: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const ArcadeControls: React.FC<ArcadeControlsProps> = ({
  gameState,
  coins,
  timeRemaining,
  isPayoutCycle,
  onMoveInput,
  onGrabPress,
  onInsertCoin,
  onShakeCabinet,
  onToggleCamera,
  onOpenCollection,
  onOpenInspector,
  soundEnabled,
  onToggleSound,
  hapticsEnabled,
  onToggleHaptics,
  radarActive,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  // Keyboard controls listener (ArrowLeft, ArrowRight, Spacebar)
  useEffect(() => {
    let keyLeft = false;
    let keyRight = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keyLeft = true;
        haptics.light();
        updateKeyMove();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keyRight = true;
        haptics.light();
        updateKeyMove();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        triggerGrab();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keyLeft = false;
        updateKeyMove();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keyRight = false;
        updateKeyMove();
      }
    };

    const updateKeyMove = () => {
      const input = (keyRight ? 1 : 0) - (keyLeft ? 1 : 0);
      onMoveInput(input, input !== 0);
      setKnobPos({ x: input * 24, y: 0 });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, onMoveInput]);

  // Touch & Mouse Joystick Handling
  const handlePointerStart = (clientX: number, clientY: number) => {
    if (gameState !== 'READY') return;
    setIsDragging(true);
    updateJoystick(clientX, clientY);
    haptics.light();
  };

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || gameState !== 'READY') return;
    updateJoystick(clientX, clientY);
  }, [isDragging, gameState]);

  const handlePointerEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onMoveInput(0, false);
    sound.stopMotor();
  }, [isDragging, onMoveInput]);

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = 36;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobPos({ x: kx, y: ky });

    // Normalized horizontal input (-1 to 1)
    const normX = Math.max(-1, Math.min(1, dx / maxRadius));
    onMoveInput(normX, Math.abs(normX) > 0.1);
  };

  useEffect(() => {
    const onGlobalPointerMove = (e: PointerEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const onGlobalPointerUp = () => {
      handlePointerEnd();
    };

    if (isDragging) {
      window.addEventListener('pointermove', onGlobalPointerMove);
      window.addEventListener('pointerup', onGlobalPointerUp);
      window.addEventListener('pointercancel', onGlobalPointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', onGlobalPointerMove);
      window.removeEventListener('pointerup', onGlobalPointerUp);
      window.removeEventListener('pointercancel', onGlobalPointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerEnd]);

  const triggerGrab = () => {
    if (gameState === 'READY' || gameState === 'DROPPING') {
      sound.playButtonClick();
      haptics.buttonClick();
      setIsButtonPressed(true);
      setTimeout(() => setIsButtonPressed(false), 180);
      onGrabPress();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-neutral-900 border-t border-neutral-800 p-3 sm:p-4 text-neutral-200">
      {/* Upper Status & Quick Action Row */}
      <div className="flex items-center justify-between mb-3 px-1">
        {/* Coin Insert / Balance */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playCoin();
              haptics.coinInsert();
              onInsertCoin();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-semibold tracking-wide transition active:scale-95 shadow-sm"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>동전 투입 (1,000원)</span>
          </button>
          <div className="text-xs font-mono text-neutral-400">
            보유: <span className="text-amber-300 font-bold">{coins}코인</span>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={onShakeCabinet}
            disabled={gameState !== 'IDLE' && gameState !== 'READY'}
            title="인형 흔들기 / 재배치"
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 disabled:opacity-40 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleCamera}
            title={radarActive ? "전면 시야로 전환" : "상단 레이더 뷰 켜기"}
            className={`p-1.5 rounded-md transition ${radarActive ? 'text-sky-400 bg-sky-500/10' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleSound}
            title={soundEnabled ? "효과음 끄기" : "효과음 켜기"}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleHaptics}
            title={hapticsEnabled ? "진동 끄기" : "진동 켜기"}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
          >
            {hapticsEnabled ? <Vibrate className="w-4 h-4 text-pink-400" /> : <VibrateOff className="w-4 h-4" />}
          </button>
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              title={isFullscreen ? "전체화면 종료" : "전체화면으로 보기"}
              className={`p-1.5 rounded-md transition ${
                isFullscreen
                  ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
              }`}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onOpenInspector}
            title="기계 장력 및 확률 분석기"
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenCollection}
            title="내 인형 보관함"
            className="p-1.5 rounded-md text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition"
          >
            <Award className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Arcade Control Deck: Joystick + Big Grab Button */}
      <div className="bg-neutral-950 rounded-2xl border border-neutral-800/80 p-3 sm:p-4 flex items-center justify-between shadow-inner relative overflow-hidden">
        {/* Subtle metallic texture highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* Left: Virtual Arcade Joystick */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-medium text-neutral-400 mb-1.5 tracking-wider">
            조이스틱 (크레인 이동)
          </div>
          <div
            ref={joystickBaseRef}
            onPointerDown={(e) => handlePointerStart(e.clientX, e.clientY)}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-neutral-900 border-2 border-neutral-700/80 relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none shadow-lg touch-none"
          >
            {/* Directional ticks */}
            <div className="absolute left-2 w-2 h-0.5 bg-neutral-600 rounded-full" />
            <div className="absolute right-2 w-2 h-0.5 bg-neutral-600 rounded-full" />
            <div className="absolute top-2 w-0.5 h-2 bg-neutral-600 rounded-full" />
            <div className="absolute bottom-2 w-0.5 h-2 bg-neutral-600 rounded-full" />

            {/* Red Arcade Joystick Ball Knob */}
            <div
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-800 border-2 border-red-400/80 shadow-md flex items-center justify-center relative pointer-events-none"
            >
              {/* Highlight sheen */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 rounded-full bg-white/40 blur-[1px]" />
              <div className="w-3 h-3 rounded-full bg-red-900/40" />
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">좌우 드래그 또는 방향키 (A/D)</div>
        </div>

        {/* Center: Instruction / Timer HUD */}
        <div className="flex flex-col items-center justify-center px-2 text-center min-w-[100px]">
          {gameState === 'IDLE' && (
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-amber-400 animate-pulse">동전을 넣어주세요</span>
              <span className="text-[10px] text-neutral-500 mt-0.5">난이도: 어려움</span>
            </div>
          )}

          {gameState === 'READY' && (
            <div className="flex flex-col items-center">
              <span className="text-xl font-mono font-black text-rose-400 tracking-wider">
                {timeRemaining < 10 ? `0${timeRemaining}` : timeRemaining}s
              </span>
              <span className="text-[10px] text-emerald-400 font-medium mt-0.5">조준 후 하강 버튼</span>
            </div>
          )}

          {gameState === 'DROPPING' && (
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-sky-400 animate-pulse">하강 중...</span>
              <span className="text-[10px] text-amber-400 mt-0.5">버튼 재입력 시 즉시 잡기!</span>
            </div>
          )}

          {gameState === 'GRABBING' && (
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-amber-400">집게 오므리는 중...</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">장력 체크 중</span>
            </div>
          )}

          {gameState === 'LIFTING' && (
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-yellow-400 animate-pulse">인형 인양 중!</span>
              <span className="text-[10px] text-rose-400 mt-0.5">낙하 주의 (심장 쫄깃)</span>
            </div>
          )}

          {gameState === 'RETURNING' && (
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-purple-400">출구로 이동 중...</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">흔들림 버티는 중</span>
            </div>
          )}

          {(gameState === 'OPENING' || gameState === 'EVALUATING' || gameState === 'RESULT') && (
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-emerald-400">결과 판정</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">출구 배출 확인</span>
            </div>
          )}
        </div>

        {/* Right: Big Arcade Grab Button */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-medium text-neutral-400 mb-1.5 tracking-wider">
            하강 / 잡기
          </div>
          <button
            onClick={triggerGrab}
            disabled={gameState !== 'READY' && gameState !== 'DROPPING'}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 flex items-center justify-center transition-all duration-75 select-none touch-none relative ${
              gameState === 'READY' || gameState === 'DROPPING'
                ? isButtonPressed
                  ? 'bg-red-700 border-red-500 translate-y-1 shadow-inner'
                  : 'bg-gradient-to-b from-red-500 via-red-600 to-red-700 border-red-400 shadow-[0_6px_0_#991B1B,0_10px_15px_rgba(239,68,68,0.3)] hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_#991B1B]'
                : 'bg-neutral-800 border-neutral-700 opacity-40 cursor-not-allowed shadow-none'
            }`}
          >
            {/* Outer LED Ring effect */}
            <div className="absolute inset-1.5 rounded-full border border-white/30 pointer-events-none" />

            <div className="flex flex-col items-center">
              <span className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow">
                {gameState === 'DROPPING' ? '즉시 잡기' : '하 강'}
              </span>
              <span className="text-[9px] text-red-100 font-medium uppercase tracking-wider">
                {gameState === 'DROPPING' ? 'STOP' : 'GRAB'}
              </span>
            </div>
          </button>
          <div className="text-[10px] text-neutral-500 mt-1">스페이스바 / 터치</div>
        </div>
      </div>
    </div>
  );
};
