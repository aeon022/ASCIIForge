"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePosition = parsePosition;
exports.insertBlock = insertBlock;
const commentBox_1 = require("./commentBox");
function parsePosition(spec) {
    const s = spec.trim().toLowerCase();
    if (s === 'top' || s === 'bottom')
        return s;
    if (/^\d+$/.test(s) && Number(s) >= 1)
        return Number(s);
    throw new Error(`Invalid --at "${spec}": use top, bottom or a line number (1 or more)`);
}
/**
 * Puts a comment block into the text of a source file. With a tag the block is wrapped in two marker comments
 * (`asciiglitch:begin NAME` / `asciiglitch:end NAME`); running the command again replaces what is between the
 * markers instead of adding a second banner. Without a tag the block is simply inserted. At the top, a
 * shebang line stays first.
 */
function insertBlock(source, block, language, position = 'top', tag) {
    const nl = source.includes('\r\n') ? '\r\n' : '\n';
    const body = block.replace(/\n+$/, '').split('\n').join(nl);
    let text = body;
    if (tag) {
        if (!/^[A-Za-z0-9_.-]+$/.test(tag))
            throw new Error(`Invalid --tag "${tag}": use letters, digits, dot, dash or underscore`);
        const begin = (0, commentBox_1.lineComment)(language, `asciiglitch:begin ${tag}`);
        const end = (0, commentBox_1.lineComment)(language, `asciiglitch:end ${tag}`);
        text = [begin, body, end].join(nl);
        const lines = source.split(/\r?\n/);
        const from = lines.findIndex((l) => l.trim() === begin);
        const to = lines.findIndex((l, i) => i > from && l.trim() === end);
        if (from >= 0 && to > from) {
            const next = [...lines.slice(0, from), ...text.split(nl), ...lines.slice(to + 1)];
            return { content: next.join(nl), action: 'replaced' };
        }
    }
    const lines = source === '' ? [] : source.split(/\r?\n/);
    const hasFinalNewline = /\r?\n$/.test(source);
    if (hasFinalNewline)
        lines.pop();
    let index;
    if (position === 'top')
        index = lines.length && lines[0].startsWith('#!') ? 1 : 0;
    else if (position === 'bottom')
        index = lines.length;
    else
        index = Math.min(position - 1, lines.length);
    const inserted = text.split(nl);
    const next = [...lines.slice(0, index), ...inserted, ...lines.slice(index)];
    return { content: next.join(nl) + (hasFinalNewline || source === '' ? nl : ''), action: 'inserted' };
}
