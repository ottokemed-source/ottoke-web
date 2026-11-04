import { read, image, z } from './content.js';

// The about page: the console's "Nosotras" (src/content/nosotras.json). `zoom` is a crop set
// by Maks for a photo that needs it.
export const nosotras = read(
  'nosotras',
  z.object({
    fundadoras: z.array(z.object({ name: z.string(), about: z.string(), photo: z.string(), alt: z.string().min(10), zoom: z.string().optional() })).length(2),
    historia: z.array(z.object({ title: z.string().max(40), text: z.string().max(300), photo: z.string().optional(), alt: z.string().optional() })).length(3),
  }),
);
nosotras.fundadoras = nosotras.fundadoras.map((f) => ({ ...f, photo: image(f.photo) }));
nosotras.historia = nosotras.historia.map((s) => ({ ...s, photo: s.photo && image(s.photo) }));
