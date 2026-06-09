import { site } from '@/data/site';
import { ContactPill } from './ContactPill';

export function Footer() {
  return (
    <footer className="flame-overlay border-t border-white/10 bg-carbon px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <ContactPill />
        <div className="flex gap-4">
          <a href={site.social.instagram} className="font-body text-sm text-hueso/70 hover:text-fuego">
            Instagram
          </a>
        </div>
        <p className="font-body text-xs text-hueso/50">
          © {new Date().getFullYear()} {site.name}. Miami, FL.
        </p>
      </div>
    </footer>
  );
}
