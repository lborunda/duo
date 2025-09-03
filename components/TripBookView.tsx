
import React, { useState } from 'react';
import type { Trip } from '../types';
import { TripListView } from './TripListView';
import { TripDetailView } from './TripDetailView';

interface TripBookViewProps {
  trips: Trip[];
  activeTripId: string | null;
  onBack: () => void;
  onCreateTrip: (name: string) => void;
  onRenameTrip: (tripId: string, newName: string) => void;
  onSetActiveTrip: (tripId: string) => void;
}

export const TripBookView: React.FC<TripBookViewProps> = (props) => {
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    const selectedTrip = props.trips.find(trip => trip.id === selectedTripId);

    if (selectedTrip) {
        return <TripDetailView trip={selectedTrip} onBack={() => setSelectedTripId(null)} />;
    }

    return (
        <TripListView 
            {...props}
            onSelectTrip={setSelectedTripId}
        />
    );
};
