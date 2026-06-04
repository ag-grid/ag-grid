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
    const caseInsensitiveReferenceToColIds = new Map<string, string[]>();
    const colIdToReference = new Map(entries.map((entry) => [entry.colId, entry.reference]));

    for (let i = 0, len = entries.length; i < len; ++i) {
        const entry = entries[i];
        const normalisedReference = normaliseReference(entry.reference);
        const colIds = caseInsensitiveReferenceToColIds.get(normalisedReference) ?? [];
        colIds.push(entry.colId);
        caseInsensitiveReferenceToColIds.set(normalisedReference, colIds);
    }

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
                const exactColId = referenceToColId.get(ref);
                if (exactColId != null) {
                    return exactColId;
                }

                const caseInsensitiveColIds = caseInsensitiveReferenceToColIds.get(normaliseReference(ref));
                const colId = caseInsensitiveColIds?.length === 1 ? caseInsensitiveColIds[0] : undefined;
                if (colId != null) {
                    return colId;
                }
                const isAmbiguous =
                    (caseInsensitiveColIds?.length ?? 0) > 1 || isAmbiguousHeaderReference(entries, ref, true);
                error ??= {
                    type: isAmbiguous ? 'ambiguous' : 'unknown',
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

function normaliseReference(reference: string): string {
    return reference.toLocaleLowerCase();
}
