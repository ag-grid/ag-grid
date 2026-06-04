import type { BeanCollection, IRowNode, RowNode } from 'ag-grid-community';

export function refreshFormulas(beans: BeanCollection, rowNode?: IRowNode | string): boolean {
    const formulaSvc = beans.formula;
    if (!formulaSvc?.isEvaluationActive()) {
        return false; // No-op if formulas are not active
    }

    if (rowNode === undefined) {
        if (!formulaSvc.hasCachedRows()) {
            return false; // No-op if nothing is cached
        }
        formulaSvc.refreshFormulas(true);
        return true;
    }

    // Both the RowNode overload and the string-id overload are handled by `refreshRow` — the
    // string path consults every row-model source (body, pinned-top, pinned-bottom) and drops
    // each matching chain. An unknown id is a silent no-op.
    return formulaSvc.refreshRow(rowNode as RowNode | string);
}
