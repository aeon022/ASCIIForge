import figlet from 'figlet';
import chalk from 'chalk';
import { ColorPreset } from './types';

/** The installed font whose name is closest to `name` (case-insensitive edit distance), if one is close enough. */
export function suggestFont(name: string): string | undefined {
  const target = name.toLowerCase();
  let best: string | undefined;
  let bestDist = Infinity;
  for (const f of figlet.fontsSync()) {
    const d = editDistance(target, f.toLowerCase());
    if (d < bestDist) {
      bestDist = d;
      best = f;
    }
  }
  return bestDist <= Math.max(2, Math.floor(target.length / 3)) ? best : undefined;
}

function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

export type Layout = 'default' | 'full' | 'fitted' | 'smush';

const LAYOUTS: Record<Layout, string> = {
  default: 'default',
  full: 'full',
  fitted: 'fitted',
  smush: 'controlled smushing'
};

export function parseLayout(name: string): Layout {
  const n = name.trim().toLowerCase();
  if (n in LAYOUTS) return n as Layout;
  throw new Error(`Unknown layout "${name}". Use default, full, fitted or smush.`);
}

export interface FigletOptions {
  layout?: Layout;
  /** wrap the text at this many columns (the banner may be narrower) */
  width?: number;
}

/**
 * Renders text with a FIGlet font. An unknown font is an error that names the closest installed font;
 * silently drawing something else hid typos (`-f Slnt` produced a different font without a word).
 * The font name `random` picks one of the installed fonts.
 */
export function renderAsciiText(text: string, fontName: string = 'Slant', options: FigletOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const installed = figlet.fontsSync();
    const exact = fontName.toLowerCase() === 'random'
      ? installed[Math.floor(Math.random() * installed.length)]
      : installed.find((f) => f.toLowerCase() === fontName.toLowerCase());
    if (!exact) {
      const hint = suggestFont(fontName);
      return reject(new Error(`Unknown font "${fontName}".${hint ? ` Did you mean "${hint}"?` : ''} List all fonts with: asciiglitch fonts`));
    }
    const opts: any = { font: exact };
    if (options.layout && options.layout !== 'default') opts.horizontalLayout = LAYOUTS[options.layout];
    if (options.width) { opts.width = options.width; opts.whitespaceBreak = true; }
    figlet.text(text, opts, (err, result) => {
      if (err || !result) return reject(err || new Error('FIGlet rendering failed'));
      resolve(result);
    });
  });
}

export function applyColorPreset(asciiArt: string, color: ColorPreset = 'cyan'): string {
  if (color === 'plain') return asciiArt;

  const lines = asciiArt.split('\n');
  return lines.map((line, idx) => {
    if (color === 'cyan') return chalk.cyan(line);
    if (color === 'magenta') return chalk.magenta(line);
    if (color === 'green') return chalk.green(line);
    if (color === 'yellow') return chalk.yellow(line);
    if (color === 'red') return chalk.red(line);
    if (color === 'neon') {
      return idx % 2 === 0 ? chalk.cyan.bold(line) : chalk.magenta.bold(line);
    }
    if (color === 'fire') {
      return idx % 2 === 0 ? chalk.red.bold(line) : chalk.yellow.bold(line);
    }
    return chalk.cyan(line);
  }).join('\n');
}
