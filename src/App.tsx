/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { MobileControls } from './components/MobileControls';
import { GameStats, HeroState, GameStatus } from './types';
import { soundManager } from './utils/audio';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    dollarsCount: 0,
    distanceMeters: 0,
    combo: 1,
    maxCombo: 1,
    comboTimer: 0,
    highScore: 0,
  });

  const [hero, setHero] = useState<HeroState>({
    x: 270,
    y: 680,
    width: 44,
    height: 52,
    vx: 0,
    vy: 0,
    speed: 7.5,
    lives: 3,
    maxLives: 3,
    invulnerableTimer: 0,
    tilt: 0,
    hasShield: false,
    magnetTimer: 0,
    speedBoostTimer: 0,
    trail: [],
  });

  // Read high score on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dollar_dodger_highscore');
      if (saved) {
        setStats((prev) => ({ ...prev, highScore: parseInt(saved, 10) || 0 }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleStartGame = () => {
    setStatus('playing');
  };

  const handleGameOver = useCallback((finalStats: GameStats) => {
    setStats(finalStats);
    setStatus('gameover');
  }, []);

  const handleStatsUpdate = useCallback((newStats: GameStats, newHero: HeroState) => {
    setStats(newStats);
    setHero(newHero);
  }, []);

  const handlePauseToggle = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'playing') return 'paused';
      if (prev === 'paused') return 'playing';
      return prev;
    });
  }, []);

  const handleMuteToggle = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleMobileDirection = (code: string, isDown: boolean) => {
    const event = new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
      code,
      key: code,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  // Global key shortcuts: Space to start/pause/resume, Escape to pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (status === 'playing' || status === 'paused') {
          e.preventDefault();
          handlePauseToggle();
        }
      } else if (e.code === 'Space') {
        if (status === 'idle') {
          e.preventDefault();
          handleStartGame();
        } else if (status === 'gameover') {
          e.preventDefault();
          handleStartGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handlePauseToggle]);

  return (
    <main
      id="game-viewport"
      className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden select-none font-sans text-slate-100"
    >
      {/* Game Screen Container */}
      <div className="relative w-full h-full max-w-[540px] max-h-[820px] flex items-center justify-center">
        {/* Game Canvas */}
        <GameCanvas
          status={status}
          onGameOver={handleGameOver}
          onStatsUpdate={handleStatsUpdate}
          onPauseToggle={handlePauseToggle}
        />

        {/* In-Game HUD overlay */}
        {status !== 'idle' && (
          <GameHUD
            stats={stats}
            hero={hero}
            isPaused={status === 'paused'}
            isMuted={isMuted}
            onPauseToggle={handlePauseToggle}
            onMuteToggle={handleMuteToggle}
          />
        )}

        {/* Start Screen Overlay */}
        {status === 'idle' && (
          <StartScreen
            highScore={stats.highScore}
            onStartGame={handleStartGame}
          />
        )}

        {/* Pause Modal Overlay */}
        {status === 'paused' && (
          <PauseModal
            onResume={() => setStatus('playing')}
            onRestart={() => setStatus('playing')}
            isMuted={isMuted}
            onMuteToggle={handleMuteToggle}
          />
        )}

        {/* Game Over Modal Overlay */}
        {status === 'gameover' && (
          <GameOverModal
            stats={stats}
            onRestart={handleStartGame}
          />
        )}

        {/* On-screen mobile touch controls (visible on small viewports during active play) */}
        {status === 'playing' && (
          <MobileControls onDirectionPress={handleMobileDirection} />
        )}
      </div>
    </main>
  );
}
