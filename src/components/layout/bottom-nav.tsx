"use client";

import Link from "next/link";
import { CalendarDays, FileText, Home, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/",
    label: "Início",
    icon: Home
  },
  {
    href: "/detectar-chegada",
    label: "GPS",
    icon: MapPin
  },
  {
    href: "/plantao/historico",
    label: "Histórico",
    icon: CalendarDays
  },
  {
    href: "/relatorios/mensal",
    label: "Relatório",
    icon: FileText
  }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-3 pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={20} />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
