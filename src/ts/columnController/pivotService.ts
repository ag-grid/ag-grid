
import {Bean, Autowired} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {ValueService} from "../valueService";
import {Column} from "../entities/column";
import {ColGroupDef, ColDef, AbstractColDef} from "../entities/colDef";
import {ColumnController} from "./columnController";
import {RowNode} from "../entities/rowNode";
import {Utils as _} from "../utils";
import {EventService} from "../eventService";

@Bean('pivotService')
export class PivotService {

    // these should go into the pivot column creator
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    private uniqueValues: any;

    private pivotColumnDefs: (ColDef|ColGroupDef)[];

    private mapRowNode(rowNode: RowNode): void {

        var pivotColumns = this.columnController.getPivotColumns();

        if (pivotColumns.length===0) {
            rowNode.childrenMapped = null;
            return;
        }

        rowNode.childrenMapped = this.mapChildren(rowNode.childrenAfterFilter, pivotColumns, 0, this.uniqueValues);
    }

    private mapChildren(children: RowNode[], pivotColumns: Column[], pivotIndex: number, uniqueValues: any): any {

        var mappedChildren: any = {};
        var pivotColumn = pivotColumns[pivotIndex];

        // map the children out based on the pivot column
        children.forEach( (child: RowNode) => {
            var key = this.valueService.getValue(pivotColumn, child);
            if (_.missing(key)) {
                key = '';
            }

            if (!uniqueValues[key]) {
                uniqueValues[key] = {};
            }

            if (!mappedChildren[key]) {
                mappedChildren[key] = [];
            }
            mappedChildren[key].push(child);
        });

        // if it's the last pivot column, return as is, otherwise go one level further in the map
        if (pivotIndex === pivotColumns.length-1) {
            return mappedChildren;
        } else {
            var result: any = {};
            
            _.iterateObject(mappedChildren, (key: string, value: RowNode[])=> {
                result[key] = this.mapChildren(value, pivotColumns, pivotIndex + 1, uniqueValues[key]);
            });
            
            return result;
        }
    }

    public execute(rootNode: RowNode): any {

        this.uniqueValues = {};
        var that = this;

        function findLeafGroups(rowNode: RowNode): void {
            if (rowNode.leafGroup) {
                that.mapRowNode(rowNode);
            } else {
                rowNode.childrenAfterFilter.forEach( child => {
                    findLeafGroups(child);
                });
            }
        }

        findLeafGroups(rootNode);

        this.createPivotColumnDefs();

        this.columnController.onPivotValueChanged();
    }

    public getPivotColumnDefs(): (ColDef|ColGroupDef)[] {
        return this.pivotColumnDefs;
    }

    private createPivotColumnDefs(): void {

        var topLevelCol = {
            children: <(ColDef|ColGroupDef)[]> [],
            headerName: 'Pivot'
        };
        this.pivotColumnDefs = [topLevelCol];

        var pivotColumns = this.columnController.getPivotColumns();
        var levelsDeep = pivotColumns.length;

        recursivelyAddGroup(topLevelCol.children, 1, this.uniqueValues);

        function recursivelyAddGroup(parentChildren: (ColGroupDef|ColDef)[], index: number, uniqueValues: any): void {

            // var column = pivotColumns[index];
            _.iterateObject(uniqueValues, (key: string, value: any)=> {
                var createGroup = index !== levelsDeep;
                if (createGroup) {
                    var groupDef: ColGroupDef = {
                        children: [],
                        headerName: key
                    };
                    parentChildren.push(groupDef);
                    recursivelyAddGroup(groupDef.children, index+1, value);
                } else {
                    var colDef: ColDef = {
                        valueGetter: '' + Math.random(),
                        headerName: key
                    };
                    parentChildren.push(colDef);
                }
            });
        }
    }

/*    private getUniqueValues(column: Column): any[] {
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
    }*/

}
