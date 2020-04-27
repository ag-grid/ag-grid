import { Bean, Autowired } from '../context/context';
import { Column } from '../entities/column';
import { RowNode } from '../entities/rowNode';
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { ExpressionService } from '../valueService/expressionService';
import { ValueFormatterParams } from '../entities/colDef';

@Bean('valueFormatterService')
export class ValueFormatterService {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;

    public formatValue(
        column: Column,
        node: RowNode | null,
        $scope: any,
        value: any,
        suppliedFormatter?: (value: any) => string,
        useFormatterFromColumn = true
    ): string {
        let result: string = null;
        let formatter: ((value: any) => string) | string;

        const colDef = column.getColDef();

        if (suppliedFormatter) {
            // favour supplied, e.g. set filter items can have their own value formatters
            formatter = suppliedFormatter;
        } else if (useFormatterFromColumn) {
            // if floating, give preference to the floating formatter
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
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };

            // originally we put the angular 1 scope here, but we don't want the scope
            // in the params interface, as other frameworks will see the interface, and
            // angular 1 is not cool any more. so we hack the scope in here (we cannot
            // include it above, as it's not in the interface, so would cause a compile error).
            // in the future, when we stop supporting angular 1, we can take this out.
            (params as any).$scope = $scope;

            result = this.expressionService.evaluate(formatter, params);
        } else if (colDef.refData) {
            return colDef.refData[value] || '';
        }

        // if we don't do this, then arrays get displayed as 1,2,3, but we want 1, 2, 3 (ie with spaces)
        if (result != null && Array.isArray(value)) {
            result = value.join(', ');
        }

        return result;
    }
}
