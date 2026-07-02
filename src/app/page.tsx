"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, FileText, MapPin, Stethoscope } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ButtonLink } from "@/components/ui/button";
import { Card, PageShell } from "@/components/ui/card";
import { getOpenShift, getShifts } from "@/lib/storage/shifts-storage";
import { calculateWorkedHours, formatHours } from "@/lib/time/datetime";
import type { Shift } from "@/types/shift";

export default function HomePage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [openShift, setOpenShift] = useState<Shift | null>(null);

  useEffect(() => {
    setShifts(getShifts());
    setOpenShift(getOpenShift());
  }, []);

  const summary = useMemo(() => {
    const finished = shifts.filter((shift) => shift.status === "finished");
    const totalWorkedHours = finished.reduce(
      (sum, shift) => sum + calculateWorkedHours(shift.checkinTime, shift.actualCheckoutTime),
      0
    );

    return {
      totalShifts: shifts.length,
      totalWorkedHours
    };
  }, [shifts]);

  return (
    <>
      <PageShell>
        <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-teal-800 to-slate-950 p-6 text-white shadow-sm">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Stethoscope size={30} />
          </div>

          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-teal-100">
            Plantão GeoCheck
          </p>

          <h1 className="mb-3 text-3xl font-bold tracking-tight">
            Registro inteligente de plantões por GPS.
          </h1>

          <p className="leading-7 text-teal-50">
            O app identifica se o médico chegou ao hospital, confirma o início
            do plantão e organiza o relatório mensal.
          </p>
        </div>

        {openShift && (
          <Card className="mb-4 border border-amber-200 bg-amber-50">
            <p className="text-sm font-bold uppercase tracking-wide text-amber-800">
              Plantão em aberto
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">
              {openShift.hospitalName}
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              {openShift.sector} · {openShift.plannedHours}h previstas
            </p>
            <div className="mt-4">
              <ButtonLink href="/plantao/aberto">Finalizar plantão</ButtonLink>
            </div>
          </Card>
        )}

        <div className="mb-4 grid grid-cols-2 gap-3">
          <Card>
            <ClipboardCheck className="mb-3 text-teal-700" size={24} />
            <p className="text-2xl font-bold text-slate-950">
              {summary.totalShifts}
            </p>
            <p className="text-sm text-slate-600">plantões registrados</p>
          </Card>

          <Card>
            <FileText className="mb-3 text-teal-700" size={24} />
            <p className="text-2xl font-bold text-slate-950">
              {formatHours(summary.totalWorkedHours)}h
            </p>
            <p className="text-sm text-slate-600">horas finalizadas</p>
          </Card>
        </div>

        <div className="grid gap-3">
          <ButtonLink href="/detectar-chegada">
            <MapPin size={20} />
            Iniciar teste de chegada
          </ButtonLink>

          <ButtonLink href="/plantao/historico" variant="secondary">
            Ver histórico mensal
          </ButtonLink>

          <ButtonLink href="/relatorios/mensal" variant="secondary">
            Gerar relatório
          </ButtonLink>
        </div>

        <Card className="mt-4">
          <p className="font-semibold text-slate-950">Hospital de teste</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Hospital Ana Nery · Salvador/BA · raio inicial de 250m.
          </p>
        </Card>
      </PageShell>

      <BottomNav />
    </>
  );
}
