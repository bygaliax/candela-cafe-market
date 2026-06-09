import Image from 'next/image';

export function LiveMusic() {
  return (
    <section id="live-music" className="relative overflow-hidden bg-carbon px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm">
          <Image src="/img/live-music.jpg" alt="Live music" fill className="rounded-3xl object-cover" />
        </div>
        <div className="text-center md:text-left">
          <p className="font-hand text-2xl text-lima">Every Weekend</p>
          <h2 className="mt-1 font-display text-5xl uppercase leading-none text-crema">
            Live Music<br />Nights
          </h2>
          <p className="mt-3 font-body text-base text-hueso/80">
            Música en vivo, buena comida y mejores momentos. Acompáñanos cada fin de semana.
          </p>
        </div>
      </div>
    </section>
  );
}
