import { site } from '@/data/site';
import { Button } from '@/components/ui/Button';

export function ContactPill() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-full bg-granate px-6 py-3 text-hueso sm:gap-6">
      <a href={site.phoneHref} className="font-body text-sm hover:text-crema sm:text-base">
        {site.phone}
      </a>
      <span className="hidden h-5 w-px bg-hueso/40 sm:block" />
      <a href={site.urlHref} className="font-body text-sm hover:text-crema sm:text-base">
        {site.url}
      </a>
      <Button href="/menu" className="px-4 py-2 text-base">
        Order Now
      </Button>
    </div>
  );
}
