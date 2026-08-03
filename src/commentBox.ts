import { CommentLanguage } from './types';

export function wrapInCodeComment(asciiArt: string, lang: CommentLanguage = 'typescript', watermark: boolean = true): string {
  const lines = asciiArt.split('\n');

  if (lang === 'typescript' || lang === 'js' || lang === 'rust' || lang === 'c' || lang === 'css') {
    let result = '/*\n';
    lines.forEach(l => {
      result += ` * ${l}\n`;
    });
    if (watermark) {
      result += ' * [Crafted with ASCIIForge by abteilung83]\n';
    }
    result += ' */\n';
    return result;
  }

  if (lang === 'python') {
    let result = '"""\n';
    lines.forEach(l => {
      result += `${l}\n`;
    });
    if (watermark) {
      result += '[Crafted with ASCIIForge by abteilung83]\n';
    }
    result += '"""\n';
    return result;
  }

  if (lang === 'html') {
    let result = '<!--\n';
    lines.forEach(l => {
      result += `  ${l}\n`;
    });
    if (watermark) {
      result += '  [Crafted with ASCIIForge by abteilung83]\n';
    }
    result += '-->\n';
    return result;
  }

  // Default // line comments
  let result = '';
  lines.forEach(l => {
    result += `// ${l}\n`;
  });
  if (watermark) {
    result += '// [Crafted with ASCIIForge by abteilung83]\n';
  }
  return result;
}
