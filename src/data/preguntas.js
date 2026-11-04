import { read, z } from './content.js';
import { site } from './site.js';

// The FAQ page: the console's "Preguntas frecuentes" (src/content/preguntas.json). Payment and
// shipping come from the shop data, so a new Nequi number is changed in one place.
const { preguntas: list } = read(
  'preguntas',
  z.object({ preguntas: z.array(z.object({ question: z.string().min(3).max(120), answer: z.array(z.string().min(3)).min(1) })) }),
);

export const preguntas = [...list, { question: '¿Cómo pago?', answer: [site.payment] }, { question: '¿Hacen envíos?', answer: [site.shipping] }];
