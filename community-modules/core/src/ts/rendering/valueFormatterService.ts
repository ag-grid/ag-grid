import { Bean, Autowired } from '../context/context';
import { Column } from '../entities/column';
import { RowNode } from '../entities/rowNode';
import { ExpressionService } from '../valueService/expressionService';
import { ValueFormatterParams } from '../entities/colDef';
import { BeanStub } from "../context/beanStub";

@Bean('valueFormatterService')
export class ValueFormatterService extends BeanStub {

    @Autowired('expressionService') private expressionService: ExpressionService;

    public formatValue(
        column: Column,
        node: RowNode | null,
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
            // if row is pinned, give preference to the pinned formatter
            formatter = node && node.rowPinned && colDef.pinnedRowValueFormatter ?
                colDef.pinnedRowValueFormatter : colDef.valueFormatter;
        }

        if (formatter) {
            const params: ValueFormatterParams = {
                value,
                node,
                data: node ? node.data : null,
                colDef,
                column,
                api: this.gridOptionsService.get('api')!,
                columnApi: this.gridOptionsService.get('columnApi')!,
                context: this.gridOptionsService.get('context')
            };

            result = this.expressionService.evaluate(formatter, params);
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
