/** Code that prints a banner when an application starts. The art is escaped for each language. */

export type SnippetLanguage = 'js' | 'ts' | 'python' | 'go' | 'rust' | 'shell';

const ALIASES: Record<string, SnippetLanguage> = {
  js: 'js', javascript: 'js', node: 'js', ts: 'ts', typescript: 'ts', py: 'python', python: 'python',
  go: 'go', golang: 'go', rust: 'rust', rs: 'rust', sh: 'shell', bash: 'shell', zsh: 'shell', shell: 'shell'
};

export const SNIPPET_LANGUAGES = ['js', 'ts', 'python', 'go', 'rust', 'shell'];

export function parseSnippetLanguage(name: string): SnippetLanguage {
  const l = ALIASES[name.trim().toLowerCase()];
  if (!l) throw new Error(`No start-up snippet for "${name}". Available: ${SNIPPET_LANGUAGES.join(', ')} (aliases: node, py, golang, rs, sh, bash)`);
  return l;
}

const trimEnd = (lines: string[]) => lines.map((l) => l.replace(/\s+$/, ''));

export function makeSnippet(art: string, language: SnippetLanguage): string {
  const lines = trimEnd(art.replace(/\n+$/, '').split('\n'));
  const text = lines.join('\n');
  switch (language) {
    case 'js':
    case 'ts': {
      const escaped = text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
      return `console.log(\`${escaped}\`);\n`;
    }
    case 'python': {
      // a raw triple-quoted string cannot end in a backslash or contain """: use a list of single-line raw strings
      return `print("\\n".join([\n${lines.map((l) => `    ${pyString(l)},`).join('\n')}\n]))\n`;
    }
    case 'go': {
      const parts = lines.map((l) => (l.includes('`') ? l.split('`').map((p) => '`' + p + '`').join(' + "`" + ') : '`' + l + '`'));
      return `fmt.Println(strings.Join([]string{\n${parts.map((p) => `\t${p},`).join('\n')}\n}, "\\n"))\n`;
    }
    case 'rust': {
      let hashes = '#';
      while (text.includes('"' + hashes)) hashes += '#';
      return `println!("{}", r${hashes}"${text}"${hashes});\n`;
    }
    case 'shell': {
      let delim = 'BANNER';
      while (lines.includes(delim)) delim += '_';
      return `cat <<'${delim}'\n${text}\n${delim}\n`;
    }
  }
}

/** A Python string literal for one line (single quotes, escapes). */
function pyString(l: string): string {
  return `'${l.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}
