// Reads the JSON files the console (Pages CMS) edits in src/content and checks them, so a
// wrong value stops the build and the live site keeps its last good version.
import { existsSync } from 'node:fs';
import { z } from 'astro/zod';

const images = import.meta.glob('/src/assets/**/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });
const files = import.meta.glob('/src/content/**/*.json', { eager: true, import: 'default' });

/** An image by the path the console stores, such as "src/assets/fotos/x.jpg". */
export const image = (path) => {
  const found = images[`/${path}`];
  if (!found) throw new Error(`Image not found: ${path}`);
  return found;
};

const check = (schema, data, where) => {
  const result = schema.safeParse(data);
  if (!result.success) throw new Error(`${where}: ${result.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  return result.data;
};

/** One JSON file, e.g. read('tienda', schema). */
export const read = (name, schema) => check(schema, files[`/src/content/${name}.json`], `${name}.json`);

/** Every JSON file of a folder, with its file name as `slug`. */
export const readAll = (folder, schema) =>
  Object.entries(files)
    .filter(([path]) => path.startsWith(`/src/content/${folder}/`))
    .map(([path, data]) => ({ slug: path.split('/').pop().replace(/\.json$/, ''), ...check(schema, data, path) }));

/** The share image of a page, or the category's while the workflow has not made it yet. */
export const og = (file, fallback) => (existsSync(`public/og/${file}`) ? `/og/${file}` : fallback);

/** "$12.000 COP" from 12000. */
export const money = (value) => `$${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP`;

/** A link the clients type: only https, so no javascript: or other schemes reach a page. */
export const link = z.string().url().startsWith('https://');

export const photo = z.object({ src: z.string(), alt: z.string().optional() });

/** Photos ready for a page: the image file, and a description built from `name` where the
 * clients left theirs empty, so every photo still tells Google and screen readers what it is. */
export const pictures = (fotos, name) =>
  fotos.map((f, i) => ({ ...f, src: image(f.src), alt: f.alt?.trim() || `${name}, foto ${i + 1}` }));
export const qa = z.object({ question: z.string().min(3), answer: z.string().min(3) });
export { z };
