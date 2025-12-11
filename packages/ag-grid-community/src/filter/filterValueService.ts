import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ValueGetterFunc } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import type { IRowNode } from '../interfaces/iRowNode';

export class FilterValueService extends BeanStub implements NamedBean {
    beanName: BeanName = 'filterValueSvc';

    public getValue(column: AgColumn, rowNode?: IRowNode | null, filterValueGetterOverride?: string | ValueGetterFunc) {
        if (!rowNode) {
            return;
        }
        const { selectableFilter, valueSvc, formula } = this.beans;
        const filterValueGetter =
            filterValueGetterOverride ??
            selectableFilter?.getFilterValueGetter(column.getColId()) ??
            column.getColDef().filterValueGetter;
        if (filterValueGetter) {
            return valueSvc.executeValueGetterNoCache(filterValueGetter, rowNode.data, column, rowNode);
        }
        const value = valueSvc.getValue(column, rowNode, false, 'api');
        if (column.isAllowFormula() && formula?.isFormula(value)) {
            return formula.resolveValue(column, rowNode as RowNode);
        }
        return value;
    }
}
