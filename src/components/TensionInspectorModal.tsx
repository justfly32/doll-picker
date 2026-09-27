import React from 'react';
import { MachineConfig } from '../types/game';
import { X, Sliders, ShieldAlert, Cpu, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TensionInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MachineConfig;
  onChangeConfig: (newConfig: Partial<MachineConfig>) => void;
  isPayoutCycle: boolean;
}

export const TensionInspectorModal: React.FC<TensionInspectorModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  isPayoutCycle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-neutral-100 tracking-tight">
              기계 세팅 & 장력 물리 분석기
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-neutral-300">
          {/* Mode Switch: Hard vs Practice */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-neutral-200 text-sm">운영 모드 선택</span>
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                <button
                  onClick={() => onChangeConfig({ difficulty: 'hard', maxWinRatePercent: 25 })}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    config.difficulty === 'hard'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  실제 오락실 (하드)
                </button>
                <button
                  onClick={() => onChangeConfig({ difficulty: 'practice', maxWinRatePercent: 100 })}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    config.difficulty === 'practice'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  연습장 (100% 장력)
                </button>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {config.difficulty === 'hard'
                ? '⚠️ 실제 인형뽑기방 세팅: 최종 당첨 확률이 25%(30% 이하)로 엄격히 통제되며, 꼭대기 도달 시 또는 이동 중에 강제 장력 풀림(탑털기)이 발생합니다.'
                : '✅ 연습 모드: 솔레노이드 밸브가 최대 장력(100%)을 계속 유지하여 조준과 물리 조작을 연습할 수 있습니다.'}
            </p>
          </div>

          {/* Current Cycle Status */}
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-bold text-neutral-200">현재 코인 당첨 사이클</div>
                <div className="text-[10px] text-neutral-400">내부 솔레노이드 파워 상태</div>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
                isPayoutCycle
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
              }`}
            >
              {isPayoutCycle ? '★ 당첨 사이클 활성 (완주 가능)' : '일반 사이클 (장력 풀림 위험)'}
            </span>
          </div>

          {/* Real Claw Physics Breakdown */}
          <div className="space-y-2">
            <div className="font-bold text-neutral-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
              <span>적용된 인형뽑기 물리 엔진 규칙</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                <div className="font-semibold text-neutral-200 mb-0.5 flex items-center justify-between">
                  <span>1. 30% 이하 최종 인양 확률 제한</span>
                  <span className="text-[10px] text-rose-400 font-mono font-bold">25.0% 상한선</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  인형을 완벽히 잡았더라도 실제 기계처럼 약 75%의 게임에서는 최고점 정점 또는 출구 이동 중에 장력이 급격히 약화되어 바닥으로 뚝 떨어집니다.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                <div className="font-semibold text-neutral-200 mb-0.5 flex items-center justify-between">
                  <span>2. 중간 낙하 (Mid-air Slip) & 탑털기</span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">진동/관성 계산</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  크레인이 상승하는 도중(높이 45%~85%) 케이블의 미세 털림과 모터 진동으로 인해 무게중심이 빗겨난 인형은 중간에 스르륵 빠져나갑니다.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                <div className="font-semibold text-neutral-200 mb-0.5 flex items-center justify-between">
                  <span>3. 누르는 시간과 강도 (하강 타이밍 조절)</span>
                  <span className="text-[10px] text-sky-400 font-mono font-bold">조기 스톱 기능</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  하강 중 버튼을 다시 누르면 원하는 높이에서 즉시 멈춰 발톱을 오므릴 수 있어, 산더미처럼 쌓인 인형의 꼭대기만을 공략할 수 있습니다.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                <div className="font-semibold text-neutral-200 mb-0.5 flex items-center justify-between">
                  <span>4. 인형의 재질 마찰력과 형태 난이도</span>
                  <span className="text-[10px] text-purple-400 font-mono font-bold">소프트바디 물리</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  황금 피기와 모찌냥은 매끄러운 나일론 코팅으로 마찰력이 매우 낮으며, 아기공룡은 꼬리로 인해 무게중심이 틀어져 삼발이에서 쉽게 튕겨 나갑니다.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                <div className="font-semibold text-neutral-200 mb-0.5 flex items-center justify-between">
                  <span>5. 출구 아크릴 턱걸이 충돌</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">출구 턱 반발력</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  출구 직전에서 인형이 아크릴 가림막 상단 모서리에 부딪히면 탄성에 의해 다시 통 속으로 튕겨 들어가는 오락실 특유의 아쉬운 상황이 그대로 발생합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
