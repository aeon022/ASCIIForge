"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLOR_PRESETS = exports.RAINBOW = void 0;
exports.normalizeHex = normalizeHex;
exports.blend = blend;
exports.parseColor = parseColor;
exports.configureColorSupport = configureColorSupport;
exports.colorizeAnsi = colorizeAnsi;
const chalk_1 = __importDefault(require("chalk"));
const PRESET_HEX = { cyan: '#00cdcd', magenta: '#cd00cd', green: '#00cd00', yellow: '#cdcd00', red: '#cd0000' };
const solid = (hex) => ({ at: () => hex });
exports.RAINBOW = ['#ff0000', '#ff8800', '#ffee00', '#22cc22', '#00ccff', '#3355ff', '#aa44ff'];
exports.COLOR_PRESETS = {
    plain: { at: () => undefined },
    cyan: { at: () => PRESET_HEX.cyan, ansiLine: (l) => chalk_1.default.cyan(l) },
    magenta: { at: () => PRESET_HEX.magenta, ansiLine: (l) => chalk_1.default.magenta(l) },
    green: { at: () => PRESET_HEX.green, ansiLine: (l) => chalk_1.default.green(l) },
    yellow: { at: () => PRESET_HEX.yellow, ansiLine: (l) => chalk_1.default.yellow(l) },
    red: { at: () => PRESET_HEX.red, ansiLine: (l) => chalk_1.default.red(l) },
    neon: { at: (_x, y) => (y % 2 === 0 ? PRESET_HEX.cyan : PRESET_HEX.magenta), ansiLine: (l, y) => (y % 2 === 0 ? chalk_1.default.cyan.bold(l) : chalk_1.default.magenta.bold(l)), bold: true },
    fire: { at: (_x, y) => (y % 2 === 0 ? PRESET_HEX.red : PRESET_HEX.yellow), ansiLine: (l, y) => (y % 2 === 0 ? chalk_1.default.red.bold(l) : chalk_1.default.yellow.bold(l)), bold: true },
    rainbow: gradientSpec(exports.RAINBOW)
};
const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
function normalizeHex(value) {
    const m = HEX.exec(value.trim());
    if (!m)
        throw new Error(`"${value}" is not a hex colour (use #rgb or #rrggbb)`);
    let h = m[1].toLowerCase();
    if (h.length === 3)
        h = Array.from(h).map((c) => c + c).join('');
    return `#${h}`;
}
const rgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const toHex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
/** Linear blend across the stops, `t` from 0 to 1. */
function blend(stops, t) {
    if (stops.length === 1)
        return stops[0];
    const pos = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
    const i = Math.min(Math.floor(pos), stops.length - 2);
    const f = pos - i;
    const a = rgb(stops[i]);
    const b = rgb(stops[i + 1]);
    return toHex([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]);
}
function gradientSpec(stops, direction = 'horizontal') {
    return {
        at(x, y, w, h) {
            const tx = w > 1 ? x / (w - 1) : 0;
            const ty = h > 1 ? y / (h - 1) : 0;
            const t = direction === 'horizontal' ? tx : direction === 'vertical' ? ty : (tx + ty) / 2;
            return blend(stops, t);
        }
    };
}
/**
 * "neon", "rainbow", "#ff0080" (solid) or "#ff0080,#00f0ff[,#…]" (gradient, left to right unless a
 * direction is given). Errors name what is wrong and list the presets.
 */
function parseColor(spec, direction = 'horizontal') {
    const s = spec.trim();
    const preset = exports.COLOR_PRESETS[s.toLowerCase()];
    if (preset)
        return direction !== 'horizontal' && s.toLowerCase() === 'rainbow' ? gradientSpec(exports.RAINBOW, direction) : preset;
    if (s.includes('#') || s.includes(',')) {
        const stops = s.split(',').map((p) => normalizeHex(p));
        if (stops.length === 1)
            return solid(stops[0]);
        return gradientSpec(stops, direction);
    }
    throw new Error(`Unknown colour "${spec}". Use a preset (${Object.keys(exports.COLOR_PRESETS).join(', ')}), a hex colour like #ff0080, or a gradient like "#ff0080,#00f0ff".`);
}
/** Honour NO_COLOR (https://no-color.org) unless colour is forced. */
function configureColorSupport(env = process.env) {
    if (env.NO_COLOR !== undefined && env.NO_COLOR !== '' && !env.FORCE_COLOR)
        chalk_1.default.level = 0;
}
/** Applies the spec to the lines with ANSI escapes (terminal output). */
function colorizeAnsi(lines, spec) {
    const h = lines.length;
    const w = Math.max(0, ...lines.map((l) => l.length));
    return lines.map((line, y) => {
        if (spec.ansiLine)
            return spec.ansiLine(line, y);
        let out = '';
        for (let x = 0; x < line.length; x++) {
            const ch = line[x];
            const hex = ch === ' ' ? undefined : spec.at(x, y, w, h);
            out += hex ? chalk_1.default.hex(hex)(ch) : ch;
        }
        return out;
    }).join('\n');
}
