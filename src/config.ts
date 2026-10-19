import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/** Defaults a project or a user can keep in a file so they do not repeat flags. */
export interface Defaults {
  font?: string;
  color?: string;
  language?: string;
  align?: string;
  border?: string;
  pad?: number;
  layout?: string;
  width?: number;
}

const STRING_KEYS = ['font', 'color', 'language', 'align', 'border', 'layout'] as const;
const NUMBER_KEYS = ['pad', 'width'] as const;

export const PROJECT_FILE = '.asciiglitchrc.json';

export function parseDefaults(raw: any, file: string): Defaults {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(`${file}: expected a JSON object`);
  const out: Defaults = {};
  for (const k of STRING_KEYS) {
    if (raw[k] === undefined) continue;
    if (typeof raw[k] !== 'string') throw new Error(`${file}: "${k}" must be a string`);
    out[k] = raw[k];
  }
  for (const k of NUMBER_KEYS) {
    if (raw[k] === undefined) continue;
    if (typeof raw[k] !== 'number' || !Number.isFinite(raw[k]) || raw[k] < 0) throw new Error(`${file}: "${k}" must be a non-negative number`);
    out[k] = raw[k];
  }
  const known = new Set<string>([...STRING_KEYS, ...NUMBER_KEYS]);
  const unknown = Object.keys(raw).filter((k) => !known.has(k));
  if (unknown.length) throw new Error(`${file}: unknown setting${unknown.length > 1 ? 's' : ''} ${unknown.map((k) => `"${k}"`).join(', ')} (allowed: ${[...known].join(', ')})`);
  return out;
}

function readFile(file: string): Defaults | undefined {
  let text: string;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return undefined;
  }
  try {
    return parseDefaults(JSON.parse(text), file);
  } catch (err: any) {
    if (err instanceof SyntaxError) throw new Error(`${file}: not valid JSON (${err.message})`);
    throw err;
  }
}

/** The user's defaults (~/.config/asciiglitch/defaults.json) overridden by the nearest project file walking up from `cwd`. */
export function loadDefaults(cwd: string = process.cwd(), home: string = os.homedir()): Defaults {
  const user = readFile(path.join(home, '.config', 'asciiglitch', 'defaults.json')) || {};
  let dir = path.resolve(cwd);
  let project: Defaults = {};
  for (;;) {
    const found = readFile(path.join(dir, PROJECT_FILE));
    if (found) { project = found; break; }
    const parent = path.dirname(dir);
    if (parent === dir || dir === home) break;
    dir = parent;
  }
  return { ...user, ...project };
}

export const TEMPLATE: Defaults = { font: 'Slant', color: 'neon', language: 'typescript', align: 'left', border: 'none', pad: 1 };
