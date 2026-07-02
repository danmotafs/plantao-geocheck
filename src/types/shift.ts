export type Hospital = {
  id: string;
  name: string;
  shortName: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  active: boolean;
};

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type DetectionMode = "gps" | "demo" | "manual";

export type HospitalDetection = {
  hospital: Hospital;
  currentLocation: GeoPoint | null;
  distanceMeters: number | null;
  insideRadius: boolean;
  gpsConfirmed: boolean;
  detectionMode: DetectionMode;
  detectedAt: string;
};

export type ShiftStatus = "open" | "finished" | "manual_review" | "cancelled";

export type Shift = {
  id: string;

  doctorName: string;
  doctorCrm: string;

  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;

  sector: string;
  plannedHours: number;

  checkinTime: string;
  plannedCheckoutTime: string;
  actualCheckoutTime: string | null;

  checkinLatitude: number | null;
  checkinLongitude: number | null;
  checkinDistanceMeters: number | null;

  gpsConfirmed: boolean;
  doctorConfirmedArrival: boolean;
  detectionMode: DetectionMode;

  status: ShiftStatus;
  notes: string;

  createdAt: string;
  updatedAt: string;
};

export type DoctorProfile = {
  doctorName: string;
  doctorCrm: string;
};
