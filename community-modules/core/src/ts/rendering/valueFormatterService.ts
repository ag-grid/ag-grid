import { Bean, Autowired } from '../context/context';
import { Column } from '../entities/column';
import { ExpressionService } from '../valueService/expressionService';
import { ValueFormatterParams } from '../entities/colDef';
import { BeanStub } from "../context/beanStub";
import { IRowNode } from '../interfaces/iRowNode';

@Bean('valueFormatterService')
export class ValueFormatterService extends BeanStub {

    @Autowired('expressionService') private expressionService: ExpressionService;

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
            const params: ValueFormatterParams = {
                value,
                node,
                data: node ? node.data : null,
                colDef,
                column,
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context
            };
            if (typeof formatter === 'function') {
                result = formatter(params);
            } else {
                result = this.expressionService.evaluate(formatter, params);
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
