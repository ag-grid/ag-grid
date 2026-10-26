import type { AgColumn, BeanCollection } from 'ag-grid-community';
import { isSpecialCol } from 'ag-grid-community';

import type { FormulaSourceReference } from '../formula/ast/parsers';
import { inspectFormulaExpression, parseFormula } from '../formula/ast/parsers';
import type { FormulaNode } from '../formula/ast/utils';
import { FormulaError } from '../formula/ast/utils';
import { createHeaderReferenceEntries, isAmbiguousHeaderReference } from '../formula/headerReferences';
import { resolveFormulaReferenceColumns, visitFormulaReferencedColumns } from '../formula/referenceColumns';
import type { ColumnSuggestion } from './calculatedColumnFormTypes';
import {
    escapeDisplayReference,
    getRestrictedReferenceMessage,
    replaceBracketReferences,
    toFormulaString,
} from './calculatedColumnUtils';

interface CalculatedColumnReferenceError {
    type: 'unknown' | 'ambiguous' | 'restricted';
    reference: string;
    range?: { start: number; end: number };
}

export interface CalculatedColumnReferenceMapper {
    suggestions: ColumnSuggestion[];
    /** The `expression` is always storable: unresolved references are preserved verbatim. */
    toInternalExpression(
        expression: string,
        mode?: 'diagnostics' | 'revalidate',
        references?: FormulaSourceReference[]
    ): { expression: string; error?: CalculatedColumnReferenceError };
    toDisplayExpression(expression: string): string;
}

type TranslateFn = (key: string, defaultValue: string, variableValues?: string[]) => string;

export function translateCalculatedColumnReferenceError(
    error: CalculatedColumnReferenceError,
    translate: TranslateFn
): string {
    if (error.type === 'restricted') {
        return getRestrictedReferenceMessage(translate, error.reference);
    }
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
    excludedColId: string,
    options?: {
        isColumnReferenceable?: (column: AgColumn) => boolean;
        originalExpression?: string;
        originalError?: CalculatedColumnReferenceError;
    }
): CalculatedColumnReferenceMapper {
    const { isColumnReferenceable, originalExpression, originalError } = options ?? {};
    const referenceColumns = columns.filter((column) => !isSpecialCol(column));
    const entries = createHeaderReferenceEntries(beans, referenceColumns, excludedColId);
    const referenceToColId = new Map(entries.map((entry) => [entry.reference, entry.colId]));
    const caseInsensitiveReferenceToColIds = new Map<string, string[]>();
    const colIdToReference = new Map(entries.map((entry) => [entry.colId, entry.reference]));
    const restrictedColIds = new Set<string>();

    for (let i = 0, len = entries.length; i < len; ++i) {
        const entry = entries[i];
        const normalisedReference = normaliseReference(entry.reference);
        const colIds = caseInsensitiveReferenceToColIds.get(normalisedReference) ?? [];
        colIds.push(entry.colId);
        caseInsensitiveReferenceToColIds.set(normalisedReference, colIds);
        if (isColumnReferenceable && !isColumnReferenceable(entry.column)) {
            restrictedColIds.add(entry.colId);
        }
    }

    const resolveReference = (ref: string): string | undefined => {
        const exactColId = referenceToColId.get(ref);
        if (exactColId != null) {
            return exactColId;
        }
        const colIds = caseInsensitiveReferenceToColIds.get(normaliseReference(ref));
        return colIds?.length === 1 ? colIds[0] : undefined;
    };
    const toDisplayExpression = (expression: string): string =>
        replaceBracketReferences(expression, (ref) => escapeDisplayReference(colIdToReference.get(ref) ?? ref));
    // existing expressions remain editable through other fields, even if their references are now restricted
    const originalDisplayExpression =
        originalExpression === undefined ? undefined : toDisplayExpression(originalExpression);
    const getFormulaReferenceError = (
        expression: string,
        references: FormulaSourceReference[],
        checkRestrictions: boolean
    ): CalculatedColumnReferenceError | undefined => {
        let primaryColumns: AgColumn[] | undefined;
        let unknownError: CalculatedColumnReferenceError | undefined;
        for (const { cell, range } of references) {
            // display bracket references are resolved separately by the header mapper
            if (cell.row.current) {
                continue;
            }
            primaryColumns ??= beans.colModel.colsList.filter((column) => column.primary);
            const { columns, unknown } = resolveFormulaReferenceColumns(beans, primaryColumns, cell);
            if (unknown) {
                unknownError ??= { type: 'unknown', reference: expression.slice(range.start, range.end), range };
            }
            if (checkRestrictions) {
                const restricted = columns.find((column) => restrictedColIds.has(column.colId));
                if (restricted) {
                    return {
                        type: 'restricted',
                        reference: colIdToReference.get(restricted.colId) ?? restricted.colId,
                        range,
                    };
                }
            }
        }
        return unknownError;
    };

    return {
        suggestions: entries
            .filter(({ colId }) => !restrictedColIds.has(colId))
            .map(({ leafName, path, reference, suffix }) => ({
                type: 'column',
                label: reference,
                value: escapeDisplayReference(reference),
                searchText: `${reference} ${leafName}`,
                displayPath: suffix ? [...path.slice(0, -1), `${leafName}${suffix}`] : path,
            })),
        toInternalExpression(expression, mode, references) {
            const unchanged = originalExpression !== undefined && expression === originalDisplayExpression;
            const revalidate = mode === 'revalidate';
            if (unchanged && mode === undefined) {
                return { expression: originalExpression, error: originalError };
            }
            let error: CalculatedColumnReferenceError | undefined;
            let restrictedReference: string | undefined;
            let restrictedRange: { start: number; end: number } | undefined;
            let originalErrorRange: { start: number; end: number } | undefined;
            // Restricted references convert like permitted ones and unresolved ones are preserved
            // verbatim, so the result is storable alongside the error and feeds the formula check below.
            const internalExpression = replaceBracketReferences(
                expression,
                (ref, start, end) => {
                    if (originalError && normaliseReference(ref) === normaliseReference(originalError.reference)) {
                        originalErrorRange ??= { start, end };
                    }
                    const colId = resolveReference(ref);
                    if (restrictedColIds.has(colId ?? ref)) {
                        if (restrictedReference === undefined) {
                            restrictedReference = ref;
                            restrictedRange = { start, end };
                        }
                        return colId;
                    }
                    if (colId != null) {
                        return colId;
                    }
                    if (unchanged && beans.colModel.getCol(ref)) {
                        return ref;
                    }
                    const caseInsensitiveColIds = caseInsensitiveReferenceToColIds.get(normaliseReference(ref));
                    const isAmbiguous =
                        (caseInsensitiveColIds?.length ?? 0) > 1 || isAmbiguousHeaderReference(entries, ref, true);
                    error ??= {
                        type: isAmbiguous ? 'ambiguous' : 'unknown',
                        reference: ref,
                        range: { start, end },
                    };
                    return undefined;
                },
                true
            );
            const formulaError = getFormulaReferenceError(
                expression,
                references ?? inspectFormulaExpression(beans, expression).references,
                !unchanged || revalidate || originalError?.type === 'restricted'
            );
            if (formulaError?.type === 'restricted') {
                if (restrictedReference === undefined) {
                    restrictedReference = formulaError.reference;
                    restrictedRange = formulaError.range;
                }
                if (
                    originalError &&
                    normaliseReference(formulaError.reference) === normaliseReference(originalError.reference)
                ) {
                    originalErrorRange ??= formulaError.range;
                }
            } else {
                error ??= formulaError;
            }
            if ((!unchanged || revalidate) && restrictedReference !== undefined) {
                error = { type: 'restricted', reference: restrictedReference, range: restrictedRange };
            }
            if (unchanged) {
                // grandfather restrictions, but still diagnose missing columns when reopening a live draft
                return {
                    expression: originalExpression,
                    error: originalError && !revalidate ? { ...originalError, range: originalErrorRange } : error,
                };
            }
            return { expression: internalExpression, error };
        },
        toDisplayExpression,
    };
}

/** Parses a calculated expression for inspection; 'absolute' keeps A1 labels unresolved, so no rows are needed. */
function parseCalculatedFormula(beans: BeanCollection, expression: string): FormulaNode {
    return parseFormula(beans, toFormulaString(expression), 'absolute');
}

/** Collects direct references without evaluation, retaining complete bracket references when syntax is invalid. */
export function getCalculatedColumnReferences(beans: BeanCollection, expression: string): AgColumn[] {
    try {
        return [...new Set(visitFormulaReferencedColumns(beans, parseCalculatedFormula(beans, expression)))];
    } catch (error) {
        if (!(error instanceof FormulaError)) {
            throw error;
        }
        const columns = new Set<AgColumn>();
        replaceBracketReferences(expression, (ref) => {
            const column = beans.colModel.getCol(ref);
            if (column) {
                columns.add(column);
            }
            return ref;
        });
        return [...columns];
    }
}

function normaliseReference(reference: string): string {
    return reference.toLocaleLowerCase();
}
