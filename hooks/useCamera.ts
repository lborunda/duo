
import { useState, useRef, useCallback } from 'react';

export const useCamera = (onCapture: (imageData: string) => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
              setError("Camera access was denied. Please allow camera access in your browser settings.");
          } else if (err.name === "NotFoundError") {
              setError("No environment-facing camera found. Using default camera.");
              // Fallback to default camera
              try {
                  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                  if (videoRef.current) {
                      videoRef.current.srcObject = stream;
                      videoRef.current.play();
                      setIsStreaming(true);
                  }
              } catch (fallbackErr) {
                  setError("Could not access any camera. Please check your device and permissions.");
              }
          } else {
              setError("An error occurred while accessing the camera.");
          }
      }
    }
  }, []);

  const stopStream = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsStreaming(false);
    }
  }, []);
  
  const captureFrame = useCallback(() => {
    if (!videoRef.current) return;
    
    if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video to get full quality
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for smaller size
        onCapture(dataUrl);
    }
  }, [onCapture]);


  return { videoRef, isStreaming, startStream, stopStream, captureFrame, error };
};
