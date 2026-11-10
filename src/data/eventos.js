import { readAll, image, photo, pictures, money, z } from './content.js';

// One file per event in src/content/eventos, edited in the console. The page picks by date:
// the soonest event that has not ended is the coming one; an ended event with its "recuerdo"
// filled in goes to "Eventos anteriores". A cancelled one shows nowhere.
// Dates are Bogotá time. The console writes 2026-12-19T15:00; the offset is added here, so
// 2026-12-19T15:00:00-05:00 (as older files have it) reads the same.
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(-05:00)?$/)
  .transform((value) => (value.endsWith('-05:00') ? value : `${value.length === 16 ? `${value}:00` : value}-05:00`));

const all = readAll(
  'eventos',
  z.object({
    edition: z.string().optional(),
    name: z.string().min(2),
    poster1: z.string().max(14).optional(),
    poster2: z.string().max(14).optional(),
    theme: z.string().optional(),
    lead: z.string().max(700).optional(),
    includes: z.string().max(300).optional(),
    deposit: z.string().max(200).optional(),
    starts: date,
    ends: date,
    deadline: date.optional(),
    place: z.string().min(2),
    placeNote: z.string().optional(),
    price: z.number().int().min(0).optional(),
    seats: z.number().int().min(1).optional(),
    full: z.boolean().default(false),
    estado: z.enum(['programado', 'aplazado', 'cancelado']).default('programado'),
    fotos: z.array(photo).max(6).default([]),
    recuerdo: z
      .object({
        text: z.array(z.string().min(10)).min(1).max(3),
        card: z.string(),
        cardAlt: z.string().min(5),
        fotos: z.array(photo.extend({ wide: z.boolean().default(false) })).max(6).default([]),
      })
      .optional(),
  }),
).filter((event) => {
  if (Date.parse(event.ends) <= Date.parse(event.starts)) throw new Error(`eventos/${event.slug}: "Termina" must come after "Empieza"`);
  return event.estado !== 'cancelado';
});

const now = Date.now();
const coming = all.filter((e) => Date.parse(e.ends) > now).sort((a, b) => Date.parse(a.starts) - Date.parse(b.starts));

const next = coming[0];
// null when none is announced: the page then offers to tell you about the next one
// ponytail: one coming event on the page; a second waits its turn until the first ends
export const proximo = next
  ? {
      ...next,
      poster: [next.poster1 ?? next.name, next.poster2 ?? ''],
      deadline: next.deadline ?? next.starts,
      price: next.price === undefined ? undefined : { display: money(next.price), value: next.price, currency: 'COP' },
      photos: pictures(next.fotos, `${next.name}, evento de cultura coreana de Ottoke en Medellín`),
    }
  : null;

const when = (iso) => new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

// newest first
export const pasados = all
  .filter((e) => Date.parse(e.ends) <= now && e.recuerdo)
  .sort((a, b) => Date.parse(b.starts) - Date.parse(a.starts))
  .map((e) => ({
    edition: e.edition,
    name: e.name,
    when: when(e.starts),
    place: e.place,
    text: e.recuerdo.text,
    card: { src: image(e.recuerdo.card), alt: e.recuerdo.cardAlt },
    photos: pictures(e.recuerdo.fotos, `${e.name}, evento de cultura coreana de Ottoke en Medellín`),
  }));
