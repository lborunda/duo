
import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchElevenLabsAudio } from '../services/elevenLabsService';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.pause();
      audio.removeAttribute('src');
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const speak = useCallback(async (text: string, _lang?: string, rate: number = 1) => {
    cleanupAudio();
    
    if (!text.trim()) {
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const audioBlob = await fetchElevenLabsAudio(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const newAudio = new Audio(audioUrl);
      newAudio.playbackRate = Math.max(0.5, Math.min(2.5, rate)); // Set playback speed, clamped
      audioRef.current = newAudio;
      
      const handleEnd = () => {
        setIsSpeaking(false);
        cleanupAudio();
      };

      newAudio.addEventListener('ended', handleEnd);
      newAudio.addEventListener('error', (e) => {
        console.error("Audio playback error:", e);
        handleEnd();
      });
      
      await newAudio.play();
    } catch (error) {
      console.error('Failed to speak with ElevenLabs:', error);
      setIsSpeaking(false);
      cleanupAudio();
      throw error; // Re-throw the error so the calling component can handle it.
    }
  }, [cleanupAudio]);

  const cancel = useCallback(() => {
    setIsSpeaking(false);
    cleanupAudio();
  }, [cleanupAudio]);
  
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { speak, cancel, isSpeaking };
};
