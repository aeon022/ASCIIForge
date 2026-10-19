#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import figlet from 'figlet';
import { renderAsciiText, applyColorPreset } from './textBanner';
import { wrapInCodeComment } from './commentBox';
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
          console.error('   Please verify your key at https://buy.polar.sh/polar_cl_BN6xwyJH2Drn6WuzvV49E2KCGauvtoTHixD3w1hCpSH\n');
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
        console.log('\n💡 Buy Pro License: https://buy.polar.sh/polar_cl_BN6xwyJH2Drn6WuzvV49E2KCGauvtoTHixD3w1hCpSH\n');
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
      console.log(`[ASCIIForge] License Status: ${licenseCheck.message}\n`);

      const rawAscii = await renderAsciiText(text, options.font);
      const coloredAscii = applyColorPreset(rawAscii, options.color as ColorPreset);

      console.log(coloredAscii);

      if (options.output) {
        const outputPath = path.resolve(options.output);
        await fs.writeFile(outputPath, rawAscii, 'utf8');
        console.log(`\n✨ Saved ASCII banner to: ${outputPath}`);
      }

      if (!licenseCheck.valid) {
        console.log('\n💡 Support development and remove the comment watermark: https://buy.polar.sh/polar_cl_BN6xwyJH2Drn6WuzvV49E2KCGauvtoTHixD3w1hCpSH');
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
  .option('-lang, --language <lang>', 'Comment syntax: typescript, python, html, css, rust', 'typescript')
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
        console.log(`\n✨ Saved comment block to: ${outputPath}`);
      }

      if (!licenseCheck.valid) {
        console.log('\n💡 Support development and remove the comment watermark: https://buy.polar.sh/polar_cl_BN6xwyJH2Drn6WuzvV49E2KCGauvtoTHixD3w1hCpSH');
      }
    } catch (err: any) {
      process.exitCode = 1;
      console.error(`[ASCIIForge] Error: ${err.message}`);
    }
  });

// Fonts List Command
program
  .command('fonts')
  .description('List all available FIGlet fonts')
  .action(() => {
    const allFonts = figlet.fontsSync().sort((a, b) => a.localeCompare(b));
    console.log(`\n🎨 ASCIIForge Fonts (${allFonts.length} available):\n`);
    allFonts.forEach((font) => console.log(`  - ${font}`));
    console.log('\nUse any of these with: ascii-forge text "Hello" -f "<font name>"\n');
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
