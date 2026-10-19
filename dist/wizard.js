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
exports.wizard = wizard;
const readline = __importStar(require("readline"));
const child_process_1 = require("child_process");
const de = /^de/i.test(process.env.LC_ALL || process.env.LANG || '');
const t = (en, d) => (de ? d : en);
const q = (s) => `'${s.replace(/'/g, `'\\''`)}'`;
const COLORS = ['neon', 'fire', 'rainbow', 'cyan', 'magenta', 'green', 'yellow', 'red', 'plain'];
const BORDERS = ['none', 'single', 'double', 'round', 'bold'];
const LANGS = ['js', 'ts', 'python', 'go', 'rust', 'shell'];
/** Step-by-step helper for beginners: asks, shows the exact command, runs it. */
async function wizard() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    const lines = rl[Symbol.asyncIterator]();
    const ask = async (question, def = '') => {
        process.stderr.write(`${question}${def ? ` [${def}]` : ''} › `);
        const { value, done } = await lines.next();
        if (done)
            throw new Error('end');
        return String(value).trim() || def;
    };
    const pick = async (question, options, def = 1) => {
        console.error(`\n${question}`);
        options.forEach((o, i) => console.error(`  ${i + 1}) ${o}`));
        for (;;) {
            const a = await ask(t('Number or name', 'Nummer oder Name'), String(def));
            const hit = options[Number(a) - 1] !== undefined ? Number(a) - 1 : options.indexOf(a);
            if (hit >= 0)
                return hit;
            console.error(t('  Please type one of the numbers above.', '  Bitte eine der Nummern oben eingeben.'));
        }
    };
    const run = (args) => {
        console.error(t('\nThe same thing as a command (copy it for next time):\n', '\nDasselbe als Befehl (zum Merken/Kopieren):\n'));
        console.error(`  asciiphreak ${args.map((a) => (/^[\w.,#:/-]+$/.test(a) ? a : q(a))).join(' ')}\n`);
        (0, child_process_1.spawnSync)(process.execPath, [process.argv[1], ...args], { stdio: 'inherit' });
    };
    console.error(t('\n🎨 asciiphreak assistant — I ask, you answer. Press Enter to accept [the default]. Ctrl+C quits.', '\n🎨 asciiphreak-Assistent — ich frage, du antwortest. Enter nimmt den [Vorschlag]. Strg+C beendet.'));
    try {
        for (;;) {
            const n = 'bcsmfq'[await pick(t('What do you want to make?', 'Was möchtest du machen?'), [
                t('A banner for the terminal', 'Ein Banner fürs Terminal'),
                t('A comment block for source code', 'Einen Kommentar-Block für Quellcode'),
                t('Code that prints a banner when my app starts', 'Code, der beim App-Start ein Banner ausgibt'),
                t('A login banner (MOTD)', 'Ein Login-Banner (MOTD)'),
                t('Look at fonts', 'Schriften ansehen'),
                t('Quit', 'Beenden'),
            ])];
            if (n === 'q')
                return;
            if (n === 'f') {
                const word = await ask(t('Only fonts containing (Enter = all)', 'Nur Schriften mit (Enter = alle)'));
                run(['fonts', ...(word ? [word] : []), '--preview', '--limit', '8']);
                continue;
            }
            const text = await ask(t('Which text?', 'Welcher Text?'), 'Hello');
            const args = [{ b: 'text', c: 'comment', s: 'snippet', m: 'motd' }[n], text];
            if (text.length > 12)
                console.error(t('  Note: big letters are wide, so a long text gets wrapped into several lines. Short words look best.', '  Hinweis: Große Buchstaben sind breit, ein langer Text wird deshalb auf mehrere Zeilen umbrochen. Kurze Wörter sehen am besten aus.'));
            const font = await ask(t('Font (Enter = default, "random" = surprise me)', 'Schrift (Enter = Standard, "random" = Überraschung)'), 'Slant');
            args.push('-f', font, '--width', String(Math.max(20, Math.min(100, (process.stdout.columns || 80) - 6))));
            if (n === 'b' || n === 'm')
                args.push('-c', COLORS[await pick(t('Colour?', 'Farbe?'), COLORS)]);
            if (n === 'b') {
                const border = BORDERS[await pick(t('Border?', 'Rahmen?'), BORDERS)];
                if (border !== 'none')
                    args.push('--border', border);
                const g = await ask(t('Glitch effect 0-1 (Enter = none, 0.3 is nice)', 'Glitch-Effekt 0-1 (Enter = keiner, 0.3 sieht gut aus)'));
                if (g)
                    args.push('--glitch', g);
                const out = await ask(t('Save to a file? Name like banner.svg / banner.txt / banner.md (Enter = no)', 'In Datei speichern? Name wie banner.svg / banner.txt / banner.md (Enter = nein)'));
                if (out)
                    args.push('-o', out);
            }
            if (n === 'c' || n === 's') {
                const langs = n === 's' ? LANGS : [...LANGS, 'html', 'css', 'c'];
                args.push('-L', langs[await pick(t('Language?', 'Sprache?'), langs)]);
            }
            run(args);
            const again = await ask(t('Make another one? (y/n)', 'Noch eins? (j/n)'), 'y');
            if (!/^[yj]/i.test(again))
                return void console.error(t('Bye! Run `asciiphreak wizard` any time.', 'Tschüss! `asciiphreak wizard` startet den Assistenten jederzeit wieder.'));
        }
    }
    catch (e) {
        if (e.message !== 'end')
            throw e;
    }
    finally {
        rl.close();
    }
}
