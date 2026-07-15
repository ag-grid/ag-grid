/**
 * GridRows inline snapshot updater. When update mode is active (`./behave.sh --update-grid-rows`),
 * records diagram mismatches during tests and rewrites the source files after each suite, using
 * the TypeScript parser for precise AST-based template-literal replacement.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { default as TypescriptImport } from 'typescript';

import { unindentText } from '../string-utils';

type Typescript = typeof TypescriptImport;

export interface SnapshotMismatch {
    file: string;
    line: number;
    column: number;
    actualDiagram: string;
    label: string;
    /** The method name that recorded this mismatch ('check' or 'checkColumns'). */
    methodName?: string;
}

/** Snapshot-assertion method names whose template-literal argument the updater rewrites. */
const SNAPSHOT_CHECK_METHODS = new Set(['check', 'checkColumns', 'checkFilterDom']);

interface Replacement {
    start: number;
    end: number;
    newText: string;
    line: number;
    label: string;
    indentFixed: boolean;
}

export function getSnapshotUpdateMode(): 'update' | 'dry' | undefined {
    return (globalThis as any).__gridRowsSnapshotUpdateMode as 'update' | 'dry' | undefined;
}

function getUpdatesArray(): SnapshotMismatch[] | undefined {
    return (globalThis as any).__gridRowsSnapshotUpdates as SnapshotMismatch[] | undefined;
}

/** Records a snapshot mismatch for later rewriting; called from the check methods in update mode. */
export function recordSnapshotMismatch(
    callerFn: (...args: any[]) => any,
    actualDiagram: string,
    label: string,
    methodName?: string
): void {
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
        methodName,
    });
}

/** Path fragments used to filter out internal snapshot-helper frames from stack traces.
 * Matches `test-utils/gridRows/`, `test-utils/gridColumns/`, and `test-utils/filters/filterDom`. */
const INTERNAL_FRAME_FRAGMENTS = [path.join('test-utils', 'grid'), path.join('test-utils', 'filters', 'filterDom')];

function captureCallSite(callerFn: (...args: any[]) => any): { file: string; line: number; column: number } | null {
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
                    file = file.slice(7);
                }
            }
            // Skip frames from node_modules or the internal snapshot-helper directories
            if (file.includes('node_modules') || INTERNAL_FRAME_FRAGMENTS.some((frag) => file.includes(frag))) {
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

/** Processes all recorded mismatches for the current suite; called from afterAll in vitest.setup.ts. */
export async function processSnapshotUpdates(currentTestFile?: string): Promise<void> {
    const updates = getUpdatesArray();
    const mode = getSnapshotUpdateMode()!;

    // Nothing to do if no mismatches and no current file to indent-fix
    if (!updates?.length && !currentTestFile) {
        return;
    }

    const mismatches = updates?.splice(0) ?? []; // drain the array

    const ts = await import('typescript');

    const byFile = new Map<string, SnapshotMismatch[]>();
    for (const m of mismatches) {
        let arr = byFile.get(m.file);
        if (!arr) {
            arr = [];
            byFile.set(m.file, arr);
        }
        arr.push(m);
    }
    // Always include the current test file in the indent-fix pass, even with no mismatches
    if (currentTestFile && !byFile.has(currentTestFile)) {
        byFile.set(currentTestFile, []);
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
                logWarning(`  ⚠️️ Skipped ${relPath}:${m.line} — cannot read file`);
                totalSkipped++;
            }
            continue;
        }

        const { replacements, skipped: findSkipped } = findReplacements(ts, source, file, fileMismatches, relPath);
        totalSkipped += findSkipped;

        if (!replacements.length) {
            continue;
        }

        // Sort descending by start position so replacements don't shift offsets
        replacements.sort((a, b) => b.start - a.start);

        // Deduplicate overlapping replacements
        const deduped: Replacement[] = [];
        for (const r of replacements) {
            if (deduped.length > 0) {
                const prev = deduped[deduped.length - 1];
                if (r.end > prev.start) {
                    // Two replacements target the same range (e.g., shared variable in parameterized tests)
                    if (r.start === prev.start && r.end === prev.end && r.newText !== prev.newText) {
                        // Different content for the same target — shared variable with different parameterizations.
                        // Skip BOTH to avoid corruption. The user needs to expand the parameterized test.
                        deduped.pop();
                        logWarning(
                            `  ⚠️️ Skipped ${relPath}:${prev.line} — "${prev.label}" (shared variable produces different snapshots across parameterizations — expand the test.each/describe.each)`
                        );
                        totalSkipped += 2;
                    } else {
                        logWarning(`  ⚠️️ Skipped ${relPath}:${r.line} — "${r.label}" (overlapping replacement)`);
                        totalSkipped++;
                    }
                    continue;
                }
            }
            deduped.push(r);
        }

        let newSource = source;
        for (const r of deduped) {
            if (mode === 'dry') {
                logInfo(`  📋 Would update ${relPath}:${r.line} — "${r.label}"`);
                totalUpdated++;
            } else {
                newSource = newSource.slice(0, r.start) + r.newText + newSource.slice(r.end);
                const suffix = r.indentFixed ? ' (indentation fixed)' : '';
                logInfo(`  👉 Updated ${relPath}:${r.line} — "${r.label}"` + suffix);
                totalUpdated++;
                updatedFiles.add(file);
            }
        }

        if (mode !== 'dry' && newSource !== source) {
            writeFileSync(file, newSource, 'utf-8');
        }
    }

    // Indentation-fix pass: scan all processed files for .check() templates with wrong indentation
    // (catches snapshots that were correct in content but hand-written with bad indent)
    let totalIndentFixed = 0;
    for (const file of byFile.keys()) {
        const relPath = relativePath(file);
        let source: string;
        try {
            source = readFileSync(file, 'utf-8');
        } catch {
            continue;
        }
        const fixes = findIndentationFixes(ts, source, file);
        if (!fixes.length) {
            continue;
        }
        fixes.sort((a, b) => b.start - a.start);
        let newSource = source;
        for (const fix of fixes) {
            if (mode === 'dry') {
                logInfo(`  📋 Would fix indent ${relPath}:${fix.line} — "${fix.label}"`);
            } else {
                newSource = newSource.slice(0, fix.start) + fix.newText + newSource.slice(fix.end);
                logInfo(`  📐 Indent fixed ${relPath}:${fix.line} — "${fix.label}"`);
                updatedFiles.add(file);
            }
            totalIndentFixed++;
        }
        if (mode !== 'dry' && newSource !== source) {
            writeFileSync(file, newSource, 'utf-8');
        }
    }

    if (totalUpdated > 0 || totalSkipped > 0 || totalIndentFixed > 0) {
        const fileCount = mode === 'dry' ? byFile.size : updatedFiles.size;
        if (mode === 'dry') {
            logInfo(
                `\n  📋 Dry run: ${totalUpdated} snapshot(s) would be updated in ${fileCount} file(s)` +
                    (totalSkipped > 0 ? `, ${totalSkipped} skipped` : '')
            );
        } else {
            logInfo(
                `\n  ✅ ${totalUpdated} snapshot(s) updated in ${fileCount} file(s)` +
                    (totalSkipped > 0 ? `, ${totalSkipped} skipped` : '')
            );
        }
    }
}

// ─── AST-based replacement finder ────────────────────────────────────────────

/** Walks the receiver chain of a check call to the underlying `new GridRows/GridColumns(api, LABEL)`
 *  and returns LABEL when it's a static string/template literal, else undefined (dynamic label). */
function extractGridInstanceLabel(ts: Typescript, expr: any): string | undefined {
    let cursor: any = expr;
    while (cursor && ts.isParenthesizedExpression(cursor)) {
        cursor = cursor.expression;
    }
    while (cursor && (ts.isCallExpression(cursor) || ts.isPropertyAccessExpression(cursor))) {
        cursor = (cursor as any).expression;
        while (cursor && ts.isParenthesizedExpression(cursor)) {
            cursor = cursor.expression;
        }
    }
    if (!cursor || !ts.isNewExpression(cursor) || !cursor.arguments || cursor.arguments.length < 2) {
        return undefined;
    }
    const labelArg = cursor.arguments[1];
    if (ts.isStringLiteral(labelArg) || ts.isNoSubstitutionTemplateLiteral(labelArg)) {
        return labelArg.text;
    }
    return undefined;
}

interface CheckCallInfo {
    callLine: number;
    node: any;
    arg: any;
    /** The method name: 'check' or 'checkColumns'. */
    methodName: string;
    /** The label passed to `new GridRows(api, LABEL)` / `new GridColumns(api, LABEL)`, when statically resolvable. */
    label: string | undefined;
}

function findReplacements(
    ts: Typescript,
    source: string,
    file: string,
    mismatches: SnapshotMismatch[],
    relPath: string
): { replacements: Replacement[]; skipped: number } {
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, /* setParentNodes */ true);
    const replacements: Replacement[] = [];
    let skipped = 0;

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

    const checkCalls: CheckCallInfo[] = [];

    function visit(node: any): void {
        if (ts.isCallExpression(node)) {
            const expr = node.expression;
            // Match .check(...) / .checkColumns(...) / .checkFilterDom(...) — PropertyAccessExpression
            if (
                ts.isPropertyAccessExpression(expr) &&
                SNAPSHOT_CHECK_METHODS.has(expr.name.text) &&
                node.arguments.length >= 1
            ) {
                const callLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1; // 1-based
                const label = extractGridInstanceLabel(ts, expr.expression);
                checkCalls.push({ callLine, node, arg: node.arguments[0], methodName: expr.name.text, label });
            }
        }
        ts.forEachChild(node, visit);
    }
    visit(sourceFile);

    // Pre-pass: collapse mismatches sharing the same `(line, methodName)`. A `.each` block records
    // several at one line with differing content; keeping one would silently freeze the snapshot to
    // the first iteration, so drop ALL to surface the conflict (expand `.each` or use 'skip-snapshot').
    const byLine = new Map<string, SnapshotMismatch[]>();
    for (const m of mismatches) {
        const key = `${m.line}|${m.methodName ?? ''}`;
        let arr = byLine.get(key);
        if (!arr) {
            arr = [];
            byLine.set(key, arr);
        }
        arr.push(m);
    }
    const filteredMismatches: SnapshotMismatch[] = [];
    const collectFiltered = (group: SnapshotMismatch[]): void => {
        if (group.length === 1) {
            filteredMismatches.push(group[0]);
            return;
        }
        const allEqual = group.every((m) => m.actualDiagram === group[0].actualDiagram);
        if (allEqual) {
            filteredMismatches.push(group[0]);
            return;
        }
        const m = group[0];
        logWarning(
            `  ⚠️ Skipped ${relPath}:${m.line} — "${m.label}" (${group.length} iterations produced different snapshots — expand test.each/describe.each or use 'skip-snapshot')`
        );
        skipped += group.length;
    };
    byLine.forEach(collectFiltered);

    // Match mismatches to .check() calls using nearest-line matching.
    // Sort mismatches by line so we process them in source order.
    const sortedMismatches = filteredMismatches.sort((a, b) => a.line - b.line);
    const usedCheckCalls = new Set<CheckCallInfo>();

    for (const mismatch of sortedMismatches) {
        // Prefer matching by label when the AST has a unique unused call with that exact label —
        // matching by line alone is fragile when V8's stack-trace line drifts from the AST start
        // line, or when multiple check calls cluster within a few lines of each other.
        let bestMatch: CheckCallInfo | undefined;
        let bestDistance = Infinity;
        if (mismatch.label) {
            const labelMatches = checkCalls.filter(
                (cc) =>
                    !usedCheckCalls.has(cc) &&
                    cc.label === mismatch.label &&
                    (!mismatch.methodName || cc.methodName === mismatch.methodName)
            );
            if (labelMatches.length === 1) {
                bestMatch = labelMatches[0];
                bestDistance = Math.abs(bestMatch.callLine - mismatch.line);
            } else if (labelMatches.length > 1) {
                // Multiple calls share the same label — disambiguate by nearest-line within the set.
                for (const cc of labelMatches) {
                    const distance = Math.abs(cc.callLine - mismatch.line);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestMatch = cc;
                    }
                }
            }
        }

        if (!bestMatch) {
            // Fallback: nearest-line match across all unused calls with matching methodName.
            for (const cc of checkCalls) {
                if (usedCheckCalls.has(cc)) {
                    continue;
                }
                if (mismatch.methodName && cc.methodName !== mismatch.methodName) {
                    continue;
                }
                const distance = Math.abs(cc.callLine - mismatch.line);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = cc;
                }
            }
        }

        if (!bestMatch || bestDistance > 5) {
            logWarning(
                `  ⚠️ Skipped ${relPath}:${mismatch.line} — "${mismatch.label}" (could not find .check() call in AST)`
            );
            skipped++;
            continue;
        }

        usedCheckCalls.add(bestMatch);

        const result = resolveTemplateLiteral(ts, sourceFile, bestMatch.arg, varDeclarations, relPath, mismatch);
        if (result) {
            const built = buildReplacementText(source, result.start, result.end, mismatch.actualDiagram);
            replacements.push({
                start: result.start,
                end: result.end,
                newText: built.text,
                line: mismatch.line,
                label: mismatch.label,
                indentFixed: built.indentFixed,
            });
        }
    }

    return { replacements, skipped };
}

/**
 * Scans all .check(`...`) template literals in a file and returns replacements for any
 * whose indentation doesn't match line-indent + 4. Does not require a recorded mismatch.
 */
function findIndentationFixes(ts: Typescript, source: string, file: string): Replacement[] {
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, /* setParentNodes */ true);
    const fixes: Replacement[] = [];

    function visit(node: any): void {
        if (ts.isCallExpression(node)) {
            const expr = node.expression;
            if (
                ts.isPropertyAccessExpression(expr) &&
                SNAPSHOT_CHECK_METHODS.has(expr.name.text) &&
                node.arguments.length >= 1
            ) {
                const arg = node.arguments[0];
                if (ts.isNoSubstitutionTemplateLiteral(arg)) {
                    const start = arg.getStart(sourceFile);
                    const end = arg.getEnd();
                    const original = source.slice(start, end);
                    const originalLines = original.slice(1, -1).split('\n'); // strip backticks

                    // Only multi-line templates can have indentation issues
                    if (originalLines.length <= 1) {
                        ts.forEachChild(node, visit);
                        return;
                    }

                    // Find existing content indent
                    let existingIndent = '';
                    for (let i = 1; i < originalLines.length; i++) {
                        if (originalLines[i].trim().length > 0) {
                            const m = originalLines[i].match(/^(\s*)/);
                            existingIndent = m ? m[1] : '';
                            break;
                        }
                    }

                    // Derive expected indent from the line containing the backtick
                    let lineStart = start - 1;
                    while (lineStart >= 0 && source[lineStart] !== '\n') {
                        lineStart--;
                    }
                    lineStart++;
                    const lineLeadMatch = source.slice(lineStart).match(/^(\s*)/);
                    const lineIndent = lineLeadMatch ? lineLeadMatch[1] : '';
                    const expectedIndent = lineIndent + '    ';

                    if (existingIndent === expectedIndent) {
                        ts.forEachChild(node, visit);
                        return; // already correct
                    }

                    // Re-apply correct indent: strip existing indent, apply expected
                    const contentLines = originalLines.slice(1, -1); // skip line after opening backtick and closing indent line
                    const stripped = contentLines.map((l) => l.slice(existingIndent.length));
                    const fixedLines = stripped.map((l) => (l.trim() ? expectedIndent + l : ''));
                    const closingIndent = lineIndent;
                    const newText = '`\n' + fixedLines.join('\n') + '\n' + closingIndent + '`';

                    const callLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
                    // Try to extract the label from the second argument of the GridRows constructor call
                    let label = '';
                    const receiver = expr.expression; // the object .check() is called on
                    if (
                        ts.isNewExpression(receiver) &&
                        receiver.arguments &&
                        receiver.arguments.length >= 2 &&
                        ts.isStringLiteral(receiver.arguments[1])
                    ) {
                        label = receiver.arguments[1].text;
                    }

                    fixes.push({ start, end, newText, line: callLine, label, indentFixed: true });
                }
            }
        }
        ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return fixes;
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
            `  ⚠️ Skipped ${relPath}:${mismatch.line} — "${mismatch.label}" (tagged template with substitutions)`
        );
        return null;
    }

    // Case 4: Identifier reference — `.check(myVar)` where `const myVar = \`...\``
    // Special case: `undefined` literal — replace it with a new template literal
    if (ts.isIdentifier(arg)) {
        const varName = arg.text;
        if (varName === 'undefined') {
            return { start: arg.getStart(sourceFile), end: arg.getEnd() };
        }
        const decl = varDeclarations.get(varName);
        if (decl === null) {
            logWarning(
                `  ⚠️ Skipped ${relPath}:${mismatch.line} — "${mismatch.label}" (variable "${varName}" is declared multiple times)`
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
            `  ⚠️ Skipped ${relPath}:${mismatch.line} — "${mismatch.label}" (variable "${varName}" is not a static string or template literal)`
        );
        return null;
    }

    // Case 5: Template with substitutions or other unsupported expression — skip
    logWarning(
        `  ⚠️ Skipped ${relPath}:${mismatch.line} — "${mismatch.label}" (argument is not a static string or template literal)`
    );
    return null;
}

/**
 * Builds the replacement text for a check() argument. Indentation is derived from the line at
 * `start` (content +4 spaces, closing backtick at base indent), also correcting any pre-existing
 * wrong indent. `indentFixed` in the result is true when the original indentation was wrong.
 */
function buildReplacementText(
    source: string,
    start: number,
    end: number,
    actualDiagram: string
): { text: string; indentFixed: boolean } {
    // Derive indent from the leading whitespace of the line containing `start`
    let lineStart = start - 1;
    while (lineStart >= 0 && source[lineStart] !== '\n') {
        lineStart--;
    }
    lineStart++; // move past '\n' (or stay at 0)
    const lineLeadMatch = source.slice(lineStart).match(/^(\s*)/);
    const lineIndent = lineLeadMatch ? lineLeadMatch[1] : '';
    const contentIndent = lineIndent + '    ';
    const closingIndent = lineIndent;

    // Detect whether the existing template already has correct indentation
    // (so we can report a fix when it didn't)
    const original = source.slice(start, end);
    const originalContent = original.slice(1, original.startsWith('`') ? -1 : -1);
    const originalLines = originalContent.split('\n');
    let existingContentIndent = '';
    for (let i = 1; i < originalLines.length; i++) {
        if (originalLines[i].trim().length > 0) {
            const m = originalLines[i].match(/^(\s*)/);
            existingContentIndent = m ? m[1] : '';
            break;
        }
    }
    const indentFixed = originalLines.length > 1 && existingContentIndent !== contentIndent;

    // Escape the template-literal metacharacters so the file bytes round-trip to the same runtime
    // string. Backslash MUST come first, else the next two passes' added backslashes get re-escaped.
    const escapeForTemplate = (s: string): string =>
        s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    const diagramLines = unindentText(actualDiagram).split('\n');
    const indentedLines = diagramLines.map((line) => (line.trim() ? contentIndent + escapeForTemplate(line) : ''));

    return { text: '`\n' + indentedLines.join('\n') + '\n' + closingIndent + '`', indentFixed };
}

function relativePath(file: string): string {
    try {
        return path.relative(process.cwd(), file);
    } catch {
        return file;
    }
}
