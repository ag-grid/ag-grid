import type { AgColumn, BeanCollection } from 'ag-grid-community';

import { createHeaderReferenceEntries, isAmbiguousHeaderReference } from '../formula/headerReferences';
import type { ColumnSuggestion } from './calculatedColumnForm';
import { replaceBracketReferences } from './calculatedColumnUtils';

interface CalculatedColumnReferenceError {
    type: 'unknown' | 'ambiguous';
    reference: string;
}

interface CalculatedColumnReferenceMapper {
    suggestions: ColumnSuggestion[];
    toInternalExpression(expression: string): { expression: string } | { error: CalculatedColumnReferenceError };
    toDisplayExpression(expression: string): string;
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
                  'Ambiguous column reference "${variable}". Use the Columns list or a more specific group path.',
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
    const colIdToReference = new Map(entries.map((entry) => [entry.colId, entry.reference]));

    return {
        suggestions: entries.map(({ leafName, reference }) => ({
            type: 'column',
            label: reference,
            value: reference,
            searchText: `${reference} ${leafName}`,
        })),
        toInternalExpression(expression: string) {
            let error: CalculatedColumnReferenceError | undefined;
            const internalExpression = replaceBracketReferences(expression, (ref) => {
                const colId = referenceToColId.get(ref);
                if (colId != null) {
                    return colId;
                }
                error ??= {
                    type: isAmbiguousHeaderReference(entries, ref) ? 'ambiguous' : 'unknown',
                    reference: ref,
                };
                return ref;
            });
            return error !== undefined ? { error } : { expression: internalExpression };
        },
        toDisplayExpression(expression: string) {
            return replaceBracketReferences(expression, (ref) => colIdToReference.get(ref) ?? ref);
        },
    };
}
