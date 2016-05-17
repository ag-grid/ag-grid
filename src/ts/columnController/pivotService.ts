
import {Bean, Autowired} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {ValueService} from "../valueService";
import {Column} from "../entities/column";
import {ColGroupDef, ColDef} from "../entities/colDef";
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

    private pivotColumnGroupDefs: (ColDef|ColGroupDef)[];
    private pivotColumnDefs: ColDef[];

    private mapRowNode(rowNode: RowNode): void {

        var pivotColumns = this.columnController.getPivotColumns();

        if (pivotColumns.length===0) {
            rowNode.childrenMapped = null;
            return;
        }

        rowNode.childrenMapped = this.mapChildren(rowNode.childrenAfterFilter, pivotColumns, 0, this.uniqueValues);
    }

    public getUniqueValues(): any {
        return this.uniqueValues;
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

    public getPivotColumnGroupDefs(): (ColDef|ColGroupDef)[] {
        return this.pivotColumnGroupDefs;
    }

    public getPivotColumnDefs(): ColDef[] {
        return this.pivotColumnDefs;
    }
    
    private createPivotColumnDefs(): void {

        this.pivotColumnGroupDefs = [];
        this.pivotColumnDefs = [];
        var that = this;

        var pivotColumns = this.columnController.getPivotColumns();
        var levelsDeep = pivotColumns.length;
        var columnIdSequence = 0;

        recursivelyAddGroup(this.pivotColumnGroupDefs, 1, this.uniqueValues, []);

        function recursivelyAddGroup(parentChildren: (ColGroupDef|ColDef)[], index: number, uniqueValues: any, keys: string[]): void {

            // var column = pivotColumns[index];
            _.iterateObject(uniqueValues, (key: string, value: any)=> {

                var newKeys = keys.slice(0);
                newKeys.push(key);

                var createGroup = index !== levelsDeep;
                if (createGroup) {
                    var groupDef: ColGroupDef = {
                        children: [],
                        headerName: key
                    };
                    parentChildren.push(groupDef);
                    recursivelyAddGroup(groupDef.children, index+1, value, newKeys);
                } else {
                    
                    var valueColumns = that.columnController.getValueColumns();

                    if (valueColumns.length===1) {
                        var colDef = createColDef(valueColumns[0], key, newKeys);
                        parentChildren.push(colDef);
                        that.pivotColumnDefs.push(colDef);
                    } else {
                        var valueGroup: ColGroupDef = {
                            children: [],
                            headerName: key
                        };
                        parentChildren.push(valueGroup);
                        valueColumns.forEach( valueColumn => {
                            var colDef = createColDef(valueColumn, valueColumn.getColDef().headerName, newKeys);
                            valueGroup.children.push(colDef);
                            that.pivotColumnDefs.push(colDef);
                        });
                    }

                }
            });
        }

        function createColDef(valueColumn: Column, headerName: any, pivotKeys: string[]): ColDef {

            var colDef: ColDef = {};

            if (valueColumn) {
                var colDefToCopy = valueColumn.getColDef();
                _.assign(colDef, colDefToCopy);
            }

            colDef.valueGetter = null;
            colDef.headerName = headerName;
            colDef.colId = 'pivot_' + columnIdSequence++;

            (<any>colDef).keys = pivotKeys;
            (<any>colDef).valueColumn = valueColumn;

            return colDef;
        }
    }

}
