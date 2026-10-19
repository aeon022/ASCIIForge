/** Alignment and boxes for banners (plain text lines in, plain text lines out). */

export type Align = 'left' | 'center' | 'right';
export type BorderStyle = 'none' | 'single' | 'double' | 'round' | 'bold' | 'ascii';

const BORDERS: Record<Exclude<BorderStyle, 'none'>, { tl: string; t: string; tr: string; l: string; r: string; bl: string; b: string; br: string }> = {
  single: { tl: '┌', t: '─', tr: '┐', l: '│', r: '│', bl: '└', b: '─', br: '┘' },
  double: { tl: '╔', t: '═', tr: '╗', l: '║', r: '║', bl: '╚', b: '═', br: '╝' },
  round: { tl: '╭', t: '─', tr: '╮', l: '│', r: '│', bl: '╰', b: '─', br: '╯' },
  bold: { tl: '┏', t: '━', tr: '┓', l: '┃', r: '┃', bl: '┗', b: '━', br: '┛' },
  ascii: { tl: '+', t: '-', tr: '+', l: '|', r: '|', bl: '+', b: '-', br: '+' }
};

export const BORDER_STYLES = Object.keys(BORDERS);

export function parseBorder(name: string): BorderStyle {
  const n = name.trim().toLowerCase();
  if (n === 'none' || n in BORDERS) return n as BorderStyle;
  throw new Error(`Unknown border "${name}". Available: none, ${BORDER_STYLES.join(', ')}`);
}

export function parseAlign(name: string): Align {
  const n = name.trim().toLowerCase();
  if (n === 'left' || n === 'center' || n === 'right') return n;
  throw new Error(`Unknown alignment "${name}". Use left, center or right.`);
}

const widest = (lines: string[]) => Math.max(0, ...lines.map((l) => Array.from(l).length));

/** Draws a box around the lines with `pad` blanks of space inside on the left and right. */
export function addBorder(lines: string[], style: BorderStyle, pad: number = 1): string[] {
  if (style === 'none') return lines;
  const b = BORDERS[style];
  const w = widest(lines);
  const inner = w + pad * 2;
  const row = (l: string) => `${b.l}${' '.repeat(pad)}${l}${' '.repeat(w - Array.from(l).length)}${' '.repeat(pad)}${b.r}`;
  return [b.tl + b.t.repeat(inner) + b.tr, ...lines.map(row), b.bl + b.b.repeat(inner) + b.br];
}

/** Moves the block inside a field `width` columns wide; a block wider than the field is left as it is. */
export function alignBlock(lines: string[], align: Align, width: number): string[] {
  const w = widest(lines);
  const free = Math.max(0, width - w);
  const left = align === 'left' ? 0 : align === 'center' ? Math.floor(free / 2) : free;
  return lines.map((l) => ' '.repeat(left) + l);
}

/** Trailing blanks are dropped: they only add noise to files and diffs. */
export const trimRight = (lines: string[]) => lines.map((l) => l.replace(/\s+$/, ''));
