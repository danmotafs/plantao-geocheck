"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, PageShell, SectionTitle } from "@/components/ui/card";
import { deleteShift, getShifts } from "@/lib/storage/shifts-storage";
import {
  calculateWorkedHours,
  formatDateOnly,
  formatHours,
  formatTimeOnly,
  getCurrentMonthValue,
  isInMonth
} from "@/lib/time/datetime";
import type { Shift } from "@/types/shift";

function statusLabel(status: Shift["status"]) {
  const labels: Record<Shift["status"], string> = {
    open: "Aberto",
    finished: "Finalizado",
    manual_review: "Revisão manual",
    cancelled: "Cancelado"
  };

  return labels[status];
}

export default function HistoricoPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [month, setMonth] = useState("");

  useEffect(() => {
    setShifts(getShifts());
    setMonth(getCurrentMonthValue());
  }, []);

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => isInMonth(shift.checkinTime, month));
  }, [shifts, month]);

  const totalWorkedHours = useMemo(() => {
    return filteredShifts.reduce(
      (sum, shift) => sum + calculateWorkedHours(shift.checkinTime, shift.actualCheckoutTime),
      0
    );
  }, [filteredShifts]);

  function handleDeleteShift(shiftId: string) {
    const confirmDelete = window.confirm(
      "Deseja excluir este plantão do histórico local?"
    );

    if (!confirmDelete) {
      return;
    }

    deleteShift(shiftId);
    setShifts(getShifts());
  }

  return (
    <>
      <PageShell>
        <Card className="mb-4">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
            <CalendarDays size={28} />
          </div>

          <SectionTitle
            eyebrow="Histórico"
            title="Plantões registrados"
            description="Consulte os plantões salvos neste navegador."
          />
        </Card>

        <Card className="mb-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-800">Mês</span>
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-950 outline-none focus:border-teal-600"
            />
          </label>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Plantões</p>
              <p className="text-2xl font-bold text-slate-950">
                {filteredShifts.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Horas realizadas</p>
              <p className="text-2xl font-bold text-slate-950">
                {formatHours(totalWorkedHours)}h
              </p>
            </div>
          </div>
        </Card>

        {filteredShifts.length === 0 && (
          <Card>
            <p className="font-bold text-slate-950">
              Nenhum plantão encontrado para este mês.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Faça a detecção de chegada para iniciar o primeiro registro.
            </p>
            <div className="mt-4">
              <ButtonLink href="/detectar-chegada">Iniciar plantão</ButtonLink>
            </div>
          </Card>
        )}

        <div className="grid gap-3">
          {filteredShifts.map((shift) => (
            <Card key={shift.id}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
                    {formatDateOnly(shift.checkinTime)}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {shift.hospitalName}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {shift.sector} · {shift.plannedHours}h previstas
                  </p>
                </div>

                <button
                  aria-label="Excluir plantão"
                  onClick={() => handleDeleteShift(shift.id)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-slate-500">Entrada</p>
                  <p className="font-bold text-slate-950">
                    {formatTimeOnly(shift.checkinTime)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-slate-500">Saída</p>
                  <p className="font-bold text-slate-950">
                    {formatTimeOnly(shift.actualCheckoutTime)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-slate-500">Horas</p>
                  <p className="font-bold text-slate-950">
                    {formatHours(
                      calculateWorkedHours(shift.checkinTime, shift.actualCheckoutTime)
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {statusLabel(shift.status)}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    shift.gpsConfirmed
                      ? "bg-teal-50 text-teal-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {shift.gpsConfirmed ? "GPS confirmado" : "GPS não confirmado"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </PageShell>

      <BottomNav />
    </>
  );
}
