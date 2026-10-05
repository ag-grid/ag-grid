import type { AgColumn, BeanCollection } from 'ag-grid-community';
import { isSpecialCol } from 'ag-grid-community';

import { parseFormula } from '../formula/ast/parsers';
import type { CellRef, FormulaNode } from '../formula/ast/utils';
import { FormulaParseError } from '../formula/ast/utils';
import { createHeaderReferenceEntries, isAmbiguousHeaderReference } from '../formula/headerReferences';
import { a1LabelToColIndex } from '../formula/refUtils';
import type { ColumnSuggestion } from './calculatedColumnFormTypes';
import { escapeDisplayReference, replaceBracketReferences } from './calculatedColumnUtils';

interface CalculatedColumnReferenceError {
    type: 'unknown' | 'ambiguous' | 'restricted';
    reference: string;
}

export interface CalculatedColumnReferenceMapper {
    suggestions: ColumnSuggestion[];
    toInternalExpression(expression: string): { expression: string } | { error: CalculatedColumnReferenceError };
    toInternalExpressionBestEffort(expression: string): string;
    toDisplayExpression(expression: string): string;
}

type TranslateFn = (key: string, defaultValue: string, variableValues?: string[]) => string;

export function translateCalculatedColumnReferenceError(
    error: CalculatedColumnReferenceError,
    translate: TranslateFn
): string {
    if (error.type === 'restricted') {
        return translate(
            'calculatedColumnExpressionRestrictedReference',
            'Column "${variable}" cannot be used in this expression.',
            [error.reference]
        ).replace('${variable}', error.reference);
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
    }
): CalculatedColumnReferenceMapper {
    const { isColumnReferenceable, originalExpression } = options ?? {};
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
            const trimmedExpression = expression.trim();
            const formula = trimmedExpression.startsWith('=') ? trimmedExpression : `=${trimmedExpression}`;
            ast = parseFormula(beans, formula, 'absolute');
        } catch (error) {
            if (!(error instanceof FormulaParseError)) {
                throw error;
            }
            // live edits may be incomplete; syntax validation belongs to deferred apply
            return;
        }
        const primaryColumns = beans.colModel.colsList.filter((column) => column.primary);
        const colId = findRestrictedColumn(beans, primaryColumns, ast, restrictedColIds);
        return colId === undefined ? undefined : (colIdToReference.get(colId) ?? colId);
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
        toInternalExpression(expression: string) {
            if (originalExpression !== undefined && expression === originalDisplayExpression) {
                return { expression: originalExpression };
            }
            let error: CalculatedColumnReferenceError | undefined;
            let restrictedReference: string | undefined;
            // Unresolved references are preserved verbatim, so the result doubles as the best-effort
            // conversion the formula check below needs even when a reference error was found.
            const internalExpression = replaceBracketReferences(
                expression,
                (ref) => {
                    const colId = resolveReference(ref);
                    if (restrictedColIds.has(colId ?? ref)) {
                        restrictedReference ??= ref;
                        return undefined;
                    }
                    if (colId != null) {
                        return colId;
                    }
                    const caseInsensitiveColIds = caseInsensitiveReferenceToColIds.get(normaliseReference(ref));
                    const isAmbiguous =
                        (caseInsensitiveColIds?.length ?? 0) > 1 || isAmbiguousHeaderReference(entries, ref, true);
                    error ??= {
                        type: isAmbiguous ? 'ambiguous' : 'unknown',
                        reference: ref,
                    };
                    return undefined;
                },
                true
            );
            restrictedReference ??= getRestrictedFormulaReference(internalExpression);
            if (restrictedReference !== undefined) {
                return { error: { type: 'restricted', reference: restrictedReference } };
            }
            return error !== undefined ? { error } : { expression: internalExpression };
        },
        toInternalExpressionBestEffort(expression: string) {
            if (originalExpression !== undefined && expression === originalDisplayExpression) {
                return originalExpression;
            }
            return replaceBracketReferences(expression, resolveReference, true);
        },
        toDisplayExpression,
    };
}

function findRestrictedColumn(
    beans: BeanCollection,
    primaryColumns: AgColumn[],
    node: FormulaNode,
    restrictedColIds: Set<string>
): string | undefined {
    if (node.type === 'operation') {
        for (const operand of node.operands) {
            const restricted = findRestrictedColumn(beans, primaryColumns, operand, restrictedColIds);
            if (restricted !== undefined) {
                return restricted;
            }
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
        return restrictedColIds.has(start.colId) ? start.colId : undefined;
    }
    // Ranges span A1 label positions, so expand them over the same primary list the labels index into.
    const startIndex = primaryColumns.indexOf(start);
    const endIndex = primaryColumns.indexOf(end);
    if (startIndex < 0 || endIndex < 0) {
        return;
    }
    for (let i = Math.min(startIndex, endIndex), last = Math.max(startIndex, endIndex); i <= last; ++i) {
        const colId = primaryColumns[i].colId;
        if (restrictedColIds.has(colId)) {
            return colId;
        }
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
