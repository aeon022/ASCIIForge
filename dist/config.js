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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPLATE = exports.PROJECT_FILE = void 0;
exports.parseDefaults = parseDefaults;
exports.loadDefaults = loadDefaults;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const STRING_KEYS = ['font', 'color', 'language', 'align', 'border', 'layout'];
const NUMBER_KEYS = ['pad', 'width'];
exports.PROJECT_FILE = '.asciiglitchrc.json';
function parseDefaults(raw, file) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        throw new Error(`${file}: expected a JSON object`);
    const out = {};
    for (const k of STRING_KEYS) {
        if (raw[k] === undefined)
            continue;
        if (typeof raw[k] !== 'string')
            throw new Error(`${file}: "${k}" must be a string`);
        out[k] = raw[k];
    }
    for (const k of NUMBER_KEYS) {
        if (raw[k] === undefined)
            continue;
        if (typeof raw[k] !== 'number' || !Number.isFinite(raw[k]) || raw[k] < 0)
            throw new Error(`${file}: "${k}" must be a non-negative number`);
        out[k] = raw[k];
    }
    const known = new Set([...STRING_KEYS, ...NUMBER_KEYS]);
    const unknown = Object.keys(raw).filter((k) => !known.has(k));
    if (unknown.length)
        throw new Error(`${file}: unknown setting${unknown.length > 1 ? 's' : ''} ${unknown.map((k) => `"${k}"`).join(', ')} (allowed: ${[...known].join(', ')})`);
    return out;
}
function readFile(file) {
    let text;
    try {
        text = fs.readFileSync(file, 'utf8');
    }
    catch {
        return undefined;
    }
    try {
        return parseDefaults(JSON.parse(text), file);
    }
    catch (err) {
        if (err instanceof SyntaxError)
            throw new Error(`${file}: not valid JSON (${err.message})`);
        throw err;
    }
}
/** The user's defaults (~/.config/asciiglitch/defaults.json) overridden by the nearest project file walking up from `cwd`. */
function loadDefaults(cwd = process.cwd(), home = os.homedir()) {
    const user = readFile(path.join(home, '.config', 'asciiglitch', 'defaults.json')) || {};
    let dir = path.resolve(cwd);
    let project = {};
    for (;;) {
        const found = readFile(path.join(dir, exports.PROJECT_FILE));
        if (found) {
            project = found;
            break;
        }
        const parent = path.dirname(dir);
        if (parent === dir || dir === home)
            break;
        dir = parent;
    }
    return { ...user, ...project };
}
exports.TEMPLATE = { font: 'Slant', color: 'neon', language: 'typescript', align: 'left', border: 'none', pad: 1 };
