import Image from 'next/image';
import { site } from '@/data/site';
import { Button } from '@/components/ui/Button';
import { MemphisDots } from '@/components/ui/MemphisDots';

export function Hero() {
  return (
    <section className="flame-overlay relative overflow-hidden bg-carbon px-4 pt-16 pb-20">
      <MemphisDots className="absolute left-6 top-6 text-lima opacity-60" color="#68b51b" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div className="text-center md:text-left">
          <p className="font-hand text-3xl text-crema-2">{site.tagline}!</p>
          <h1 className="mt-2 font-display text-5xl uppercase leading-none text-crema sm:text-7xl">
            Flame-Grilled<br />Goodness
          </h1>
          <p className="mt-4 font-body text-lg text-hueso/80">
            Enjoy our special mixed grill today. Burgers, sandwiches, parrilla y más.
          </p>
          <div className="mt-6 flex justify-center gap-3 md:justify-start">
            <Button href="/menu">Order Now</Button>
            <Button href="/#burgers" variant="outline">Ver Menú</Button>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="absolute inset-0 rounded-full bg-fuego" />
          <Image
            src="/img/mixed-grill.jpg"
            alt="Mixed grill"
            fill
            className="rounded-full object-cover p-3"
            priority
          />
        </div>
      </div>
    </section>
  );
}
