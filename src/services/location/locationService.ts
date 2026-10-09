import type { LocationData } from '../../types/dcb';

export class LocationService {
  public static async getCurrentLocation(): Promise<LocationData> {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return this.createFallbackLocation('Geolocation API not supported in browser environment');
    }

    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: parseFloat(pos.coords.latitude.toFixed(5)),
            longitude: parseFloat(pos.coords.longitude.toFixed(5)),
            accuracy: parseFloat(pos.coords.accuracy.toFixed(1)),
            locationName: `GPS Fix (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
            isStale: false,
            timestamp: new Date(pos.timestamp).toISOString()
          });
        },
        (err) => {
          console.warn('GPS location request failed or timed out:', err.message);
          resolve(this.createFallbackLocation(`GPS Fix Failed: ${err.message}`));
        },
        options
      );
    });
  }

  public static createManualLocation(landmarkName: string, lat?: number, lon?: number): LocationData {
    return {
      latitude: lat !== undefined ? lat : 13.0827,
      longitude: lon !== undefined ? lon : 80.2707,
      accuracy: 50.0,
      locationName: landmarkName || 'Manual Landmark Location',
      isStale: false,
      timestamp: new Date().toISOString()
    };
  }

  private static createFallbackLocation(reason: string): LocationData {
    return {
      latitude: null,
      longitude: null,
      accuracy: null,
      locationName: `Location Unavailable (${reason})`,
      isStale: true,
      timestamp: new Date().toISOString()
    };
  }
}
