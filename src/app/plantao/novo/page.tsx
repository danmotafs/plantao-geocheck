"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, PageShell, SectionTitle } from "@/components/ui/card";
import {
  createShiftId,
  getDoctorProfile,
  getLastDetection,
  getOpenShift,
  saveDoctorProfile,
  saveShift
} from "@/lib/storage/shifts-storage";
import {
  addHoursToDatetimeLocal,
  nowForDatetimeInput
} from "@/lib/time/datetime";
import type { HospitalDetection, Shift } from "@/types/shift";

const sectorOptions = [
  "Emergência",
  "UTI",
  "Enfermaria",
  "Centro Cirúrgico",
  "Clínica Médica",
  "Pediatria",
  "Obstetrícia",
  "Outro"
];

export default function NovoPlantaoPage() {
  const router = useRouter();

  const [detection, setDetection] = useState<HospitalDetection | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [doctorCrm, setDoctorCrm] = useState("");
  const [sector, setSector] = useState("Emergência");
  const [plannedHours, setPlannedHours] = useState("12");
  const [checkinTime, setCheckinTime] = useState("");
  const [plannedCheckoutTime, setPlannedCheckoutTime] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const lastDetection = getLastDetection();
    const profile = getDoctorProfile();

    setDetection(lastDetection);
    setDoctorName(profile.doctorName);
    setDoctorCrm(profile.doctorCrm);

    const nowValue = nowForDatetimeInput();
    setCheckinTime(nowValue);
    setPlannedCheckoutTime(addHoursToDatetimeLocal(nowValue, 12));
  }, []);

  useEffect(() => {
    if (checkinTime && plannedHours) {
      setPlannedCheckoutTime(
        addHoursToDatetimeLocal(checkinTime, Number(plannedHours))
      );
    }
  }, [checkinTime, plannedHours]);

  const openShift = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return getOpenShift();
  }, []);

  function handleSubmit() {
    setErrorMessage("");

    if (!detection) {
      setErrorMessage("Antes de registrar o plantão, faça a detecção de chegada.");
      return;
    }

    if (openShift) {
      setErrorMessage("Já existe um plantão em aberto. Finalize antes de iniciar outro.");
      return;
    }

    if (!doctorName.trim()) {
      setErrorMessage("Informe o nome do médico.");
      return;
    }

    if (!doctorCrm.trim()) {
      setErrorMessage("Informe o CRM do médico.");
      return;
    }

    if (!sector.trim()) {
      setErrorMessage("Informe o setor do plantão.");
      return;
    }

    if (!plannedHours || Number(plannedHours) <= 0) {
      setErrorMessage("Informe uma carga horária válida.");
      return;
    }

    if (!checkinTime) {
      setErrorMessage("Informe o horário de chegada.");
      return;
    }

    if (!plannedCheckoutTime) {
      setErrorMessage("Informe o horário de saída previsto.");
      return;
    }

    const checkinDate = new Date(checkinTime);
    const plannedCheckoutDate = new Date(plannedCheckoutTime);

    if (plannedCheckoutDate <= checkinDate) {
      setErrorMessage("A saída prevista não pode ser anterior à chegada.");
      return;
    }

    const now = new Date().toISOString();

    const newShift: Shift = {
      id: createShiftId(),

      doctorName: doctorName.trim(),
      doctorCrm: doctorCrm.trim(),

      hospitalId: detection.hospital.id,
      hospitalName: detection.hospital.name,
      hospitalAddress: detection.hospital.address,

      sector,
      plannedHours: Number(plannedHours),

      checkinTime,
      plannedCheckoutTime,
      actualCheckoutTime: null,

      checkinLatitude: detection.currentLocation?.latitude ?? null,
      checkinLongitude: detection.currentLocation?.longitude ?? null,
      checkinDistanceMeters: detection.distanceMeters,

      gpsConfirmed: detection.gpsConfirmed,
      doctorConfirmedArrival: true,
      detectionMode: detection.detectionMode,

      status: "open",
      notes,

      createdAt: now,
      updatedAt: now
    };

    saveDoctorProfile({
      doctorName: doctorName.trim(),
      doctorCrm: doctorCrm.trim()
    });

    saveShift(newShift);
    router.push("/plantao/aberto");
  }

  return (
    <>
      <PageShell>
        <Card className="mb-4">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
            <ClipboardCheck size={28} />
          </div>

          <SectionTitle
            eyebrow="Registro do plantão"
            title="Ótimo. Vamos registrar seu plantão."
            description="Confirme os dados abaixo para iniciar o registro e gerar seu histórico mensal."
          />
        </Card>

        {!detection && (
          <Card className="mb-4 border border-amber-200 bg-amber-50">
            <p className="font-bold text-amber-950">Chegada ainda não detectada</p>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              Volte para a tela de GPS e confirme sua chegada ao hospital antes
              de registrar o plantão.
            </p>
            <div className="mt-4">
              <ButtonLink href="/detectar-chegada">Detectar chegada</ButtonLink>
            </div>
          </Card>
        )}

        {openShift && (
          <Card className="mb-4 border border-amber-200 bg-amber-50">
            <p className="font-bold text-amber-950">Plantão em aberto</p>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              Você já possui um plantão em aberto. Finalize o plantão atual
              antes de iniciar outro.
            </p>
            <div className="mt-4">
              <ButtonLink href="/plantao/aberto">Finalizar plantão</ButtonLink>
            </div>
          </Card>
        )}

        <Card>
          {detection && (
            <div className="mb-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Hospital identificado</p>
              <p className="mt-1 font-bold text-slate-950">
                {detection.hospital.name}
              </p>
              <p className="text-sm text-slate-600">
                {detection.hospital.city}/{detection.hospital.state}
              </p>
              <p
                className={`mt-2 text-sm font-semibold ${
                  detection.gpsConfirmed ? "text-teal-700" : "text-amber-700"
                }`}
              >
                {detection.gpsConfirmed
                  ? `GPS confirmado · distância: ${Math.round(
                      detection.distanceMeters ?? 0
                    )}m`
                  : "GPS não confirmado · modo simulação/manual"}
              </p>
            </div>
          )}

          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">
                Nome do médico
              </span>
              <input
                value={doctorName}
                onChange={(event) => setDoctorName(event.target.value)}
                placeholder="Ex.: Dr. João Silva"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-950 outline-none focus:border-teal-600"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">CRM</span>
              <input
                value={doctorCrm}
                onChange={(event) => setDoctorCrm(event.target.value)}
                placeholder="Ex.: CRM-BA 00000"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-950 outline-none focus:border-teal-600"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">
                Em qual setor será seu plantão hoje?
              </span>
              <select
                value={sector}
                onChange={(event) => setSector(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-950 outline-none focus:border-teal-600"
              >
                {sectorOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">
                Qual a carga horária prevista?
              </span>
              <select
                value={plannedHours}
                onChange={(event) => setPlannedHours(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-950 outline-none focus:border-teal-600"
              >
                <option value="6">6 horas</option>
                <option value="12">12 horas</option>
                <option value="24">24 horas</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">
                Qual seu horário de chegada?
              </span>
              <input
                type="datetime-local"
                value={checkinTime}
                onChange={(event) => setCheckinTime(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-950 outline-none focus:border-teal-600"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">
                Qual o horário de saída previsto?
              </span>
              <input
                type="datetime-local"
                value={plannedCheckoutTime}
                onChange={(event) => setPlannedCheckoutTime(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-950 outline-none focus:border-teal-600"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">
                Observação opcional
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ex.: plantão extra, troca de escala, intercorrência administrativa..."
                rows={3}
                className="resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-950 outline-none focus:border-teal-600"
              />
            </label>

            {errorMessage && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
                {errorMessage}
              </div>
            )}

            <Button onClick={handleSubmit} disabled={!detection || Boolean(openShift)}>
              Salvar e iniciar plantão
            </Button>
          </div>
        </Card>
      </PageShell>

      <BottomNav />
    </>
  );
}
