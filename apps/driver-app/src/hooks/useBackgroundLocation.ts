import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useState } from 'react';

const TASK_NAME = 'FS_DRIVER_LOCATION_TASK';

export default function useBackgroundLocation() {
  const [isTracking, setIsTracking] = useState<boolean>(false);

  async function startTracking(): Promise<void> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Foreground location permission denied');
      const bg = await Location.requestBackgroundPermissionsAsync();
      if (bg.status !== 'granted') throw new Error('Background location permission denied');

      await Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        distanceInterval: 10,
        deferredUpdatesInterval: 1000,
        showsBackgroundLocationIndicator: true
      });
      setIsTracking(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('startTracking error', error);
      throw error;
    }
  }

  async function stopTracking(): Promise<void> {
    try {
      await Location.stopLocationUpdatesAsync(TASK_NAME);
      setIsTracking(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('stopTracking error', error);
      throw error;
    }
  }

  return { startTracking, stopTracking, isTracking };
}

type LocationCoords = { latitude: number; longitude: number; speed?: number };

TaskManager.defineTask(TASK_NAME, ({ data, error }: { data?: unknown; error?: Error }) => {
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Task error', error);
    return;
  }
  try {
    const payload = data as { locations?: Array<{ coords: LocationCoords }> } | undefined;
    const locations = payload?.locations;
    if (locations && locations.length) {
      const loc = locations[0];
      // Log background location locally; integration to backend via socket/REST should be implemented in production.
      // eslint-disable-next-line no-console
      console.log('BG location', loc.coords.latitude, loc.coords.longitude, 'speed', loc.coords.speed);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Task handler parse error', err);
  }
});
