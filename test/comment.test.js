const test = require('node:test');
const assert = require('node:assert');
const { wrapInCodeComment, resolveLanguage, SUPPORTED_LANGUAGES } = require('../dist/commentBox');
const { renderAsciiText, suggestFont } = require('../dist/textBanner');

const art = 'ab  \n  */  \n-->\n';

test('block comments cannot be closed early by the art, and trailing blanks are trimmed', () => {
  const out = wrapInCodeComment(art, 'typescript', false);
  assert.strictEqual(out, '/*\n * ab\n *   * /\n * -->\n */\n');
  assert.strictEqual(out.split('*/').length, 2, 'exactly one comment terminator');
  assert.ok(!/ +\n/.test(out), 'no trailing whitespace');
});

test('html comments cannot be closed early, xml forbids double dashes', () => {
  assert.ok(!wrapInCodeComment(art, 'html', false).slice(0, -4).includes('-->'));
  assert.ok(!wrapInCodeComment('a--b', 'xml', false).slice(4, -4).includes('--'));
});

test('hash, dash and slash styles', () => {
  assert.strictEqual(wrapInCodeComment('x\n y', 'python', false), '# x\n#  y\n');
  assert.strictEqual(wrapInCodeComment('x', 'sql', false), '-- x\n');
  assert.strictEqual(wrapInCodeComment('x', 'sh', true), '# x\n# [Crafted with asciiglitch by abteilung83]\n');
});

test('aliases resolve, unknown languages are an error that lists the supported ones', () => {
  for (const [alias, canon] of [['ts', 'typescript'], ['PY', 'python'], ['yml', 'yaml'], ['c++', 'cpp'], ['md', 'markdown']]) {
    assert.strictEqual(resolveLanguage(alias), canon);
  }
  assert.throws(() => resolveLanguage('cobol'), /Unknown comment language "cobol"\. Supported: .*typescript/);
  assert.ok(SUPPORTED_LANGUAGES.includes('go') && SUPPORTED_LANGUAGES.includes('rust') && SUPPORTED_LANGUAGES.includes('ts'));
});

test('an unknown font is an error with a suggestion instead of a silent other font', async () => {
  await assert.rejects(renderAsciiText('Hi', 'Slnt'), /Unknown font "Slnt"\. Did you mean "Slant"\?/);
  await assert.rejects(renderAsciiText('Hi', 'qqqqqqqq'), /Unknown font "qqqqqqqq"\.(?! Did you mean)/);
  assert.strictEqual(suggestFont('standrd'), 'Standard');
  assert.ok((await renderAsciiText('Hi', 'slant')).includes('/'), 'font names are case-insensitive');
});
