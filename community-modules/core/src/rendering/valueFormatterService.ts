import { BeanStub } from "../context/beanStub";
import { Bean } from '../context/context';
import { ValueFormatterParams } from '../entities/colDef';
import { Column } from '../entities/column';
import { IRowNode } from '../interfaces/iRowNode';

@Bean('valueFormatterService')
export class ValueFormatterService extends BeanStub {

    public formatValue(
        column: Column,
        node: IRowNode | null,
        value: any,
        suppliedFormatter?: (value: any) => string,
        useFormatterFromColumn = true
    ): string | null {
        let result: string | null = null;
        let formatter: ((value: any) => string) | string | undefined;

        const colDef = column.getColDef();

        if (suppliedFormatter) {
            // use supplied formatter if provided, e.g. set filter items can have their own value formatters
            formatter = suppliedFormatter;
        } else if (useFormatterFromColumn) {
            formatter = colDef.valueFormatter;
        }

        if (formatter) {
            const params: ValueFormatterParams = this.beans.gos.addGridCommonParams({
                value,
                node,
                data: node ? node.data : null,
                colDef,
                column
            });
            if (typeof formatter === 'function') {
                result = formatter(params);
            } else {
                result = this.beans.expressionService.evaluate(formatter, params);
            }
        } else if (colDef.refData) {
            return colDef.refData[value] || '';
        }

        // if we don't do this, then arrays get displayed as 1,2,3, but we want 1, 2, 3 (i.e. with spaces)
        if (result == null && Array.isArray(value)) {
            result = value.join(', ');
        }

        return result;
    }
}
