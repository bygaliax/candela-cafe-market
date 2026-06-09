'use client';

type Props = { value: string; onChange: (v: string) => void };

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="px-4 py-3">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar en el menú…"
        className="w-full rounded-full bg-carbon-2 px-5 py-3 font-body text-sm text-crema placeholder:text-hueso/40 focus:outline-none focus:ring-2 focus:ring-fuego"
      />
    </div>
  );
}
