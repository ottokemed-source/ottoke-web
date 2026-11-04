import { read, image, link, photo, money, z } from './content.js';

// The kimchi page: the console's "Kimchi" (src/content/kimchi.json).
export const kimchi = read(
  'kimchi',
  z.object({
    precio: z.number().int().min(1000),
    peso_g: z.number().int().min(50),
    available: z.boolean().default(true),
    lead: z.string().min(10).max(200),
    frase: z.string().min(10).max(120),
    rasgos: z.array(z.string().min(2).max(30)).length(6), // six, one per drawn icon
    salud_titulo: z.string().min(5).max(90),
    salud: z.string().min(10).max(400),
    fotos: z.array(photo).min(1).max(6),
    platos: z.array(z.object({ name: z.string(), korean: z.string(), href: link, image: z.string(), alt: z.string() })),
  }),
);
kimchi.fotos = kimchi.fotos.map((f) => ({ ...f, src: image(f.src) }));
kimchi.platos = kimchi.platos.map((d) => ({ ...d, image: image(d.image) }));

export const price = { display: money(kimchi.precio), weight: `${kimchi.peso_g} g`, value: kimchi.precio, currency: 'COP' };
