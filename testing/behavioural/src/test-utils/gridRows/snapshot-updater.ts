/**
 * GridRows inline snapshot updater.
 *
 * When `UPDATE_GRID_ROWS_SNAPSHOTS` is set (via env var or `./behave.sh --update-grid-rows`),
 * this module records diagram mismatches during test execution and rewrites the source
 * files after each test suite completes.
 *
 * Uses TypeScript's parser for precise AST-based template literal replacement.
 */
import ansis from 'ansis';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { default as TypescriptImport } from 'typescript';

import { unindentText } from '../utils';

type Typescript = typeof TypescriptImport;

export interface SnapshotMismatch {
    file: string;
    line: number;
    column: number;
    actualDiagram: string;
    label: string;
}

interface Replacement {
    start: number;
    end: number;
    newText: string;
    line: number;
    label: string;
}

/** Returns the update mode if active, or undefined if not. */
export function getSnapshotUpdateMode(): 'update' | 'dry' | undefined {
    return (globalThis as any).__gridRowsSnapshotUpdateMode as 'update' | 'dry' | undefined;
}

/** Returns the mutable updates array if snapshot update mode is active. */
function getUpdatesArray(): SnapshotMismatch[] | undefined {
    return (globalThis as any).__gridRowsSnapshotUpdates as SnapshotMismatch[] | undefined;
}

// ─── Call site capture ───────────────────────────────────────────────────────

/**
 * Records a snapshot mismatch for later rewriting.
 * Called from GridRows.check() when update mode is active.
 */
export function recordSnapshotMismatch(callerFn: Function, actualDiagram: string, label: string): void {
    const updates = getUpdatesArray();
    if (!updates) {
        return;
    }

    const callSite = captureCallSite(callerFn);
    if (!callSite) {
        logWarning(`Could not capture call site for snapshot "${label}"`);
        return;
    }

    updates.push({
        file: callSite.file,
        line: callSite.line,
        column: callSite.column,
        actualDiagram,
        label,
    });
}

/** Directory path used to filter out internal frames from stack traces. */
const GRID_ROWS_DIR = path.join('test-utils', 'gridRows') + path.sep;

function captureCallSite(callerFn: Function): { file: string; line: number; column: number } | null {
    const err: { stack?: string } = {};
    Error.captureStackTrace(err, callerFn);
    const stack = err.stack;
    if (!stack) {
        return null;
    }

    // V8 stack format: "    at functionName (file:line:col)" or "    at file:line:col"
    for (const line of stack.split('\n')) {
        const match = line.match(/at\s+(?:.*?\s+\()?(.+?):(\d+):(\d+)\)?$/);
        if (match) {
            let file = match[1];
            // Handle file:// URLs (vitest ESM can emit these)
            if (file.startsWith('file://')) {
                try {
                    file = fileURLToPath(file);
                } catch {
                    // If conversion fails, try stripping the prefix manually
                    file = file.slice(7);
                }
            }
            // Skip frames from node_modules or the gridRows utilities directory
            if (file.includes('node_modules') || file.includes(GRID_ROWS_DIR)) {
                continue;
            }
            return { file, line: parseInt(match[2], 10), column: parseInt(match[3], 10) };
        }
    }
    return null;
}

function logInfo(message: string): void {
    process.stdout.write(message + '\n');
}

function logWarning(message: string): void {
    process.stderr.write(message + '\n');
}

// ─── Main entry point ────────────────────────────────────────────────────────

/**
 * Processes all recorded snapshot mismatches for the current test suite.
 * Called from afterAll in vitest.setup.ts.
 */
export async function processSnapshotUpdates(): Promise<void> {
    const updates = getUpdatesArray();
    if (!updates?.length) {
        return;
    }

    const mode = getSnapshotUpdateMode()!;
    const mismatches = updates.splice(0); // drain the array

    const ts = await import('typescript');

    // Group by file
    const byFile = new Map<string, SnapshotMismatch[]>();
    for (const m of mismatches) {
        let arr = byFile.get(m.file);
        if (!arr) {
            arr = [];
            byFile.set(m.file, arr);
        }
        arr.push(m);
    }

    let totalUpdated = 0;
    let totalSkipped = 0;
    const updatedFiles = new Set<string>();

    for (const [file, fileMismatches] of byFile) {
        const relPath = relativePath(file);
        let source: string;
        try {
            source = readFileSync(file, 'utf-8');
        } catch {
            for (const m of fileMismatches) {
                logWarning(ansis.yellow(`  ⚠ Skipped`) + ` ${relPath}:${m.line} — cannot read file`);
                totalSkipped++;
            }
            continue;
        }

        const replacements = findReplacements(ts, source, file, fileMismatches, ansis, relPath);

        if (!replacements.length) {
            continue;
        }

        // Sort descending by start position so replacements don't shift offsets
        replacements.sort((a, b) => b.start - a.start);

        // Deduplicate overlapping replacements (keep only the first = last in source order)
        const deduped: Replacement[] = [];
        for (const r of replacements) {
            if (deduped.length > 0) {
                const prev = deduped[deduped.length - 1];
                // prev.start >= r.end since sorted descending — but check overlap just in case
                if (r.end > prev.start) {
                    logWarning(
                        ansis.yellow(`  ⚠ Skipped`) + ` ${relPath}:${r.line} — "${r.label}" (overlapping replacement)`
                    );
                    totalSkipped++;
                    continue;
                }
            }
            deduped.push(r);
        }

        let newSource = source;
        for (const r of deduped) {
            if (mode === 'dry') {
                logInfo(ansis.cyan(`  📋 Would update`) + ` ${relPath}:${r.line} — "${r.label}"`);
                totalUpdated++;
            } else {
                newSource = newSource.slice(0, r.start) + r.newText + newSource.slice(r.end);
                logInfo(ansis.green.bold(`  👉 Updated`) + ` ${relPath}:${r.line} — "${r.label}"`);
                totalUpdated++;
                updatedFiles.add(file);
            }
        }

        if (mode !== 'dry' && newSource !== source) {
            writeFileSync(file, newSource, 'utf-8');
        }
    }

    // Summary
    if (totalUpdated > 0 || totalSkipped > 0) {
        const fileCount = mode === 'dry' ? byFile.size : updatedFiles.size;
        if (mode === 'dry') {
            logInfo(
                ansis.cyan(`\n  📋 Dry run: ${totalUpdated} snapshot(s) would be updated in ${fileCount} file(s)`) +
                    (totalSkipped > 0 ? ansis.yellow(`, ${totalSkipped} skipped`) : '')
            );
        } else {
            logInfo(
                ansis.green(`\n  ✅ ${totalUpdated} snapshot(s) updated in ${fileCount} file(s)`) +
                    (totalSkipped > 0 ? ansis.yellow(`, ${totalSkipped} skipped`) : '')
            );
        }
    }
}

// ─── AST-based replacement finder ────────────────────────────────────────────

/** Information about a .check() call found in the AST. */
interface CheckCallInfo {
    callLine: number;
    node: any;
    arg: any;
}

function findReplacements(
    ts: Typescript,
    source: string,
    file: string,
    mismatches: SnapshotMismatch[],
    ansis: any,
    relPath: string
): Replacement[] {
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, /* setParentNodes */ true);
    const replacements: Replacement[] = [];

    // Collect all variable declarations with template literal initialisers
    // for resolving identifier references. Warn on shadowed names.
    const varDeclarations = new Map<string, { node: any; scope: any } | null>();

    function collectVarDeclarations(node: any): void {
        if (ts.isVariableDeclaration(node) && node.initializer && ts.isIdentifier(node.name)) {
            const name = node.name.text;
            if (varDeclarations.has(name)) {
                // Shadowed variable — mark as null to avoid ambiguous replacement
                varDeclarations.set(name, null);
            } else {
                varDeclarations.set(name, { node, scope: node.parent });
            }
        }
        ts.forEachChild(node, collectVarDeclarations);
    }
    collectVarDeclarations(sourceFile);

    // Collect all .check() calls from the AST
    const checkCalls: CheckCallInfo[] = [];

    function visit(node: any): void {
        if (ts.isCallExpression(node)) {
            const expr = node.expression;
            // Match .check(...) — PropertyAccessExpression where name is "check"
            if (ts.isPropertyAccessExpression(expr) && expr.name.text === 'check' && node.arguments.length >= 1) {
                const callLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1; // 1-based
                checkCalls.push({ callLine, node, arg: node.arguments[0] });
            }
        }
        ts.forEachChild(node, visit);
    }
    visit(sourceFile);

    // Match mismatches to .check() calls using nearest-line matching.
    // Sort mismatches by line so we process them in source order.
    const sortedMismatches = [...mismatches].sort((a, b) => a.line - b.line);
    const usedCheckCalls = new Set<CheckCallInfo>();

    for (const mismatch of sortedMismatches) {
        // Find the closest unused .check() call to this mismatch's line
        let bestMatch: CheckCallInfo | undefined;
        let bestDistance = Infinity;

        for (const cc of checkCalls) {
            if (usedCheckCalls.has(cc)) {
                continue;
            }
            const distance = Math.abs(cc.callLine - mismatch.line);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = cc;
            }
        }

        // Require the match to be within a reasonable tolerance
        if (!bestMatch || bestDistance > 5) {
            logWarning(
                ansis.yellow(`  ⚠ Skipped`) +
                    ` ${relPath}:${mismatch.line} — "${mismatch.label}" (could not find .check() call in AST)`
            );
            continue;
        }

        usedCheckCalls.add(bestMatch);

        const result = resolveTemplateLiteral(ts, sourceFile, bestMatch.arg, varDeclarations, ansis, relPath, mismatch);
        if (result) {
            const newText = buildReplacementText(source, result.start, result.end, mismatch.actualDiagram);
            replacements.push({
                start: result.start,
                end: result.end,
                newText,
                line: mismatch.line,
                label: mismatch.label,
            });
        }
    }

    return replacements;
}

/**
 * Resolves the argument of .check() to a template literal node.
 * Returns the start/end character positions of the template literal (including backticks) if found.
 */
function resolveTemplateLiteral(
    ts: Typescript,
    sourceFile: any,
    arg: any,
    varDeclarations: Map<string, { node: any; scope: any } | null>,
    ansis: any,
    relPath: string,
    mismatch: SnapshotMismatch
): { start: number; end: number } | null {
    // Case 1: Direct template literal — `.check(\`...\`)`
    if (ts.isNoSubstitutionTemplateLiteral(arg)) {
        return { start: arg.getStart(sourceFile), end: arg.getEnd() };
    }

    // Case 2: String literal — `.check('...')` or `.check("...")`
    if (ts.isStringLiteral(arg)) {
        return { start: arg.getStart(sourceFile), end: arg.getEnd() };
    }

    // Case 3: Tagged template — `.check(unindentText\`...\`)`
    if (ts.isTaggedTemplateExpression(arg)) {
        const template = arg.template;
        if (ts.isNoSubstitutionTemplateLiteral(template)) {
            return { start: template.getStart(sourceFile), end: template.getEnd() };
        }
        logWarning(
            ansis.yellow(`  ⚠ Skipped`) +
                ` ${relPath}:${mismatch.line} — "${mismatch.label}" (tagged template with substitutions)`
        );
        return null;
    }

    // Case 4: Identifier reference — `.check(myVar)` where `const myVar = \`...\``
    if (ts.isIdentifier(arg)) {
        const varName = arg.text;
        const decl = varDeclarations.get(varName);
        if (decl === null) {
            logWarning(
                ansis.yellow(`  ⚠ Skipped`) +
                    ` ${relPath}:${mismatch.line} — "${mismatch.label}" (variable "${varName}" is declared multiple times)`
            );
            return null;
        }
        const init = decl?.node.initializer;
        if (init && (ts.isNoSubstitutionTemplateLiteral(init) || ts.isStringLiteral(init))) {
            return {
                start: init.getStart(sourceFile),
                end: init.getEnd(),
            };
        }
        logWarning(
            ansis.yellow(`  ⚠ Skipped`) +
                ` ${relPath}:${mismatch.line} — "${mismatch.label}" (variable "${varName}" is not a static string or template literal)`
        );
        return null;
    }

    // Case 5: Template with substitutions or other unsupported expression — skip
    logWarning(
        ansis.yellow(`  ⚠ Skipped`) +
            ` ${relPath}:${mismatch.line} — "${mismatch.label}" (argument is not a static string or template literal)`
    );
    return null;
}

// ─── Text replacement with indentation ───────────────────────────────────────

/**
 * Builds the replacement text for a template literal, preserving the original indentation.
 *
 * @param source Full source file content
 * @param start Start position of the template literal (the opening backtick)
 * @param end End position of the template literal (after the closing backtick)
 * @param actualDiagram The new diagram content from makeDiagram(false)
 */
function buildReplacementText(source: string, start: number, end: number, actualDiagram: string): string {
    const original = source.slice(start, end);

    // Detect the indentation from the original template literal content
    const originalContent = original.slice(1, -1); // strip backticks
    const originalLines = originalContent.split('\n');

    // Find indent of first non-empty content line (skip the first which is after the backtick on the same line)
    let contentIndent = '';
    for (let i = 1; i < originalLines.length; i++) {
        const line = originalLines[i];
        if (line.trim().length > 0) {
            const match = line.match(/^(\s+)/);
            contentIndent = match ? match[1] : '';
            break;
        }
    }

    // Find indent of the closing backtick line
    let closingIndent = '';
    if (originalLines.length > 1) {
        const lastLine = originalLines[originalLines.length - 1];
        const match = lastLine.match(/^(\s*)/);
        closingIndent = match ? match[1] : '';
    }

    // If we couldn't detect indentation (single-line or empty original), fall back to the
    // leading whitespace of the line containing the literal, plus 4 extra spaces for content.
    if (!contentIndent) {
        // Find the start of the line containing `start`
        let lineStart = start - 1;
        while (lineStart >= 0 && source[lineStart] !== '\n') {
            lineStart--;
        }
        lineStart++; // move past the '\n' (or stay at 0)
        const lineLeadMatch = source.slice(lineStart).match(/^(\s*)/);
        const lineIndent = lineLeadMatch ? lineLeadMatch[1] : '';
        contentIndent = lineIndent + '    '; // 4 extra spaces for diagram content
        closingIndent = lineIndent;
    }

    // Build the new diagram with proper indentation
    const diagramLines = unindentText(actualDiagram).split('\n');
    const indentedLines = diagramLines.map((line) => (line.trim() ? contentIndent + line : ''));

    return '`\n' + indentedLines.join('\n') + '\n' + closingIndent + '`';
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function relativePath(file: string): string {
    try {
        return path.relative(process.cwd(), file);
    } catch {
        return file;
    }
}
