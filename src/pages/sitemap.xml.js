import { norigae } from '../data/norigae.js';
import { horquillas } from '../data/horquillas.js';

export function GET({ site }) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const paths = [
    '/',
    '/products/',
    '/norigae/',
    ...norigae.map((item) => `/norigae/${item.slug}/`),
    '/horquillas/',
    ...horquillas.map((item) => `/horquillas/${item.slug}/`),
    '/kimchi/',
    '/eventos/',
    '/nosotras/',
    '/preguntas-frecuentes/',
  ];
  const urls = paths.map((path) => `<url><loc>${new URL(path, site).href}</loc><lastmod>${lastmod}</lastmod></url>`);
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
