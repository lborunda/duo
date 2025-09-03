
import React, { useState, useEffect } from 'react';
import type { Trip, TripHighlight } from '../types';
import { BackIcon } from './icons';

const Slideshow = ({ highlights }: { highlights: TripHighlight[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (highlights.length < 2) return;
        const timer = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % highlights.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [highlights.length]);

    if (highlights.length === 0) {
        return <div className="w-full h-64 bg-stone-200 flex items-center justify-center text-stone-500">No highlights yet.</div>;
    }

    return (
        <div className="w-full h-64 bg-black relative overflow-hidden">
            {highlights.map((h, index) => (
                <div
                    key={h.id}
                    className="absolute inset-0 transition-opacity duration-1000"
                    style={{ opacity: index === currentIndex ? 1 : 0 }}
                >
                    <img src={h.imageData} alt="Trip highlight" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
            ))}
             <div className="absolute bottom-2 left-2 flex gap-1">
                {highlights.map((_, index) => (
                    <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export const TripDetailView: React.FC<{ trip: Trip; onBack: () => void }> = ({ trip, onBack }) => {
    return (
        <div className="absolute inset-0 bg-stone-100 flex flex-col z-30">
            <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm p-4 flex items-center border-b border-stone-200 z-10">
                <button onClick={onBack} className="p-2 text-stone-500 hover:text-orange-500 rounded-full hover:bg-stone-200">
                    <BackIcon className="w-6 h-6" />
                </button>
                <div className="flex-grow text-center">
                    <h1 className="text-xl font-bold text-stone-800">{trip.name}</h1>
                    <p className="text-sm text-stone-500">{new Date(trip.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <Slideshow highlights={trip.highlights} />
                <div className="p-4 space-y-4">
                    {trip.highlights.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                            <img src={item.imageData} alt="Trip highlight" className="w-full h-56 object-cover" />
                            <div className="p-5 space-y-3">
                                {item.conversation.map((msg, index) => (
                                    msg.role === 'model' ? (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-500 flex-shrink-0"></div>
                                            <div className="flex-1 bg-stone-100 p-3 rounded-lg">
                                                <p className="text-stone-700 text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={index} className="flex justify-end">
                                            <div className="bg-orange-100/50 text-stone-600 p-3 rounded-lg max-w-md">
                                                <p className="text-base leading-relaxed whitespace-pre-wrap italic">"{msg.text}"</p>
                                            </div>
                                        </div>
                                    )
                                ))}
                                <p className="text-xs text-stone-400 mt-4 text-right">
                                    {new Date(item.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
