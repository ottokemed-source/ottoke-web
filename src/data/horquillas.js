import { readAll, image, og, photo, pictures, z } from './content.js';
import { productos, offer } from './productos.js';

// One file per hairpin in src/content/horquillas, edited in the console. Slugs (file names)
// stay as they are: the /og/ images are named after them. `cutout` is the first photo without
// its background (_agent/narzedzia/wytnij_tlo.py --plain); a card shows it and swaps to the
// second photo. `thread` tints the torn sheet of "Más productos" under the hairpin.
export const price = offer(productos.precio_horquilla);

const all = readAll(
  'horquillas',
  z.object({
    name: z.string().min(2).max(23),
    available: z.boolean().default(true),
    archived: z.boolean().default(false),
    orden: z.number().default(999),
    // both written by the cutout workflow; a new hairpin shows its first photo until then
    thread: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#A8B3B2'),
    cutout: z.string().optional(),
    fotos: z.array(photo).min(2).max(4),
  }),
);

export const horquillas = all
  .filter((item) => !item.archived)
  .sort((a, b) => a.orden - b.orden || a.name.localeCompare(b.name))
  .map(({ fotos, cutout, ...item }) => ({ ...item, og: og(`horquilla-${item.slug}.jpg`, '/og/horquilla-dragon-azul.jpg'), cutout: image(cutout ?? fotos[0].src), photos: pictures(fotos, `Horquilla ${item.name.toLowerCase()} de Ottoke, Medellín`) }));
