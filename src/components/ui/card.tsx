import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-3xl bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function PageShell({ children }: CardProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6 pb-28">
      <section className="mx-auto max-w-md">{children}</section>
    </main>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
      {description && (
        <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
      )}
    </div>
  );
}
