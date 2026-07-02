import type { GeoPoint } from "@/types/shift";

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function calculateDistanceInMeters(
  origin: GeoPoint,
  destination: GeoPoint
): number {
  const earthRadiusMeters = 6371000;

  const deltaLatitude = toRadians(destination.latitude - origin.latitude);
  const deltaLongitude = toRadians(destination.longitude - origin.longitude);

  const originLatitudeRad = toRadians(origin.latitude);
  const destinationLatitudeRad = toRadians(destination.latitude);

  const haversineValue =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(originLatitudeRad) *
      Math.cos(destinationLatitudeRad) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));

  return earthRadiusMeters * angularDistance;
}
