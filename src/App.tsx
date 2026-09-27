/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ClawPhysicsEngine } from './game/physics';
import { ArcadeCabinet } from './components/ArcadeCabinet';
import { ArcadeControls } from './components/ArcadeControls';
import { CollectionModal } from './components/CollectionModal';
import { TensionInspectorModal } from './components/TensionInspectorModal';
import { GameState, GameStats } from './types/game';
import { DOLL_TEMPLATES } from './game/dolls';
import { sound } from './services/sound';
import { haptics } from './services/haptics';
import { 
  Trophy, 
  Sliders, 
  Maximize, 
  Minimize, 
  Cpu, 
  Activity, 
  Coins, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

const STATS_STORAGE_KEY = 'arcade_claw_stats_v1';
const COLLECTION_STORAGE_KEY = 'arcade_claw_collection_v1';

export default function App() {
  // Master Physics Engine Instance
  const engine = useMemo(() => new ClawPhysicsEngine(), []);

  // Game State
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [coins, setCoins] = useState<number>(10);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [isPayoutCycle, setIsPayoutCycle] = useState<boolean>(false);
  const [cameraAngle, setCameraAngle] = useState<'front' | 'radar'>('front');

  // Interactive Moving Input (-1 to 1)
  const [inputX, setInputX] = useState<number>(0);
  const [isManualMoving, setIsManualMoving] = useState<boolean>(false);

  // Settings & Toggles
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [isCollectionOpen, setIsCollectionOpen] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Stats & Collection with LocalStorage persistence
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      gamesPlayed: 0,
      dollsWon: 0,
      coinsSpent: 0,
      currentStreak: 0,
      bestStreak: 0
    };
  });

  const [caughtDollIds, setCaughtDollIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COLLECTION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Fullscreen Change Listener
  useEffect(() => {
    const onFullscreenChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element };
      setIsFullscreen(!!(document.fullscreenElement || doc.webkitFullscreenElement));
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      const docEl = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void>;
        webkitFullscreenElement?: Element;
      };

      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch (e) {
      console.warn('Fullscreen toggle failed:', e);
    }
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(caughtDollIds));
    } catch {
      // ignore
    }
  }, [caughtDollIds]);

  // Audio & Haptic Sync
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
    if (next) sound.playButtonClick();
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    haptics.setEnabled(next);
    if (next) haptics.buttonClick();
  };

  // Timer Countdown during READY state (30s)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (gameState === 'READY') {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleGrabPress();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  // Insert Coin Action
  const handleInsertCoin = () => {
    if (gameState !== 'IDLE' && gameState !== 'RESULT') return;

    if (coins <= 0) {
      setCoins(5);
      return;
    }

    setCoins((c) => c - 1);
    setTimeRemaining(30);
    setInputX(0);
    setIsManualMoving(false);

    // Roll payout cycle (Hard mode: strictly <= 30%)
    const payout = engine.rollPayoutCycle();
    setIsPayoutCycle(payout);

    // Reset claw to center
    engine.claw.cableLength = 30;
    engine.claw.cableVelocity = 0;
    engine.claw.clawTargetAngle = 0.85;
    engine.claw.trolleyVx = 0;
    engine.claw.grippedDollUid = null;

    setStats((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      coinsSpent: prev.coinsSpent + 1
    }));

    setGameState('READY');
  };

  // Grab Button Press Action (Descent or Early Stop)
  const handleGrabPress = () => {
    if (gameState === 'READY') {
      sound.stopMotor();
      sound.playDrop();
      setGameState('DROPPING');
    } else if (gameState === 'DROPPING') {
      sound.playButtonClick();
      haptics.clawTouch();
      engine.claw.cableVelocity = 0;
      setGameState('GRABBING');

      setTimeout(() => {
        engine.attemptGrip(0.15);
        setTimeout(() => {
          setGameState('LIFTING');
        }, 450);
      }, 180);
    }
  };

  // Joystick Input
  const handleMoveInput = (x: number, isMoving: boolean) => {
    setInputX(x);
    setIsManualMoving(isMoving);
  };

  // Winning doll callback
  const handleWinDoll = (templateId: string) => {
    setCaughtDollIds((prev) => [...prev, templateId]);
    setStats((prev) => {
      const nextStreak = prev.currentStreak + 1;
      return {
        ...prev,
        dollsWon: prev.dollsWon + 1,
        currentStreak: nextStreak,
        bestStreak: Math.max(nextStreak, prev.bestStreak)
      };
    });
  };

  // Game over / round complete
  const handleGameOver = () => {
    setGameState('IDLE');
    sound.stopMotor();
  };

  const handleShakeCabinet = () => {
    engine.shakeCabinet();
  };

  const handleToggleCamera = () => {
    setCameraAngle((prev) => (prev === 'front' ? 'radar' : 'front'));
  };

  const winRate = stats.gamesPlayed > 0 
    ? ((stats.dollsWon / stats.gamesPlayed) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="h-[100dvh] w-screen max-w-full bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white overflow-hidden">
      {/* Top Bar Header */}
      <header className="w-full px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur z-20 shrink-0">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            초리얼 인형뽑기 MASTER
          </span>
          <span className="text-neutral-500 text-xs hidden md:inline" aria-hidden="true">·</span>
          <span className="text-xs text-rose-400 font-medium hidden md:inline">
            하드 모드 (당첨률 30% 이하 제한)
          </span>
        </div>

        {/* Zone 2: Navigation / Info (Desktop) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs text-neutral-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>실제 물리 엔진</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>진자 와이어 스웨이</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>중간 낙하 & 탑털기</span>
          </span>
        </nav>

        {/* Zone 3: Quick Action Buttons including Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "전체화면 종료" : "전체화면으로 보기"}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              isFullscreen
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">창 화면</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">전체 화면</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsInspectorOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/70 rounded-lg text-xs font-medium transition"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">장력 분석</span>
          </button>

          <button
            onClick={() => setIsCollectionOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-600/70 rounded-lg text-xs font-semibold transition"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">보관함</span>
            <span>({caughtDollIds.length})</span>
          </button>
        </div>
      </header>

      {/* Main Viewport Content - Dual Layout (Wide Desktop / Responsive Mobile) */}
      <main className="flex-1 w-full h-full min-h-0 flex flex-col lg:flex-row items-center justify-center p-1 sm:p-3 gap-3 overflow-hidden">
        {/* Left / Center: Arcade Cabinet Viewport (Scales dynamically to fit height) */}
        <div className="flex-1 w-full h-full min-h-0 flex items-center justify-center relative">
          <ArcadeCabinet
            engine={engine}
            gameState={gameState}
            setGameState={setGameState}
            timeRemaining={timeRemaining}
            setTimeRemaining={setTimeRemaining}
            onWinDoll={handleWinDoll}
            onGameOver={handleGameOver}
            radarActive={cameraAngle === 'radar'}
            cameraAngle={cameraAngle}
            inputX={inputX}
            isManualMoving={isManualMoving}
            className="w-full h-full max-h-[calc(100dvh-170px)] lg:max-h-[calc(100dvh-90px)] max-w-xl flex flex-col items-center justify-center"
          />
        </div>

        {/* Right / Bottom: Control Deck & Arcade Sidebar */}
        <div className="w-full lg:w-[420px] lg:h-full lg:max-h-[calc(100dvh-90px)] shrink-0 flex flex-col justify-between overflow-y-auto lg:overflow-y-visible">
          {/* Desktop-only Realtime Arcade Telemetry Panel */}
          <div className="hidden lg:flex flex-col gap-2.5 p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800/90 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>실시간 크레인 장력 & 기계 상태</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                isPayoutCycle ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40' : 'bg-rose-950 text-rose-300 border border-rose-600/40'
              }`}>
                {isPayoutCycle ? '당첨 사이클 ON' : '장력 풀림 위험 (HARD)'}
              </span>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">성공률 (30%이하)</div>
                <div className="font-bold text-emerald-400 font-mono text-sm">{winRate}%</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">시도 횟수</div>
                <div className="font-bold text-neutral-200 font-mono text-sm">{stats.gamesPlayed}회</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">보유 코인</div>
                <div className="font-bold text-amber-300 font-mono text-sm">{coins}코인</div>
              </div>
            </div>

            {/* Recent Caught Dolls Shelf Preview */}
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="text-[10px] font-semibold text-neutral-400 mb-1.5 flex items-center justify-between">
                <span>내 보관함 최근 인형 ({caughtDollIds.length}개)</span>
                <button 
                  onClick={() => setIsCollectionOpen(true)}
                  className="text-amber-400 hover:underline text-[10px]"
                >
                  전체보기
                </button>
              </div>

              {caughtDollIds.length === 0 ? (
                <div className="text-[10px] text-neutral-500 text-center py-2">
                  아직 뽑은 인형이 없습니다. 동전을 넣고 도전하세요!
                </div>
              ) : (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {caughtDollIds.slice(-5).reverse().map((id, idx) => {
                    const tmpl = DOLL_TEMPLATES[id];
                    return (
                      <div
                        key={idx}
                        title={tmpl ? tmpl.name : id}
                        className="px-2 py-1 rounded-md bg-neutral-900 border border-neutral-700 text-[10px] font-bold text-neutral-200 whitespace-nowrap shrink-0 flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>{tmpl ? tmpl.name : id}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Arcade Controls Deck (Responsive Virtual Joystick + Grab Button) */}
          <ArcadeControls
            gameState={gameState}
            coins={coins}
            timeRemaining={timeRemaining}
            isPayoutCycle={isPayoutCycle}
            onMoveInput={handleMoveInput}
            onGrabPress={handleGrabPress}
            onInsertCoin={handleInsertCoin}
            onShakeCabinet={handleShakeCabinet}
            onToggleCamera={handleToggleCamera}
            onOpenCollection={() => setIsCollectionOpen(true)}
            onOpenInspector={() => setIsInspectorOpen(true)}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            hapticsEnabled={hapticsEnabled}
            onToggleHaptics={handleToggleHaptics}
            radarActive={cameraAngle === 'radar'}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        </div>
      </main>

      {/* Collection & Prize Showcase Modal */}
      <CollectionModal
        isOpen={isCollectionOpen}
        onClose={() => setIsCollectionOpen(false)}
        caughtDollIds={caughtDollIds}
        stats={stats}
      />

      {/* Tension Inspector & Settings Modal */}
      <TensionInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        config={engine.config}
        onChangeConfig={(newCfg) => {
          Object.assign(engine.config, newCfg);
        }}
        isPayoutCycle={isPayoutCycle}
      />
    </div>
  );
}
