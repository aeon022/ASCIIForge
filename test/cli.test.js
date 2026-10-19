const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const bin = path.join(__dirname, '..', 'dist', 'index.js');
const home = fs.mkdtempSync(path.join(os.tmpdir(), 'af-cli-'));
const run = (...args) => spawnSync('node', [bin, ...args], { env: { ...process.env, HOME: home, NO_COLOR: '1', POLAR_LICENSE_KEY: '' }, encoding: 'utf8' });

test('the banner on stdout is clean: status goes to stderr, and text has nothing to promote', () => {
  const r = run('text', 'Hi', '-c', 'plain');
  assert.strictEqual(r.status, 0);
  assert.ok(!/License Status|polar\.sh|💡/.test(r.stdout), `stdout polluted:\n${r.stdout}`);
  assert.ok(!r.stderr.includes('polar.sh'), 'the free tier only affects comment blocks');
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
  assert.match(r.stderr, /Saved banner to/);
});

const runIn = (cwd, args, input) => spawnSync('node', [bin, ...args], { env: { ...process.env, HOME: home, NO_COLOR: '1', POLAR_LICENSE_KEY: '' }, encoding: 'utf8', cwd, input });

test('the text can be piped in', () => {
  const r = runIn(home, ['text', '-c', 'plain'], 'Hi\n');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(r.stdout.trim().length > 0);
  assert.strictEqual(r.stdout, run('text', 'Hi', '-c', 'plain').stdout);
  const none = runIn(home, ['text'], '   \n');
  assert.strictEqual(none.status, 1);
  assert.match(none.stderr, /No text/);
});

test('border, alignment and width shape the banner; colours accept gradients and hex', () => {
  const r = run('text', 'Hi', '-c', '#ff0080,#00f0ff', '--border', 'round', '--align', 'center', '--width', '60', '-f', 'Standard');
  assert.strictEqual(r.status, 0, r.stderr);
  const lines = r.stdout.split('\n').filter(Boolean);
  assert.ok(lines[0].trimStart().startsWith('╭') && lines[lines.length - 1].trimStart().startsWith('╰'));
  assert.ok(lines[0].startsWith(' '), 'centred inside 60 columns');
  assert.ok(Math.max(...lines.map((l) => l.length)) <= 60);
  assert.strictEqual(run('text', 'Hi', '-c', 'chartreuse').status, 1);
  assert.match(run('text', 'Hi', '--border', 'wavy').stderr, /Unknown border "wavy"/);
  assert.match(run('text', 'Hi', '--direction', 'up').stderr, /--direction must be one of/);
  assert.match(run('text', 'Hi', '--layout', 'tight').stderr, /Unknown layout "tight"/);
  assert.match(run('text', 'Hi', '--width', '3').stderr, /--width must be a number between/);
});

test('--font random works; --output keeps colours in svg/html and wraps markdown', () => {
  assert.strictEqual(run('text', 'Hi', '-f', 'random', '-c', 'plain').status, 0);
  const svg = path.join(home, 'b.svg');
  run('text', 'Hi', '-c', '#ff0000,#0000ff', '-o', svg);
  assert.match(fs.readFileSync(svg, 'utf8'), /fill="#ff0000"/);
  const md = path.join(home, 'b.md');
  run('text', 'Hi', '-c', 'plain', '-o', md);
  assert.match(fs.readFileSync(md, 'utf8'), /^```text\n[\s\S]*```\n$/);
});

test('comment --insert puts the block into a file; with --tag it is replaced, not repeated', () => {
  const file = path.join(home, 'app.py');
  fs.writeFileSync(file, '#!/usr/bin/env python3\nprint("hi")\n');
  let r = run('comment', 'ONE', '--insert', file, '--tag', 'hero', '-f', 'Standard');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stderr, /Inserted the block into/);
  r = run('comment', 'TWO', '--insert', file, '--tag', 'hero', '-f', 'Standard');
  assert.match(r.stderr, /Replaced the tagged block/);
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(text.startsWith('#!/usr/bin/env python3\n# ascii-forge:begin hero\n'), 'language came from .py, the shebang stays first');
  assert.strictEqual((text.match(/ascii-forge:begin hero/g) || []).length, 1);
  assert.ok(text.endsWith('print("hi")\n'));
  assert.strictEqual(spawnSync('python3', ['-c', 'import ast,sys; ast.parse(open(sys.argv[1]).read())', file]).status, 0, 'the file still parses');
  assert.match(run('comment', 'X', '--insert', file, '-o', 'y').stderr, /either --insert or --output/);
  assert.match(run('comment', 'X', '--insert', file, '--at', '0').stderr, /Invalid --at/);
});

test('snippet prints runnable code; motd adds a system line; init writes defaults that are then used', () => {
  const js = run('snippet', 'Hi', '-f', 'Standard');
  assert.strictEqual(spawnSync(process.execPath, ['-e', js.stdout], { encoding: 'utf8' }).stdout.trim(), run('text', 'Hi', '-f', 'Standard', '-c', 'plain').stdout.trim().split('\n').map((l) => l.replace(/\s+$/, '')).join('\n'));
  assert.match(run('snippet', 'Hi', '-L', 'cobol').stderr, /No start-up snippet/);
  const m = run('motd', 'Hi', '-c', 'plain');
  assert.match(m.stdout, new RegExp(os.hostname().replace(/\./g, '\\.')));
  assert.ok(!run('motd', 'Hi', '--no-info').stdout.includes(os.hostname()));

  const proj = fs.mkdtempSync(path.join(os.tmpdir(), 'af-proj-'));
  assert.strictEqual(runIn(proj, ['init']).status, 0);
  assert.strictEqual(runIn(proj, ['init']).status, 1);
  assert.match(fs.readFileSync(path.join(proj, '.asciiforgerc.json'), 'utf8'), /"font": "Slant"/);
  fs.writeFileSync(path.join(proj, '.asciiforgerc.json'), JSON.stringify({ font: 'Standard', color: 'plain', border: 'single' }));
  const withCfg = runIn(proj, ['text', 'Hi']);
  assert.ok(withCfg.stdout.startsWith('┌'), 'the project file set the border');
  assert.strictEqual(runIn(proj, ['text', 'Hi', '--border', 'none']).stdout.includes('┌'), false, 'flags beat the file');
  fs.writeFileSync(path.join(proj, '.asciiforgerc.json'), '{"colour": "x"}');
  assert.match(runIn(proj, ['text', 'Hi']).stderr, /unknown setting "colour"/);
});

test('fonts --preview draws samples and says how many were left out', () => {
  const r = run('fonts', 'shadow', '--preview', 'Hi', '--limit', '2');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual((r.stdout.match(/^── /gm) || []).length, 2);
  assert.match(r.stdout, /2 of \d+ fonts shown/);
});
