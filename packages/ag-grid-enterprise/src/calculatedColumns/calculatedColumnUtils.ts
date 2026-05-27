import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { _DATA_TYPE_DERIVED_COL_DEF_PROPERTIES } from 'ag-grid-community';

/**
 * Walks a (possibly nested) columnDefs tree and returns every `colId` and `field` it encounters
 * on leaf columns. Used by `createUniqueColId` to scan the user-provided source of truth for id
 * collisions, matching the same `colId ?? field` lookup the insert/update/remove paths use.
 */
export function collectColIdsAndFields(columnDefs: (ColDef | ColGroupDef)[]): Set<string> {
    const used = new Set<string>();

    const visit = (defs: (ColDef | ColGroupDef)[]) => {
        for (const colDef of defs) {
            if ('children' in colDef) {
                visit(colDef.children);
                continue;
            }

            const { colId, field } = colDef;

            if (colId) {
                used.add(colId);
            }

            if (field) {
                used.add(field);
            }
        }
    };

    visit(columnDefs);
    return used;
}

/**
 * When `cellDataType` changes on a calculated column (e.g. via the Edit dialog moving Boolean →
 * Number), the data-type service does not re-resolve properties it implicitly set for the old
 * type (cellRenderer, valueFormatter, etc.) — they remain on the resolved colDef and leak the
 * previous type's behaviour. This strips those properties from the base before the user's update
 * merges in, but only when the user did not provide them explicitly on the original colDef.
 *
 * @param colDef The current resolved colDef on the AgColumn.
 * @param userColDef The original user-provided colDef (preserves explicit overrides).
 * @param colDefUpdate The incoming patch — only acts when its `cellDataType` differs.
 */
export function clearStaleDataTypeProperties(colDef: ColDef, userColDef: ColDef | null, colDefUpdate: ColDef): ColDef {
    if (colDefUpdate.cellDataType === undefined || colDefUpdate.cellDataType === colDef.cellDataType) {
        return colDef;
    }

    const nextColDef = { ...colDef };
    for (const property of _DATA_TYPE_DERIVED_COL_DEF_PROPERTIES) {
        if (colDefUpdate[property] === undefined && userColDef?.[property] === undefined) {
            delete nextColDef[property];
        }
    }
    return nextColDef;
}

/**
 * Visits every `[ref]` bracket reference in a calculated-column expression and produces a new
 * expression with each reference replaced by the callback's return value. String-literal
 * boundaries (`"..."`) are respected, including the SQL-style `""` escape — brackets inside a
 * string literal are left untouched.
 *
 * Callers that only need to visit (no rewrite) can return the input `ref` unchanged; the returned
 * string is identical to the input in that case.
 *
 * Must stay in sync with the parser's `isInsideStringLiteral` semantics in
 * `formula/ast/parsers.ts`.
 *
 * @param expression The expression to scan, typically the raw `calculatedExpression` value.
 * @param replaceReference Receives each bracketed reference (without the brackets); the return
 *   value replaces the bracketed token in the output expression.
 * @returns The expression with each reference replaced; returns the input verbatim when no
 *   bracket references are present.
 */
export function replaceBracketReferences(expression: string, replaceReference: (reference: string) => string): string {
    let inString = false;
    let result = '';
    let lastIndex = 0;
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
            result += expression.slice(lastIndex, i);
            result += `[${replaceReference(expression.slice(i + 1, end))}]`;
            lastIndex = end + 1;
            i = end;
        }
    }
    return result + expression.slice(lastIndex);
}
