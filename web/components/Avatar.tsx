interface AvatarProps {
  initials: string;
  hue: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASS = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-11 w-11 text-xs",
  lg: "h-14 w-14 text-sm",
  xl: "h-20 w-20 text-lg",
} as const;

export function Avatar({
  initials,
  hue,
  size = "md",
  className = "",
}: AvatarProps) {
  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-[35%] font-bold text-ink ring-2 ring-surface ${SIZE_CLASS[size]} ${className}`}
      style={{
        background: `linear-gradient(145deg, hsl(${hue} 55% 86%), hsl(${hue} 48% 72%))`,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
