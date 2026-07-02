import type { DoctorProfile, HospitalDetection, Shift } from "@/types/shift";

const SHIFTS_STORAGE_KEY = "plantao_geocheck_shifts_v1";
const PROFILE_STORAGE_KEY = "plantao_geocheck_profile_v1";
const DETECTION_STORAGE_KEY = "plantao_geocheck_last_detection_v1";

function assertBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Esta operação só pode ser executada no navegador.");
  }
}

export function getShifts(): Shift[] {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(SHIFTS_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as Shift[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export function setShifts(shifts: Shift[]): void {
  assertBrowser();
  window.localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(shifts));
}

export function saveShift(shift: Shift): void {
  const currentShifts = getShifts();
  setShifts([shift, ...currentShifts]);
}

export function updateShift(shiftId: string, updater: (shift: Shift) => Shift): Shift | null {
  const currentShifts = getShifts();
  let updatedShift: Shift | null = null;

  const nextShifts = currentShifts.map((shift) => {
    if (shift.id !== shiftId) {
      return shift;
    }

    updatedShift = updater(shift);
    return updatedShift;
  });

  setShifts(nextShifts);
  return updatedShift;
}

export function deleteShift(shiftId: string): void {
  const currentShifts = getShifts();
  setShifts(currentShifts.filter((shift) => shift.id !== shiftId));
}

export function getOpenShift(): Shift | null {
  return getShifts().find((shift) => shift.status === "open") ?? null;
}

export function getShiftById(shiftId: string): Shift | null {
  return getShifts().find((shift) => shift.id === shiftId) ?? null;
}

export function clearAllShifts(): void {
  assertBrowser();
  window.localStorage.removeItem(SHIFTS_STORAGE_KEY);
}

export function getDoctorProfile(): DoctorProfile {
  if (typeof window === "undefined") {
    return {
      doctorName: "",
      doctorCrm: ""
    };
  }

  const rawValue = window.localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!rawValue) {
    return {
      doctorName: "",
      doctorCrm: ""
    };
  }

  try {
    const parsed = JSON.parse(rawValue) as DoctorProfile;

    return {
      doctorName: parsed.doctorName ?? "",
      doctorCrm: parsed.doctorCrm ?? ""
    };
  } catch {
    return {
      doctorName: "",
      doctorCrm: ""
    };
  }
}

export function saveDoctorProfile(profile: DoctorProfile): void {
  assertBrowser();
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function saveLastDetection(detection: HospitalDetection): void {
  assertBrowser();
  window.sessionStorage.setItem(DETECTION_STORAGE_KEY, JSON.stringify(detection));
}

export function getLastDetection(): HospitalDetection | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(DETECTION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as HospitalDetection;
  } catch {
    return null;
  }
}

export function clearLastDetection(): void {
  assertBrowser();
  window.sessionStorage.removeItem(DETECTION_STORAGE_KEY);
}

export function createShiftId(): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `shift-${Date.now()}-${randomPart}`;
}
