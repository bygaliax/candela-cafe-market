import Link from 'next/link';

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: 'fuego' | 'outline';
  className?: string;
};

export function Button({ href, children, variant = 'fuego', className = '' }: Props) {
  const base =
    'inline-flex items-center justify-center px-6 py-3 font-display uppercase tracking-tight text-lg transition-colors';
  const styles =
    variant === 'fuego'
      ? 'bg-fuego-cta text-crema hover:bg-fuego'
      : 'border-2 border-crema text-crema hover:bg-crema hover:text-carbon';
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
