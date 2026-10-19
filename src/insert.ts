import { lineComment } from './commentBox';

export type Position = 'top' | 'bottom' | number;

export function parsePosition(spec: string): Position {
  const s = spec.trim().toLowerCase();
  if (s === 'top' || s === 'bottom') return s;
  if (/^\d+$/.test(s) && Number(s) >= 1) return Number(s);
  throw new Error(`Invalid --at "${spec}": use top, bottom or a line number (1 or more)`);
}

export interface InsertResult {
  content: string;
  action: 'inserted' | 'replaced';
}

/**
 * Puts a comment block into the text of a source file. With a tag the block is wrapped in two marker comments
 * (`asciiphreak:begin NAME` / `asciiphreak:end NAME`); running the command again replaces what is between the
 * markers instead of adding a second banner. Without a tag the block is simply inserted. At the top, a
 * shebang line stays first.
 */
export function insertBlock(source: string, block: string, language: string, position: Position = 'top', tag?: string): InsertResult {
  const nl = source.includes('\r\n') ? '\r\n' : '\n';
  const body = block.replace(/\n+$/, '').split('\n').join(nl);
  let text = body;
  if (tag) {
    if (!/^[A-Za-z0-9_.-]+$/.test(tag)) throw new Error(`Invalid --tag "${tag}": use letters, digits, dot, dash or underscore`);
    const begin = lineComment(language, `asciiphreak:begin ${tag}`);
    const end = lineComment(language, `asciiphreak:end ${tag}`);
    text = [begin, body, end].join(nl);
    const lines = source.split(/\r?\n/);
    const from = lines.findIndex((l) => l.trim() === begin);
    const to = lines.findIndex((l, i) => i > from && l.trim() === end);
    if (from >= 0 && to > from) {
      const next = [...lines.slice(0, from), ...text.split(nl), ...lines.slice(to + 1)];
      return { content: next.join(nl), action: 'replaced' };
    }
  }
  const lines = source === '' ? [] : source.split(/\r?\n/);
  const hasFinalNewline = /\r?\n$/.test(source);
  if (hasFinalNewline) lines.pop();
  let index: number;
  if (position === 'top') index = lines.length && lines[0].startsWith('#!') ? 1 : 0;
  else if (position === 'bottom') index = lines.length;
  else index = Math.min(position - 1, lines.length);
  const inserted = text.split(nl);
  const next = [...lines.slice(0, index), ...inserted, ...lines.slice(index)];
  return { content: next.join(nl) + (hasFinalNewline || source === '' ? nl : ''), action: 'inserted' };
}
