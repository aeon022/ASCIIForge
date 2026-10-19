const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { parseColor, blend, normalizeHex, colorizeAnsi, COLOR_PRESETS, RAINBOW } = require('../dist/color');
const { addBorder, alignBlock, parseBorder, parseAlign } = require('../dist/layout');
const { parseDefaults, loadDefaults, PROJECT_FILE } = require('../dist/config');
const { insertBlock, parsePosition } = require('../dist/insert');
const { makeSnippet, parseSnippetLanguage } = require('../dist/snippet');
const { toSvg, toHtml, formatFor, writeBanner, copyToClipboard } = require('../dist/output');
const { wrapInCodeComment, lineComment } = require('../dist/commentBox');

test('colours: gradients blend between the stops, hex is normalised, mistakes are explained', () => {
  assert.strictEqual(blend(['#000000', '#ffffff'], 0.5), '#808080');
  assert.strictEqual(blend(['#ff0000', '#00ff00', '#0000ff'], 0.5), '#00ff00');
  assert.strictEqual(normalizeHex('#F0a'), '#ff00aa');
  assert.throws(() => normalizeHex('red'), /not a hex colour/);
  const g = parseColor('#ff0000,#0000ff');
  assert.strictEqual(g.at(0, 0, 11, 1), '#ff0000');
  assert.strictEqual(g.at(10, 0, 11, 1), '#0000ff');
  assert.strictEqual(parseColor('#00ff88').at(3, 3, 9, 9), '#00ff88');
  assert.strictEqual(parseColor('#ff0000,#0000ff', 'vertical').at(5, 0, 11, 3), '#ff0000');
  assert.throws(() => parseColor('chartreuse'), /Unknown colour "chartreuse"\. Use a preset \(.*rainbow/);
  assert.ok(RAINBOW.length >= 6 && COLOR_PRESETS.rainbow.at(0, 0, 10, 1) === RAINBOW[0]);
});

test('colourising keeps the text and adds colour only to visible characters', () => {
  const chalk = require('chalk');
  const before = chalk.level;
  chalk.level = 3;
  try {
    const out = colorizeAnsi(['ab', ' c'], parseColor('#ff0000,#0000ff'));
    assert.ok(out.includes('\u001b['), 'has escapes');
    assert.strictEqual(out.replace(/\u001b\[[0-9;]*m/g, ''), 'ab\n c');
    assert.strictEqual(colorizeAnsi(['ab'], COLOR_PRESETS.plain), 'ab');
  } finally { chalk.level = before; }
});

test('layout: borders, alignment, wide characters count as one column each', () => {
  assert.deepStrictEqual(addBorder(['ab', 'c'], 'single', 1), ['┌────┐', '│ ab │', '│ c  │', '└────┘']);
  assert.deepStrictEqual(addBorder(['x'], 'ascii', 0), ['+-+', '|x|', '+-+']);
  assert.deepStrictEqual(addBorder(['x'], 'none'), ['x']);
  assert.deepStrictEqual(alignBlock(['ab'], 'center', 10), ['    ab']);
  assert.deepStrictEqual(alignBlock(['ab'], 'right', 10), ['        ab']);
  assert.deepStrictEqual(alignBlock(['abcdef'], 'center', 3), ['abcdef'], 'too wide: unchanged');
  assert.throws(() => parseBorder('wavy'), /Unknown border "wavy"\. Available: none, single/);
  assert.throws(() => parseAlign('middle'), /Unknown alignment/);
});

test('config: validation, user then project precedence, nearest project file wins', () => {
  assert.deepStrictEqual(parseDefaults({ font: 'Standard', pad: 2 }, 'f'), { font: 'Standard', pad: 2 });
  assert.throws(() => parseDefaults({ font: 3 }, 'f'), /"font" must be a string/);
  assert.throws(() => parseDefaults({ pad: -1 }, 'f'), /"pad" must be a non-negative number/);
  assert.throws(() => parseDefaults({ colour: 'x' }, 'f'), /unknown setting "colour"/);
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'af-home-'));
  const proj = path.join(home, 'work', 'app', 'src');
  fs.mkdirSync(proj, { recursive: true });
  fs.mkdirSync(path.join(home, '.config', 'ascii-forge'), { recursive: true });
  fs.writeFileSync(path.join(home, '.config', 'ascii-forge', 'defaults.json'), JSON.stringify({ font: 'Big', color: 'cyan' }));
  fs.writeFileSync(path.join(home, 'work', PROJECT_FILE), JSON.stringify({ color: 'fire', border: 'round' }));
  fs.writeFileSync(path.join(home, 'work', 'app', PROJECT_FILE), JSON.stringify({ border: 'double' }));
  assert.deepStrictEqual(loadDefaults(proj, home), { font: 'Big', color: 'cyan', border: 'double' });
  fs.writeFileSync(path.join(home, 'work', 'app', PROJECT_FILE), '{oops');
  assert.throws(() => loadDefaults(proj, home), /not valid JSON/);
});

test('insert: top (after a shebang), bottom, line, and tagged blocks are replaced instead of duplicated', () => {
  const block = wrapInCodeComment('AB', 'python', false);
  assert.strictEqual(insertBlock('#!/usr/bin/env python3\nprint(1)\n', block, 'python', 'top').content, '#!/usr/bin/env python3\n# AB\nprint(1)\n');
  assert.strictEqual(insertBlock('x\n', block, 'python', 'bottom').content, 'x\n# AB\n');
  assert.strictEqual(insertBlock('a\nb\nc\n', block, 'python', 2).content, 'a\n# AB\nb\nc\n');
  assert.strictEqual(insertBlock('', block, 'python').content, '# AB\n');
  const first = insertBlock('code\n', block, 'python', 'top', 'hero');
  assert.strictEqual(first.action, 'inserted');
  assert.match(first.content, /^# ascii-forge:begin hero\n# AB\n# ascii-forge:end hero\ncode\n$/);
  const again = insertBlock(first.content, wrapInCodeComment('CD', 'python', false), 'python', 'bottom', 'hero');
  assert.strictEqual(again.action, 'replaced');
  assert.strictEqual(again.content, '# ascii-forge:begin hero\n# CD\n# ascii-forge:end hero\ncode\n');
  assert.strictEqual((again.content.match(/begin hero/g) || []).length, 1);
  assert.strictEqual(insertBlock('a\r\nb\r\n', block, 'python', 'bottom').content, 'a\r\nb\r\n# AB\r\n', 'line endings are kept');
  assert.throws(() => insertBlock('x', block, 'python', 'top', 'bad tag'), /Invalid --tag/);
  assert.throws(() => parsePosition('0'), /Invalid --at/);
  assert.strictEqual(lineComment('html', 'a --> b'), '<!-- a -- > b -->');
  assert.strictEqual(lineComment('typescript', 'x'), '/* x */');
});

function run(cmd, args, input) {
  return spawnSync(cmd, args, { input, encoding: 'utf8' });
}

test('start-up snippets print exactly the banner (JS, Python, shell are executed)', () => {
  const art = 'a`b ${x} \\n \'q\' "r"\n  /\\_/\\ \n';
  const want = art.replace(/\s+$/gm, '').replace(/\n+$/, '');
  const js = makeSnippet(art, 'js');
  assert.strictEqual(run(process.execPath, ['-e', js]).stdout.replace(/\n$/, ''), want);
  const py = run('python3', ['-c', makeSnippet(art, 'python')]);
  if (py.status !== null && !py.error) assert.strictEqual(py.stdout.replace(/\n$/, ''), want);
  const sh = run('sh', ['-c', makeSnippet(art, 'shell')]);
  assert.strictEqual(sh.stdout.replace(/\n$/, ''), want);
  assert.match(makeSnippet(art, 'go'), /fmt\.Println\(strings\.Join/);
  assert.match(makeSnippet('x"#y', 'rust'), /r##"x"#y"##/);
  assert.match(makeSnippet('BANNER', 'shell'), /<<'BANNER_'/);
  assert.strictEqual(parseSnippetLanguage('Node'), 'js');
  assert.throws(() => parseSnippetLanguage('cobol'), /No start-up snippet for "cobol"/);
});

test('files: format follows the extension; SVG and HTML are escaped and coloured', async () => {
  assert.deepStrictEqual(['a.svg', 'a.HTML', 'a.md', 'a.txt', 'a'].map(formatFor), ['svg', 'html', 'markdown', 'text', 'text']);
  const spec = parseColor('#ff0000,#0000ff');
  const svg = toSvg(['<a>&', 'b'], spec);
  assert.ok(svg.includes('&lt;') && svg.includes('&gt;') && svg.includes('&amp;'));
  assert.match(svg, /fill="#ff0000"/);
  assert.ok(!svg.includes('<a>'));
  assert.match(toHtml(['<x>'], spec), /&lt;/);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'af-out-'));
  const md = await writeBanner(path.join(dir, 'sub', 'b.md'), ['hi'], spec);
  assert.strictEqual(fs.readFileSync(md, 'utf8'), '```text\nhi\n```\n');
});

test('clipboard: uses the first tool that works, explains when there is none', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'af-clip-'));
  const out = path.join(dir, 'captured.txt');
  fs.writeFileSync(path.join(dir, 'xclip'), `#!/bin/sh\ncat > '${out}'\n`, { mode: 0o755 });
  const oldPath = process.env.PATH;
  process.env.PATH = dir + ':/usr/bin:/bin';
  try {
    assert.strictEqual(await copyToClipboard('hello\nworld', 'linux'), 'xclip');
    assert.strictEqual(fs.readFileSync(out, 'utf8'), 'hello\nworld');
    fs.rmSync(path.join(dir, 'xclip'));
    await assert.rejects(copyToClipboard('x', 'linux'), /No clipboard tool found \(tried wl-copy, xclip, xsel\)/);
    await assert.rejects(copyToClipboard('x', 'plan9'), /not supported on plan9/);
  } finally { process.env.PATH = oldPath; }
});
