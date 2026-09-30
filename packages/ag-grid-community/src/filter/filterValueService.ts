import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _resolvePivotColumnForRow } from '../entities/agColumn';
import type { ColDef, ValueGetterFunc, ValueGetterParams } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import type { IRowNode } from '../interfaces/iRowNode';

/**
 * The input a filter's value is read from, by kind as a field path and a getter expression can be spelled alike.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface FilterValueSource {
    /** In read order: filter value getter, calculated expression, value getter, field; `-1` for none. */
    readonly kind: number;
    readonly source: unknown;
    readonly readsFormula: boolean;
}

/**
 * Mirrors the precedence of `getValueWithGetter` and `ValueService.getValueFromData`, which must stay in step.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getFilterValueSource(
    colDef: ColDef,
    filterValueGetter: string | ValueGetterFunc | undefined
): FilterValueSource {
    // the getters and the field count when truthy, as the reads test them; a calculated expression when defined
    const sources = [
        filterValueGetter || undefined,
        colDef.calculatedExpression,
        colDef.valueGetter || undefined,
        colDef.field || undefined,
    ];
    const kind = sources.findIndex((source) => source !== undefined);
    // formulas are read wherever neither a filter value getter nor a calculated expression supplies the value
    return { kind, source: sources[kind], readsFormula: kind !== 0 && kind !== 1 && !!colDef.allowFormula };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class FilterValueService extends BeanStub implements NamedBean {
    beanName: BeanName = 'filterValueSvc';

    public getValue(column: AgColumn, rowNode: IRowNode) {
        return this.getValueWithGetter(
            column,
            rowNode,
            this.beans.selectableFilter?.getFilterValueGetter(column.colId) ?? column.colDef.filterValueGetter
        );
    }

    /** Reads through this filter value getter alone, or the column's own value without one; see `_getFilterValueSource`. */
    public getValueWithGetter(
        column: AgColumn,
        rowNode: IRowNode,
        filterValueGetter: string | ValueGetterFunc | undefined
    ) {
        const colDef = column.colDef;
        const beans = this.beans;
        const valueSvc = beans.valueSvc;
        if (filterValueGetter) {
            const isFunction = typeof filterValueGetter === 'function';
            const expressionSvc = beans.expressionSvc;
            if (!isFunction && !expressionSvc) {
                return undefined;
            }

            const colModel = beans.colModel;
            const params: ValueGetterParams = {
                api: beans.gridApi,
                context: beans.gridOptions.context,
                data: rowNode.data,
                node: rowNode,
                column,
                colDef,
                getValue: (colKey) => {
                    const col = colModel.getCol(colKey);
                    // arbitrary user-requested field: may be a pivot result column, so resolve it
                    return col ? valueSvc.getValueFromData(_resolvePivotColumnForRow(col, rowNode), rowNode) : null;
                },
            };

            return isFunction ? filterValueGetter(params) : expressionSvc!.evaluate(filterValueGetter, params);
        }

        // Filtering never reads a pivot-result column on a leaf row: leaf rows are filtered with primary
        // columns; pivot-result columns are only evaluated against group rows (aggregate path), where the
        // pivot block is skipped anyway. So pivot resolution can never fire here.
        const value = valueSvc.getValueFromData(column, rowNode);
        if (column.allowFormula) {
            const formula = beans.formula;
            if (formula?.isFormula(value)) {
                return formula.resolveValue(column, rowNode as RowNode);
            }
        }
        return value;
    }
}
