import type { GeoPoint, Hospital, HospitalDetection } from "@/types/shift";
import { calculateDistanceInMeters } from "./haversine";

export type NearestHospitalResult = {
  hospital: Hospital | null;
  currentLocation: GeoPoint;
  distanceMeters: number | null;
  insideRadius: boolean;
};

export function findNearestHospital(
  currentLocation: GeoPoint,
  availableHospitals: Hospital[]
): NearestHospitalResult {
  const activeHospitals = availableHospitals.filter((hospital) => hospital.active);

  if (activeHospitals.length === 0) {
    return {
      hospital: null,
      currentLocation,
      distanceMeters: null,
      insideRadius: false
    };
  }

  const sortedHospitals = activeHospitals
    .map((hospital) => {
      const distanceMeters = calculateDistanceInMeters(currentLocation, {
        latitude: hospital.latitude,
        longitude: hospital.longitude
      });

      return {
        hospital,
        distanceMeters,
        insideRadius: distanceMeters <= hospital.radiusMeters
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  const nearest = sortedHospitals[0];

  return {
    hospital: nearest.hospital,
    currentLocation,
    distanceMeters: nearest.distanceMeters,
    insideRadius: nearest.insideRadius
  };
}

export function buildGpsDetection(result: NearestHospitalResult): HospitalDetection | null {
  if (!result.hospital) {
    return null;
  }

  return {
    hospital: result.hospital,
    currentLocation: result.currentLocation,
    distanceMeters: result.distanceMeters,
    insideRadius: result.insideRadius,
    gpsConfirmed: result.insideRadius,
    detectionMode: "gps",
    detectedAt: new Date().toISOString()
  };
}

export function buildDemoDetection(hospital: Hospital): HospitalDetection {
  return {
    hospital,
    currentLocation: {
      latitude: hospital.latitude,
      longitude: hospital.longitude
    },
    distanceMeters: 0,
    insideRadius: true,
    gpsConfirmed: false,
    detectionMode: "demo",
    detectedAt: new Date().toISOString()
  };
}
