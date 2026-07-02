import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-teal-700 text-white shadow-sm hover:bg-teal-800",
  secondary: "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100"
};

const baseClasses =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-center text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
};

export function ButtonLink({
  href,
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
