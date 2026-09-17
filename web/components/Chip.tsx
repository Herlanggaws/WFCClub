interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function Chip({ label, selected, onClick }: ChipProps) {
  const className = selected
    ? "border-transparent bg-accent text-white"
    : "border-line bg-surface text-ink";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${className}`}
      >
        {label}
      </button>
    );
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3.5 py-1.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
