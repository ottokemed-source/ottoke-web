import { readAll, image, og, photo, pictures, z } from './content.js';
import { productos, offer } from './productos.js';

// One file per norigae in src/content/norigae, edited in the console. `thread` and `cutout`
// are written by the cutout workflow (_agent/narzedzia/wytnij_tlo.py), never by hand.
// `pattern` is the background motif of the card: wezel, gwiazdka or serce.
export const price = offer(productos.precio_norigae);

const all = readAll(
  'norigae',
  z.object({
    name: z.string().min(2).max(17),
    wish: z.string().min(10).max(75),
    available: z.boolean().default(true),
    archived: z.boolean().default(false),
    orden: z.number().default(999),
    pattern: z.enum(['wezel', 'gwiazdka', 'serce']),
    fotos: z.array(photo).default([]),
    // empty for a new piece until the cutout workflow has run (a few minutes after saving)
    thread: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    cutout: z.object({ w: z.number(), h: z.number(), knot: z.number(), knotTop: z.number(), pivot: z.number() }).optional(),
  }),
);

// archived pieces leave the site, and a new one waits for its cutout; the rest in the order
// set in the console
export const norigae = all
  .filter((item) => !item.archived && item.cutout && item.thread)
  .sort((a, b) => a.orden - b.orden || a.name.localeCompare(b.name))
  .map((item) => ({ ...item, og: og(`${item.slug}.jpg`, '/og/norigae.jpg'), fotos: pictures(item.fotos, `Norigae ${item.name.toLowerCase()} tejido a mano por Ottoke en Medellín`) }));
