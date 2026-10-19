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
const os = __importStar(require("os"));
const figlet_1 = __importDefault(require("figlet"));
const textBanner_1 = require("./textBanner");
const commentBox_1 = require("./commentBox");
const license_1 = require("./license");
const color_1 = require("./color");
const layout_1 = require("./layout");
const output_1 = require("./output");
const config_1 = require("./config");
const insert_1 = require("./insert");
const glitch_1 = require("./glitch");
const wizard_1 = require("./wizard");
const snippet_1 = require("./snippet");
const BUY_URL = 'https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS';
(0, color_1.configureColorSupport)();
const program = new commander_1.Command();
program
    .name('asciiphreak')
    .description('ASCII art banners for terminals, READMEs and source files: colours and gradients, borders, comment blocks in 25+ languages')
    .version('0.2.1');
const fail = (err, what = 'Error') => {
    process.exitCode = 1;
    console.error(`[asciiphreak] ${what}: ${err.message || err}`);
};
const num = (v, name, min, max) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < min || n > max)
        throw new Error(`--${name} must be a number between ${min} and ${max}`);
    return n;
};
async function licensed(options) {
    const check = await (0, license_1.validatePolarLicense)(options.license);
    console.error(`[asciiphreak] License Status: ${check.message}`);
    return check.valid;
}
const promo = (valid) => {
    if (!valid)
        console.error(`\n💡 Support development and remove the comment watermark: ${BUY_URL}`);
};
async function readStdin() {
    let data = '';
    for await (const chunk of process.stdin)
        data += chunk;
    return data.replace(/\r?\n$/, '');
}
/** The text of a banner: the argument, or piped input when there is none. */
async function textOf(arg) {
    if (arg !== undefined)
        return arg;
    if (process.stdin.isTTY)
        throw new Error('Give the text as an argument, or pipe it in: echo "Hello" | asciiphreak text');
    const piped = await readStdin();
    if (piped.trim() === '')
        throw new Error('No text: the argument is missing and nothing was piped in.');
    return piped;
}
function bannerOptions(cmd) {
    return cmd
        .option('-f, --font <name>', 'FIGlet font (or "random"); see `asciiphreak fonts`')
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
            await (0, license_1.clearSavedLicense)();
            console.log('[asciiphreak] Saved license key cleared. Switched to Free Tier.');
            return;
        }
        if (key) {
            console.log('[asciiphreak] Validating license key...');
            const result = await (0, license_1.saveLicenseKey)(key);
            if (result.valid) {
                console.log(`\n✨ ${result.message}`);
                console.log('   License successfully activated and saved locally!\n');
            }
            else {
                process.exitCode = 1;
                console.error(`\n❌ ${result.message}`);
                console.error(`   Please verify your key at ${BUY_URL}\n`);
            }
            return;
        }
        const activeKey = await (0, license_1.getSavedLicenseKey)();
        const result = await (0, license_1.validatePolarLicense)(activeKey);
        console.log('\n[asciiphreak] License Status:');
        console.log(`  State : ${result.valid ? 'PRO ACTIVE ✓' : 'FREE TIER'}`);
        console.log(`  Key   : ${activeKey ? (0, license_1.maskKey)(activeKey) : 'None'}`);
        console.log(`  Info  : ${result.message}`);
        if (!result.valid)
            console.log(`\n💡 Buy Pro License: ${BUY_URL}\n`);
    }
    catch (err) {
        fail(err, 'License error');
    }
});
// ── text ──────────────────────────────────────────────────────────────────────
bannerOptions(program.command('text [text]').description('Draw a text banner (the text can also be piped in)'))
    .option('-c, --color <spec>', `Colour: ${Object.keys(color_1.COLOR_PRESETS).join(', ')}, a hex colour (#ff0080) or a gradient ("#ff0080,#00f0ff")`)
    .option('--direction <dir>', `Gradient direction: ${GRADIENT_DIRECTIONS.join(', ')}`, 'horizontal')
    .option('--align <side>', 'left, center or right (within --width, or the terminal width)')
    .option('--border <style>', 'Box around the banner: none, single, double, round, bold, ascii')
    .option('--pad <n>', 'Blanks between the border and the letters')
    .option('--glitch <0-1>', 'Corrupt the banner: shifted rows and broken characters (0.3 is a good start)')
    .option('--seed <n>', 'With --glitch: the same seed gives the same glitch')
    .option('-o, --output <path>', 'Also save to a file: .svg and .html keep the colours, .md wraps it in a code block, anything else is plain text')
    .option('--copy', 'Copy the banner (without colours) to the clipboard')
    .option('-l, --license <key>', 'Polar.sh Pro License Key')
    .action(async (arg, options) => {
    try {
        await licensed(options);
        const d = (0, config_1.loadDefaults)();
        const text = await textOf(arg);
        const dir = String(options.direction);
        if (!GRADIENT_DIRECTIONS.includes(dir))
            throw new Error(`--direction must be one of ${GRADIENT_DIRECTIONS.join(', ')}`);
        const spec = (0, color_1.parseColor)(options.color ?? d.color ?? 'neon', dir);
        const align = (0, layout_1.parseAlign)(options.align ?? d.align ?? 'left');
        const border = (0, layout_1.parseBorder)(options.border ?? d.border ?? 'none');
        const pad = num(options.pad ?? d.pad ?? 1, 'pad', 0, 20);
        const widthOpt = options.width ?? d.width;
        const width = widthOpt === undefined ? undefined : num(widthOpt, 'width', 10, 500);
        const raw = await (0, textBanner_1.renderAsciiText)(text, options.font ?? d.font ?? 'Slant', {
            layout: (0, textBanner_1.parseLayout)(options.layout ?? d.layout ?? 'default'),
            width: border === 'none' ? width : width === undefined ? undefined : Math.max(10, width - pad * 2 - 2)
        });
        let art = (0, layout_1.trimRight)(raw.split('\n')).filter((l, i, a) => !(i === a.length - 1 && l === ''));
        if (options.glitch !== undefined)
            art = (0, glitch_1.glitch)(art, (0, glitch_1.parseIntensity)(options.glitch), options.seed === undefined ? undefined : num(options.seed, 'seed', 0, 4294967295));
        let lines = (0, layout_1.addBorder)(art, border, pad);
        if (align !== 'left')
            lines = (0, layout_1.alignBlock)(lines, align, width ?? process.stdout.columns ?? 80);
        console.log((0, color_1.colorizeAnsi)(lines, spec));
        if (options.output)
            console.error(`✨ Saved banner to: ${await (0, output_1.writeBanner)(options.output, lines, spec)}`);
        if (options.copy)
            console.error(`📋 Copied to the clipboard (${await (0, output_1.copyToClipboard)(lines.join('\n') + '\n')})`);
    }
    catch (err) {
        fail(err);
    }
});
// ── comment ───────────────────────────────────────────────────────────────────
bannerOptions(program.command('comment <text>').description('Write a banner as a code comment block, or put it into a file'))
    .option('-L, --language <lang>', 'Comment syntax (see `asciiphreak languages`); with --insert it follows the file extension')
    .option('-o, --output <path>', 'Save the comment block to a file')
    .option('--insert <file>', 'Insert the block into this source file')
    .option('--at <where>', 'With --insert: top (default, after a #! line), bottom, or a line number')
    .option('--tag <name>', 'With --insert: mark the block so running the command again replaces it instead of adding another')
    .option('--copy', 'Copy the block to the clipboard')
    .option('-l, --license <key>', 'Polar.sh Pro License Key')
    .action(async (text, options) => {
    try {
        const valid = await licensed(options);
        const d = (0, config_1.loadDefaults)();
        if (options.insert && options.output)
            throw new Error('Use either --insert or --output, not both.');
        const language = options.language ?? (options.insert ? (0, commentBox_1.languageForFile)(options.insert) : undefined) ?? d.language ?? 'typescript';
        const widthOpt = options.width ?? d.width;
        const raw = await (0, textBanner_1.renderAsciiText)(text, options.font ?? d.font ?? 'Slant', {
            layout: (0, textBanner_1.parseLayout)(options.layout ?? d.layout ?? 'default'),
            width: widthOpt === undefined ? undefined : num(widthOpt, 'width', 10, 500)
        });
        const block = (0, commentBox_1.wrapInCodeComment)(raw, language, !valid);
        if (options.insert) {
            const file = path.resolve(options.insert);
            const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
            const position = (0, insert_1.parsePosition)(options.at ?? 'top');
            const result = (0, insert_1.insertBlock)(existing, block, language, position, options.tag);
            fs.writeFileSync(file, result.content, 'utf8');
            console.error(`✨ ${result.action === 'replaced' ? 'Replaced the tagged block in' : 'Inserted the block into'}: ${file}`);
        }
        else {
            console.log(block);
            if (options.output) {
                const out = path.resolve(options.output);
                await fs.ensureDir(path.dirname(out));
                await fs.writeFile(out, block, 'utf8');
                console.error(`✨ Saved comment block to: ${out}`);
            }
        }
        if (options.copy)
            console.error(`📋 Copied to the clipboard (${await (0, output_1.copyToClipboard)(block)})`);
        promo(valid);
    }
    catch (err) {
        fail(err);
    }
});
// ── snippet ───────────────────────────────────────────────────────────────────
bannerOptions(program.command('snippet <text>').description(`Code that prints the banner when your app starts (${snippet_1.SNIPPET_LANGUAGES.join(', ')})`))
    .option('-L, --language <lang>', 'Language of the snippet', 'js')
    .action(async (text, options) => {
    try {
        const d = (0, config_1.loadDefaults)();
        const language = (0, snippet_1.parseSnippetLanguage)(options.language);
        const raw = await (0, textBanner_1.renderAsciiText)(text, options.font ?? d.font ?? 'Slant', { layout: (0, textBanner_1.parseLayout)(options.layout ?? d.layout ?? 'default'), width: options.width ? num(options.width, 'width', 10, 500) : d.width });
        console.log((0, snippet_1.makeSnippet)(raw, language).replace(/\n$/, ''));
    }
    catch (err) {
        fail(err);
    }
});
// ── motd ──────────────────────────────────────────────────────────────────────
bannerOptions(program.command('motd <text>').description('A login banner: the banner plus a line with host, system and uptime'))
    .option('-c, --color <spec>', 'Colour (see `text --help`)')
    .option('--no-info', 'Only the banner')
    .action(async (text, options) => {
    try {
        const d = (0, config_1.loadDefaults)();
        const spec = (0, color_1.parseColor)(options.color ?? d.color ?? 'neon');
        const raw = await (0, textBanner_1.renderAsciiText)(text, options.font ?? d.font ?? 'Slant', { layout: (0, textBanner_1.parseLayout)(options.layout ?? d.layout ?? 'default'), width: options.width ? num(options.width, 'width', 10, 500) : d.width });
        console.log((0, color_1.colorizeAnsi)((0, layout_1.trimRight)(raw.split('\n')), spec));
        if (options.info !== false) {
            const up = os.uptime();
            const days = Math.floor(up / 86400);
            const hours = Math.floor((up % 86400) / 3600);
            console.log(`\n  ${os.hostname()} · ${os.type()} ${os.release()} · up ${days ? `${days}d ` : ''}${hours}h\n`);
        }
    }
    catch (err) {
        fail(err);
    }
});
// ── fonts / languages / init ──────────────────────────────────────────────────
program
    .command('fonts [filter]')
    .description('List the available FIGlet fonts (optionally only those containing a word)')
    .option('--preview [text]', 'Draw each font with this text (default: the font name)')
    .option('--limit <n>', 'With --preview: at most this many fonts', '12')
    .action(async (filter, options) => {
    try {
        const all = figlet_1.default.fontsSync().sort((a, b) => a.localeCompare(b));
        const fonts = filter ? all.filter((f) => f.toLowerCase().includes(filter.toLowerCase())) : all;
        if (options.preview !== undefined) {
            const limit = num(options.limit, 'limit', 1, 500);
            const shown = fonts.slice(0, limit);
            for (const font of shown) {
                const sample = typeof options.preview === 'string' ? options.preview : font;
                console.log(`\n── ${font}\n`);
                console.log((0, layout_1.trimRight)((await (0, textBanner_1.renderAsciiText)(sample, font)).split('\n')).join('\n'));
            }
            console.log(`\n${shown.length} of ${fonts.length} fonts shown${fonts.length > shown.length ? ' (raise --limit or add a filter)' : ''}.\n`);
            return;
        }
        console.log(`\n🎨 asciiphreak Fonts (${fonts.length}${filter ? ` matching "${filter}" of ${all.length}` : ' available'}):\n`);
        fonts.forEach((font) => console.log(`  - ${font}`));
        console.log('\nUse any of these with: asciiphreak text "Hello" -f "<font name>"  (or -f random)\n');
    }
    catch (err) {
        fail(err);
    }
});
program
    .command('languages')
    .description('List the comment languages `asciiphreak comment` can write')
    .action(() => {
    console.log(commentBox_1.SUPPORTED_LANGUAGES.join('\n'));
});
program
    .command('init')
    .description(`Write a ${config_1.PROJECT_FILE} with default font, colour, language … for this project`)
    .option('--force', 'Overwrite an existing file')
    .action((options) => {
    try {
        const file = path.resolve(config_1.PROJECT_FILE);
        if (fs.existsSync(file) && !options.force)
            throw new Error(`${config_1.PROJECT_FILE} already exists (use --force to overwrite it)`);
        fs.writeFileSync(file, JSON.stringify(config_1.TEMPLATE, null, 2) + '\n', 'utf8');
        console.log(`Created ${file}`);
    }
    catch (err) {
        fail(err);
    }
});
program
    .command('demo')
    .description('Show a banner with a gradient')
    .option('-c, --color <spec>', 'Colour', 'rainbow')
    .action(async (options) => {
    try {
        const raw = await (0, textBanner_1.renderAsciiText)('asciiphreak', 'Slant');
        console.log((0, color_1.colorizeAnsi)((0, layout_1.trimRight)(raw.split('\n')), (0, color_1.parseColor)(options.color)));
        console.log('   Crafted with 💜 by abteilung83\n');
    }
    catch (err) {
        fail(err);
    }
});
program
    .command('wizard')
    .description('Step-by-step assistant: answers a few questions, shows the command and runs it')
    .action(() => (0, wizard_1.wizard)().catch((err) => fail(err)));
program.parse(process.argv);
