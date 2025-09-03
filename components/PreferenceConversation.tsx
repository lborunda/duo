import React, { useState, useEffect } from 'react';
import type { Preferences } from '../types';
import { MicIcon } from './icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { AnimatedInterestIcon } from './AnimatedInterestIcon';

interface PreferenceConversationProps {
  onComplete: (preferences: Partial<Preferences>) => void;
  onCreateTrip?: (name: string) => void;
}

const INTEREST_KEYWORDS = ['history', 'art', 'architecture', 'culture', 'food', 'nature', 'translate'];

export const PreferenceConversation: React.FC<PreferenceConversationProps> = ({ onComplete, onCreateTrip }) => {
  const [conversation, setConversation] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [step, setStep] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [storedPrefs, setStoredPrefs] = useState<Partial<Preferences>>({});

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) handleUserResponse(transcript);
  }, [transcript]);

  useEffect(() => {
    if (step === 0) askQuestion("To get started, what kind of traveler are you? (history, food, art...)");
  }, [step]);

  const askQuestion = async (text: string) => {
    setIsLoading(true);
    setConversation(prev => [...prev, text]);
    setIsLoading(false);
  };

  const parseKeywords = (text: string): string[] => {
    const words = text.toLowerCase().split(/\W+/);
    const found = INTEREST_KEYWORDS.filter(k => words.includes(k));
    if (found.length > 0) {
      setKeywords(prev => [...new Set([...prev, ...found])]);
    }
    return found;
  };

  const computeInterestWeights = (userKeywords: string[]) => {
    const base = 0.3;
    const boost = 0.5;
    return INTEREST_KEYWORDS.reduce((acc, key) => {
      acc[key] = userKeywords.includes(key) ? base + boost : base;
      return acc;
    }, {} as Record<string, number>);
  };

  const handleUserResponse = async (text: string) => {
    stopListening();
    const userReply = text.trim();
    if (!userReply) return;

    setConversation(prev => [...prev, userReply]);

    if (step === 0) {
      const found = parseKeywords(userReply);
      if (found.length === 0) {
        await askQuestion("Hmm, I didn't quite catch your interests. Try 'art', 'food', or 'nature'?");
        return;
      }
      setStep(1);
      await askQuestion("Awesome! Do you prefer brief summaries, narrative stories, or a translation service?");
    } else if (step === 1) {
      const lower = userReply.toLowerCase();
      const detailLevel = /brief|short/.test(lower) ? 0.2 : 0.8;
      const creativity = /narrative|story/.test(lower) ? 0.7 : 0.3;

      const preferences: Partial<Preferences> = {
        personality: { detailLevel, creativity },
        interests: computeInterestWeights(keywords),
      };

      setStoredPrefs(preferences); // store for later
      setStep(2);
      await askQuestion("Would you like to start a new trip?");
    } else if (step === 2) {
        const lower = userReply.toLowerCase();
        if (lower.includes('yes') && onCreateTrip) {
            const tripName = `Trip ${new Date().toLocaleDateString()}`;
            onCreateTrip(tripName);
            await askQuestion(`Trip "${tripName}" created!`);
        } else {
            await askQuestion("Okay — you can create a trip anytime.");
        }
        setIsComplete(true);
        setTimeout(() => onComplete(storedPrefs), 1000);
        }

  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    handleUserResponse(manualInput.trim());
    setManualInput('');
  };

  return (
    <div className="h-full flex flex-col p-4 text-center">
      <div className="flex-grow flex flex-col items-center justify-center space-y-4">
        <AnimatedInterestIcon keywords={keywords} />
        <div className="min-h-[8rem] flex items-center justify-center p-4">
          <p className="text-xl font-medium text-stone-700 max-w-md">
            {conversation[conversation.length - 1] || 'Waking up DUO...'}
          </p>
        </div>
        <div className="h-8">
          {isListening && <p className="text-lg text-orange-600 italic">{transcript || "..."}</p>}
        </div>

        {!isComplete && (
          <div className="w-full max-w-md flex space-x-2 mt-2">
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
              placeholder="Or type your answer..."
              className="flex-1 border border-stone-300 rounded px-3 py-2 text-stone-700 shadow-sm"
            />
            <button
              onClick={handleManualSubmit}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow-md"
            >
              Send
            </button>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 mt-auto flex flex-col items-center justify-center pb-4">
        <p className="text-stone-500 text-sm mb-4 h-4">
          {isComplete ? 'All set!' : (isListening ? 'I\'m listening...' : (isLoading ? 'Thinking...' : 'Tap mic or type'))}
        </p>
        <button
          onClick={() => isListening ? stopListening() : startListening()}
          disabled={isLoading || isComplete}
          className={`relative w-20 h-20 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 scale-110' : 'bg-orange-500 hover:bg-orange-600'} text-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening && <span className="absolute inset-0 bg-red-400 rounded-full animate-ping"></span>}
          <MicIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
