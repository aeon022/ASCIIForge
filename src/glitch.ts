/** The glitch effect: shifted rows and corrupted characters, optionally repeatable with a seed. */

export const GLITCH_CHARS = '#%&@$░▒▓█/\\|_=+<>[]{}';

/** Small seedable random generator (mulberry32), so a glitch can be reproduced. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function parseIntensity(v: string | number): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 1) throw new Error('--glitch must be a number between 0 and 1 (0.3 is a good start)');
  return n;
}

/**
 * Corrupts a banner. `intensity` 0 returns it unchanged; around 0.3 looks like a flickering screen, 1 is wrecked.
 * About `intensity` of the rows are pushed sideways by up to 4 columns, and about 12 % × intensity of the
 * visible characters become glitch glyphs. Line count never changes.
 */
export function glitch(lines: string[], intensity: number, seed: number = Math.floor(Math.random() * 2 ** 32)): string[] {
  if (intensity <= 0) return lines;
  const rand = rng(seed);
  return lines.map((line) => {
    let chars = Array.from(line);
    if (rand() < intensity * 0.6) {
      const shift = (rand() < 0.5 ? -1 : 1) * (1 + Math.floor(rand() * 4));
      chars = shift > 0 ? [...Array(shift).fill(' '), ...chars] : chars.slice(Math.min(-shift, chars.filter((c) => c === ' ').length ? -shift : 0));
    }
    chars = chars.map((c) => (c !== ' ' && rand() < intensity * 0.12 ? GLITCH_CHARS[Math.floor(rand() * GLITCH_CHARS.length)] : c));
    return chars.join('');
  });
}
