import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ValueGetterFunc, ValueGetterParams } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import type { IRowNode } from '../interfaces/iRowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class FilterValueService extends BeanStub implements NamedBean {
    beanName: BeanName = 'filterValueSvc';

    public getValue(column: AgColumn, rowNode: IRowNode, filterValueGetterOverride?: string | ValueGetterFunc) {
        const colDef = column.colDef;
        const beans = this.beans;
        const filterValueGetter =
            filterValueGetterOverride ??
            beans.selectableFilter?.getFilterValueGetter(column.colId) ??
            colDef.filterValueGetter;

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
                getValue: (field) => {
                    const col = colModel.getCol(field);
                    return col ? valueSvc.getValue(col, rowNode, 'data') : null;
                },
            };

            return isFunction ? filterValueGetter(params) : expressionSvc!.evaluate(filterValueGetter, params);
        }

        const value = valueSvc.getValue(column, rowNode, 'data');
        if (column.colDef.allowFormula) {
            const formula = beans.formula;
            if (formula?.isFormula(value)) {
                return formula.resolveValue(column, rowNode as RowNode);
            }
        }
        return value;
    }
}
