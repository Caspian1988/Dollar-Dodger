import React, { useEffect } from 'react';
import { RotateCcw, Trophy, DollarSign, Footprints, Zap } from 'lucide-react';
import { GameStats } from '../types';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart }) => {
  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  // Listen for Spacebar or Enter to quick restart
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onRestart]);

  return (
    <div
      id="game-over-modal"
      className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center">
        {/* Banner / Title */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 mb-3 shadow-lg">
          <RotateCcw className="w-7 h-7" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
          RUN OVER
        </h2>

        {isNewHighScore ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-full mb-4 animate-pulse">
            <Trophy className="w-3.5 h-3.5 fill-current" />
            <span>NEW HIGH SCORE!</span>
          </div>
        ) : (
          <p className="text-xs text-slate-400 mb-4">You got hit by too many hazards!</p>
        )}

        {/* Score Display */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-4">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Total Dollars Secured
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
            ${stats.score.toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2 mb-6">
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex flex-col items-center">
            <DollarSign className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Bills</span>
            <span className="font-mono text-sm font-bold text-slate-200">{stats.dollarsCount}</span>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex flex-col items-center">
            <Footprints className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Distance</span>
            <span className="font-mono text-sm font-bold text-slate-200">{stats.distanceMeters}m</span>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex flex-col items-center">
            <Zap className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Max Combo</span>
            <span className="font-mono text-sm font-bold text-slate-200">x{stats.maxCombo}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="play-again-button"
          type="button"
          onClick={onRestart}
          className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 group-hover:-rotate-45 transition-transform" />
          <span>PLAY AGAIN</span>
        </button>

        <span className="mt-3 text-[11px] text-slate-400">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">Space</kbd> or Enter to restart
        </span>
      </div>
    </div>
  );
};
