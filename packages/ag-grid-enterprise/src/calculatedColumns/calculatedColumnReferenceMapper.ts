import type { AgColumn, BeanCollection } from 'ag-grid-community';

import type { ColumnSuggestion } from './calculatedColumnForm';

interface ColumnReferenceEntry {
    colId: string;
    leafName: string;
    path: string[];
    reference: string;
}

interface CalculatedColumnReferenceError {
    type: 'unknown' | 'ambiguous';
    reference: string;
}

interface CalculatedColumnReferenceMapper {
    suggestions: ColumnSuggestion[];
    toDisplayExpression(expression: string): string;
    toInternalExpression(expression: string): { expression: string } | { error: CalculatedColumnReferenceError };
}

type TranslateFn = (key: string, defaultValue: string, variableValues?: string[]) => string;

export function translateCalculatedColumnReferenceError(
    error: CalculatedColumnReferenceError,
    translate: TranslateFn
): string {
    const [localeKey, defaultMessage] =
        error.type === 'ambiguous'
            ? [
                  'calculatedColumnExpressionAmbiguousReference',
                  'Ambiguous column reference "${variable}". Use a more specific column reference.',
              ]
            : ['calculatedColumnExpressionUnknownReference', 'Unknown column reference "${variable}".'];
    return translate(localeKey, defaultMessage, [error.reference]).replace('${variable}', error.reference);
}

export function createCalculatedColumnReferenceMapper(
    beans: BeanCollection,
    columns: AgColumn[],
    excludedColId: string
): CalculatedColumnReferenceMapper {
    const entries = columns
        .filter((column) => column.getColId() !== excludedColId)
        .map<ColumnReferenceEntry>((column) => {
            const path = getColumnPath(beans, column);
            return { colId: column.getColId(), leafName: path[path.length - 1], path, reference: '' };
        });

    const candidateCounts = new Map<string, number>();
    for (const entry of entries) {
        for (const candidate of getReferenceCandidates(entry.path)) {
            candidateCounts.set(candidate, (candidateCounts.get(candidate) ?? 0) + 1);
        }
    }

    const fullPathSuffix = new Map<string, number>();
    for (const entry of entries) {
        const unique = getReferenceCandidates(entry.path).find((value) => candidateCounts.get(value) === 1);
        if (unique) {
            entry.reference = unique;
            continue;
        }
        // No candidate is unique — the full path itself collides, so suffix every occurrence with (N).
        const fullPath = joinReferencePath(entry.path);
        const occurrence = (fullPathSuffix.get(fullPath) ?? 0) + 1;
        fullPathSuffix.set(fullPath, occurrence);
        entry.reference = `${fullPath} (${occurrence})`;
    }

    const colIdToReference = new Map(entries.map((entry) => [entry.colId, entry.reference]));
    const referenceToColId = new Map(entries.map((entry) => [entry.reference, entry.colId]));
    const selectedReferences = new Set(entries.map((entry) => entry.reference));

    return {
        suggestions: entries.map(({ leafName, reference }) => ({
            type: 'column',
            label: reference,
            value: reference,
            searchText: `${reference} ${leafName}`,
        })),
        toDisplayExpression(expression: string) {
            return replaceBracketReferences(expression, (ref) => colIdToReference.get(ref) ?? ref);
        },
        toInternalExpression(expression: string) {
            let error: CalculatedColumnReferenceError | undefined;
            const nextExpression = replaceBracketReferences(expression, (ref) => {
                const colId = referenceToColId.get(ref);
                if (colId) {
                    return colId;
                }
                error ??= {
                    type: (candidateCounts.get(ref) ?? 0) > 1 && !selectedReferences.has(ref) ? 'ambiguous' : 'unknown',
                    reference: ref,
                };
                return ref;
            });
            return error !== undefined ? { error } : { expression: nextExpression };
        },
    };
}

function getColumnPath(beans: BeanCollection, column: AgColumn): string[] {
    const leaf = getUsableName(beans.colNames.getDisplayNameForColumn(column, 'header'), column.getColId());
    const groups: string[] = [];
    let parent = column.getOriginalParent();
    while (parent) {
        if (!parent.isPadding()) {
            groups.unshift(
                getUsableName(
                    beans.colNames.getDisplayNameForProvidedColumnGroup(null, parent, 'header'),
                    parent.getGroupId()
                )
            );
        }
        parent = parent.getOriginalParent();
    }
    return [...groups, leaf];
}

function getUsableName(name: string | null | undefined, fallback: string): string {
    return name?.trim() || fallback.trim() || fallback;
}

function getReferenceCandidates(path: string[]): string[] {
    const candidates: string[] = [];
    for (let start = path.length - 1; start >= 0; start--) {
        const candidate = joinReferencePath(path.slice(start));
        if (candidate) {
            candidates.push(candidate);
        }
    }
    return candidates;
}

function joinReferencePath(path: string[]): string {
    return path.filter(Boolean).join(' ');
}

// String-literal handling mirrors the parser's isInsideStringLiteral in formula/ast/parsers.ts —
// keep the two in sync if either side adds new quote-escape semantics.
function replaceBracketReferences(expression: string, replaceReference: (reference: string) => string): string {
    let result = '';
    let inString = false;
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if (char === '"') {
            result += char;
            if (expression[i + 1] === '"') {
                result += expression[i + 1];
                i++;
            } else {
                inString = !inString;
            }
            continue;
        }
        if (!inString && char === '[') {
            const end = expression.indexOf(']', i + 1);
            if (end === -1) {
                result += char;
                continue;
            }
            result += `[${replaceReference(expression.slice(i + 1, end))}]`;
            i = end;
            continue;
        }
        result += char;
    }
    return result;
}
