
import React, { useEffect } from 'react';
import { useSharedCamera } from '../hooks/useSharedCamera';
import { BookOpenIcon, SettingsIcon } from './icons';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  onViewChange: (view: 'tripBook' | 'settings') => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onViewChange }) => {
  const { videoRef, previewUrl, nativeMode, isStreaming, startStream, stopStream, retryStream, captureFrame, error, detail } = useSharedCamera(onCapture);
  
  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, [startStream, stopStream]);
  
  const handleCaptureClick = () => {
    if ('vibrate' in navigator) navigator.vibrate(50);
    captureFrame();
  };

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      {nativeMode ? (previewUrl && <img src={previewUrl} alt="Live view from Ray-Ban Meta glasses" className="w-full h-full object-contain" />) : <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />}
      {error && (
        <div className="absolute inset-x-0 top-0 bg-red-500 text-white p-4 text-center">
          <p>{error}</p>
          <button onClick={retryStream} className="underline mt-2">Retry camera connection</button>
        </div>
      )}
      {!isStreaming && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-lg text-center">
            <p>{detail}</p>
            <button onClick={retryStream} className="underline mt-2">Retry camera connection</button>
          </div>
        </div>
      )}

      {/* Top right navigation buttons */}
      <div className="absolute top-5 right-5 z-20 flex flex-col gap-3 md:flex-row pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)]">
        <button
          onClick={() => onViewChange('tripBook')}
          className="bg-black/20 backdrop-blur-md rounded-full p-3 text-white hover:bg-black/40 transition-colors"
          aria-label="Open Trip Book"
        >
          <BookOpenIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => onViewChange('settings')}
          className="bg-black/20 backdrop-blur-md rounded-full p-3 text-white hover:bg-black/40 transition-colors"
          aria-label="Open Settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
      
      {/* Center capture button */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-500 ease-in-out ${isStreaming ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
        <button
          onClick={handleCaptureClick}
          className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center text-white transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95"
          aria-label="Capture photo"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500"></div>
        </button>
      </div>
    </div>
  );
};
