import fs from 'node:fs';
import path from 'node:path';

const allowlist = ['node_modules', '.next', 'out', 'dist', 'build'];
const cwd = process.cwd();

for (const dir of allowlist) {
  const dirPath = path.join(cwd, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dir}...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}
console.log('Clean complete.');
