"use client";

import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-white px-6 pb-10 pt-4">
      <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col pt-[10vh] animate-rise">
        <p className="text-center font-brand text-sm font-bold lowercase tracking-tight text-accent">
          wfc
        </p>
        <h1 className="mt-6 text-center font-brand text-[28px] font-extrabold lowercase tracking-tight text-ink">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 text-center text-[13px] leading-relaxed text-muted">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-10 flex flex-1 flex-col">{children}</div>
        {footer ? <div className="mt-8 text-center text-sm text-muted">{footer}</div> : null}
      </div>
    </div>
  );
}

export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-[13px] font-semibold lowercase text-muted">
        {label}
      </span>
      <input
        autoFocus={autoFocus}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-full border-0 bg-[#f7f3ea] px-6 py-3.5 text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted/70 focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}

export function AuthButton({
  children,
  disabled,
  loading,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-10 py-3.5 text-[17px] font-bold lowercase text-white transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
    >
      {loading ? "loading..." : children}
    </button>
  );
}

export function AuthErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mb-4 rounded-[var(--radius-sm)] bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
    >
      {message}
    </p>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="font-semibold text-accent underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}
