import Image from 'next/image';
import { site } from '@/data/site';

export function Catering() {
  return (
    <section id="catering" className="relative overflow-hidden bg-fuego px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
        <div className="text-carbon">
          <p className="font-hand text-2xl">Corporate Catering</p>
          <h2 className="mt-1 font-display text-4xl uppercase leading-none sm:text-5xl">
            Elevate Your Events
          </h2>
          <p className="mt-3 font-body text-base text-carbon/80">
            Eleva tus eventos con nuestro servicio de catering exclusivo.
          </p>
          <a
            href={site.phoneHref}
            className="mt-5 inline-flex items-center justify-center border-2 border-carbon px-6 py-3 font-display text-lg uppercase tracking-tight text-carbon transition-colors hover:bg-carbon hover:text-crema"
          >
            Solicitar
          </a>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-md">
          <Image src="/img/catering.jpg" alt="Catering" fill className="rounded-3xl object-cover" />
        </div>
      </div>
    </section>
  );
}
