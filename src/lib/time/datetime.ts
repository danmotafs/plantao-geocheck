export function nowForDatetimeInput(): string {
  const now = new Date();
  return toDatetimeLocalValue(now);
}

export function toDatetimeLocalValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export function addHoursToDatetimeLocal(datetimeLocal: string, hours: number): string {
  const date = new Date(datetimeLocal);
  date.setMinutes(date.getMinutes() + hours * 60);
  return toDatetimeLocalValue(date);
}

export function formatDatetime(datetimeLocalOrIso: string | null | undefined): string {
  if (!datetimeLocalOrIso) {
    return "—";
  }

  const date = new Date(datetimeLocalOrIso);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

export function formatDateOnly(datetimeLocalOrIso: string | null | undefined): string {
  if (!datetimeLocalOrIso) {
    return "—";
  }

  const date = new Date(datetimeLocalOrIso);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short"
  }).format(date);
}

export function formatTimeOnly(datetimeLocalOrIso: string | null | undefined): string {
  if (!datetimeLocalOrIso) {
    return "—";
  }

  const date = new Date(datetimeLocalOrIso);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function getCurrentMonthValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isInMonth(datetimeLocalOrIso: string, monthValue: string): boolean {
  if (!datetimeLocalOrIso || !monthValue) {
    return false;
  }

  const date = new Date(datetimeLocalOrIso);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}` === monthValue;
}

export function calculateWorkedHours(
  checkinTime: string,
  actualCheckoutTime: string | null
): number {
  if (!actualCheckoutTime) {
    return 0;
  }

  const start = new Date(checkinTime);
  const end = new Date(actualCheckoutTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffMilliseconds = end.getTime() - start.getTime();

  if (diffMilliseconds <= 0) {
    return 0;
  }

  return diffMilliseconds / 1000 / 60 / 60;
}

export function formatHours(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}
