#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import figlet from 'figlet';
import { renderAsciiText, applyColorPreset } from './textBanner';
import { wrapInCodeComment, SUPPORTED_LANGUAGES } from './commentBox';
import { validatePolarLicense, saveLicenseKey, clearSavedLicense, getSavedLicenseKey, maskKey } from './license';
import { ColorPreset, CommentLanguage } from './types';

const program = new Command();

program
  .name('ascii-forge')
  .alias('asciiforge')
  .description('ASCII Art & Terminal Banner Studio CLI for Developers & READMEs by abteilung83')
  .version('0.1.0');

// License Management Command
program
  .command('license [key]')
  .description('Activate, check, or clear Polar.sh Pro license key')
  .option('--clear', 'Clear stored license key')
  .option('--status', 'Check active license status')
  .action(async (key, options) => {
    try {
      if (options.clear) {
        await clearSavedLicense();
        console.log('[ASCIIForge] Saved license key cleared. Switched to Free Tier.');
        return;
      }

      if (key) {
        console.log('[ASCIIForge] Validating license key...');
        const result = await saveLicenseKey(key);
        if (result.valid) {
          console.log(`\n✨ ${result.message}`);
          console.log('   License successfully activated and saved locally!\n');
        } else {
          console.error(`\n❌ ${result.message}`);
          console.error('   Please verify your key at https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS\n');
        }
        return;
      }

      // Check current status
      const activeKey = await getSavedLicenseKey();
      const result = await validatePolarLicense(activeKey);
      console.log('\n[ASCIIForge] License Status:');
      console.log(`  State : ${result.valid ? 'PRO ACTIVE ✓' : 'FREE TIER'}`);
      console.log(`  Key   : ${activeKey ? maskKey(activeKey) : 'None'}`);
      console.log(`  Info  : ${result.message}`);
      if (!result.valid) {
        console.log('\n💡 Buy Pro License: https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS\n');
      }
    } catch (err: any) {
      process.exitCode = 1;
      console.error(`[ASCIIForge] License error: ${err.message}`);
    }
  });

// Text Banner Command
program
  .command('text <text>')
  .description('Generate ASCII Art text banner')
  .option('-f, --font <name>', 'FIGlet font name (Slant, Standard, Block, ANSI Shadow, 3D-ASCII)', 'Slant')
  .option('-c, --color <preset>', 'Color preset: cyan, magenta, green, yellow, red, neon, fire, plain', 'neon')
  .option('-o, --output <path>', 'Save output to file')
  .option('-l, --license <key>', 'Polar.sh Pro License Key')
  .action(async (text, options) => {
    try {
      const licenseCheck = await validatePolarLicense(options.license);
      console.error(`[ASCIIForge] License Status: ${licenseCheck.message}`);

      const rawAscii = await renderAsciiText(text, options.font);
      const coloredAscii = applyColorPreset(rawAscii, options.color as ColorPreset);

      console.log(coloredAscii);

      if (options.output) {
        const outputPath = path.resolve(options.output);
        await fs.writeFile(outputPath, rawAscii, 'utf8');
        console.error(`✨ Saved ASCII banner to: ${outputPath}`);
      }

      if (!licenseCheck.valid) {
        console.error('\n💡 Support development and remove the comment watermark: https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS');
      }
    } catch (err: any) {
      process.exitCode = 1;
      console.error(`[ASCIIForge] Error: ${err.message}`);
    }
  });

// Comment Box Command
program
  .command('comment <text>')
  .description('Generate formatted code comment block for source files')
  .option('-f, --font <name>', 'FIGlet font name', 'Slant')
  .option('-L, --language <lang>', 'Comment syntax (see `ascii-forge languages`)', 'typescript')
  .option('-o, --output <path>', 'Save output to file')
  .option('-l, --license <key>', 'Polar.sh Pro License Key')
  .action(async (text, options) => {
    try {
      const licenseCheck = await validatePolarLicense(options.license);
      const rawAscii = await renderAsciiText(text, options.font);
      const commentBlock = wrapInCodeComment(rawAscii, options.language as CommentLanguage, !licenseCheck.valid);

      console.log(commentBlock);

      if (options.output) {
        const outputPath = path.resolve(options.output);
        await fs.writeFile(outputPath, commentBlock, 'utf8');
        console.error(`✨ Saved comment block to: ${outputPath}`);
      }

      if (!licenseCheck.valid) {
        console.error('\n💡 Support development and remove the comment watermark: https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS');
      }
    } catch (err: any) {
      process.exitCode = 1;
      console.error(`[ASCIIForge] Error: ${err.message}`);
    }
  });

// Fonts List Command
program
  .command('fonts [filter]')
  .description('List the available FIGlet fonts (optionally only those containing a word)')
  .action((filter?: string) => {
    const all = figlet.fontsSync().sort((a, b) => a.localeCompare(b));
    const fonts = filter ? all.filter((f) => f.toLowerCase().includes(filter.toLowerCase())) : all;
    console.log(`\n🎨 ASCIIForge Fonts (${fonts.length}${filter ? ` matching "${filter}" of ${all.length}` : ' available'}):\n`);
    fonts.forEach((font) => console.log(`  - ${font}`));
    console.log('\nUse any of these with: ascii-forge text "Hello" -f "<font name>"\n');
  });

// Languages Command
program
  .command('languages')
  .description('List the comment languages `ascii-forge comment` can write')
  .action(() => {
    console.log(SUPPORTED_LANGUAGES.join('\n'));
  });

// Demo Command
program
  .command('demo')
  .description('Generate an instant showcase banner')
  .option('-c, --color <preset>', 'Color preset', 'neon')
  .action(async (options) => {
    try {
      const banner = await renderAsciiText('ASCIIForge', 'Slant');
      const colored = applyColorPreset(banner, options.color as ColorPreset);
      console.log(colored);
      console.log('   Crafted with 💜 by abteilung83\n');
    } catch (err: any) {
      process.exitCode = 1;
      console.error(`[ASCIIForge] Error: ${err.message}`);
    }
  });

program.parse(process.argv);
