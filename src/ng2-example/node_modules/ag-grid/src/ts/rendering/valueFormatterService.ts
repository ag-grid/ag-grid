
import {Bean, Autowired} from "../context/context";
import {Column} from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

@Bean('valueFormatterService')
export class ValueFormatterService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public formatValue(column: Column,
                       rowNode: RowNode,
                       $scope: any,
                       rowIndex: number,
                       value: any): string {
        var formatter: (value:any)=>string;
        var colDef = column.getColDef();
        // if floating, give preference to the floating formatter
        if (rowNode.floating) {
            formatter = colDef.floatingCellFormatter ? colDef.floatingCellFormatter : colDef.cellFormatter;
        } else {
            formatter = colDef.cellFormatter;
        }
        var result: string = null;
        if (formatter) {
            var params = {
                value: value,
                node: rowNode,
                column: column,
                $scope: $scope,
                rowIndex: rowIndex,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            result = formatter(params);
        }
        return result;
    }
}