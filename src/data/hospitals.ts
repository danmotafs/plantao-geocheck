import type { Hospital } from "@/types/shift";

export const hospitals: Hospital[] = [
  {
    id: "hospital-ana-nery-salvador-ba",
    name: "Hospital Ana Nery",
    shortName: "Ana Nery",
    address: "Rua Saldanha Marinho, Caixa d'Água, Salvador/BA",
    neighborhood: "Caixa d'Água",
    city: "Salvador",
    state: "BA",
    latitude: -12.95736,
    longitude: -38.49582,
    radiusMeters: 250,
    active: true
  }
];

export function getHospitalById(hospitalId: string): Hospital | null {
  return hospitals.find((hospital) => hospital.id === hospitalId) ?? null;
}
