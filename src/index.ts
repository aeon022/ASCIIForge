#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import { renderAsciiText, applyColorPreset } from './textBanner';
import { wrapInCodeComment } from './commentBox';
import { validatePolarLicense } from './license';
import { ColorPreset, CommentLanguage } from './types';

const program = new Command();

program
  .name('ascii-forge')
  .alias('asciiforge')
  .description('ASCII Art & Terminal Banner Studio CLI for Developers & READMEs by abteilung83')
  .version('0.1.0');

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
        // Strip ANSI codes when saving to raw text file unless SVG/HTML
        const plainText = rawAscii;
        await fs.writeFile(outputPath, plainText, 'utf8');
        console.log(`\n✨ Saved ASCII banner to: ${outputPath}`);
      }

      if (!licenseCheck.valid) {
        console.log('\n💡 Unlock Pro fonts & custom export: https://buy.polar.sh/polar_cl_BN6xwyJH2Drn6WuzvV49E2KCGauvtoTHixD3w1hCpSH');
      }
    } catch (err: any) {
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
        console.log('\n💡 Unlock Pro un-watermarked comments: https://buy.polar.sh/polar_cl_BN6xwyJH2Drn6WuzvV49E2KCGauvtoTHixD3w1hCpSH');
      }
    } catch (err: any) {
      console.error(`[ASCIIForge] Error: ${err.message}`);
    }
  });

// Fonts List Command
program
  .command('fonts')
  .description('List popular recommended FIGlet fonts')
  .action(() => {
    console.log('\n🎨 Popular ASCIIForge Fonts:');
    console.log('  - Slant (Default modern sleek)');
    console.log('  - Standard (Classic bold)');
    console.log('  - Block (Heavy 3D block text)');
    console.log('  - ANSI Shadow (Retro shadow text)');
    console.log('  - 3D-ASCII (3D outline style)');
    console.log('  - Star Wars (Sci-fi styled font)\n');
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
      console.error(`[ASCIIForge] Error: ${err.message}`);
    }
  });

program.parse(process.argv);
