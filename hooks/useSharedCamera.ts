import { useState, useRef, useCallback } from 'react';
import { captureNativePhoto, watchNativeCamera } from '../services/nativeCamera';

declare global {
  interface Window { __DUO_CAMERA_PATH__?: string }
}

export const useSharedCamera = (onCapture: (imageData: string) => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const generation = useRef(0);
  const captureBusy = useRef(false);
  const onCaptureRef = useRef(onCapture);
  onCaptureRef.current = onCapture;
  const nativeMode = new URLSearchParams(window.location.search).get('capture') === 'native';
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState('Connecting to camera…');

  const stopStream = useCallback(() => {
    generation.current++;
    cleanupRef.current?.();
    cleanupRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setPreviewUrl(null);
    setIsStreaming(false);
  }, []);

  const startStream = useCallback(async () => {
    stopStream();
    const current = generation.current;
    setError(null);
    if (nativeMode) {
      setDetail('Waiting for the DUO Tour glasses connection…');
      let stopWatching: (() => void) | undefined;
      const attach = () => {
        const path = window.__DUO_CAMERA_PATH__;
        if (!path || current !== generation.current || stopWatching) return;
        stopWatching = watchNativeCamera(path, status => {
          setDetail(status.detail);
          setError(status.state === 'error' ? status.detail : null);
        }, url => {
          setPreviewUrl(url);
          setIsStreaming(url !== null);
        });
      };
      window.addEventListener('duo-camera-ready', attach);
      cleanupRef.current = () => {
        window.removeEventListener('duo-camera-ready', attach);
        stopWatching?.();
      };
      attach();
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Phone camera access requires HTTPS or localhost. Open the companion inside DUO Tour to use the glasses.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false,
      });
      if (current !== generation.current || !videoRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      if (current === generation.current) setIsStreaming(true);
    } catch (err) {
      if (current !== generation.current) return;
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setError(err instanceof Error && err.name === 'NotAllowedError'
        ? 'Phone camera permission was denied. Allow camera access in your browser settings.'
        : err instanceof Error ? err.message : 'Could not start the camera.');
    }
  }, [nativeMode, stopStream]);

  const retryStream = useCallback(async () => {
    if (!nativeMode) return startStream();
    const path = window.__DUO_CAMERA_PATH__;
    if (!path) return setError('The native camera bridge is not ready. Close and reopen the companion in DUO Tour.');
    try {
      const response = await fetch(path + 'start', { method: 'POST', cache: 'no-store' });
      if (!response.ok) throw new Error('Could not retry the glasses connection. Return to DUO Tour.');
      setError(null);
      setDetail('Connecting to glasses…');
    } catch (err) { setError(err instanceof Error ? err.message : 'Retry failed.'); }
  }, [nativeMode, startStream]);

  const captureFrame = useCallback(async () => {
    if (captureBusy.current || !isStreaming) return;
    const current = generation.current;
    captureBusy.current = true;
    try {
      if (nativeMode) {
        const path = window.__DUO_CAMERA_PATH__;
        if (!path) throw new Error('The glasses camera bridge is not ready.');
        const photo = await captureNativePhoto(path);
        if (current === generation.current) onCaptureRef.current(photo);
      } else {
        const video = videoRef.current;
        if (!video || !video.videoWidth || !video.videoHeight) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          onCaptureRef.current(canvas.toDataURL('image/jpeg', 0.9));
        }
      }
    } catch (err) {
      if (current === generation.current) setError(err instanceof Error ? err.message : 'Capture failed.');
    } finally { captureBusy.current = false; }
  }, [nativeMode, isStreaming]);

  return { videoRef, previewUrl, nativeMode, isStreaming, startStream, stopStream, retryStream, captureFrame, error, detail };
};
