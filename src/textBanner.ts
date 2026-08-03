import figlet from 'figlet';
import chalk from 'chalk';
import { ColorPreset } from './types';

export function renderAsciiText(text: string, fontName: string = 'Slant'): Promise<string> {
  return new Promise((resolve, reject) => {
    figlet.text(text, { font: fontName as any }, (err, result) => {
      if (err || !result) {
        // Fallback to Standard font if specified font isn't found
        figlet.text(text, { font: 'Standard' }, (err2, fallbackResult) => {
          if (err2 || !fallbackResult) return reject(err2 || new Error('FIGlet rendering failed'));
          resolve(fallbackResult);
        });
        return;
      }
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
