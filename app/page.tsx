import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { ConceptSection } from '@/components/landing/ConceptSection';
import { Catering } from '@/components/landing/Catering';
import { LiveMusic } from '@/components/landing/LiveMusic';
import { concepts } from '@/data/site';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        {concepts.map((c, i) => (
          <ConceptSection key={c.id} concept={c} reverse={i % 2 === 1} />
        ))}
        <Catering />
        <LiveMusic />
      </main>
      <Footer />
    </>
  );
}
