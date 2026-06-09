import Link from 'next/link';
import { FlameBadge } from '@/components/ui/FlameBadge';
import { Button } from '@/components/ui/Button';

const links = [
  { href: '/#burgers', label: 'Burgers' },
  { href: '/#sandwiches', label: 'Sandwiches' },
  { href: '/#salads', label: 'Salads' },
  { href: '/menu', label: 'Menú' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-carbon/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <FlameBadge size={44} />
          <span className="font-display text-xl uppercase tracking-tight text-crema">
            Candela &amp; Café
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="font-body text-sm text-hueso hover:text-fuego">
              {l.label}
            </Link>
          ))}
        </nav>
        <Button href="/menu" className="px-4 py-2 text-base">
          Order Now
        </Button>
      </div>
    </header>
  );
}
