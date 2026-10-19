"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_LANGUAGES = void 0;
exports.resolveLanguage = resolveLanguage;
exports.wrapInCodeComment = wrapInCodeComment;
exports.lineComment = lineComment;
exports.languageForFile = languageForFile;
const C_BLOCK = { block: { open: '/*', prefix: ' * ', close: ' */' }, escapes: [[/\*\//g, '* /']] };
const HASH = { line: '# ' };
const DASH = { line: '-- ' };
const SLASHES = { line: '// ' };
const HTML = { block: { open: '<!--', prefix: '  ', close: '-->' }, escapes: [[/--!?>/g, '-- >']] };
const XML = { block: { open: '<!--', prefix: '  ', close: '-->' }, escapes: [[/--/g, '- -']] };
// Every language the tool knows, by its canonical name; aliases below point at these.
const SYNTAX = {
    typescript: C_BLOCK, javascript: C_BLOCK, c: C_BLOCK, cpp: C_BLOCK, csharp: C_BLOCK, java: C_BLOCK,
    go: C_BLOCK, rust: C_BLOCK, swift: C_BLOCK, kotlin: C_BLOCK, php: C_BLOCK, css: C_BLOCK, scss: C_BLOCK,
    python: HASH, shell: HASH, yaml: HASH, ruby: HASH, toml: HASH, dockerfile: HASH,
    sql: DASH, lua: DASH,
    html: HTML, markdown: HTML, xml: XML,
    line: SLASHES,
};
const ALIASES = {
    ts: 'typescript', js: 'javascript', py: 'python', sh: 'shell', bash: 'shell', zsh: 'shell',
    yml: 'yaml', rb: 'ruby', 'c++': 'cpp', cs: 'csharp', rs: 'rust', kt: 'kotlin', md: 'markdown', svg: 'xml',
};
exports.SUPPORTED_LANGUAGES = [...Object.keys(SYNTAX).filter((n) => n !== 'line'), ...Object.keys(ALIASES)].sort();
function resolveLanguage(name) {
    const key = name.trim().toLowerCase();
    const canonical = ALIASES[key] || key;
    if (!SYNTAX[canonical]) {
        throw new Error(`Unknown comment language "${name}". Supported: ${exports.SUPPORTED_LANGUAGES.join(', ')}`);
    }
    return canonical;
}
const WATERMARK = '[Crafted with asciiphreak by abteilung83]';
/**
 * Wraps ASCII art in a comment of the given language. Sequences inside the art that would close the
 * comment early (the block terminator `*` followed by `/`, or `-->`) are neutralised so the result always compiles, and trailing blanks are
 * trimmed so the block does not add whitespace noise to a diff.
 */
function wrapInCodeComment(asciiArt, lang = 'typescript', watermark = true) {
    const syntax = SYNTAX[resolveLanguage(lang)];
    let lines = asciiArt.split('\n').map((l) => l.replace(/\s+$/, ''));
    while (lines.length && lines[lines.length - 1] === '')
        lines.pop();
    for (const [re, to] of syntax.escapes || [])
        lines = lines.map((l) => l.replace(re, to));
    if (watermark)
        lines.push(WATERMARK);
    if (syntax.block) {
        const { open, prefix, close } = syntax.block;
        const body = lines.map((l) => (prefix + l).replace(/\s+$/, ''));
        return [open, ...body, close].join('\n') + '\n';
    }
    const prefix = syntax.line;
    return lines.map((l) => (prefix + l).replace(/\s+$/, '')).join('\n') + '\n';
}
/** One line of text as a comment of the language (used for markers); `--` is neutralised where it would end the comment. */
function lineComment(lang, text) {
    const syntax = SYNTAX[resolveLanguage(lang)];
    let t = text;
    for (const [re, to] of syntax.escapes || [])
        t = t.replace(re, to);
    if (syntax.block)
        return syntax.block.open === '<!--' ? `<!-- ${t} -->` : `${syntax.block.open} ${t} ${syntax.block.close.trim()}`;
    return `${syntax.line}${t}`;
}
const EXTENSIONS = {
    ts: 'typescript', tsx: 'typescript', mts: 'typescript', js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    py: 'python', rb: 'ruby', rs: 'rust', go: 'go', java: 'java', c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', hpp: 'cpp', cs: 'csharp',
    php: 'php', swift: 'swift', kt: 'kotlin', css: 'css', scss: 'scss', sh: 'shell', bash: 'shell', zsh: 'shell', yml: 'yaml', yaml: 'yaml',
    toml: 'toml', sql: 'sql', lua: 'lua', html: 'html', htm: 'html', xml: 'xml', svg: 'xml', md: 'markdown', markdown: 'markdown'
};
/** The comment language for a file name (by extension), if the tool knows it. */
function languageForFile(file) {
    const base = file.split(/[\\/]/).pop() || '';
    if (base.toLowerCase() === 'dockerfile')
        return 'dockerfile';
    const ext = base.includes('.') ? base.split('.').pop().toLowerCase() : '';
    return EXTENSIONS[ext];
}
