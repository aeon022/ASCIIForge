"use strict";
/** Alignment and boxes for banners (plain text lines in, plain text lines out). */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimRight = exports.BORDER_STYLES = void 0;
exports.parseBorder = parseBorder;
exports.parseAlign = parseAlign;
exports.addBorder = addBorder;
exports.alignBlock = alignBlock;
const BORDERS = {
    single: { tl: '┌', t: '─', tr: '┐', l: '│', r: '│', bl: '└', b: '─', br: '┘' },
    double: { tl: '╔', t: '═', tr: '╗', l: '║', r: '║', bl: '╚', b: '═', br: '╝' },
    round: { tl: '╭', t: '─', tr: '╮', l: '│', r: '│', bl: '╰', b: '─', br: '╯' },
    bold: { tl: '┏', t: '━', tr: '┓', l: '┃', r: '┃', bl: '┗', b: '━', br: '┛' },
    ascii: { tl: '+', t: '-', tr: '+', l: '|', r: '|', bl: '+', b: '-', br: '+' }
};
exports.BORDER_STYLES = Object.keys(BORDERS);
function parseBorder(name) {
    const n = name.trim().toLowerCase();
    if (n === 'none' || n in BORDERS)
        return n;
    throw new Error(`Unknown border "${name}". Available: none, ${exports.BORDER_STYLES.join(', ')}`);
}
function parseAlign(name) {
    const n = name.trim().toLowerCase();
    if (n === 'left' || n === 'center' || n === 'right')
        return n;
    throw new Error(`Unknown alignment "${name}". Use left, center or right.`);
}
const widest = (lines) => Math.max(0, ...lines.map((l) => Array.from(l).length));
/** Draws a box around the lines with `pad` blanks of space inside on the left and right. */
function addBorder(lines, style, pad = 1) {
    if (style === 'none')
        return lines;
    const b = BORDERS[style];
    const w = widest(lines);
    const inner = w + pad * 2;
    const row = (l) => `${b.l}${' '.repeat(pad)}${l}${' '.repeat(w - Array.from(l).length)}${' '.repeat(pad)}${b.r}`;
    return [b.tl + b.t.repeat(inner) + b.tr, ...lines.map(row), b.bl + b.b.repeat(inner) + b.br];
}
/** Moves the block inside a field `width` columns wide; a block wider than the field is left as it is. */
function alignBlock(lines, align, width) {
    const w = widest(lines);
    const free = Math.max(0, width - w);
    const left = align === 'left' ? 0 : align === 'center' ? Math.floor(free / 2) : free;
    return lines.map((l) => ' '.repeat(left) + l);
}
/** Trailing blanks are dropped: they only add noise to files and diffs. */
const trimRight = (lines) => lines.map((l) => l.replace(/\s+$/, ''));
exports.trimRight = trimRight;
