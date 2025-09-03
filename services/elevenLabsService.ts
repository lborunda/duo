
import { ELEVENLABS_API_KEY } from '../constants';

const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
const MISSING_KEY_ERROR = "Text-to-speech Error: The ELEVENLABS_API_KEY is not set in `constants.ts`.";

export const fetchElevenLabsAudio = async (text: string): Promise<Blob> => {
  if (ELEVENLABS_API_KEY === 'YOUR_ELEVENLABS_API_KEY_HERE' || !ELEVENLABS_API_KEY) {
    throw new Error(MISSING_KEY_ERROR);
  }

  if (!text.trim()) {
    return Promise.reject("Text cannot be empty.");
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    let errorData;
    try {
        errorData = await response.json();
    } catch(e) {
        errorData = { detail: "An unknown error occurred."}
    }
    console.error("ElevenLabs API Error:", errorData);
    throw new Error(`ElevenLabs API request failed: ${errorData.detail?.message || errorData.detail}`);
  }

  return response.blob();
};
