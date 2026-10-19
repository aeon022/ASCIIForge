#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import figlet from 'figlet';
import { renderAsciiText, parseLayout } from './textBanner';
import { wrapInCodeComment, SUPPORTED_LANGUAGES, languageForFile } from './commentBox';
import { validatePolarLicense, saveLicenseKey, clearSavedLicense, getSavedLicenseKey, maskKey } from './license';
import { parseColor, colorizeAnsi, configureColorSupport, COLOR_PRESETS, GradientDirection } from './color';
import { addBorder, alignBlock, parseAlign, parseBorder, trimRight } from './layout';
import { writeBanner, copyToClipboard } from './output';
import { loadDefaults, PROJECT_FILE, TEMPLATE } from './config';
import { insertBlock, parsePosition } from './insert';
import { glitch, parseIntensity } from './glitch';
import { makeSnippet, parseSnippetLanguage, SNIPPET_LANGUAGES } from './snippet';

const BUY_URL = 'https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS';

configureColorSupport();

const program = new Command();
program
  .name('asciiglitch')
  .description('ASCII art banners for terminals, READMEs and source files: colours and gradients, borders, comment blocks in 25+ languages')
  .version('0.2.0');

const fail = (err: any, what = 'Error') => {
  process.exitCode = 1;
  console.error(`[asciiglitch] ${what}: ${err.message || err}`);
};

const num = (v: any, name: string, min: number, max: number): number => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`--${name} must be a number between ${min} and ${max}`);
  return n;
};

async function licensed(options: any): Promise<boolean> {
  const check = await validatePolarLicense(options.license);
  console.error(`[asciiglitch] License Status: ${check.message}`);
  return check.valid;
}

const promo = (valid: boolean) => {
  if (!valid) console.error(`\n💡 Support development and remove the comment watermark: ${BUY_URL}`);
};

async function readStdin(): Promise<string> {
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  return data.replace(/\r?\n$/, '');
}

/** The text of a banner: the argument, or piped input when there is none. */
async function textOf(arg: string | undefined): Promise<string> {
  if (arg !== undefined) return arg;
  if (process.stdin.isTTY) throw new Error('Give the text as an argument, or pipe it in: echo "Hello" | asciiglitch text');
  const piped = await readStdin();
  if (piped.trim() === '') throw new Error('No text: the argument is missing and nothing was piped in.');
  return piped;
}

function bannerOptions(cmd: Command): Command {
  return cmd
    .option('-f, --font <name>', 'FIGlet font (or "random"); see `asciiglitch fonts`')
    .option('--layout <mode>', 'Letter spacing: default, full, fitted or smush')
    .option('--width <n>', 'Wrap the text at this many columns');
}

const GRADIENT_DIRECTIONS = ['horizontal', 'vertical', 'diagonal'];

// ── license ───────────────────────────────────────────────────────────────────

program
  .command('license [key]')
  .description('Activate, check, or clear Polar.sh Pro license key')
  .option('--clear', 'Clear stored license key')
  .option('--status', 'Check active license status')
  .action(async (key, options) => {
    try {
      if (options.clear) {
        await clearSavedLicense();
        console.log('[asciiglitch] Saved license key cleared. Switched to Free Tier.');
        return;
      }
      if (key) {
        console.log('[asciiglitch] Validating license key...');
        const result = await saveLicenseKey(key);
        if (result.valid) {
          console.log(`\n✨ ${result.message}`);
          console.log('   License successfully activated and saved locally!\n');
        } else {
          process.exitCode = 1;
          console.error(`\n❌ ${result.message}`);
          console.error(`   Please verify your key at ${BUY_URL}\n`);
        }
        return;
      }
      const activeKey = await getSavedLicenseKey();
      const result = await validatePolarLicense(activeKey);
      console.log('\n[asciiglitch] License Status:');
      console.log(`  State : ${result.valid ? 'PRO ACTIVE ✓' : 'FREE TIER'}`);
      console.log(`  Key   : ${activeKey ? maskKey(activeKey) : 'None'}`);
      console.log(`  Info  : ${result.message}`);
      if (!result.valid) console.log(`\n💡 Buy Pro License: ${BUY_URL}\n`);
    } catch (err) {
      fail(err, 'License error');
    }
  });

// ── text ──────────────────────────────────────────────────────────────────────

bannerOptions(program.command('text [text]').description('Draw a text banner (the text can also be piped in)'))
  .option('-c, --color <spec>', `Colour: ${Object.keys(COLOR_PRESETS).join(', ')}, a hex colour (#ff0080) or a gradient ("#ff0080,#00f0ff")`)
  .option('--direction <dir>', `Gradient direction: ${GRADIENT_DIRECTIONS.join(', ')}`, 'horizontal')
  .option('--align <side>', 'left, center or right (within --width, or the terminal width)')
  .option('--border <style>', 'Box around the banner: none, single, double, round, bold, ascii')
  .option('--pad <n>', 'Blanks between the border and the letters')
  .option('--glitch <0-1>', 'Corrupt the banner: shifted rows and broken characters (0.3 is a good start)')
  .option('--seed <n>', 'With --glitch: the same seed gives the same glitch')
  .option('-o, --output <path>', 'Also save to a file: .svg and .html keep the colours, .md wraps it in a code block, anything else is plain text')
  .option('--copy', 'Copy the banner (without colours) to the clipboard')
  .option('-l, --license <key>', 'Polar.sh Pro License Key')
  .action(async (arg: string | undefined, options: any) => {
    try {
      await licensed(options);
      const d = loadDefaults();
      const text = await textOf(arg);
      const dir = String(options.direction);
      if (!GRADIENT_DIRECTIONS.includes(dir)) throw new Error(`--direction must be one of ${GRADIENT_DIRECTIONS.join(', ')}`);
      const spec = parseColor(options.color ?? d.color ?? 'neon', dir as GradientDirection);
      const align = parseAlign(options.align ?? d.align ?? 'left');
      const border = parseBorder(options.border ?? d.border ?? 'none');
      const pad = num(options.pad ?? d.pad ?? 1, 'pad', 0, 20);
      const widthOpt = options.width ?? d.width;
      const width = widthOpt === undefined ? undefined : num(widthOpt, 'width', 10, 500);
      const raw = await renderAsciiText(text, options.font ?? d.font ?? 'Slant', {
        layout: parseLayout(options.layout ?? d.layout ?? 'default'),
        width: border === 'none' ? width : width === undefined ? undefined : Math.max(10, width - pad * 2 - 2)
      });
      let art = trimRight(raw.split('\n')).filter((l, i, a) => !(i === a.length - 1 && l === ''));
      if (options.glitch !== undefined) art = glitch(art, parseIntensity(options.glitch), options.seed === undefined ? undefined : num(options.seed, 'seed', 0, 4294967295));
      let lines = addBorder(art, border, pad);
      if (align !== 'left') lines = alignBlock(lines, align, width ?? process.stdout.columns ?? 80);
      console.log(colorizeAnsi(lines, spec));
      if (options.output) console.error(`✨ Saved banner to: ${await writeBanner(options.output, lines, spec)}`);
      if (options.copy) console.error(`📋 Copied to the clipboard (${await copyToClipboard(lines.join('\n') + '\n')})`);
    } catch (err) {
      fail(err);
    }
  });

// ── comment ───────────────────────────────────────────────────────────────────

bannerOptions(program.command('comment <text>').description('Write a banner as a code comment block, or put it into a file'))
  .option('-L, --language <lang>', 'Comment syntax (see `asciiglitch languages`); with --insert it follows the file extension')
  .option('-o, --output <path>', 'Save the comment block to a file')
  .option('--insert <file>', 'Insert the block into this source file')
  .option('--at <where>', 'With --insert: top (default, after a #! line), bottom, or a line number')
  .option('--tag <name>', 'With --insert: mark the block so running the command again replaces it instead of adding another')
  .option('--copy', 'Copy the block to the clipboard')
  .option('-l, --license <key>', 'Polar.sh Pro License Key')
  .action(async (text: string, options: any) => {
    try {
      const valid = await licensed(options);
      const d = loadDefaults();
      if (options.insert && options.output) throw new Error('Use either --insert or --output, not both.');
      const language: string = options.language ?? (options.insert ? languageForFile(options.insert) : undefined) ?? d.language ?? 'typescript';
      const widthOpt = options.width ?? d.width;
      const raw = await renderAsciiText(text, options.font ?? d.font ?? 'Slant', {
        layout: parseLayout(options.layout ?? d.layout ?? 'default'),
        width: widthOpt === undefined ? undefined : num(widthOpt, 'width', 10, 500)
      });
      const block = wrapInCodeComment(raw, language, !valid);
      if (options.insert) {
        const file = path.resolve(options.insert);
        const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
        const position = parsePosition(options.at ?? 'top');
        const result = insertBlock(existing, block, language, position, options.tag);
        fs.writeFileSync(file, result.content, 'utf8');
        console.error(`✨ ${result.action === 'replaced' ? 'Replaced the tagged block in' : 'Inserted the block into'}: ${file}`);
      } else {
        console.log(block);
        if (options.output) {
          const out = path.resolve(options.output);
          await fs.ensureDir(path.dirname(out));
          await fs.writeFile(out, block, 'utf8');
          console.error(`✨ Saved comment block to: ${out}`);
        }
      }
      if (options.copy) console.error(`📋 Copied to the clipboard (${await copyToClipboard(block)})`);
      promo(valid);
    } catch (err) {
      fail(err);
    }
  });

// ── snippet ───────────────────────────────────────────────────────────────────

bannerOptions(program.command('snippet <text>').description(`Code that prints the banner when your app starts (${SNIPPET_LANGUAGES.join(', ')})`))
  .option('-L, --language <lang>', 'Language of the snippet', 'js')
  .action(async (text: string, options: any) => {
    try {
      const d = loadDefaults();
      const language = parseSnippetLanguage(options.language);
      const raw = await renderAsciiText(text, options.font ?? d.font ?? 'Slant', { layout: parseLayout(options.layout ?? d.layout ?? 'default'), width: options.width ? num(options.width, 'width', 10, 500) : d.width });
      console.log(makeSnippet(raw, language).replace(/\n$/, ''));
    } catch (err) {
      fail(err);
    }
  });

// ── motd ──────────────────────────────────────────────────────────────────────

bannerOptions(program.command('motd <text>').description('A login banner: the banner plus a line with host, system and uptime'))
  .option('-c, --color <spec>', 'Colour (see `text --help`)')
  .option('--no-info', 'Only the banner')
  .action(async (text: string, options: any) => {
    try {
      const d = loadDefaults();
      const spec = parseColor(options.color ?? d.color ?? 'neon');
      const raw = await renderAsciiText(text, options.font ?? d.font ?? 'Slant', { layout: parseLayout(options.layout ?? d.layout ?? 'default'), width: options.width ? num(options.width, 'width', 10, 500) : d.width });
      console.log(colorizeAnsi(trimRight(raw.split('\n')), spec));
      if (options.info !== false) {
        const up = os.uptime();
        const days = Math.floor(up / 86400);
        const hours = Math.floor((up % 86400) / 3600);
        console.log(`\n  ${os.hostname()} · ${os.type()} ${os.release()} · up ${days ? `${days}d ` : ''}${hours}h\n`);
      }
    } catch (err) {
      fail(err);
    }
  });

// ── fonts / languages / init ──────────────────────────────────────────────────

program
  .command('fonts [filter]')
  .description('List the available FIGlet fonts (optionally only those containing a word)')
  .option('--preview [text]', 'Draw each font with this text (default: the font name)')
  .option('--limit <n>', 'With --preview: at most this many fonts', '12')
  .action(async (filter: string | undefined, options: any) => {
    try {
      const all = figlet.fontsSync().sort((a, b) => a.localeCompare(b));
      const fonts = filter ? all.filter((f) => f.toLowerCase().includes(filter.toLowerCase())) : all;
      if (options.preview !== undefined) {
        const limit = num(options.limit, 'limit', 1, 500);
        const shown = fonts.slice(0, limit);
        for (const font of shown) {
          const sample = typeof options.preview === 'string' ? options.preview : font;
          console.log(`\n── ${font}\n`);
          console.log(trimRight((await renderAsciiText(sample, font)).split('\n')).join('\n'));
        }
        console.log(`\n${shown.length} of ${fonts.length} fonts shown${fonts.length > shown.length ? ' (raise --limit or add a filter)' : ''}.\n`);
        return;
      }
      console.log(`\n🎨 asciiglitch Fonts (${fonts.length}${filter ? ` matching "${filter}" of ${all.length}` : ' available'}):\n`);
      fonts.forEach((font) => console.log(`  - ${font}`));
      console.log('\nUse any of these with: asciiglitch text "Hello" -f "<font name>"  (or -f random)\n');
    } catch (err) {
      fail(err);
    }
  });

program
  .command('languages')
  .description('List the comment languages `asciiglitch comment` can write')
  .action(() => {
    console.log(SUPPORTED_LANGUAGES.join('\n'));
  });

program
  .command('init')
  .description(`Write a ${PROJECT_FILE} with default font, colour, language … for this project`)
  .option('--force', 'Overwrite an existing file')
  .action((options: any) => {
    try {
      const file = path.resolve(PROJECT_FILE);
      if (fs.existsSync(file) && !options.force) throw new Error(`${PROJECT_FILE} already exists (use --force to overwrite it)`);
      fs.writeFileSync(file, JSON.stringify(TEMPLATE, null, 2) + '\n', 'utf8');
      console.log(`Created ${file}`);
    } catch (err) {
      fail(err);
    }
  });

program
  .command('demo')
  .description('Show a banner with a gradient')
  .option('-c, --color <spec>', 'Colour', 'rainbow')
  .action(async (options: any) => {
    try {
      const raw = await renderAsciiText('asciiglitch', 'Slant');
      console.log(colorizeAnsi(trimRight(raw.split('\n')), parseColor(options.color)));
      console.log('   Crafted with 💜 by abteilung83\n');
    } catch (err) {
      fail(err);
    }
  });

program.parse(process.argv);
