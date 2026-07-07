// Line-completeness check for the changes backfill (see tmp_backfill-plan.md):
// verifies that every line of a source upgrade page is present verbatim as a
// `//` comment in the version file. Comments may appear in any order and at any
// indentation; extra comments (rationale, REVIEW, FIXME) are ignored.
//
//     node tmp_check-source-comments.mjs <version-file.ts> <source-page.mdoc>
//
// Exits 1 listing any source lines missing from the version file.
import { readFileSync } from 'node:fs';

const [versionFile, sourceFile] = process.argv.slice(2);
if (!versionFile || !sourceFile) {
    console.error('usage: node tmp_check-source-comments.mjs <version-file.ts> <source-page.mdoc>');
    process.exit(2);
}

// Multiset of comment payloads in the version file: for `    // foo` the payload is `foo`.
const available = new Map();
for (const line of readFileSync(versionFile, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {
        const payload = trimmed.replace(/^\/\/ ?/, '').trimEnd();
        available.set(payload, (available.get(payload) ?? 0) + 1);
    }
}

const missing = [];
const sourceLines = readFileSync(sourceFile, 'utf8').split('\n');
if (sourceLines[sourceLines.length - 1] === '') {
    sourceLines.pop(); // trailing newline, not a line
}
for (let i = 0, len = sourceLines.length; i < len; ++i) {
    const payload = sourceLines[i].trimEnd();
    const count = available.get(payload) ?? 0;
    if (count > 0) {
        available.set(payload, count - 1);
    } else {
        missing.push(`${i + 1}: ${payload === '' ? '(blank line)' : payload}`);
    }
}

if (missing.length > 0) {
    console.error(`${missing.length} source line(s) missing from ${versionFile}:`);
    for (const line of missing) {
        console.error(`  ${line}`);
    }
    process.exit(1);
}
console.log(`OK: all ${sourceLines.length} source lines present as comments in ${versionFile}`);
