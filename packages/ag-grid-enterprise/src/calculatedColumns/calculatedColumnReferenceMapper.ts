import type { AgColumn, BeanCollection } from 'ag-grid-community';

import { createHeaderReferenceEntries, isAmbiguousHeaderReference } from '../formula/headerReferences';
import type { ColumnSuggestion } from './calculatedColumnForm';

interface CalculatedColumnReferenceError {
    type: 'unknown' | 'ambiguous';
    reference: string;
}

interface CalculatedColumnReferenceMapper {
    suggestions: ColumnSuggestion[];
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
    const entries = createHeaderReferenceEntries(beans, columns, excludedColId);
    const referenceToColId = new Map(entries.map((entry) => [entry.reference, entry.colId]));

    return {
        suggestions: entries.map(({ leafName, reference }) => ({
            type: 'column',
            label: reference,
            value: reference,
            searchText: `${reference} ${leafName}`,
        })),
        toInternalExpression(expression: string) {
            let error: CalculatedColumnReferenceError | undefined;
            visitBracketReferences(expression, (ref) => {
                if (referenceToColId.has(ref)) {
                    return;
                }
                error ??= {
                    type: isAmbiguousHeaderReference(entries, ref) ? 'ambiguous' : 'unknown',
                    reference: ref,
                };
            });
            return error !== undefined ? { error } : { expression };
        },
    };
}

// String-literal handling mirrors the parser's isInsideStringLiteral in formula/ast/parsers.ts —
// keep the two in sync if either side adds new quote-escape semantics.
function visitBracketReferences(expression: string, visitReference: (reference: string) => void): void {
    let inString = false;
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if (char === '"') {
            if (expression[i + 1] === '"') {
                i++;
            } else {
                inString = !inString;
            }
            continue;
        }
        if (!inString && char === '[') {
            const end = expression.indexOf(']', i + 1);
            if (end === -1) {
                continue;
            }
            visitReference(expression.slice(i + 1, end));
            i = end;
        }
    }
}
