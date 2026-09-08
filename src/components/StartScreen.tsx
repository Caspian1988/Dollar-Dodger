import React from 'react';
import { Play, Trophy, Shield, Magnet, Zap, DollarSign, AlertTriangle, Sparkles } from 'lucide-react';

interface StartScreenProps {
  highScore: number;
  onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ highScore, onStartGame }) => {
  return (
    <div
      id="start-screen-overlay"
      className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Animated Icon Badge */}
        <div className="relative mb-4">
          <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-400 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.3)]">
            <DollarSign className="w-10 h-10 text-emerald-400 stroke-[2.5]" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-slate-950 shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1">
          DOLLAR <span className="text-emerald-400">DODGER</span>
        </h1>
        <p className="text-sm text-slate-400 mb-5 max-w-xs">
          Guide the hero to grab falling cash bundles while dodging lethal hazards!
        </p>

        {/* High Score Pill */}
        {highScore > 0 && (
          <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-xs font-semibold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Best Record: ${highScore.toLocaleString()}</span>
          </div>
        )}

        {/* Legend / Guide */}
        <div className="w-full grid grid-cols-2 gap-2 text-left mb-6 text-xs">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 font-mono font-bold">
              $
            </div>
            <div>
              <div className="font-semibold text-slate-200">Collect Cash</div>
              <div className="text-[11px] text-slate-400">Bills, Bundles & Bags</div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200">Dodge Hazards</div>
              <div className="text-[11px] text-slate-400">Rocks, Spikes & Bombs</div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-600 flex items-center justify-center text-blue-400">
              <Magnet className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200">Magnet Orb</div>
              <div className="text-[11px] text-slate-400">Pulls dollars automatically</div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-600 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200">Energy Shield</div>
              <div className="text-[11px] text-slate-400">Absorbs 1 direct hit</div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          id="start-game-button"
          type="button"
          onClick={onStartGame}
          className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
          <span>START PLAYING</span>
        </button>

        {/* Controls hint */}
        <div className="mt-4 text-[11px] text-slate-400 flex items-center gap-2 justify-center">
          <span>Controls: <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">WASD</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">Arrows</kbd> / Touch & Drag</span>
        </div>
      </div>
    </div>
  );
};
