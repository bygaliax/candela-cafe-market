type Props = { className?: string; color?: string };

/** Rejilla 5x5 de puntos estilo Memphis. */
export function MemphisDots({ className = '', color = 'currentColor' }: Props) {
  return (
    <div className={`grid grid-cols-5 gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: 25 }).map((_, i) => (
        <span key={i} className="block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}
