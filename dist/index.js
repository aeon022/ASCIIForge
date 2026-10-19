#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const figlet_1 = __importDefault(require("figlet"));
const textBanner_1 = require("./textBanner");
const commentBox_1 = require("./commentBox");
const license_1 = require("./license");
const program = new commander_1.Command();
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
            await (0, license_1.clearSavedLicense)();
            console.log('[ASCIIForge] Saved license key cleared. Switched to Free Tier.');
            return;
        }
        if (key) {
            console.log('[ASCIIForge] Validating license key...');
            const result = await (0, license_1.saveLicenseKey)(key);
            if (result.valid) {
                console.log(`\n✨ ${result.message}`);
                console.log('   License successfully activated and saved locally!\n');
            }
            else {
                console.error(`\n❌ ${result.message}`);
                console.error('   Please verify your key at https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS\n');
            }
            return;
        }
        // Check current status
        const activeKey = await (0, license_1.getSavedLicenseKey)();
        const result = await (0, license_1.validatePolarLicense)(activeKey);
        console.log('\n[ASCIIForge] License Status:');
        console.log(`  State : ${result.valid ? 'PRO ACTIVE ✓' : 'FREE TIER'}`);
        console.log(`  Key   : ${activeKey ? (0, license_1.maskKey)(activeKey) : 'None'}`);
        console.log(`  Info  : ${result.message}`);
        if (!result.valid) {
            console.log('\n💡 Buy Pro License: https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS\n');
        }
    }
    catch (err) {
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
        const licenseCheck = await (0, license_1.validatePolarLicense)(options.license);
        console.error(`[ASCIIForge] License Status: ${licenseCheck.message}`);
        const rawAscii = await (0, textBanner_1.renderAsciiText)(text, options.font);
        const coloredAscii = (0, textBanner_1.applyColorPreset)(rawAscii, options.color);
        console.log(coloredAscii);
        if (options.output) {
            const outputPath = path.resolve(options.output);
            await fs.writeFile(outputPath, rawAscii, 'utf8');
            console.error(`✨ Saved ASCII banner to: ${outputPath}`);
        }
        if (!licenseCheck.valid) {
            console.error('\n💡 Support development and remove the comment watermark: https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS');
        }
    }
    catch (err) {
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
        const licenseCheck = await (0, license_1.validatePolarLicense)(options.license);
        const rawAscii = await (0, textBanner_1.renderAsciiText)(text, options.font);
        const commentBlock = (0, commentBox_1.wrapInCodeComment)(rawAscii, options.language, !licenseCheck.valid);
        console.log(commentBlock);
        if (options.output) {
            const outputPath = path.resolve(options.output);
            await fs.writeFile(outputPath, commentBlock, 'utf8');
            console.error(`✨ Saved comment block to: ${outputPath}`);
        }
        if (!licenseCheck.valid) {
            console.error('\n💡 Support development and remove the comment watermark: https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS');
        }
    }
    catch (err) {
        process.exitCode = 1;
        console.error(`[ASCIIForge] Error: ${err.message}`);
    }
});
// Fonts List Command
program
    .command('fonts [filter]')
    .description('List the available FIGlet fonts (optionally only those containing a word)')
    .action((filter) => {
    const all = figlet_1.default.fontsSync().sort((a, b) => a.localeCompare(b));
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
    console.log(commentBox_1.SUPPORTED_LANGUAGES.join('\n'));
});
// Demo Command
program
    .command('demo')
    .description('Generate an instant showcase banner')
    .option('-c, --color <preset>', 'Color preset', 'neon')
    .action(async (options) => {
    try {
        const banner = await (0, textBanner_1.renderAsciiText)('ASCIIForge', 'Slant');
        const colored = (0, textBanner_1.applyColorPreset)(banner, options.color);
        console.log(colored);
        console.log('   Crafted with 💜 by abteilung83\n');
    }
    catch (err) {
        process.exitCode = 1;
        console.error(`[ASCIIForge] Error: ${err.message}`);
    }
});
program.parse(process.argv);
