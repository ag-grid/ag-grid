
import {Bean, Autowired} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {ValueService} from "../valueService";
import {Column} from "../entities/column";
import {ColGroupDef, ColDef} from "../entities/colDef";
import {ColumnController} from "./columnController";
import {RowNode} from "../entities/rowNode";

@Bean('pivotService')
export class PivotService {

    // these should go into the pivot column creator
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnController') private columnController: ColumnController;

    public createPivotColumnDefs(): (ColGroupDef|ColDef)[] {

        var result: ColGroupDef = {
            children: [],
            headerName: 'Pivot'
        };

        var that = this;

        var pivotColumns = this.columnController.getPivotColumns();
        
        recursivelyAddGroup(result.children, 0);

        function recursivelyAddGroup(parentChildren: (ColGroupDef|ColDef)[], index: number): void {

            var column = pivotColumns[index];
            var values = that.getUniqueValues(column);

            values.forEach( (value: string) => {
                var createGroup = index !== values.length - 1;
                if (createGroup) {
                    var groupDef: ColGroupDef = {
                        children: [],
                        headerName: value
                    };
                    parentChildren.push(groupDef);
                    recursivelyAddGroup(groupDef.children, index+1);
                } else {
                    var colDef: ColDef = {
                        valueGetter: '' + Math.random(),
                        headerName: value
                    };
                    parentChildren.push(colDef);
                }
            });

        }

        return [result];
    }

    private getUniqueValues(column: Column): any[] {
        var uniqueCheck = <any>{};
        var result = <any>[];

        this.rowModel.forEachNode( (node: RowNode)=> {
            if (!node.group) {
                var value = this.valueService.getValue(column, node);
                if (value === "" || value === undefined) {
                    value = null;
                }

                addUniqueValueIfMissing(value)
            }
        });

        function addUniqueValueIfMissing(value: any) {
            if (!uniqueCheck.hasOwnProperty(value)) {
                result.push(value);
                uniqueCheck[value] = 1;
            }
        }

        return result;
    }

}
