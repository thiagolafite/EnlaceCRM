import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDist = path.join(__dirname, 'dist');
const rootDist = path.join(__dirname, '..', 'dist');

try {
  if (fs.existsSync(srcDist)) {
    fs.cpSync(srcDist, rootDist, { recursive: true, force: true });
    console.log('✅ Copied dist to root dist directory for Vercel');
  }
} catch (err) {
  console.error('Error copying dist:', err);
}
