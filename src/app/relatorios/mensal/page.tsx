"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Printer } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, PageShell, SectionTitle } from "@/components/ui/card";
import { exportShiftsToCsv } from "@/lib/reports/export-csv";
import { getShifts } from "@/lib/storage/shifts-storage";
import {
  calculateWorkedHours,
  formatDateOnly,
  formatHours,
  formatTimeOnly,
  getCurrentMonthValue,
  isInMonth
} from "@/lib/time/datetime";
import type { Shift } from "@/types/shift";

function getMonthLabel(monthValue: string): string {
  if (!monthValue) {
    return "—";
  }

  const [year, month] = monthValue.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function statusLabel(status: Shift["status"]) {
  const labels: Record<Shift["status"], string> = {
    open: "Aberto",
    finished: "Finalizado",
    manual_review: "Revisão manual",
    cancelled: "Cancelado"
  };

  return labels[status];
}

export default function RelatorioMensalPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [month, setMonth] = useState("");

  useEffect(() => {
    setShifts(getShifts());
    setMonth(getCurrentMonthValue());
  }, []);

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => isInMonth(shift.checkinTime, month));
  }, [shifts, month]);

  const summary = useMemo(() => {
    const finishedShifts = filteredShifts.filter((shift) => shift.status === "finished");
    const openShifts = filteredShifts.filter((shift) => shift.status === "open");
    const gpsConfirmedShifts = filteredShifts.filter((shift) => shift.gpsConfirmed);

    const plannedHours = filteredShifts.reduce(
      (sum, shift) => sum + shift.plannedHours,
      0
    );

    const workedHours = filteredShifts.reduce(
      (sum, shift) => sum + calculateWorkedHours(shift.checkinTime, shift.actualCheckoutTime),
      0
    );

    return {
      totalShifts: filteredShifts.length,
      finishedShifts: finishedShifts.length,
      openShifts: openShifts.length,
      gpsConfirmedShifts: gpsConfirmedShifts.length,
      plannedHours,
      workedHours
    };
  }, [filteredShifts]);

  function handleExportCsv() {
    exportShiftsToCsv(
      filteredShifts,
      `relatorio-plantoes-${month || "mes"}.csv`
    );
  }

  return (
    <>
      <PageShell>
        <Card className="print-card mb-4">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
            <FileText size={28} />
          </div>

          <SectionTitle
            eyebrow="Relatório mensal"
            title="Base de plantões para conferência"
            description="Resumo mensal para cálculo de recebimento."
          />

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Mês de referência</p>
            <p className="mt-1 text-xl font-bold capitalize text-slate-950">
              {getMonthLabel(month)}
            </p>
          </div>
        </Card>

        <Card className="no-print mb-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-800">Mês</span>
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-950 outline-none focus:border-teal-600"
            />
          </label>

          <div className="mt-4 grid gap-3">
            <Button onClick={handleExportCsv} disabled={filteredShifts.length === 0}>
              <Download size={20} />
              Exportar CSV
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.print()}
              disabled={filteredShifts.length === 0}
            >
              <Printer size={20} />
              Imprimir relatório
            </Button>
          </div>
        </Card>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <Card className="print-card">
            <p className="text-sm text-slate-600">Plantões</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">
              {summary.totalShifts}
            </p>
          </Card>

          <Card className="print-card">
            <p className="text-sm text-slate-600">Finalizados</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">
              {summary.finishedShifts}
            </p>
          </Card>

          <Card className="print-card">
            <p className="text-sm text-slate-600">Horas previstas</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">
              {formatHours(summary.plannedHours)}h
            </p>
          </Card>

          <Card className="print-card">
            <p className="text-sm text-slate-600">Horas realizadas</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">
              {formatHours(summary.workedHours)}h
            </p>
          </Card>
        </div>

        <Card className="print-card mb-4">
          <h2 className="mb-3 text-lg font-bold text-slate-950">
            Indicadores de conferência
          </h2>

          <div className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4 rounded-2xl bg-slate-50 p-3">
              <span className="text-slate-600">Plantões em aberto</span>
              <strong className="text-slate-950">{summary.openShifts}</strong>
            </div>

            <div className="flex justify-between gap-4 rounded-2xl bg-slate-50 p-3">
              <span className="text-slate-600">GPS confirmado</span>
              <strong className="text-slate-950">
                {summary.gpsConfirmedShifts}/{summary.totalShifts}
              </strong>
            </div>
          </div>
        </Card>

        <Card className="print-card">
          <h2 className="mb-4 text-lg font-bold text-slate-950">
            Detalhamento dos plantões
          </h2>

          {filteredShifts.length === 0 && (
            <p className="text-sm leading-6 text-slate-600">
              Nenhum plantão registrado para o mês selecionado.
            </p>
          )}

          <div className="grid gap-3">
            {filteredShifts.map((shift) => (
              <div key={shift.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3">
                  <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
                    {formatDateOnly(shift.checkinTime)}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-950">
                    {shift.hospitalName}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {shift.doctorName} · {shift.doctorCrm}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500">Setor</p>
                    <p className="font-bold text-slate-950">{shift.sector}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500">Status</p>
                    <p className="font-bold text-slate-950">{statusLabel(shift.status)}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500">Entrada</p>
                    <p className="font-bold text-slate-950">
                      {formatTimeOnly(shift.checkinTime)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500">Saída real</p>
                    <p className="font-bold text-slate-950">
                      {formatTimeOnly(shift.actualCheckoutTime)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500">Previstas</p>
                    <p className="font-bold text-slate-950">
                      {formatHours(shift.plannedHours)}h
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500">Realizadas</p>
                    <p className="font-bold text-slate-950">
                      {formatHours(
                        calculateWorkedHours(shift.checkinTime, shift.actualCheckoutTime)
                      )}
                      h
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      shift.gpsConfirmed
                        ? "bg-teal-50 text-teal-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {shift.gpsConfirmed ? "GPS confirmado" : "GPS não confirmado"}
                  </span>

                  {shift.checkinDistanceMeters !== null && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      Distância: {Math.round(shift.checkinDistanceMeters)}m
                    </span>
                  )}
                </div>

                {shift.notes && (
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    {shift.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </PageShell>

      <BottomNav />
    </>
  );
}
