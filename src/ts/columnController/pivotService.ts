
import {Bean, Autowired} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {ValueService} from "../valueService";
import {Column} from "../entities/column";
import {ColGroupDef, ColDef} from "../entities/colDef";
import {ColumnController} from "./columnController";
import {RowNode} from "../entities/rowNode";
import {Utils as _} from "../utils";

@Bean('pivotService')
export class PivotService {

    // these should go into the pivot column creator
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnController') private columnController: ColumnController;

    private uniqueValues: any;

    public setUniqueValues(): void {
    }

    private mapRowNode(rowNode: RowNode): void {

        var pivotColumns = this.columnController.getPivotColumns();

        if (pivotColumns.length===0) {
            rowNode.childrenMapped = null;
            return;
        }

        rowNode.childrenMapped = this.mapChildren(rowNode.children, pivotColumns, 0);
    }

    private mapChildren(children: RowNode[], pivotColumns: Column[], pivotIndex: number): any {

        var mappedChildren: any = {};
        var column = pivotColumns[pivotIndex];

        var columnUniqueValues = this.uniqueValues[column.getId()];
        if (_.missing(columnUniqueValues)) {
            columnUniqueValues = {};
            this.uniqueValues[column.getId()] = columnUniqueValues;
        }

        // map the children out based on the pivot column
        children.forEach( (child: RowNode) => {
            var key = this.valueService.getValue(column, child);
            if (_.missing(key)) {
                key = '';
            }

            // we could check this first, but it's quicker to skip the lookup and just overwrite
            columnUniqueValues[key]= true;

            if (!mappedChildren[key]) {
                mappedChildren[key] = [];
            }
            mappedChildren[key].push(child);
        });

        // if it's the last pivot column, return as is, otherwise go one level further in the map
        if (pivotIndex === pivotColumns.length-1) {
            return {
                data: {},
                children: mappedChildren
            };
        } else {
            var result: any = {};
            
            _.iterateObject(mappedChildren, (key: string, value: RowNode[])=> {
                result[key] = this.mapChildren(value, pivotColumns, pivotIndex + 1);
            });
            
            return result;
        }
    }

    public execute(rowNodes: RowNode[]): RowNode[] {

        this.uniqueValues = {};
        var that = this;

        function findLeafGroups(rowNodes: RowNode[]): void {
            rowNodes.forEach( rowNode => {
                if (rowNode.leafGroup) {
                    that.mapRowNode(rowNode);
                } else if (rowNode.group) {
                    findLeafGroups(rowNode.childrenAfterFilter);
                }
            });
        }

        findLeafGroups(rowNodes);

        return rowNodes;
    }

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
