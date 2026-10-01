// «Compartir esta página» (pie de portada y carta): abre el menú de compartir del móvil; si no hay, copia el enlace.
import { t } from './i18n.js';

export function initShare() {
  const btn = document.getElementById('shareBtn'), note = document.getElementById('shareNote');
  const url = document.querySelector('link[rel="canonical"]').href;
  let timer = 0;
  btn.addEventListener('click', async () => {
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url }); } catch { /* cancelado */ }
      return;
    }
    try { await navigator.clipboard.writeText(url); note.textContent = t('footer.copied'); }
    catch { note.textContent = url; } // sin portapapeles: al menos se ve el enlace para copiarlo a mano
    clearTimeout(timer);
    timer = setTimeout(() => { note.textContent = ''; }, 4000);
  });
}
