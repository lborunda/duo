
import { useEffect, useRef } from 'react';

/**
 * A hook to provide intermittent vibration.
 * @param isVibrating - A boolean to control the vibration.
 * @param interval - The time in ms between vibrations.
 * @param duration - The duration in ms of each vibration.
 */
export const useIntermittentVibration = (isVibrating: boolean, interval = 250, duration = 15) => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isVibrating && 'vibrate' in navigator) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      // Vibrate once immediately
      navigator.vibrate(duration);

      intervalRef.current = window.setInterval(() => {
        navigator.vibrate(duration);
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVibrating, interval, duration]);
};
