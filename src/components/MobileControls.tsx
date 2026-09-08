import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface MobileControlsProps {
  onDirectionPress: (code: string, isDown: boolean) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onDirectionPress }) => {
  const handleTouch = (code: string, isDown: boolean, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onDirectionPress(code, isDown);
  };

  return (
    <div
      id="mobile-touch-controls"
      className="sm:hidden absolute bottom-3 inset-x-0 flex items-center justify-between px-6 pointer-events-none z-20"
    >
      {/* Left / Right directional pad */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          id="btn-touch-left"
          type="button"
          onTouchStart={(e) => handleTouch('ArrowLeft', true, e)}
          onTouchEnd={(e) => handleTouch('ArrowLeft', false, e)}
          onMouseDown={(e) => handleTouch('ArrowLeft', true, e)}
          onMouseUp={(e) => handleTouch('ArrowLeft', false, e)}
          aria-label="Move left"
          className="w-14 h-14 bg-slate-900/80 active:bg-emerald-600/60 border border-slate-700/80 active:border-emerald-400 rounded-2xl flex items-center justify-center text-slate-200 shadow-xl backdrop-blur-md transition-transform active:scale-95 touch-none"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        <button
          id="btn-touch-right"
          type="button"
          onTouchStart={(e) => handleTouch('ArrowRight', true, e)}
          onTouchEnd={(e) => handleTouch('ArrowRight', false, e)}
          onMouseDown={(e) => handleTouch('ArrowRight', true, e)}
          onMouseUp={(e) => handleTouch('ArrowRight', false, e)}
          aria-label="Move right"
          className="w-14 h-14 bg-slate-900/80 active:bg-emerald-600/60 border border-slate-700/80 active:border-emerald-400 rounded-2xl flex items-center justify-center text-slate-200 shadow-xl backdrop-blur-md transition-transform active:scale-95 touch-none"
        >
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

      {/* Up / Down vertical pad */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        <button
          id="btn-touch-up"
          type="button"
          onTouchStart={(e) => handleTouch('ArrowUp', true, e)}
          onTouchEnd={(e) => handleTouch('ArrowUp', false, e)}
          onMouseDown={(e) => handleTouch('ArrowUp', true, e)}
          onMouseUp={(e) => handleTouch('ArrowUp', false, e)}
          aria-label="Move up"
          className="w-12 h-11 bg-slate-900/80 active:bg-emerald-600/60 border border-slate-700/80 active:border-emerald-400 rounded-xl flex items-center justify-center text-slate-200 shadow-xl backdrop-blur-md transition-transform active:scale-95 touch-none"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        <button
          id="btn-touch-down"
          type="button"
          onTouchStart={(e) => handleTouch('ArrowDown', true, e)}
          onTouchEnd={(e) => handleTouch('ArrowDown', false, e)}
          onMouseDown={(e) => handleTouch('ArrowDown', true, e)}
          onMouseUp={(e) => handleTouch('ArrowDown', false, e)}
          aria-label="Move down"
          className="w-12 h-11 bg-slate-900/80 active:bg-emerald-600/60 border border-slate-700/80 active:border-emerald-400 rounded-xl flex items-center justify-center text-slate-200 shadow-xl backdrop-blur-md transition-transform active:scale-95 touch-none"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
