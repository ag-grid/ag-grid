import { Bean, Autowired } from "../context/context";
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ExpressionService } from "../valueService/expressionService";
import { ValueFormatterParams } from "../entities/colDef";

@Bean('valueFormatterService')
export class ValueFormatterService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;

    public formatValue(column: Column,
                       rowNode: RowNode | null,
                       $scope: any,
                       value: any): string {

        let formatter: (value: any) => string;
        const colDef = column.getColDef();
        // if floating, give preference to the floating formatter
        if (rowNode && rowNode.rowPinned) {
            formatter = colDef.pinnedRowValueFormatter ? colDef.pinnedRowValueFormatter : colDef.valueFormatter;
        } else {
            formatter = colDef.valueFormatter;
        }
        let result: string = null;
        if (formatter) {
            const params: ValueFormatterParams = {
                value: value,
                node: rowNode,
                data: rowNode ? rowNode.data : null,
                colDef: column.getColDef(),
                column: column,
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
        if ((result === null || result === undefined) && Array.isArray(value)) {
            result = value.join(', ');
        }

        return result;
    }
}
