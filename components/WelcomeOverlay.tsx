import React from 'react';

interface WelcomeOverlayProps {
  onStart: () => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-stone-50 text-center p-8">
      <div className="max-w-md">
        <h1 className="text-5xl font-black text-stone-800 mb-2">
          Hello, I'm <span className="text-orange-500">DUO</span>
        </h1>
        <p className="text-stone-600 text-lg mb-8">
          Your personal AI travel guide. Show me your world, and I'll tell you its story. Let's explore together.
        </p>
        <p className="text-stone-500 text-sm mt-4">
          DUO v3 · For questions or collaboration, contact Luis Borunda · <a href="mailto:lborunda@vt.edu" className="underline hover:text-orange-600">lborunda@vt.edu</a>, Virginia Tech
        </p>
       
        <p> _ </p>
        <button
          onClick={onStart}
          className="bg-orange-500 text-white font-bold py-4 px-10 rounded-full text-xl hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-orange-500/30"
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
};
