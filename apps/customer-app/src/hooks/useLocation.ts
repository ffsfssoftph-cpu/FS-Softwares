import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

export default function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        if (mounted) setLocation(loc);
      } catch (error) {
        // console.warn
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { location };
}
