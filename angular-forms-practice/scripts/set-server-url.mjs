// Shkruan adresën e backend-it online te src/app/core/server-url.ts.
// Vercel e nis këtë para "ng build" (shih vercel.json); adresa merret
// nga variabla BACKEND_URL te Settings → Environment Variables.
import { writeFileSync } from 'node:fs';

const url = (process.env.BACKEND_URL || '').trim().replace(/\/+$/, '');

if (!/^https?:\/\/[^\s'"]+$/.test(url)) {
  console.error('Mungon BACKEND_URL (p.sh. https://bookers-backend.up.railway.app).');
  process.exit(1);
}

writeFileSync(
  new URL('../src/app/core/server-url.ts', import.meta.url),
  `// Ky skedar rishkruhet nga scripts/set-server-url.mjs gjatë publikimit.\nexport const BACKEND_URL = '${url}';\n`,
);
console.log(`Backend-i: ${url}`);
