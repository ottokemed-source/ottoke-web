import { read, money, qa, z } from './content.js';

// Prices and shared texts of the products: the console's "Productos" (src/content/productos.json).
export const productos = read(
  'productos',
  z.object({
    precio_norigae: z.number().int().min(1000),
    precio_horquilla: z.number().int().min(1000),
    descripcion_norigae: z.string().min(10).max(120),
    descripcion_horquillas: z.string().min(10).max(120),
    descripcion_kimchi: z.string().min(10).max(120),
    titulo_horquillas: z.string().min(3).max(40),
    lead_horquilla: z.string().min(10).max(200),
    // first tab of questions on a product page, then the order tab (payment and shipping are added)
    preguntas_norigae: z.array(qa),
    pedido_norigae: z.array(qa),
    preguntas_horquillas: z.array(qa),
    pedido_horquillas: z.array(qa),
  }),
);

export const offer = (value) => ({ display: money(value), value, currency: 'COP' });
