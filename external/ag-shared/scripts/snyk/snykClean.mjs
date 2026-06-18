#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { resolve, relative } from 'path';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
    const args = { dryRun: false };
    for (const arg of argv.slice(2)) {
        if (arg === '--dry-run') args.dryRun = true;
    }
    return args;
}

// ---------------------------------------------------------------------------
// yarn.lock v1 parser — returns Set<"name@version">
// ---------------------------------------------------------------------------

// Extract all package names from a single yarn.lock specifier.
// Handles npm protocol aliases: "alias@npm:realpackage@constraint"
// e.g. "string-width-cjs@npm:string-width@^4.2.0" → ["string-width-cjs", "string-width"]
function extractNamesFromSpec(spec) {
    const npmAliasMatch = spec.match(/^(@?[^@]+)@npm:(@?[^@]+)@/);
    if (npmAliasMatch) {
        return [npmAliasMatch[1], npmAliasMatch[2]];
    }
    const lastAt = spec.lastIndexOf('@');
    if (lastAt > 0) {
        return [spec.slice(0, lastAt)];
    }
    return [];
}

function parseYarnLock(lockfilePath) {
    const content = readFileSync(lockfilePath, 'utf8');
    const resolved = new Set();
    let currentNames = [];

    for (const line of content.split('\n')) {
        // Header lines come in two forms:
        //   Quoted:   "@babel/core@^7.11.6", "@babel/core@^7.23.0":
        //   Unquoted: jest@29.7.0, jest@^29.5.0, jest@^29.7.0:
        // Both end with ":" and may contain multiple comma-separated specifiers.
        if ((line.startsWith('"') || (line.match(/^\S/) && line.endsWith(':'))) && !line.startsWith('#') && !line.startsWith(' ')) {
            currentNames = [];

            // Strip trailing colon and extract all specifiers.
            const header = line.replace(/:$/, '');

            // Collect quoted specifiers first, then any unquoted remainders.
            const specs = [];
            const quotedRegex = /"([^"]+)"/g;
            let match;
            while ((match = quotedRegex.exec(header)) !== null) {
                specs.push(match[1]);
            }
            const unquoted = header.replace(/"[^"]+"/g, '').split(',').map((s) => s.trim()).filter(Boolean);
            specs.push(...unquoted);

            for (const spec of specs) {
                currentNames.push(...extractNamesFromSpec(spec));
            }
        } else if (currentNames.length > 0 && line.match(/^\s+version "(.+)"$/)) {
            const version = line.match(/^\s+version "(.+)"$/)[1];
            for (const name of currentNames) {
                resolved.add(`${name}@${version}`);
            }
            currentNames = [];
        }
    }

    return resolved;
}

// ---------------------------------------------------------------------------
// .snyk file discovery (copied from snyk-viewer/index.mjs)
// ---------------------------------------------------------------------------

const IGNORED_DIRS = new Set(['node_modules', '.git', '.claude', 'dist', '.nx']);
const IGNORED_RELATIVE_DIRS = ['external/ag-shared'];

function getSnykFiles(dir, found = [], ignoredAbsoluteDirs = new Set()) {
    let entries;
    try {
        entries = readdirSync(dir, { withFileTypes: true });
    } catch {
        return found;
    }
    for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        const full = resolve(dir, entry.name);
        if (ignoredAbsoluteDirs.has(full)) continue;
        if (entry.isDirectory()) {
            getSnykFiles(full, found, ignoredAbsoluteDirs);
        } else if (entry.name === '.snyk') {
            found.push(full);
        }
    }
    return found;
}

// ---------------------------------------------------------------------------
// .snyk ignore parser (copied from snyk-viewer/index.mjs)
// Returns: { [vulnId]: Array<{ path: string, reason: string }> }
// ---------------------------------------------------------------------------

function parseSnykIgnorePaths(content) {
    const result = {};
    let inIgnoreSection = false;
    let currentId = null;
    let currentPath = null;
    let blockReasonLines = null;
    let blockReasonIndent = 0;

    for (const line of content.split('\n')) {
        // Track top-level YAML section changes (e.g. "ignore:", "patch:", "version:").
        // Top-level keys start at column 0 with a letter and are not comments.
        if (/^[a-zA-Z]/.test(line) && !line.startsWith('#')) {
            if (blockReasonLines?.length && currentPath) {
                currentPath.reason = blockReasonLines.join(' ');
            }
            inIgnoreSection = line.startsWith('ignore:');
            currentId = null;
            currentPath = null;
            blockReasonLines = null;
            continue;
        }

        if (!inIgnoreSection) continue;

        if (blockReasonLines !== null) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const indent = line.match(/^( *)/)[1].length;
            if (indent > blockReasonIndent) {
                blockReasonLines.push(trimmed);
                continue;
            }
            if (currentPath) currentPath.reason = blockReasonLines.join(' ');
            blockReasonLines = null;
        }

        const idMatch = line.match(/^\s{2,6}(SNYK-\S+|CVE-\d+-\d+|GHSA-\S+):\s*$/);
        if (idMatch) {
            currentId = idMatch[1];
            currentPath = null;
            result[currentId] = result[currentId] || [];
        } else if (currentId) {
            const pathMatch = line.match(/^\s+- (?:'(.+?)'|"(.+?)"|([\w@][^:]*?)):\s*$/);
            if (pathMatch) {
                currentPath = { path: (pathMatch[1] ?? pathMatch[2] ?? pathMatch[3]).trim(), reason: '' };
                result[currentId].push(currentPath);
            } else if (currentPath) {
                const reasonInline = line.match(/^(\s+)reason:\s+([^>|].+)$/);
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

    if (blockReasonLines?.length && currentPath) {
        currentPath.reason = blockReasonLines.join(' ');
    }

    return result;
}

// ---------------------------------------------------------------------------
// Find line ranges for each (vulnId, path) entry in .snyk file content
// Returns: Array<{ vulnId, path, startLine, endLine }>
// where startLine is the "- path:" line and endLine is the last line of the entry
// ---------------------------------------------------------------------------

function findEntryLineRanges(lines) {
    const entries = [];
    const vulnIdLines = []; // { vulnId, lineIndex }
    let inIgnoreSection = false;
    let currentVulnId = null;
    let currentVulnIdLine = -1;
    let currentEntry = null;
    let pathPropertyIndent = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Track top-level YAML section changes.
        if (/^[a-zA-Z]/.test(line) && !line.startsWith('#')) {
            if (currentEntry) {
                currentEntry.endLine = i - 1;
                while (currentEntry.endLine > currentEntry.startLine && !lines[currentEntry.endLine].trim()) {
                    currentEntry.endLine--;
                }
                entries.push(currentEntry);
                currentEntry = null;
            }
            inIgnoreSection = line.startsWith('ignore:');
            currentVulnId = null;
            continue;
        }

        if (!inIgnoreSection) continue;

        // Vuln ID line
        const idMatch = line.match(/^\s{2,6}(SNYK-\S+|CVE-\d+-\d+|GHSA-\S+):\s*$/);
        if (idMatch) {
            // Finalise previous entry
            if (currentEntry) {
                currentEntry.endLine = i - 1;
                entries.push(currentEntry);
                currentEntry = null;
            }
            currentVulnId = idMatch[1];
            currentVulnIdLine = i;
            vulnIdLines.push({ vulnId: currentVulnId, lineIndex: i });
            pathPropertyIndent = -1;
            continue;
        }

        if (!currentVulnId) continue;

        // Path line
        const pathMatch = line.match(/^(\s+)- (?:'(.+?)'|"(.+?)"|([\w@][^:]*?)):\s*$/);
        if (pathMatch) {
            // Finalise previous entry
            if (currentEntry) {
                currentEntry.endLine = i - 1;
                entries.push(currentEntry);
            }
            const path = (pathMatch[2] ?? pathMatch[3] ?? pathMatch[4]).trim();
            currentEntry = { vulnId: currentVulnId, vulnIdLine: currentVulnIdLine, path, startLine: i, endLine: -1 };
            // Properties (reason/expires/created) are indented deeper than the "- " list marker.
            pathPropertyIndent = pathMatch[1].length + 1;
            continue;
        }

        // If we're inside an entry, check if the line is still part of it
        if (currentEntry) {
            const trimmed = line.trim();
            if (!trimmed) continue; // blank lines within entry
            const indent = line.match(/^( *)/)[1].length;
            // Lines at or deeper than the property indent belong to this entry
            if (indent >= pathPropertyIndent) continue;
            // Otherwise, this line is at a higher level — entry ended on previous non-blank line
            currentEntry.endLine = i - 1;
            // Walk back past trailing blank lines
            while (currentEntry.endLine > currentEntry.startLine && !lines[currentEntry.endLine].trim()) {
                currentEntry.endLine--;
            }
            entries.push(currentEntry);
            currentEntry = null;
        }
    }

    // Finalise last entry
    if (currentEntry) {
        currentEntry.endLine = lines.length - 1;
        while (currentEntry.endLine > currentEntry.startLine && !lines[currentEntry.endLine].trim()) {
            currentEntry.endLine--;
        }
        entries.push(currentEntry);
    }

    return { entries, vulnIdLines };
}

// ---------------------------------------------------------------------------
// Remove stale entries from .snyk file content
// ---------------------------------------------------------------------------

function removeStaleEntries(content, stalePaths) {
    // stalePaths: Array<{ vulnId, path }>
    if (!stalePaths.length) return content;

    const lines = content.split('\n');
    const { entries, vulnIdLines } = findEntryLineRanges(lines);

    // Build set of lines to remove
    const linesToRemove = new Set();

    const staleSet = new Set(stalePaths.map((s) => `${s.vulnId}|||${s.path}`));

    // Mark stale entry lines for removal
    for (const entry of entries) {
        if (staleSet.has(`${entry.vulnId}|||${entry.path}`)) {
            for (let i = entry.startLine; i <= entry.endLine; i++) {
                linesToRemove.add(i);
            }
        }
    }

    // Check if any vulnId has ALL its entries removed — if so, remove the vulnId line too
    for (const { vulnId, lineIndex } of vulnIdLines) {
        const vulnEntries = entries.filter((e) => e.vulnId === vulnId);
        const allRemoved = vulnEntries.every((e) => staleSet.has(`${e.vulnId}|||${e.path}`));
        if (allRemoved && vulnEntries.length > 0) {
            linesToRemove.add(lineIndex);
        }
    }

    // Build new content excluding removed lines
    const newLines = lines.filter((_, i) => !linesToRemove.has(i));

    // Collapse consecutive blank lines
    const collapsed = [];
    for (const line of newLines) {
        if (!line.trim() && collapsed.length > 0 && !collapsed[collapsed.length - 1].trim()) {
            continue; // skip consecutive blank line
        }
        collapsed.push(line);
    }

    // Check if ignore section is now empty (no vuln IDs remain)
    let result = collapsed.join('\n');
    const hasRemainingVulns = /^\s{2,6}(SNYK-\S+|CVE-\d+-\d+|GHSA-\S+):\s*$/m.test(result);
    if (!hasRemainingVulns) {
        // Replace "ignore:\n" (possibly followed by blank lines before "patch:") with "ignore: {}"
        result = result.replace(/^ignore:\s*\n(\s*\n)*/m, 'ignore: {}\n');
    }

    return result;
}

// Both top-level sections are the empty inline mapping → nothing left to keep.
function isSnykFileEmpty(content) {
    return /^ignore:\s*\{\s*\}\s*$/m.test(content)
        && /^patch:\s*\{\s*\}\s*$/m.test(content);
}

// ---------------------------------------------------------------------------
// Check which entries are stale
// ---------------------------------------------------------------------------

function findStaleEntries(ignorePatterns, yarnLockPackages) {
    const stale = [];

    for (const [vulnId, entries] of Object.entries(ignorePatterns)) {
        for (const entry of entries) {
            const segments = entry.path.split(' > ');
            const missingSegment = segments.find((seg) => !yarnLockPackages.has(seg));
            if (missingSegment) {
                stale.push({ vulnId, path: entry.path, missingSegment });
            }
        }
    }

    return stale;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
    const args = parseArgs(process.argv);
    const rootDir = process.cwd();

    // Parse yarn.lock
    const yarnLockPath = resolve(rootDir, 'yarn.lock');
    const yarnLockPackages = parseYarnLock(yarnLockPath);
    console.log(`Parsed yarn.lock: ${yarnLockPackages.size} resolved packages`);

    // Find all .snyk files, skipping ignored relative directories (managed separately)
    const ignoredAbsoluteDirs = new Set(IGNORED_RELATIVE_DIRS.map((d) => resolve(rootDir, d)));
    const snykFiles = getSnykFiles(rootDir, [], ignoredAbsoluteDirs);
    console.log(`Scanning ${snykFiles.length} .snyk files...\n`);

    let totalRemoved = 0;
    let filesModified = 0;

    for (const filePath of snykFiles) {
        const relPath = relative(rootDir, filePath);
        const content = readFileSync(filePath, 'utf8');
        const ignorePatterns = parseSnykIgnorePaths(content);
        const staleEntries = findStaleEntries(ignorePatterns, yarnLockPackages);

        if (!staleEntries.length) continue;

        console.log(`${relPath}:`);
        for (const entry of staleEntries) {
            console.log(`  STALE: [${entry.vulnId}] ${entry.path}`);
            console.log(`         (${entry.missingSegment} not in yarn.lock)`);
        }
        console.log();

        totalRemoved += staleEntries.length;
        filesModified++;

        const cleaned = removeStaleEntries(content, staleEntries);
        const fileNowEmpty = isSnykFileEmpty(cleaned);

        if (args.dryRun) {
            if (fileNowEmpty) {
                console.log(`  → would delete ${relPath} (no remaining ignores or patches)`);
            }
        } else if (fileNowEmpty) {
            unlinkSync(filePath);
            console.log(`  → deleted ${relPath} (no remaining ignores or patches)`);
        } else {
            writeFileSync(filePath, cleaned, 'utf8');
        }
    }

    if (totalRemoved === 0) {
        console.log('No stale entries found. All .snyk ignores match current yarn.lock.');
    } else {
        const action = args.dryRun ? 'Would remove' : 'Removed';
        console.log(`${action} ${totalRemoved} stale ${totalRemoved === 1 ? 'entry' : 'entries'} across ${filesModified} ${filesModified === 1 ? 'file' : 'files'}.`);
        if (args.dryRun) {
            console.log('(Re-run without --dry-run to apply changes)');
        }
    }
}

main();
