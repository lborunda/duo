
import React from 'react';
import { CameraIcon, BookOpenIcon, SettingsIcon } from './icons';

interface ControlsProps {
  view: 'camera' | 'tripBook' | 'settings';
  onViewChange: (view: 'camera' | 'tripBook' | 'settings') => void;
}

export const Controls: React.FC<ControlsProps> = ({ view, onViewChange }) => {
  const baseButtonClass = "p-3 rounded-full transition-colors duration-200 flex flex-col items-center text-xs w-24 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400";
  const activeClass = "text-orange-500";
  const inactiveClass = "text-stone-500 hover:text-stone-900";

  return (
    <div className="relative z-40">
        <div className="bg-white/70 backdrop-blur-md p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-around items-center border-t border-stone-200/80">
          <button
            onClick={() => onViewChange('camera')}
            className={`${baseButtonClass} ${view === 'camera' ? activeClass : inactiveClass}`}
          >
            <CameraIcon className="w-7 h-7 mb-1" />
            <span>Guide</span>
          </button>
          
          <button
            onClick={() => onViewChange('tripBook')}
            className={`${baseButtonClass} ${view === 'tripBook' ? activeClass : inactiveClass}`}
          >
            <BookOpenIcon className="w-7 h-7 mb-1" />
            <span>Trip Book</span>
          </button>

          <button
            onClick={() => onViewChange('settings')}
            className={`${baseButtonClass} ${view === 'settings' ? activeClass : inactiveClass}`}
          >
            <SettingsIcon className="w-7 h-7 mb-1" />
            <span>Settings</span>
          </button>
        </div>
    </div>
  );
};