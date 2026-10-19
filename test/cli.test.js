const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const bin = path.join(__dirname, '..', 'dist', 'index.js');
const home = fs.mkdtempSync(path.join(os.tmpdir(), 'af-cli-'));
const run = (...args) => spawnSync('node', [bin, ...args], { env: { ...process.env, HOME: home, NO_COLOR: '1', POLAR_LICENSE_KEY: '' }, encoding: 'utf8' });

test('the banner on stdout is clean: status and promotion go to stderr', () => {
  const r = run('text', 'Hi', '-c', 'plain');
  assert.strictEqual(r.status, 0);
  assert.ok(!/License Status|polar\.sh|💡/.test(r.stdout), `stdout polluted:\n${r.stdout}`);
  assert.match(r.stderr, /License Status: FREE TIER/);
  assert.ok(r.stdout.trim().length > 0);
});

test('the comment block on stdout can be appended to a source file as is', () => {
  const r = run('comment', 'Hi', '-L', 'python');
  assert.strictEqual(r.status, 0);
  assert.ok(r.stdout.split('\n').filter(Boolean).every((l) => l.startsWith('#')), r.stdout);
  assert.ok(!/polar\.sh/.test(r.stdout));
});

test('errors exit non-zero with a useful message', () => {
  let r = run('comment', 'Hi', '-L', 'cobol');
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /Unknown comment language "cobol"/);
  r = run('text', 'Hi', '-f', 'Slnt');
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /Did you mean "Slant"/);
});

test('fonts can be filtered and languages listed', () => {
  const f = run('fonts', 'slant');
  assert.match(f.stdout, /matching "slant"/);
  assert.match(f.stdout, /- Slant/);
  assert.match(run('languages').stdout, /^go$/m);
});

test('--output writes the file and keeps stdout for the art', () => {
  const out = path.join(home, 'banner.txt');
  const r = run('text', 'Hi', '-c', 'plain', '-o', out);
  assert.strictEqual(r.status, 0);
  assert.strictEqual(fs.readFileSync(out, 'utf8').trim(), r.stdout.trim());
  assert.match(r.stderr, /Saved ASCII banner to/);
});
