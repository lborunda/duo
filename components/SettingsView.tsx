import React, { useState } from 'react';
import { Preferences } from '../types';
import { PreferenceTuner } from './PreferenceTuner';
import { PreferenceConversation } from './PreferenceConversation';

interface SettingsViewProps {
  preferences: Preferences;
  onPreferencesChange: (prefs: Preferences) => void;
  onBack: () => void;
  onCreateTrip?: (name: string) => void;
  hasVisitedBefore: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onPreferencesChange,
  onBack,
  onCreateTrip,
  hasVisitedBefore,
}) => {
  const [step, setStep] = useState<'choice' | 'interview' | 'manual'>(() => {
    const interviewed = localStorage.getItem('hasInterviewed') === 'true';
    return hasVisitedBefore || interviewed ? 'manual' : 'choice';
  });

  const handleCompleteInterview = (partialPrefs: Partial<Preferences>) => {
    const updated = {
      ...preferences,
      ...partialPrefs,
      personality: {
        ...preferences.personality,
        ...partialPrefs.personality,
      },
      interests: {
        ...preferences.interests,
        ...partialPrefs.interests,
      },
    };
    onPreferencesChange(updated);
    localStorage.setItem('hasInterviewed', 'true');
    setStep('manual');
  };

  const hasPreferences =
    preferences &&
    preferences.personality &&
    preferences.interests;

  if (!hasPreferences) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-stone-500 text-lg">Loading preferences...</p>
      </div>
    );
  }

  if (step === 'choice') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 space-y-6">
        <h2 className="text-2xl font-bold">Set Preferences</h2>
        <p className="text-stone-600 max-w-md text-center">
          You can answer a few quick questions or adjust preferences manually.
        </p>
        <button
          onClick={() => setStep('interview')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow-md"
        >
          Answer a Few Questions
        </button>
        <button
          onClick={() => setStep('manual')}
          className="text-blue-600 underline hover:text-blue-800 text-sm"
        >
          Set Preferences Manually
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-4 flex flex-col items-center space-y-6">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-2xl font-bold text-center flex-1">Preferences</h2>
      </div>

      {step === 'interview' ? (
        <PreferenceConversation
          onComplete={handleCompleteInterview}
          onCreateTrip={onCreateTrip}
        />
      ) : (
        <>
          <PreferenceTuner
            preferences={preferences}
            onPreferencesChange={onPreferencesChange}
          />

          {/* Assistant Orb Button for Redo Interview */}
          <div
            className="flex flex-col items-center mt-6 space-y-2 cursor-pointer group"
            onClick={() => setStep('interview')}
          >
            <div className="relative w-20 h-20 rounded-full bg-orange-500 shadow-lg group-hover:scale-110 transition-transform">
              <div className="absolute inset-0 rounded-full bg-orange-400 opacity-40 animate-ping" />
              <div className="flex items-center justify-center w-full h-full text-white text-2xl font-bold">
                AI
              </div>
            </div>
            <p className="text-sm text-orange-600 group-hover:text-orange-700 transition-colors">
              Redo Preference Interview
            </p>
          </div>

          {/* Back and Create Buttons */}
          <button
            onClick={onBack}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md shadow-md"
          >
            Back
          </button>
          <button
            onClick={() => {
              const name = prompt("Name your new trip:");
              if (name && onCreateTrip) onCreateTrip(name);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md mt-2"
          >
            Create New Trip
          </button>
        </>
      )}
    </div>
  );
};
