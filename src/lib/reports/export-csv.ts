import type { Shift } from "@/types/shift";
import { calculateWorkedHours, formatDateOnly, formatTimeOnly } from "@/lib/time/datetime";

function sanitizeCsvValue(value: string | number | boolean | null | undefined): string {
  const normalized = value === null || value === undefined ? "" : String(value);
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}

function buildCsvRows(shifts: Shift[]): string[][] {
  return [
    [
      "Medico",
      "CRM",
      "Data",
      "Hospital",
      "Setor",
      "Entrada",
      "Saida prevista",
      "Saida real",
      "Carga prevista",
      "Horas realizadas",
      "GPS confirmado",
      "Distancia GPS em metros",
      "Status",
      "Observacao"
    ],
    ...shifts.map((shift) => [
      shift.doctorName,
      shift.doctorCrm,
      formatDateOnly(shift.checkinTime),
      shift.hospitalName,
      shift.sector,
      formatTimeOnly(shift.checkinTime),
      formatTimeOnly(shift.plannedCheckoutTime),
      formatTimeOnly(shift.actualCheckoutTime),
      String(shift.plannedHours),
      calculateWorkedHours(shift.checkinTime, shift.actualCheckoutTime).toFixed(2),
      shift.gpsConfirmed ? "Sim" : "Não",
      shift.checkinDistanceMeters === null ? "" : String(Math.round(shift.checkinDistanceMeters)),
      shift.status,
      shift.notes
    ])
  ];
}

export function exportShiftsToCsv(shifts: Shift[], filename: string): void {
  const rows = buildCsvRows(shifts);
  const csvContent = rows
    .map((row) => row.map((cell) => sanitizeCsvValue(cell)).join(";"))
    .join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
