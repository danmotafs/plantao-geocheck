"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, MapPin, Navigation } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, PageShell, SectionTitle } from "@/components/ui/card";
import { hospitals } from "@/data/hospitals";
import {
  buildDemoDetection,
  buildGpsDetection,
  findNearestHospital
} from "@/lib/geo/find-nearest-hospital";
import { saveLastDetection } from "@/lib/storage/shifts-storage";
import type { HospitalDetection } from "@/types/shift";

type DetectionStatus = "idle" | "loading" | "success" | "outside" | "error";

export default function DetectarChegadaPage() {
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const [message, setMessage] = useState("");
  const [detection, setDetection] = useState<HospitalDetection | null>(null);

  function persistDetection(nextDetection: HospitalDetection) {
    setDetection(nextDetection);
    saveLastDetection(nextDetection);
  }

  function handleDetectLocation() {
    setStatus("loading");
    setMessage("");
    setDetection(null);

    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("Este navegador não oferece suporte à geolocalização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        const nearestResult = findNearestHospital(currentLocation, hospitals);
        const nextDetection = buildGpsDetection(nearestResult);

        if (!nextDetection) {
          setStatus("error");
          setMessage("Nenhum hospital ativo foi encontrado no cadastro local.");
          return;
        }

        persistDetection(nextDetection);

        if (nextDetection.insideRadius) {
          setStatus("success");
          setMessage(`Identificamos sua chegada ao ${nextDetection.hospital.name}.`);
          return;
        }

        setStatus("outside");
        setMessage(
          `O hospital mais próximo é ${nextDetection.hospital.name}, mas você está fora do raio configurado.`
        );
      },
      (error) => {
        console.error(error);
        setStatus("error");

        if (error.code === error.PERMISSION_DENIED) {
          setMessage(
            "Permissão de localização negada. Autorize o GPS no navegador para testar o reconhecimento automático."
          );
          return;
        }

        if (error.code === error.TIMEOUT) {
          setMessage("O GPS demorou para responder. Tente novamente em local com melhor sinal.");
          return;
        }

        setMessage("Não foi possível obter sua localização atual.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  function handleDemoMode() {
    const anaNery = hospitals[0];
    const demoDetection = buildDemoDetection(anaNery);
    persistDetection(demoDetection);
    setStatus("success");
    setMessage(
      `Modo demonstração ativado para ${demoDetection.hospital.name}.`
    );
  }

  const distanceLabel =
    detection?.distanceMeters !== null && detection?.distanceMeters !== undefined
      ? `${Math.round(detection.distanceMeters)}m`
      : "—";

  return (
    <>
      <PageShell>
        <Card className="mb-4">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
            <MapPin size={28} />
          </div>

          <SectionTitle
            eyebrow="Reconhecimento automático"
            title="Vamos identificar o hospital pelo GPS."
            description="Ao permitir a localização, o app compara sua posição com o Hospital Ana Nery e confirma sua chegada."
          />
        </Card>

        <Card>
          {status === "idle" && (
            <div className="grid gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Hospital cadastrado</p>
                <p className="mt-1 font-bold text-slate-950">Hospital Ana Nery</p>
                <p className="text-sm text-slate-600">Salvador/BA · raio de 250m</p>
              </div>

              <Button onClick={handleDetectLocation}>
                <Navigation size={20} />
                Usar GPS e detectar hospital
              </Button>

              <Button variant="secondary" onClick={handleDemoMode}>
                Simular chegada para testar fluxo
              </Button>

              <p className="text-xs leading-5 text-slate-500">
                O modo simulação serve apenas para testar o app fora do hospital.
                O registro será marcado como GPS não confirmado.
              </p>
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <Loader2 className="animate-spin text-teal-700" size={36} />
              <p className="font-bold text-slate-950">
                Verificando sua localização...
              </p>
              <p className="text-sm leading-6 text-slate-600">
                Mantenha o GPS ativo e permita a localização no navegador.
              </p>
            </div>
          )}

          {status === "success" && detection && (
            <div className="grid gap-4">
              <div
                className={`flex items-start gap-3 rounded-2xl p-4 ${
                  detection.gpsConfirmed ? "bg-teal-50" : "bg-blue-50"
                }`}
              >
                <CheckCircle2
                  className={`mt-1 ${
                    detection.gpsConfirmed ? "text-teal-700" : "text-blue-700"
                  }`}
                  size={24}
                />
                <div>
                  <p
                    className={`font-bold ${
                      detection.gpsConfirmed ? "text-teal-950" : "text-blue-950"
                    }`}
                  >
                    {message}
                  </p>
                  <p
                    className={`text-sm ${
                      detection.gpsConfirmed ? "text-teal-800" : "text-blue-800"
                    }`}
                  >
                    Distância aproximada: {distanceLabel}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Pergunta do app</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Você chegou ao {detection.hospital.name} para dar plantão?
                </h2>
              </div>

              {!detection.gpsConfirmed && (
                <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Este é um registro de demonstração ou fora de confirmação por
                  GPS. No relatório, ele será marcado como GPS não confirmado.
                </div>
              )}

              <ButtonLink href="/plantao/novo">
                Sim, iniciar plantão
              </ButtonLink>

              <Button variant="secondary" onClick={handleDetectLocation}>
                Verificar novamente com GPS
              </Button>
            </div>
          )}

          {status === "outside" && detection && (
            <div className="grid gap-4">
              <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
                <AlertCircle className="mt-1 text-amber-700" size={24} />
                <div>
                  <p className="font-bold text-amber-950">{message}</p>
                  <p className="text-sm text-amber-800">
                    Distância aproximada: {distanceLabel}
                  </p>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                Para o teste real, tente novamente quando estiver próximo ao
                hospital. Para validar o fluxo agora, use o modo simulação.
              </p>

              <Button onClick={handleDetectLocation}>Tentar novamente</Button>
              <Button variant="secondary" onClick={handleDemoMode}>
                Simular chegada para testar fluxo
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="grid gap-4">
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4">
                <AlertCircle className="mt-1 text-red-700" size={24} />
                <div>
                  <p className="font-bold text-red-950">
                    Não foi possível detectar o hospital.
                  </p>
                  <p className="text-sm leading-6 text-red-800">{message}</p>
                </div>
              </div>

              <Button onClick={handleDetectLocation}>Tentar novamente</Button>
              <Button variant="secondary" onClick={handleDemoMode}>
                Simular chegada para testar fluxo
              </Button>
            </div>
          )}
        </Card>
      </PageShell>

      <BottomNav />
    </>
  );
}
