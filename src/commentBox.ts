import { CommentLanguage } from './types';

interface Syntax {
  /** Block comments: first line, line prefix, last line. */
  block?: { open: string; prefix: string; close: string };
  /** Line comments: prefix of every line. */
  line?: string;
  /** Characters inside the art that would end the comment early, and what to write instead. */
  escapes?: [RegExp, string][];
}

const C_BLOCK: Syntax = { block: { open: '/*', prefix: ' * ', close: ' */' }, escapes: [[/\*\//g, '* /']] };
const HASH: Syntax = { line: '# ' };
const DASH: Syntax = { line: '-- ' };
const SLASHES: Syntax = { line: '// ' };
const HTML: Syntax = { block: { open: '<!--', prefix: '  ', close: '-->' }, escapes: [[/--!?>/g, '-- >']] };
const XML: Syntax = { block: { open: '<!--', prefix: '  ', close: '-->' }, escapes: [[/--/g, '- -']] };

// Every language the tool knows, by its canonical name; aliases below point at these.
const SYNTAX: Record<string, Syntax> = {
  typescript: C_BLOCK, javascript: C_BLOCK, c: C_BLOCK, cpp: C_BLOCK, csharp: C_BLOCK, java: C_BLOCK,
  go: C_BLOCK, rust: C_BLOCK, swift: C_BLOCK, kotlin: C_BLOCK, php: C_BLOCK, css: C_BLOCK, scss: C_BLOCK,
  python: HASH, shell: HASH, yaml: HASH, ruby: HASH, toml: HASH, dockerfile: HASH,
  sql: DASH, lua: DASH,
  html: HTML, markdown: HTML, xml: XML,
  line: SLASHES,
};

const ALIASES: Record<string, string> = {
  ts: 'typescript', js: 'javascript', py: 'python', sh: 'shell', bash: 'shell', zsh: 'shell',
  yml: 'yaml', rb: 'ruby', 'c++': 'cpp', cs: 'csharp', rs: 'rust', kt: 'kotlin', md: 'markdown', svg: 'xml',
};

export const SUPPORTED_LANGUAGES: string[] = [...Object.keys(SYNTAX).filter((n) => n !== 'line'), ...Object.keys(ALIASES)].sort();

export function resolveLanguage(name: string): string {
  const key = name.trim().toLowerCase();
  const canonical = ALIASES[key] || key;
  if (!SYNTAX[canonical]) {
    throw new Error(`Unknown comment language "${name}". Supported: ${SUPPORTED_LANGUAGES.join(', ')}`);
  }
  return canonical;
}

const WATERMARK = '[Crafted with asciiglitch by abteilung83]';

/**
 * Wraps ASCII art in a comment of the given language. Sequences inside the art that would close the
 * comment early (the block terminator `*` followed by `/`, or `-->`) are neutralised so the result always compiles, and trailing blanks are
 * trimmed so the block does not add whitespace noise to a diff.
 */
export function wrapInCodeComment(asciiArt: string, lang: CommentLanguage | string = 'typescript', watermark: boolean = true): string {
  const syntax = SYNTAX[resolveLanguage(lang)];
  let lines = asciiArt.split('\n').map((l) => l.replace(/\s+$/, ''));
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  for (const [re, to] of syntax.escapes || []) lines = lines.map((l) => l.replace(re, to));
  if (watermark) lines.push(WATERMARK);

  if (syntax.block) {
    const { open, prefix, close } = syntax.block;
    const body = lines.map((l) => (prefix + l).replace(/\s+$/, ''));
    return [open, ...body, close].join('\n') + '\n';
  }
  const prefix = syntax.line as string;
  return lines.map((l) => (prefix + l).replace(/\s+$/, '')).join('\n') + '\n';
}

/** One line of text as a comment of the language (used for markers); `--` is neutralised where it would end the comment. */
export function lineComment(lang: string, text: string): string {
  const syntax = SYNTAX[resolveLanguage(lang)];
  let t = text;
  for (const [re, to] of syntax.escapes || []) t = t.replace(re, to);
  if (syntax.block) return syntax.block.open === '<!--' ? `<!-- ${t} -->` : `${syntax.block.open} ${t} ${syntax.block.close.trim()}`;
  return `${syntax.line}${t}`;
}

const EXTENSIONS: Record<string, string> = {
  ts: 'typescript', tsx: 'typescript', mts: 'typescript', js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  py: 'python', rb: 'ruby', rs: 'rust', go: 'go', java: 'java', c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', hpp: 'cpp', cs: 'csharp',
  php: 'php', swift: 'swift', kt: 'kotlin', css: 'css', scss: 'scss', sh: 'shell', bash: 'shell', zsh: 'shell', yml: 'yaml', yaml: 'yaml',
  toml: 'toml', sql: 'sql', lua: 'lua', html: 'html', htm: 'html', xml: 'xml', svg: 'xml', md: 'markdown', markdown: 'markdown'
};

/** The comment language for a file name (by extension), if the tool knows it. */
export function languageForFile(file: string): string | undefined {
  const base = file.split(/[\\/]/).pop() || '';
  if (base.toLowerCase() === 'dockerfile') return 'dockerfile';
  const ext = base.includes('.') ? base.split('.').pop()!.toLowerCase() : '';
  return EXTENSIONS[ext];
}
