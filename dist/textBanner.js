"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestFont = suggestFont;
exports.parseLayout = parseLayout;
exports.renderAsciiText = renderAsciiText;
exports.applyColorPreset = applyColorPreset;
const figlet_1 = __importDefault(require("figlet"));
const chalk_1 = __importDefault(require("chalk"));
/** The installed font whose name is closest to `name` (case-insensitive edit distance), if one is close enough. */
function suggestFont(name) {
    const target = name.toLowerCase();
    let best;
    let bestDist = Infinity;
    for (const f of figlet_1.default.fontsSync()) {
        const d = editDistance(target, f.toLowerCase());
        if (d < bestDist) {
            bestDist = d;
            best = f;
        }
    }
    return bestDist <= Math.max(2, Math.floor(target.length / 3)) ? best : undefined;
}
function editDistance(a, b) {
    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        let diag = prev[0];
        prev[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const tmp = prev[j];
            prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
            diag = tmp;
        }
    }
    return prev[b.length];
}
const LAYOUTS = {
    default: 'default',
    full: 'full',
    fitted: 'fitted',
    smush: 'controlled smushing'
};
function parseLayout(name) {
    const n = name.trim().toLowerCase();
    if (n in LAYOUTS)
        return n;
    throw new Error(`Unknown layout "${name}". Use default, full, fitted or smush.`);
}
/**
 * Renders text with a FIGlet font. An unknown font is an error that names the closest installed font;
 * silently drawing something else hid typos (`-f Slnt` produced a different font without a word).
 * The font name `random` picks one of the installed fonts.
 */
function renderAsciiText(text, fontName = 'Slant', options = {}) {
    return new Promise((resolve, reject) => {
        const installed = figlet_1.default.fontsSync();
        const exact = fontName.toLowerCase() === 'random'
            ? installed[Math.floor(Math.random() * installed.length)]
            : installed.find((f) => f.toLowerCase() === fontName.toLowerCase());
        if (!exact) {
            const hint = suggestFont(fontName);
            return reject(new Error(`Unknown font "${fontName}".${hint ? ` Did you mean "${hint}"?` : ''} List all fonts with: asciiphreak fonts`));
        }
        const opts = { font: exact };
        if (options.layout && options.layout !== 'default')
            opts.horizontalLayout = LAYOUTS[options.layout];
        if (options.width) {
            opts.width = options.width;
            opts.whitespaceBreak = true;
        }
        figlet_1.default.text(text, opts, (err, result) => {
            if (err || !result)
                return reject(err || new Error('FIGlet rendering failed'));
            resolve(result);
        });
    });
}
function applyColorPreset(asciiArt, color = 'cyan') {
    if (color === 'plain')
        return asciiArt;
    const lines = asciiArt.split('\n');
    return lines.map((line, idx) => {
        if (color === 'cyan')
            return chalk_1.default.cyan(line);
        if (color === 'magenta')
            return chalk_1.default.magenta(line);
        if (color === 'green')
            return chalk_1.default.green(line);
        if (color === 'yellow')
            return chalk_1.default.yellow(line);
        if (color === 'red')
            return chalk_1.default.red(line);
        if (color === 'neon') {
            return idx % 2 === 0 ? chalk_1.default.cyan.bold(line) : chalk_1.default.magenta.bold(line);
        }
        if (color === 'fire') {
            return idx % 2 === 0 ? chalk_1.default.red.bold(line) : chalk_1.default.yellow.bold(line);
        }
        return chalk_1.default.cyan(line);
    }).join('\n');
}
