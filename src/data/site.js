import { read, link, z } from './content.js';

// Contacts, payment and shipping: the console's "Datos de la tienda" (src/content/tienda.json).
const tienda = read(
  'tienda',
  z.object({
    whatsapp: z.string().regex(/^\+57\d{10}$/),
    instagram: link,
    tiktok: link,
    dm: link,
    pago: z.string().min(10),
    envio: z.string().min(10),
    // the clients' Google Form for the list of people who want to hear about events; empty
    // until they make it, and then every "Avísame" leads there instead of to WhatsApp
    formulario: z.union([link, z.literal('')]).optional(),
  }),
);

export const site = {
  name: 'Ottoke Culture',
  city: 'Medellín',
  instagram: tienda.instagram,
  dm: tienda.dm, // opens the Instagram chat itself, not the profile
  tiktok: tienda.tiktok,
  phone: tienda.whatsapp,
  // "301 117 5647", as their brochure prints it
  phoneDisplay: tienda.whatsapp.slice(3).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'),
  payment: tienda.pago,
  shipping: tienda.envio,
  signup: tienda.formulario || null,
};

export const whatsapp = (message) => `https://wa.me/${site.phone.slice(1)}?text=${encodeURIComponent(message)}`;
