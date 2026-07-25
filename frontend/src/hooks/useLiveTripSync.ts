import { useEffect, useRef } from 'react';
import { TravelExpense, ItineraryStop, TripParticipant } from '../types';

export function useLiveTripSync(
  onRemoteUpdate: (data: { expenses?: TravelExpense[]; stops?: ItineraryStop[]; message: string; updatedBy: string }) => void
) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const deviceIdRef = useRef<string>(`dev_${Math.random().toString(36).substring(2, 9)}`);

  const broadcastChange = (payload: {
    expenses?: TravelExpense[];
    stops?: ItineraryStop[];
    participants?: TripParticipant[];
    message: string;
    updatedBy: string;
  }) => {
    try {
      localStorage.setItem('travelpulse_shared_trip_data', JSON.stringify(payload));
    } catch (e) {
      console.error(e);
    }

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'TRIP_SYNC',
        senderId: deviceIdRef.current,
        payload
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('travelpulse_shared_trip_v1');
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload, senderId } = event.data || {};
        if (senderId && senderId !== deviceIdRef.current && type === 'TRIP_SYNC') {
          onRemoteUpdate(payload);
        }
      };

      return () => channel.close();
    }
  }, [onRemoteUpdate]);

  return { broadcastChange };
}