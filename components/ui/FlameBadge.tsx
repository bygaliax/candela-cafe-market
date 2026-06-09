import Image from 'next/image';

type Props = { size?: number; className?: string };

export function FlameBadge({ size = 56, className = '' }: Props) {
  return (
    <Image
      src="/logo/candela-flame.png"
      alt="Candela & Café"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}
