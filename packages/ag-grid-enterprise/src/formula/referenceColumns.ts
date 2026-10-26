import type { AgColumn, BeanCollection } from 'ag-grid-community';

import type { Cell, CellRef, FormulaNode } from './ast/utils';
import { a1LabelToColIndex } from './refUtils';

/** Resolves column membership without reading rows or evaluating values. Unknown endpoints are reported explicitly. */
export function resolveFormulaReferenceColumns(
    beans: BeanCollection,
    primaryColumns: AgColumn[],
    cell: Cell
): { columns: AgColumn[]; unknownColumn?: string } {
    const start = resolveColumn(beans, primaryColumns, cell.column);
    if (!start) {
        return { columns: [], unknownColumn: cell.column.id };
    }
    const end = cell.endColumn ? resolveColumn(beans, primaryColumns, cell.endColumn) : start;
    if (!end) {
        return { columns: [], unknownColumn: cell.endColumn!.id };
    }
    if (start === end) {
        return { columns: [start] };
    }
    const startIndex = primaryColumns.indexOf(start);
    const endIndex = primaryColumns.indexOf(end);
    if (startIndex < 0 || endIndex < 0) {
        return { columns: [] };
    }
    return { columns: primaryColumns.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1) };
}

/** Yields directly referenced columns, expanding ranges in the same primary order as the formula A1 map. */
export function* visitFormulaReferencedColumns(beans: BeanCollection, ast: FormulaNode): Generator<AgColumn> {
    const primaryColumns = beans.colModel.colsList.filter((column) => column.primary);
    function* visit(node: FormulaNode): Generator<AgColumn> {
        if (node.type === 'operation') {
            for (const operand of node.operands) {
                yield* visit(operand);
            }
        } else if (node.value != null && typeof node.value === 'object') {
            yield* resolveFormulaReferenceColumns(beans, primaryColumns, node.value).columns;
        }
    }
    yield* visit(ast);
}

function resolveColumn(beans: BeanCollection, primaryColumns: AgColumn[], ref: CellRef): AgColumn | undefined {
    if (!ref.absolute) {
        return beans.colModel.colsById[ref.id];
    }
    // the first deferred dialog can open before the formula service builds its A1 map
    const index = a1LabelToColIndex(ref.id);
    return index < 0 ? undefined : primaryColumns[index];
}
