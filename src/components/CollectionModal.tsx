import React, { useRef, useEffect } from 'react';
import { DOLL_TEMPLATES, drawPlushOnCanvas } from '../game/dolls';
import { GameStats } from '../types/game';
import { X, Trophy, Sparkles, Target, Flame, Coins } from 'lucide-react';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  caughtDollIds: string[];
  stats: GameStats;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  caughtDollIds,
  stats
}) => {
  if (!isOpen) return null;

  // Count instances of each doll caught
  const counts: Record<string, number> = {};
  for (const id of caughtDollIds) {
    counts[id] = (counts[id] || 0) + 1;
  }

  const winRate = stats.gamesPlayed > 0 
    ? ((stats.dollsWon / stats.gamesPlayed) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-neutral-100 tracking-tight">
              내 인형 보관함 & 도감
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 bg-neutral-950/90 border-b border-neutral-800/80 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-neutral-400">총 시도 횟수</span>
            <span className="text-sm sm:text-base font-bold font-mono text-neutral-200">
              {stats.gamesPlayed}회
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-neutral-400">뽑은 인형</span>
            <span className="text-sm sm:text-base font-bold font-mono text-amber-400">
              {stats.dollsWon}개
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-neutral-400">실제 성공률</span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">
              {winRate}%
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-neutral-400">사용한 코인</span>
            <span className="text-sm sm:text-base font-bold font-mono text-rose-400">
              {stats.coinsSpent}개
            </span>
          </div>
        </div>

        {/* Doll Grid */}
        <div className="p-5 overflow-y-auto space-y-3">
          <div className="text-xs text-neutral-400 font-medium flex items-center justify-between">
            <span>획득한 인형 목록 ({Object.keys(counts).length}/{Object.keys(DOLL_TEMPLATES).length}종 발견)</span>
            <span className="text-[11px] text-neutral-500">난이도 어려움 (당첨률 30% 이하 제한)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(DOLL_TEMPLATES).map((tmpl) => {
              const count = counts[tmpl.id] || 0;
              const isUnlocked = count > 0;

              return (
                <div
                  key={tmpl.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                    isUnlocked
                      ? 'bg-neutral-800/60 border-neutral-700/80 shadow-sm'
                      : 'bg-neutral-900/40 border-neutral-800/40 opacity-55'
                  }`}
                >
                  {/* Doll Canvas Preview */}
                  <div className="w-16 h-16 rounded-lg bg-neutral-950 flex items-center justify-center relative shrink-0 border border-neutral-800">
                    <DollCanvasPreview templateId={tmpl.id} isUnlocked={isUnlocked} />
                    {count > 1 && (
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-amber-500 text-neutral-950 text-[10px] font-black rounded-full shadow">
                        x{count}
                      </span>
                    )}
                  </div>

                  {/* Doll Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-neutral-200 truncate">
                        {tmpl.name}
                      </h4>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          tmpl.rarity === 'LEGENDARY'
                            ? 'text-amber-300 bg-amber-950/70 border border-amber-600/40'
                            : tmpl.rarity === 'RARE'
                            ? 'text-purple-300 bg-purple-950/70 border border-purple-600/40'
                            : tmpl.rarity === 'UNCOMMON'
                            ? 'text-sky-300 bg-sky-950/70 border border-sky-600/40'
                            : 'text-neutral-400 bg-neutral-800'
                        }`}
                      >
                        {tmpl.rarity}
                      </span>
                    </div>

                    <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {isUnlocked ? tmpl.description : '??? (아직 뽑지 못한 미지의 인형)'}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[9px] text-neutral-500">
                      <span>난이도: {'★'.repeat(tmpl.gripDifficulty)}{'☆'.repeat(5 - tmpl.gripDifficulty)}</span>
                      <span>·</span>
                      <span>무게: {tmpl.mass >= 1.4 ? '무거움' : tmpl.mass <= 0.9 ? '가벼움' : '보통'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400">
            실제 오락실과 동일한 장력 감소와 미끄러짐 물리가 작동합니다.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

// Mini preview canvas for individual doll
const DollCanvasPreview: React.FC<{ templateId: string; isUnlocked: boolean }> = ({
  templateId,
  isUnlocked
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 64, 64);

    const tmpl = DOLL_TEMPLATES[templateId];
    if (!tmpl) return;

    if (isUnlocked) {
      drawPlushOnCanvas(ctx, tmpl, 32, 32, 0, 1.0, 1.0, 0.7);
    } else {
      // Silhouette shadow
      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(32, 32, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', 32, 38);
      ctx.restore();
    }
  }, [templateId, isUnlocked]);

  return <canvas ref={canvasRef} width={64} height={64} className="w-14 h-14" />;
};
