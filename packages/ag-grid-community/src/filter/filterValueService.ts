import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection, BeanName } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ValueGetterParams } from '../entities/colDef';
import type { IRowNode } from '../interfaces/iRowNode';
import type { ExpressionService } from '../valueService/expressionService';
import type { ValueService } from '../valueService/valueService';

export class FilterValueService extends BeanStub implements NamedBean {
    beanName: BeanName = 'filterValueService';

    private valueService: ValueService;
    private expressionService?: ExpressionService;

    public wireBeans(beans: BeanCollection): void {
        this.valueService = beans.valueService;
        this.expressionService = beans.expressionService;
    }

    public getValue(column: AgColumn, rowNode?: IRowNode | null) {
        if (!rowNode) {
            return;
        }
        const colDef = column.getColDef();
        const { filterValueGetter } = colDef;
        if (filterValueGetter) {
            return this.executeFilterValueGetter(filterValueGetter, rowNode.data, column, rowNode, colDef);
        }
        return this.valueService.getValue(column, rowNode);
    }

    private executeFilterValueGetter(
        // eslint-disable-next-line @typescript-eslint/ban-types
        valueGetter: string | Function,
        data: any,
        column: AgColumn,
        node: IRowNode,
        colDef: ColDef
    ): any {
        const params: ValueGetterParams = this.gos.addGridCommonParams({
            data,
            node,
            column,
            colDef,
            getValue: this.valueService.getValueCallback.bind(this, node),
        });

        if (typeof valueGetter === 'function') {
            return valueGetter(params);
        }
        return this.expressionService?.evaluate(valueGetter, params);
    }
}
