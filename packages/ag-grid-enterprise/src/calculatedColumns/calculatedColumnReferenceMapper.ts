import type { AgColumn, BeanCollection } from 'ag-grid-community';
import { isSpecialCol } from 'ag-grid-community';

import { parseFormula } from '../formula/ast/parsers';
import type { CellRef, FormulaNode } from '../formula/ast/utils';
import { FormulaError, FormulaParseError } from '../formula/ast/utils';
import { createHeaderReferenceEntries, isAmbiguousHeaderReference } from '../formula/headerReferences';
import { a1LabelToColIndex } from '../formula/refUtils';
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
        mode?: 'diagnostics'
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
    const getRestrictedFormulaReference = (expression: string): string | undefined => {
        if (!restrictedColIds.size) {
            return;
        }
        let ast: FormulaNode;
        try {
            ast = parseCalculatedFormula(beans, expression);
        } catch (error) {
            if (!(error instanceof FormulaParseError)) {
                throw error;
            }
            // live edits may be incomplete; syntax validation belongs to deferred apply
            return;
        }
        for (const column of visitReferencedColumns(beans, ast)) {
            if (restrictedColIds.has(column.colId)) {
                return colIdToReference.get(column.colId) ?? column.colId;
            }
        }
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
        toInternalExpression(expression: string, mode?: 'diagnostics') {
            const unchanged = originalExpression !== undefined && expression === originalDisplayExpression;
            if (unchanged && mode !== 'diagnostics') {
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
            if (!unchanged) {
                restrictedReference ??= getRestrictedFormulaReference(internalExpression);
            }
            if (!unchanged && restrictedReference !== undefined) {
                error = { type: 'restricted', reference: restrictedReference, range: restrictedRange };
            }
            if (unchanged) {
                // grandfather restrictions, but still diagnose missing columns when reopening a live draft
                return {
                    expression: originalExpression,
                    error: originalError ? { ...originalError, range: originalErrorRange } : error,
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
        return [...new Set(visitReferencedColumns(beans, parseCalculatedFormula(beans, expression)))];
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

/** Yields each directly referenced column, expanding ranges; duplicates are yielded as encountered. */
function* visitReferencedColumns(beans: BeanCollection, ast: FormulaNode): Generator<AgColumn> {
    yield* visitNodeColumns(
        beans,
        beans.colModel.colsList.filter((column) => column.primary),
        ast
    );
}

function* visitNodeColumns(beans: BeanCollection, primaryColumns: AgColumn[], node: FormulaNode): Generator<AgColumn> {
    if (node.type === 'operation') {
        for (const operand of node.operands) {
            yield* visitNodeColumns(beans, primaryColumns, operand);
        }
        return;
    }
    const cell = node.value;
    if (cell == null || typeof cell !== 'object') {
        return;
    }
    const start = resolveColumn(beans, primaryColumns, cell.column);
    const end = cell.endColumn ? resolveColumn(beans, primaryColumns, cell.endColumn) : start;
    if (!start || !end) {
        return;
    }
    if (start === end) {
        yield start;
        return;
    }
    // Ranges span A1 label positions, so expand them over the same primary list the labels index into.
    const startIndex = primaryColumns.indexOf(start);
    const endIndex = primaryColumns.indexOf(end);
    if (startIndex < 0 || endIndex < 0) {
        return;
    }
    for (let i = Math.min(startIndex, endIndex), last = Math.max(startIndex, endIndex); i <= last; ++i) {
        yield primaryColumns[i];
    }
}

function resolveColumn(beans: BeanCollection, primaryColumns: AgColumn[], ref: CellRef): AgColumn | undefined {
    if (!ref.absolute) {
        return beans.colModel.colsById[ref.id];
    }
    // the first deferred dialog opens before the formula service builds its A1 map
    const index = a1LabelToColIndex(ref.id);
    return index < 0 ? undefined : primaryColumns[index];
}

function normaliseReference(reference: string): string {
    return reference.toLocaleLowerCase();
}
