// A product page: the gallery counts its pictures.
// Shared by the norigae, hairpin and kimchi pages, which use the same markup.
import { onArrowKeys } from './arrows.js';

const gallery = document.getElementById('galeria');
const track = document.getElementById('fotos');
const prev = document.getElementById('anterior');
const next = document.getElementById('siguiente');
const count = document.getElementById('cuenta');
const slides = track.children.length;

// to an absolute slide, not by a relative distance: a relative step taken while the
// snap is still settling got lost now and then
const step = (direction) => {
  const width = track.firstElementChild.offsetWidth;
  const index = Math.min(slides - 1, Math.max(0, Math.round(track.scrollLeft / width) + direction));
  track.scrollTo({
    left: index * width,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
};
prev?.addEventListener('click', () => step(-1));
next?.addEventListener('click', () => step(1));
onArrowKeys(step);

// slides are narrower than the track, so the last one never reaches the left edge:
// the end of the scroll counts as the last picture
const update = () => {
  const max = track.scrollWidth - track.clientWidth;
  const atEnd = track.scrollLeft >= max - 1;
  const index =
    max > 0 && atEnd
      ? slides - 1
      : Math.round(track.scrollLeft / track.firstElementChild.offsetWidth);
  gallery.style.setProperty('--index', String(index));
  count.textContent = `${index + 1} / ${slides}`;
  if (prev) prev.hidden = track.scrollLeft < 1;
  if (next) next.hidden = atEnd;
};
track.addEventListener('scroll', update);
addEventListener('resize', update);
update();
