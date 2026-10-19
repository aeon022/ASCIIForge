import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';
import { ColorSpec } from './color';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FONT = "Menlo, Monaco, 'Courier New', monospace";

/** A monospace SVG of the banner; every character gets the colour the spec gives it. */
export function toSvg(lines: string[], spec: ColorSpec, background: string = '#1e1e2e', foreground: string = '#cdd6f4'): string {
  const fontSize = 16;
  const cw = fontSize * 0.602;
  const lh = Math.round(fontSize * 1.25);
  const w = Math.max(1, ...lines.map((l) => Array.from(l).length));
  const h = lines.length;
  const pad = 20;
  const width = Math.round(w * cw + pad * 2);
  const height = h * lh + pad * 2;
  const rows = lines.map((line, y) => {
    let spans = '';
    let run = '';
    let runColor: string | undefined;
    const flush = () => { if (run) spans += `<tspan fill="${runColor || foreground}">${esc(run)}</tspan>`; run = ''; };
    Array.from(line).forEach((ch, x) => {
      const c = ch === ' ' ? runColor : spec.at(x, y, w, h);
      if (c !== runColor && ch !== ' ') { flush(); runColor = c; }
      run += ch;
    });
    flush();
    return `  <text x="${pad}" y="${pad + (y + 1) * lh - 4}" xml:space="preserve" font-family="${FONT}" font-size="${fontSize}px"${spec.bold ? ' font-weight="bold"' : ''}>${spans}</text>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" rx="10" fill="${background}"/>
${rows.join('\n')}
</svg>
`;
}

/** A standalone HTML page with the banner in a <pre>, coloured per character. */
export function toHtml(lines: string[], spec: ColorSpec, background: string = '#1e1e2e', foreground: string = '#cdd6f4'): string {
  const w = Math.max(1, ...lines.map((l) => Array.from(l).length));
  const h = lines.length;
  const body = lines.map((line, y) => {
    let out = '';
    Array.from(line).forEach((ch, x) => {
      const c = ch === ' ' ? undefined : spec.at(x, y, w, h);
      out += c ? `<span style="color:${c}">${esc(ch)}</span>` : esc(ch);
    });
    return out;
  }).join('\n');
  return `<!doctype html>
<meta charset="utf-8">
<title>banner</title>
<style>body{margin:0;padding:24px;background:${background};color:${foreground}}pre{font:16px/1.25 ${FONT};margin:0}</style>
<pre>${body}</pre>
`;
}

export type FileFormat = 'text' | 'svg' | 'html' | 'markdown';

/** The format follows the file extension: .svg, .html, .md; anything else is plain text. */
export function formatFor(file: string): FileFormat {
  switch (path.extname(file).toLowerCase()) {
    case '.svg': return 'svg';
    case '.html': case '.htm': return 'html';
    case '.md': case '.markdown': return 'markdown';
    default: return 'text';
  }
}

export async function writeBanner(file: string, lines: string[], spec: ColorSpec): Promise<string> {
  const full = path.resolve(file);
  await fs.ensureDir(path.dirname(full));
  const format = formatFor(file);
  const content = format === 'svg' ? toSvg(lines, spec)
    : format === 'html' ? toHtml(lines, spec)
    : format === 'markdown' ? '```text\n' + lines.join('\n') + '\n```\n'
    : lines.join('\n') + '\n';
  await fs.writeFile(full, content, 'utf8');
  return full;
}

const CLIPBOARD: Record<string, [string, string[]][]> = {
  darwin: [['pbcopy', []]],
  win32: [['clip', []]],
  linux: [['wl-copy', []], ['xclip', ['-selection', 'clipboard']], ['xsel', ['--clipboard', '--input']]]
};

/** Puts text on the system clipboard using the tool the OS provides; rejects with a hint when there is none. */
export function copyToClipboard(text: string, platform: string = process.platform): Promise<string> {
  const candidates = CLIPBOARD[platform] || [];
  const tryNext = (i: number): Promise<string> => {
    if (i >= candidates.length) {
      return Promise.reject(new Error(candidates.length ? `No clipboard tool found (tried ${candidates.map((c) => c[0]).join(', ')}). Install one or redirect the output to a file.` : `--copy is not supported on ${platform}`));
    }
    const [cmd, args] = candidates[i];
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, { stdio: ['pipe', 'ignore', 'ignore'] });
      let settled = false; // a missing tool reports both 'error' and 'close'
      const next = () => { if (!settled) { settled = true; resolve(tryNext(i + 1)); } };
      child.on('error', next);
      child.on('close', (code) => { if (code === 0 && !settled) { settled = true; resolve(cmd); } else next(); });
      child.stdin.on('error', () => { /* the tool exited early: handled by close */ });
      child.stdin.end(text);
    });
  };
  return tryNext(0);
}
