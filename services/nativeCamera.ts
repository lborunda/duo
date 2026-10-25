export type NativeCameraStatus = { state: 'live' | 'waiting' | 'stopped' | 'error'; detail: string; setupSummary?: string };

/** Explicit Stop releases the shared native camera, not just its web subscriber. */
export async function stopNativeCamera(path: string, transport = fetch): Promise<void> {
  const response = await transport(path + 'stop', { method: 'POST', cache: 'no-store' });
  if (!response.ok) throw new Error('Could not stop the glasses camera. Use Stop in DUO Tour.');
}

export async function openNativeSetup(path: string, transport = fetch): Promise<void> {
  const response = await transport(path + 'setup', { method: 'POST', cache: 'no-store' });
  if (!response.ok) throw new Error('Could not open glasses setup. Return to DUO Tour.');
}

/** Reads the in-process WebView adapter, not another camera or the inference server. */
export function watchNativeCamera(
  path: string,
  onStatus: (status: NativeCameraStatus) => void,
  onFrame: (url: string | null) => void,
  transport = fetch,
  urls = URL,
) {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let frameUrl: string | null = null;
  const clearFrame = () => {
    onFrame(null);
    if (frameUrl) urls.revokeObjectURL(frameUrl);
    frameUrl = null;
  };
  const poll = async () => {
    try {
      const options = { signal: controller.signal, cache: 'no-store' as const };
      const response = await transport(path + 'status', options);
      if (!response.ok) throw new Error('Glasses camera is unavailable. Return to DUO Tour and check its connection.');
      const status: NativeCameraStatus = await response.json();
      if (controller.signal.aborted) return;
      onStatus(status);
      if (status.state !== 'live') {
        clearFrame();
      } else {
        const frame = await transport(path + 'frame', options);
        if (frame.status === 204) {
          if (!controller.signal.aborted) clearFrame();
        } else {
          if (!frame.ok || !frame.headers.get('content-type')?.startsWith('image/jpeg')) {
            throw new Error('The glasses preview did not return a camera frame.');
          }
          const blob = await frame.blob();
          if (controller.signal.aborted) return;
          const next = urls.createObjectURL(blob);
          const previous = frameUrl;
          frameUrl = next;
          onFrame(next);
          if (previous) urls.revokeObjectURL(previous);
        }
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      clearFrame();
      onStatus({ state: 'error', detail: error instanceof Error ? error.message : 'Glasses preview failed.' });
    } finally {
      if (!controller.signal.aborted) timer = setTimeout(poll, 150);
    }
  };
  void poll();
  return () => {
    controller.abort();
    clearTimeout(timer);
    clearFrame();
  };
}

export async function captureNativePhoto(path: string, transport = fetch): Promise<string> {
  const response = await transport(path + 'capture', { method: 'POST', cache: 'no-store' });
  if (!response.ok) throw new Error((await response.text()) || 'The glasses did not return a photograph.');
  if (!response.headers.get('content-type')?.startsWith('image/jpeg')) throw new Error('Expected a photograph from the glasses.');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the captured photograph.'));
    reader.readAsDataURL(blob);
  });
}
