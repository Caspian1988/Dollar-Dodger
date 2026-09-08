import React from 'react';
import { Heart, Volume2, VolumeX, Pause, Play, Zap, Shield, Magnet, Trophy } from 'lucide-react';
import { GameStats, HeroState } from '../types';

interface GameHUDProps {
  stats: GameStats;
  hero: HeroState;
  isPaused: boolean;
  isMuted: boolean;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  hero,
  isPaused,
  isMuted,
  onPauseToggle,
  onMuteToggle,
}) => {
  return (
    <div id="game-hud" className="absolute inset-x-0 top-0 pointer-events-none z-10 p-3 sm:p-4 flex flex-col gap-2">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Cash Collected & Distance */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/40 shadow-lg flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Cash</span>
            <span className="font-mono font-black text-xl sm:text-2xl text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
              ${stats.score.toLocaleString()}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-300 font-mono text-sm">
            <span className="text-xs text-slate-400 font-sans uppercase">Dist</span>
            <span>{stats.distanceMeters}m</span>
          </div>
        </div>

        {/* Action Controls & Lives */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Lives display */}
          <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/60">
            {Array.from({ length: hero.maxLives }).map((_, idx) => {
              const active = idx < hero.lives;
              return (
                <Heart
                  key={idx}
                  id={`life-heart-${idx}`}
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${
                    active
                      ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : 'fill-slate-800 text-slate-700 opacity-40'
                  }`}
                />
              );
            })}
          </div>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-button"
            type="button"
            onClick={onMuteToggle}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 backdrop-blur-md transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause Toggle */}
          <button
            id="pause-game-button"
            type="button"
            onClick={onPauseToggle}
            aria-label={isPaused ? 'Resume game' : 'Pause game'}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 backdrop-blur-md transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-bar: Combo & Active Power-Ups */}
      <div className="flex items-center justify-between gap-2">
        {/* Combo indicator */}
        <div className="flex items-center gap-2">
          {stats.combo > 1 ? (
            <div
              id="combo-badge"
              className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-slate-950 font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5 animate-pulse"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>COMBO x{stats.combo}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-mono flex items-center gap-1 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Best: ${stats.highScore.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Active Power-up indicators */}
        <div className="flex items-center gap-2">
          {hero.hasShield && (
            <div
              id="shield-indicator"
              className="flex items-center gap-1 bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-md shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 fill-cyan-400/30" />
              <span className="hidden xs:inline">Shield</span>
            </div>
          )}

          {hero.magnetTimer > 0 && (
            <div
              id="magnet-indicator"
              className="flex items-center gap-1 bg-blue-950/80 border border-blue-500/50 text-blue-300 text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-md shadow-sm"
            >
              <Magnet className="w-3.5 h-3.5 text-blue-400" />
              <span>{Math.ceil(hero.magnetTimer / 60)}s</span>
            </div>
          )}

          {hero.speedBoostTimer > 0 && (
            <div
              id="boost-indicator"
              className="flex items-center gap-1 bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-md shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{Math.ceil(hero.speedBoostTimer / 60)}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
