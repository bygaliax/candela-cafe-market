import Image from 'next/image';
import Link from 'next/link';
import type { LandingConcept } from '@/data/site';

export function ConceptSection({ concept, reverse = false }: { concept: LandingConcept; reverse?: boolean }) {
  const accentText = concept.accent === 'fuego' ? 'text-fuego' : 'text-lima';
  return (
    <section id={concept.id} className="bg-carbon px-4 py-14">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 ${
          reverse ? 'md:[&>*:first-child]:order-2' : ''
        }`}
      >
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <div className={`absolute inset-0 rounded-full ${concept.accent === 'fuego' ? 'bg-fuego/20' : 'bg-lima/20'}`} />
          <Image src={concept.image} alt={concept.kicker} fill className="rounded-full object-cover p-2" />
        </div>
        <div className="text-center md:text-left">
          <p className={`font-hand text-2xl ${accentText}`}>{concept.kicker}</p>
          <h2 className="mt-1 font-display text-4xl uppercase leading-none text-crema sm:text-5xl">
            {concept.title}
          </h2>
          <p className="mt-3 font-body text-base text-hueso/80">{concept.copy}</p>
          <Link href="/menu" className="mt-4 inline-block font-display uppercase text-fuego hover:text-crema">
            Ver en el menú →
          </Link>
        </div>
      </div>
    </section>
  );
}
