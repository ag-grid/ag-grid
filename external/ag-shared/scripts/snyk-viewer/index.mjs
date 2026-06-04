#!/usr/bin/env node
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, readdirSync, renameSync, existsSync, statSync } from 'fs';
import { resolve, dirname, sep } from 'path';
import { fileURLToPath } from 'url';
import jsYaml from 'js-yaml';
import { exec, spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Directory names to skip when recursively searching for .snyk files. */
const IGNORED_DIRS = new Set(['node_modules', '.git', '.claude']);

function parseArgs(args) {
    const result = { port: 3456, file: null, open: false, name: null };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--port' && args[i + 1]) {
            result.port = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === '--name' && args[i + 1]) {
            result.name = args[i + 1];
            i++;
        } else if (args[i] === '--open') {
            result.open = true;
        } else if (!args[i].startsWith('--')) {
            result.file = args[i];
        }
    }
    return result;
}

function openBrowser(url) {
    const cmd =
        process.platform === 'darwin' ? `open "${url}"` : process.platform === 'win32' ? `start "${url}"` : `xdg-open "${url}"`;
    exec(cmd, (err) => {
        if (err) console.error('Could not open browser automatically. Visit:', url);
    });
}

function normaliseSnykData(raw) {
    // Snyk outputs either a single project object or an array of project objects
    const projects = Array.isArray(raw) ? raw : [raw];
    return projects;
}

// Recursively find all .snyk files under dir, skipping node_modules and .git.
function getSnykFiles(dir, found = []) {
    let entries;
    try {
        entries = readdirSync(dir, { withFileTypes: true });
    } catch {
        return found;
    }
    for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        const full = resolve(dir, entry.name);
        if (entry.isDirectory()) {
            getSnykFiles(full, found);
        } else if (entry.name === '.snyk') {
            found.push(full);
        }
    }
    return found;
}

// Parse ignore paths from a single .snyk YAML file (regex-based, zero dependencies).
// Returns: { [vulnId]: Array<{ path: string, reason: string }> }
// Handles both quoted and unquoted paths, and inline or block-scalar (>-) reasons.
function parseSnykIgnorePaths(content) {
    const result = {};
    let currentId = null;
    let currentPath = null;
    let blockReasonLines = null; // non-null while collecting a >- block scalar
    let blockReasonIndent = 0;

    for (const line of content.split('\n')) {
        // Collecting block scalar reason lines
        if (blockReasonLines !== null) {
            const trimmed = line.trim();
            if (!trimmed) continue; // blank lines within block
            const indent = line.match(/^( *)/)[1].length;
            if (indent > blockReasonIndent) {
                blockReasonLines.push(trimmed);
                continue;
            }
            // Indentation dropped — end of block
            if (currentPath) currentPath.reason = blockReasonLines.join(' ');
            blockReasonLines = null;
            // Fall through to process this line normally
        }

        // Vuln ID lines: "  SNYK-JS-FOO-123:" or "  CVE-2021-1234:"
        const idMatch = line.match(/^\s{2,6}(SNYK-\S+|CVE-\d+-\d+|GHSA-\S+):\s*$/);
        if (idMatch) {
            currentId = idMatch[1];
            currentPath = null;
            result[currentId] = result[currentId] || [];
        } else if (currentId) {
            // Path lines: quoted "    - '@pkg@ver > @pkg@ver':" or unquoted "    - pkg@ver > pkg@ver:"
            const pathMatch = line.match(/^\s+- (?:'(.+?)'|"(.+?)"|([\w@][^:]*?)):\s*$/);
            if (pathMatch) {
                currentPath = { path: (pathMatch[1] ?? pathMatch[2] ?? pathMatch[3]).trim(), reason: '' };
                result[currentId].push(currentPath);
            } else if (currentPath) {
                // Inline reason: "    reason: some text"
                const reasonInline = line.match(/^(\s+)reason:\s+([^>|].+)$/);
                // Block scalar reason: "    reason: >-"
                const reasonBlock = line.match(/^(\s+)reason:\s*[>|][+-]?\s*$/);
                if (reasonInline) {
                    currentPath.reason = reasonInline[2].trim().replace(/^['"]|['"]$/g, '');
                } else if (reasonBlock) {
                    blockReasonIndent = reasonBlock[1].length;
                    blockReasonLines = [];
                }
            }
        }
    }

    // Flush any pending block scalar at end of file
    if (blockReasonLines?.length && currentPath) {
        currentPath.reason = blockReasonLines.join(' ');
    }

    return result;
}

// Replaces a single path entry for vulnId in a .snyk file's content string.
// Returns { content, changed } — content is the (potentially updated) file text.
function updateSnykFilePath(content, vulnId, oldPath, newPath) {
    const lines = content.split('\n');
    let inVuln = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const idMatch = line.match(/^\s{2,6}(SNYK-\S+|CVE-\d+-\d+|GHSA-\S+):\s*$/);
        if (idMatch) { inVuln = idMatch[1] === vulnId; continue; }
        if (!inVuln) continue;
        const m = line.match(/^(\s+- )(?:'(.+?)'|"(.+?)"|([\w@][^:]*?)):(.*)/);
        if (!m) continue;
        const found = (m[2] ?? m[3] ?? m[4])?.trim();
        if (found !== oldPath) continue;
        lines[i] = `${m[1]}'${newPath}':${m[5]}`;
        return { content: lines.join('\n'), changed: true };
    }
    return { content, changed: false };
}

// Parse all .snyk files found under rootDir.
// Returns byFile: { [relFilePath]: { [vulnId]: Array<{path,reason}> } } so the client
// can match each project only against the .snyk file in its own directory.
function loadAllSnykIgnorePatterns(rootDir) {
    const files = getSnykFiles(rootDir);
    const byFile = {};
    for (const file of files) {
        try {
            const patterns = parseSnykIgnorePaths(readFileSync(file, 'utf8'));
            const relPath = file.slice(rootDir.length + 1).replace(/\\/g, '/');
            byFile[relPath] = patterns;
        } catch {
            // Skip unreadable files
        }
    }
    return { files, byFile };
}

// ── Review state helpers ──
const reviewStatePath = () => resolve(process.cwd(), 'tmp', 'snyk-review-state.json');

function readReviewState() {
    try { return JSON.parse(readFileSync(reviewStatePath(), 'utf8')); }
    catch { return { decisions: {} }; }
}

function writeReviewState(state) {
    mkdirSync(resolve(process.cwd(), 'tmp'), { recursive: true });
    writeFileSync(reviewStatePath(), JSON.stringify(state, null, 2), 'utf8');
}

// Returns the first `expires:` value found in any .snyk file.
function findSharedExpiry(rootDir) {
    const files = getSnykFiles(rootDir);
    for (const file of files) {
        try {
            const m = readFileSync(file, 'utf8').match(/^\s*expires:\s*(\S+)/m);
            if (m) return m[1];
        } catch { /* skip */ }
    }
    return null;
}

// Adds or updates an ignore entry in a .snyk file.
// If an entry for the same (vulnId, depPath) already exists it is replaced in-place.
// Uses js-yaml to correctly quote the dep path key, and matches the snyk CLI's
// indentation style: 4-space vuln IDs, 8-space path entries, 14-space properties.
function addSnykIgnoreEntry(snykFile, vulnId, depPath, reason, expires) {
    const rootDir = process.cwd();
    const absPath = resolve(rootDir, snykFile);
    const rootPrefix = rootDir + sep;
    if ((!absPath.startsWith(rootPrefix) && absPath !== resolve(rootDir, '.snyk')) || !snykFile.endsWith('.snyk')) {
        throw new Error('Invalid .snyk file path');
    }
    const created = new Date().toISOString();
    let content;
    if (existsSync(absPath)) {
        content = readFileSync(absPath, 'utf8');
    } else {
        content = '# Snyk (https://snyk.io) policy file, patches or ignores known vulnerabilities.\nversion: v1.25.1\n\nignore:\npatch: {}\n';
    }

    // Snyk CLI / snykClean.mjs writes `ignore: {}` when the section is empty.
    // YAML rejects mixing the inline empty mapping with block-style children,
    // so collapse it to `ignore:` before inserting any vuln block beneath it.
    content = content.replace(/^ignore:[ \t]*\{[ \t]*\}[ \t]*$/m, 'ignore:');

    // Detect the file's existing indentation so we match it exactly. Different repos
    // write .snyk files at different indentation depths (e.g. ag-grid uses 2/4/8 for
    // vuln-id/list-item/property, others use 4/8/14). Mixing depths within one file
    // produces invalid YAML, so derive the widths from any existing entry and fall back
    // to the 4/8/14 style for an empty file (matching the historical default here).
    const idIndentMatch = content.match(/^( +)(?:SNYK-\S+|CVE-\d+-\d+|GHSA-\S+):\s*$/m);
    const dashIndentMatch = content.match(/^( +)- /m);
    const propIndentMatch = content.match(/^( +)(?:reason|expires|created):/m);
    const idIndent = idIndentMatch ? idIndentMatch[1].length : 4;
    const dashIndent = dashIndentMatch ? dashIndentMatch[1].length : 8;
    const propIndent = propIndentMatch ? propIndentMatch[1].length : 14;
    const idPad = ' '.repeat(idIndent);
    const dashPad = ' '.repeat(dashIndent);
    const propPad = ' '.repeat(propIndent);
    const reasonTextPad = ' '.repeat(propIndent + 4);

    // Use js-yaml to get a correctly-quoted key for the dep path.
    // Dump as a single-key mapping, strip the ": null" value, then append ":".
    // e.g. "@nx/foo@1 > bar@2"  →  "'@nx/foo@1 > bar@2':"
    //      "vitest@2 > vite@3"  →  "vitest@2 > vite@3:"
    const quotedKey = jsYaml.dump({ [depPath]: null }, { lineWidth: -1 })
        .trim()
        .replace(/:\s*null\s*$/, '') + ':';

    // Indent reason block-scalar content one level deeper than the properties.
    const reasonText = reason.split('\n').map(l => reasonTextPad + l).join('\n');

    // Build path entry matching the file's detected indentation.
    const pathEntry = `${dashPad}- ${quotedKey}\n` +
                      `${propPad}reason: >-\n` +
                      `${reasonText}\n` +
                      `${propPad}expires: ${expires}\n` +
                      `${propPad}created: ${created}\n`;

    // Returns the index just after the newline that terminates a matched line
    function afterLine(matchIndex, matchLength) {
        const end = matchIndex + matchLength;
        return content[end] === '\n' ? end + 1 : end;
    }

    const idEsc = vulnId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const idMatch = content.match(new RegExp(`^\\s{2,8}${idEsc}:\\s*$`, 'm'));

    if (idMatch) {
        const idLineEnd = afterLine(idMatch.index, idMatch[0].length);

        // Search for an existing entry with the same dep path within this vuln's block.
        // The block ends at the next line indented no deeper than the vuln ID (another
        // vuln ID or a top-level section key); path/property lines are indented deeper.
        const afterId = content.slice(idLineEnd);
        const nextBlockMatch = afterId.match(new RegExp(`^[ ]{0,${idIndent}}\\S`, 'm'));
        const vulnBlockContent = nextBlockMatch ? afterId.slice(0, nextBlockMatch.index) : afterId;

        // An entry: the list-item line plus its deeper-indented property lines.
        const keyEsc = quotedKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingEntryRe = new RegExp(`^[ ]{${dashIndent}}- ${keyEsc}\\n(?:[ ]{${dashIndent + 1},}[^\\n]*\\n)*`, 'm');
        const existingEntry = vulnBlockContent.match(existingEntryRe);

        if (existingEntry) {
            // Replace existing entry in-place
            const replaceStart = idLineEnd + existingEntry.index;
            const replaceEnd = replaceStart + existingEntry[0].length;
            content = content.slice(0, replaceStart) + pathEntry + content.slice(replaceEnd);
        } else {
            // Insert new path entry immediately after the existing ID line
            content = content.slice(0, idLineEnd) + pathEntry + content.slice(idLineEnd);
        }
    } else {
        // Insert new vuln block after 'ignore:' line
        const ignoreMatch = content.match(/^ignore:\s*$/m);
        if (ignoreMatch) {
            const insertAt = afterLine(ignoreMatch.index, ignoreMatch[0].length);
            content = content.slice(0, insertAt) + `${idPad}${vulnId}:\n${pathEntry}` + content.slice(insertAt);
        } else {
            content += `\n${idPad}${vulnId}:\n${pathEntry}`;
        }
    }

    mkdirSync(dirname(absPath), { recursive: true });
    writeFileSync(absPath, content, 'utf8');
}

const args = parseArgs(process.argv.slice(2));

if (!args.file) {
    console.error('Usage: node index.mjs <snyk-output.json> [--port 3456] [--open]');
    process.exit(1);
}

let rawData;
let snykFileMtime;
try {
    const snykFilePath = resolve(args.file);
    rawData = JSON.parse(readFileSync(snykFilePath, 'utf8'));
    snykFileMtime = statSync(snykFilePath).mtime.toISOString();
} catch (err) {
    console.error(`Failed to read/parse JSON file: ${args.file}`);
    console.error(err.message);
    process.exit(1);
}

const snykData = normaliseSnykData(rawData);

// Log .snyk files found at startup (patterns are re-read on each /data request
// so that updates written via POST /update-snyk are reflected on reload).
const { files: snykFiles } = loadAllSnykIgnorePatterns(process.cwd());
if (snykFiles.length) {
    console.log(`Loaded ignore patterns from ${snykFiles.length} .snyk file(s):`);
    snykFiles.forEach((f) => console.log(`  ${f}`));
} else {
    console.log('No .snyk files found — near-ignored matching will not be available.');
}

const uiTemplatePath = resolve(__dirname, 'ui.html');
let uiHtml;
try {
    uiHtml = readFileSync(uiTemplatePath, 'utf8');
} catch (err) {
    console.error('Could not read ui.html:', err.message);
    process.exit(1);
}
if (args.name) {
    uiHtml = uiHtml.replaceAll('Snyk Vulnerability Viewer', `${args.name}: Snyk Vulnerability Viewer`);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}

const server = createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${args.port}`);

    if (url.pathname === '/data') {
        const { byFile: ignorePatternsByFile } = loadAllSnykIgnorePatterns(process.cwd());
        const sharedExpiry = findSharedExpiry(process.cwd());
        let rootPackageName = null;
        try {
            const rootPkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
            rootPackageName = rootPkg.name || null;
        } catch { /* ignore */ }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ projects: snykData, ignorePatternsByFile, sharedExpiry, rootPackageName, scanDate: snykFileMtime }));
        return;
    }

    if (url.pathname === '/run-snyk') {
        const backup = url.searchParams.get('backup') === '1';
        const snykJsonPath = resolve(process.cwd(), args.file);

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        const send = (event, data) => {
            if (event !== 'message') res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        if (backup) {
            if (existsSync(snykJsonPath)) {
                const ts = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
                const backupPath = snykJsonPath.replace(/\.json$/, `_${ts}.json`);
                try {
                    renameSync(snykJsonPath, backupPath);
                    send('message', { type: 'info', text: `Backed up to ${backupPath}\n` });
                } catch (e) {
                    send('message', { type: 'warn', text: `Could not back up: ${e.message}\n` });
                }
            } else {
                send('message', { type: 'info', text: 'No existing file to back up.\n' });
            }
        }

        send('message', { type: 'info', text: 'Running yarn nx snyk:test:json…\n' });

        const child = spawn('yarn', ['nx', 'snyk:test:json', '--skip-nx-cache'], { cwd: process.cwd(), shell: true });
        child.stdout.on('data', d => send('message', { type: 'stdout', text: d.toString() }));
        child.stderr.on('data', d => send('message', { type: 'stderr', text: d.toString() }));
        child.on('close', code => {
            if (code === 0) {
                try {
                    const newRaw = JSON.parse(readFileSync(snykJsonPath, 'utf8'));
                    const newData = normaliseSnykData(newRaw);
                    snykData.length = 0;
                    newData.forEach(p => snykData.push(p));
                    snykFileMtime = statSync(snykJsonPath).mtime.toISOString();
                    console.log(`Re-run complete: loaded ${snykData.length} project(s) from ${args.file}`);
                    send('done', { ok: true });
                } catch (e) {
                    send('done', { ok: false, error: `Command succeeded but could not read output: ${e.message}` });
                }
            } else {
                send('done', { ok: false, error: `Command exited with code ${code}` });
            }
            res.end();
        });
        req.on('close', () => { try { child.kill(); } catch { /* ignore */ } });
        return;
    }

    if (req.method === 'POST' && url.pathname === '/update-snyk') {
        readBody(req).then(body => {
            try {
                const { updates } = JSON.parse(body);
                const rootDir = process.cwd();
                const rootPrefix = rootDir + sep;
                let updatedCount = 0;
                for (const { snykFile, vulnId, oldPath, newPath } of (updates || [])) {
                    if (typeof snykFile !== 'string' || !snykFile.endsWith('.snyk')) continue;
                    const absPath = resolve(rootDir, snykFile);
                    if (!absPath.startsWith(rootPrefix) && absPath !== resolve(rootDir, '.snyk')) continue;
                    try {
                        const original = readFileSync(absPath, 'utf8');
                        const { content: updated, changed } = updateSnykFilePath(original, vulnId, oldPath, newPath);
                        if (changed) { writeFileSync(absPath, updated, 'utf8'); updatedCount++; }
                    } catch { /* skip unreadable/unwritable files */ }
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, updated: updatedCount }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    // ── Review state endpoints ──
    if (url.pathname === '/review-state') {
        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(readReviewState()));
            return;
        }
        if (req.method === 'POST') {
            readBody(req).then(body => {
                try {
                    const updates = JSON.parse(body); // { vulnId: { status, resolution?, note? } }
                    const state = readReviewState();
                    state.decisions = state.decisions || {};
                    const ts = new Date().toISOString();
                    for (const [id, decision] of Object.entries(updates)) {
                        state.decisions[id] = { ...decision, timestamp: ts };
                    }
                    writeReviewState(state);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true }));
                } catch (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: err.message }));
                }
            });
            return;
        }
    }

    // ── npm-versions endpoint ──
    if (url.pathname === '/npm-versions') {
        const pkg = url.searchParams.get('pkg');
        if (!pkg || !/^[@\w][\w./@-]*$/.test(pkg)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Invalid or missing pkg parameter' }));
            return;
        }
        let done = false;
        const child = spawn('npm', ['view', pkg, 'versions', '--json'], { cwd: process.cwd() });
        let stdout = '', stderr = '';
        const timer = setTimeout(() => {
            if (done) return;
            done = true;
            child.kill();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Timeout after 15s' }));
        }, 15000);
        child.stdout.on('data', d => { stdout += d; });
        child.stderr.on('data', d => { stderr += d; });
        child.on('close', code => {
            clearTimeout(timer);
            if (done) return;
            done = true;
            if (code !== 0) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: (stderr.trim() || `Exit code ${code}`) }));
                return;
            }
            try {
                const parsed = JSON.parse(stdout.trim());
                const versions = Array.isArray(parsed) ? parsed : [parsed];
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, versions: versions.slice().reverse() }));
            } catch {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: 'Could not parse npm output' }));
            }
        });
        return;
    }

    // ── update-dep-version endpoint ──
    if (req.method === 'POST' && url.pathname === '/update-dep-version') {
        readBody(req).then(body => {
            try {
                const { packageJsonPath, dep, version, field } = JSON.parse(body);
                const rootDir = process.cwd();
                const absPath = resolve(rootDir, packageJsonPath);
                const rootPrefix = rootDir + sep;
                if (!absPath.startsWith(rootPrefix) || !packageJsonPath.endsWith('package.json')) {
                    throw new Error('Invalid packageJsonPath');
                }
                const pkg = JSON.parse(readFileSync(absPath, 'utf8'));
                let updated = false;
                const fieldsToCheck = field ? [field] : ['dependencies', 'devDependencies', 'resolutions', 'peerDependencies'];
                for (const f of fieldsToCheck) {
                    if (pkg[f] && dep in pkg[f]) {
                        pkg[f][dep] = version;
                        updated = true;
                        break;
                    }
                }
                if (!updated && field) {
                    pkg[field] = pkg[field] || {};
                    pkg[field][dep] = version;
                    updated = true;
                }
                if (!updated) throw new Error(`Package "${dep}" not found in ${packageJsonPath}`);
                writeFileSync(absPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    // ── remove-dep endpoint ──
    if (req.method === 'POST' && url.pathname === '/remove-dep') {
        readBody(req).then(body => {
            try {
                const { packageJsonPath, dep, field } = JSON.parse(body);
                const rootDir = process.cwd();
                const absPath = resolve(rootDir, packageJsonPath);
                const rootPrefix = rootDir + sep;
                if (!absPath.startsWith(rootPrefix) || !packageJsonPath.endsWith('package.json')) {
                    throw new Error('Invalid packageJsonPath');
                }
                const pkg = JSON.parse(readFileSync(absPath, 'utf8'));
                const fieldsToCheck = field ? [field] : ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
                let removed = false;
                for (const f of fieldsToCheck) {
                    if (pkg[f] && dep in pkg[f]) {
                        delete pkg[f][dep];
                        removed = true;
                        break;
                    }
                }
                if (!removed) throw new Error(`Package "${dep}" not found in ${packageJsonPath}`);
                writeFileSync(absPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    // ── apply-resolution endpoint ──
    if (req.method === 'POST' && url.pathname === '/apply-resolution') {
        readBody(req).then(body => {
            try {
                const { key, version } = JSON.parse(body);
                const absPath = resolve(process.cwd(), 'package.json');
                const pkg = JSON.parse(readFileSync(absPath, 'utf8'));
                pkg.resolutions = pkg.resolutions || {};
                pkg.resolutions[key] = version;
                writeFileSync(absPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' });
                res.end(JSON.stringify({ ok: true }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' });
                res.end(JSON.stringify({ ok: false, error: String(err.message) }));
            }
        });
        return;
    }

    // ── add-snyk-ignore endpoint ──
    if (req.method === 'POST' && url.pathname === '/add-snyk-ignore') {
        readBody(req).then(body => {
            try {
                const { snykFile, vulnId, path: depPath, reason, expires } = JSON.parse(body);
                addSnykIgnoreEntry(snykFile, vulnId, depPath, reason, expires);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    // ── reset-review-state endpoint ──
    if (req.method === 'POST' && url.pathname === '/reset-review-state') {
        try {
            const p = reviewStatePath();
            if (existsSync(p)) unlinkSync(p);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
        return;
    }

    // ── dep-field endpoint ──
    if (url.pathname === '/dep-field') {
        const pkg = url.searchParams.get('pkg');
        const file = url.searchParams.get('file');
        if (!pkg || !file) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Missing pkg or file parameter' }));
            return;
        }
        try {
            const rootDir = process.cwd();
            const absPath = resolve(rootDir, file);
            const rootPrefix = rootDir + sep;
            if ((!absPath.startsWith(rootPrefix) && absPath !== resolve(rootDir, 'package.json')) || !file.endsWith('package.json')) {
                throw new Error('Invalid file path');
            }
            const pkgJson = JSON.parse(readFileSync(absPath, 'utf8'));
            const fields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
            let foundField = null;
            let foundVersion = null;
            for (const f of fields) {
                const section = pkgJson[f];
                if (section && typeof section === 'object') {
                    // Iterate own keys to avoid using unsanitised input as a direct property accessor
                    const match = Object.entries(section).find(([k]) => k === pkg);
                    if (match) {
                        foundField = f;
                        foundVersion = match[1];
                        break;
                    }
                }
            }
            res.writeHead(200, { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' });
            res.end(JSON.stringify({ ok: true, field: foundField ?? '', version: String(foundVersion ?? '') }));
        } catch (err) {
            res.writeHead(200, { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' });
            res.end(JSON.stringify({ ok: false, error: String(err.message) }));
        }
        return;
    }

    // Serve static UI files (.css/.js) from the same directory as ui.html
    const STATIC_FILES = {
        '/ui-styles.css': { file: 'ui-styles.css', type: 'text/css' },
        '/ui-browse.js':  { file: 'ui-browse.js',  type: 'application/javascript' },
        '/ui-review.js':  { file: 'ui-review.js',  type: 'application/javascript' },
    };
    const staticEntry = STATIC_FILES[url.pathname];
    if (staticEntry) {
        try {
            const content = readFileSync(resolve(__dirname, staticEntry.file));
            res.writeHead(200, { 'Content-Type': staticEntry.type });
            res.end(content);
        } catch {
            res.writeHead(404);
            res.end('Not found');
        }
        return;
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(uiHtml);
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

server.listen(args.port, '127.0.0.1', () => {
    const url = `http://localhost:${args.port}`;
    console.log(`\nSnyk Viewer running at \x1b[36m\x1b[4m${url}\x1b[0m`);
    console.log(`Loaded ${snykData.length} project(s) from ${args.file}`);
    console.log('Press Ctrl+C to stop.\n');
    if (args.open) openBrowser(url);
});
