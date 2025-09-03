
import React from 'react';
import { DuoBrainIcon, HistoryIcon, ArtIcon, ArchitectureIcon, CultureIcon, FoodIcon, NatureIcon } from './icons';

// Mapping keywords to icons
const interestIconMap: { [key: string]: React.FC<{ className?: string }> } = {
  history: HistoryIcon,
  art: ArtIcon,
  architecture: ArchitectureIcon,
  culture: CultureIcon,
  food: FoodIcon,
  nature: NatureIcon,
};

const ALL_KEYWORDS = Object.keys(interestIconMap);

export const AnimatedInterestIcon: React.FC<{ keywords: string[] }> = ({ keywords }) => {
  // Find the last valid keyword that has an icon
  const activeKeyword = [...keywords].reverse().find(k => interestIconMap[k]);

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <DuoBrainIcon
        className={`absolute inset-0 transition-all duration-500 ease-in-out text-orange-500 ${!activeKeyword ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
      />
      {ALL_KEYWORDS.map(key => {
        const Icon = interestIconMap[key];
        return (
          <Icon
            key={key}
            className={`absolute inset-0 transition-all duration-500 ease-in-out text-orange-500 ${activeKeyword === key ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          />
        );
      })}
    </div>
  );
};
