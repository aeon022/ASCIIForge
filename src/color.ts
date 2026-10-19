import chalk from 'chalk';

/**
 * How a banner is coloured. A spec says which colour each character gets (`at`), so the same spec can drive
 * terminal output (ANSI) and file output (SVG/HTML). `ansi` presets keep the terminal's own palette.
 */
export interface ColorSpec {
  /** hex colour for the character at column x, row y of a w × h banner; undefined = leave uncoloured */
  at(x: number, y: number, w: number, h: number): string | undefined;
  /** the terminal colour for a whole line, for presets that use the terminal palette */
  ansiLine?(line: string, y: number): string;
  bold?: boolean;
}

const PRESET_HEX = { cyan: '#00cdcd', magenta: '#cd00cd', green: '#00cd00', yellow: '#cdcd00', red: '#cd0000' };

const solid = (hex: string): ColorSpec => ({ at: () => hex });

export const RAINBOW = ['#ff0000', '#ff8800', '#ffee00', '#22cc22', '#00ccff', '#3355ff', '#aa44ff'];

export const COLOR_PRESETS: Record<string, ColorSpec> = {
  plain: { at: () => undefined },
  cyan: { at: () => PRESET_HEX.cyan, ansiLine: (l) => chalk.cyan(l) },
  magenta: { at: () => PRESET_HEX.magenta, ansiLine: (l) => chalk.magenta(l) },
  green: { at: () => PRESET_HEX.green, ansiLine: (l) => chalk.green(l) },
  yellow: { at: () => PRESET_HEX.yellow, ansiLine: (l) => chalk.yellow(l) },
  red: { at: () => PRESET_HEX.red, ansiLine: (l) => chalk.red(l) },
  neon: { at: (_x, y) => (y % 2 === 0 ? PRESET_HEX.cyan : PRESET_HEX.magenta), ansiLine: (l, y) => (y % 2 === 0 ? chalk.cyan.bold(l) : chalk.magenta.bold(l)), bold: true },
  fire: { at: (_x, y) => (y % 2 === 0 ? PRESET_HEX.red : PRESET_HEX.yellow), ansiLine: (l, y) => (y % 2 === 0 ? chalk.red.bold(l) : chalk.yellow.bold(l)), bold: true },
  rainbow: gradientSpec(RAINBOW)
};

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex(value: string): string {
  const m = HEX.exec(value.trim());
  if (!m) throw new Error(`"${value}" is not a hex colour (use #rgb or #rrggbb)`);
  let h = m[1].toLowerCase();
  if (h.length === 3) h = Array.from(h).map((c) => c + c).join('');
  return `#${h}`;
}

const rgb = (hex: string): [number, number, number] => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const toHex = (c: [number, number, number]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** Linear blend across the stops, `t` from 0 to 1. */
export function blend(stops: string[], t: number): string {
  if (stops.length === 1) return stops[0];
  const pos = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
  const i = Math.min(Math.floor(pos), stops.length - 2);
  const f = pos - i;
  const a = rgb(stops[i]);
  const b = rgb(stops[i + 1]);
  return toHex([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]);
}

export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal';

function gradientSpec(stops: string[], direction: GradientDirection = 'horizontal'): ColorSpec {
  return {
    at(x, y, w, h) {
      const tx = w > 1 ? x / (w - 1) : 0;
      const ty = h > 1 ? y / (h - 1) : 0;
      const t = direction === 'horizontal' ? tx : direction === 'vertical' ? ty : (tx + ty) / 2;
      return blend(stops, t);
    }
  };
}

/**
 * "neon", "rainbow", "#ff0080" (solid) or "#ff0080,#00f0ff[,#…]" (gradient, left to right unless a
 * direction is given). Errors name what is wrong and list the presets.
 */
export function parseColor(spec: string, direction: GradientDirection = 'horizontal'): ColorSpec {
  const s = spec.trim();
  const preset = COLOR_PRESETS[s.toLowerCase()];
  if (preset) return direction !== 'horizontal' && s.toLowerCase() === 'rainbow' ? gradientSpec(RAINBOW, direction) : preset;
  if (s.includes('#') || s.includes(',')) {
    const stops = s.split(',').map((p) => normalizeHex(p));
    if (stops.length === 1) return solid(stops[0]);
    return gradientSpec(stops, direction);
  }
  throw new Error(`Unknown colour "${spec}". Use a preset (${Object.keys(COLOR_PRESETS).join(', ')}), a hex colour like #ff0080, or a gradient like "#ff0080,#00f0ff".`);
}

/** Honour NO_COLOR (https://no-color.org) unless colour is forced. */
export function configureColorSupport(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NO_COLOR !== undefined && env.NO_COLOR !== '' && !env.FORCE_COLOR) chalk.level = 0;
}

/** Applies the spec to the lines with ANSI escapes (terminal output). */
export function colorizeAnsi(lines: string[], spec: ColorSpec): string {
  const h = lines.length;
  const w = Math.max(0, ...lines.map((l) => l.length));
  return lines.map((line, y) => {
    if (spec.ansiLine) return spec.ansiLine(line, y);
    let out = '';
    for (let x = 0; x < line.length; x++) {
      const ch = line[x];
      const hex = ch === ' ' ? undefined : spec.at(x, y, w, h);
      out += hex ? chalk.hex(hex)(ch) : ch;
    }
    return out;
  }).join('\n');
}
