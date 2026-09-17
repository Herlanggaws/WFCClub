import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-bg/90 px-4 pb-3 pt-3 backdrop-blur-md">
      <div className="flex items-center gap-1">
        {backHref ? (
          <Link
            href={backHref}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition active:bg-black/5"
            aria-label="Kembali"
          >
            <BackIcon />
          </Link>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-brand text-[22px] font-extrabold tracking-tight text-ink">
            {title}
          </h1>
        </div>

        {action ? (
          <div className="shrink-0">{action}</div>
        ) : backHref ? (
          <div className="h-10 w-10 shrink-0" aria-hidden />
        ) : null}
      </div>

      {subtitle ? (
        <p
          className={`mt-1 text-sm text-muted ${
            backHref ? "pl-10" : "px-1"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 5 8 12l7 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
