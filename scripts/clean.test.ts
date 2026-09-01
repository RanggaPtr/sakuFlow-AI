import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const cwd = process.cwd();
const fixtureDir = path.join(cwd, 'test-clean-fixture');
const nextDir = path.join(fixtureDir, '.next');
const envFile = path.join(fixtureDir, '.env');
const srcDir = path.join(fixtureDir, 'src');

describe('scripts/clean.mjs', () => {
  beforeAll(() => {
    // Setup fixture directory
    if (!fs.existsSync(fixtureDir)) fs.mkdirSync(fixtureDir);
    if (!fs.existsSync(nextDir)) fs.mkdirSync(nextDir);
    if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);
    fs.writeFileSync(envFile, 'SECRET=123');
    fs.writeFileSync(path.join(nextDir, 'cache.txt'), 'cache');
    fs.writeFileSync(path.join(srcDir, 'index.ts'), 'console.log("hello");');
  });

  afterAll(() => {
    // Cleanup fixture directory
    if (fs.existsSync(fixtureDir)) {
      fs.rmSync(fixtureDir, { recursive: true, force: true });
    }
  });

  it('removes allowlisted directories and keeps others', () => {
    // We need to run clean.mjs in the fixture directory
    execSync('node ' + path.join(cwd, 'scripts', 'clean.mjs'), { cwd: fixtureDir });

    expect(fs.existsSync(nextDir)).toBe(false);
    expect(fs.existsSync(envFile)).toBe(true);
    expect(fs.existsSync(srcDir)).toBe(true);
  });
});
