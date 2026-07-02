"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, PageShell, SectionTitle } from "@/components/ui/card";
import { getOpenShift, updateShift } from "@/lib/storage/shifts-storage";
import {
  calculateWorkedHours,
  formatDatetime,
  formatHours,
  nowForDatetimeInput
} from "@/lib/time/datetime";
import type { Shift } from "@/types/shift";

export default function PlantaoAbertoPage() {
  const [openShift, setOpenShift] = useState<Shift | null>(null);
  const [actualCheckoutTime, setActualCheckoutTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const currentOpenShift = getOpenShift();
    setOpenShift(currentOpenShift);
    setActualCheckoutTime(nowForDatetimeInput());
  }, []);

  function handleFinishShift() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!openShift) {
      setErrorMessage("Nenhum plantão em aberto foi encontrado.");
      return;
    }

    if (!actualCheckoutTime) {
      setErrorMessage("Informe o horário de saída real.");
      return;
    }

    const checkinDate = new Date(openShift.checkinTime);
    const checkoutDate = new Date(actualCheckoutTime);

    if (checkoutDate <= checkinDate) {
      setErrorMessage("A saída real não pode ser anterior à chegada.");
      return;
    }

    const updated = updateShift(openShift.id, (shift) => ({
      ...shift,
      actualCheckoutTime,
      status: "finished",
      updatedAt: new Date().toISOString()
    }));

    setOpenShift(null);
    setSuccessMessage(
      `Plantão finalizado com ${formatHours(
        calculateWorkedHours(openShift.checkinTime, actualCheckoutTime)
      )}h realizadas.`
    );

    if (updated) {
      setActualCheckoutTime(nowForDatetimeInput());
    }
  }

  return (
    <>
      <PageShell>
        <Card className="mb-4">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
            <Clock size={28} />
          </div>

          <SectionTitle
            eyebrow="Plantão em aberto"
            title="Finalize seu plantão ao sair do hospital."
            description="Confirme o horário de saída real para consolidar as horas realizadas no relatório."
          />
        </Card>

        {successMessage && (
          <Card className="mb-4 border border-teal-200 bg-teal-50">
            <p className="font-bold text-teal-950">{successMessage}</p>
            <div className="mt-4">
              <ButtonLink href="/relatorios/mensal">Ver relatório mensal</ButtonLink>
            </div>
          </Card>
        )}

        {!openShift && !successMessage && (
          <Card>
            <p className="font-bold text-slate-950">
              Nenhum plantão em aberto no momento.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Inicie um novo registro pela tela de detecção de chegada.
            </p>
            <div className="mt-4">
              <ButtonLink href="/detectar-chegada">Detectar chegada</ButtonLink>
            </div>
          </Card>
        )}

        {openShift && (
          <Card>
            <div className="mb-5 rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-teal-700">
                <MapPin size={18} />
                <p className="text-sm font-bold uppercase tracking-wide">
                  {openShift.gpsConfirmed ? "GPS confirmado" : "GPS não confirmado"}
                </p>
              </div>

              <h2 className="text-2xl font-bold text-slate-950">
                {openShift.hospitalName}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {openShift.hospitalAddress}
              </p>
            </div>

            <div className="mb-5 grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Setor</p>
                <p className="font-bold text-slate-950">{openShift.sector}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Chegada</p>
                  <p className="font-bold text-slate-950">
                    {formatDatetime(openShift.checkinTime)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Carga</p>
                  <p className="font-bold text-slate-950">
                    {openShift.plannedHours}h
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Saída prevista</p>
                <p className="font-bold text-slate-950">
                  {formatDatetime(openShift.plannedCheckoutTime)}
                </p>
              </div>
            </div>

            <label className="mb-4 grid gap-2">
              <span className="text-sm font-bold text-slate-800">
                Horário de saída real
              </span>
              <input
                type="datetime-local"
                value={actualCheckoutTime}
                onChange={(event) => setActualCheckoutTime(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-950 outline-none focus:border-teal-600"
              />
            </label>

            {errorMessage && (
              <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
                {errorMessage}
              </div>
            )}

            <Button onClick={handleFinishShift}>Finalizar plantão</Button>
          </Card>
        )}
      </PageShell>

      <BottomNav />
    </>
  );
}
