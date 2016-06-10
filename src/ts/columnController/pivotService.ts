
import {Bean, Autowired} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {ValueService} from "../valueService";
import {Column} from "../entities/column";
import {ColGroupDef, ColDef} from "../entities/colDef";
import {ColumnController} from "./columnController";
import {RowNode} from "../entities/rowNode";
import {Utils as _} from "../utils";
import {EventService} from "../eventService";

/**
 * Service goes to all the leafGroups and places the children into buckets using
 * the pivot columns as the keys. It also keeps track of all of the unique values,
 * as these will end up as columns.
 *
 * If there are 2 or more pivot columns, then the buckets are 2d or more. That means
 * buckets of buckets (or maps of maps), (or n-dimension arrays but they are not arrays
 * they are maps).
 *
 * A leafGroup is a group that has normal rows as children, ie no groups as children.
 */

@Bean('pivotService')
export class PivotService {

    // these should go into the pivot column creator
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    private uniqueValues: any = {};

    private pivotColumnGroupDefs: (ColDef|ColGroupDef)[];
    private pivotColumnDefs: ColDef[];

    private valueColumnsHashLastTime: string;

    public execute(rootNode: RowNode): any {

        if (!this.columnController.isPivotActive()) {
            this.columnController.setSecondaryColumns(null);
            return;
        }
        
        var uniqueValues = this.bucketUpRowNodes(rootNode);

        var uniqueValuesChanged = this.setUniqueValues(uniqueValues);

        var valueColumns = this.columnController.getValueColumns();
        var valueColumnsHash = valueColumns.map( (column)=> column.getId() ).join('#');

        var valueColumnsChanged = this.valueColumnsHashLastTime !== valueColumnsHash;
        this.valueColumnsHashLastTime = valueColumnsHash;

        if (uniqueValuesChanged || valueColumnsChanged) {
            this.createPivotColumnDefs();
            this.columnController.setSecondaryColumns(this.pivotColumnGroupDefs);
        }

    }

    private setUniqueValues(newValues: any): boolean {
        var json1 = JSON.stringify(newValues);
        var json2 = JSON.stringify(this.uniqueValues);

        var uniqueValuesChanged = json1 !== json2;

        // we only continue the below if the unique values are different, as otherwise
        // the result will be the same as the last time we did it
        if (uniqueValuesChanged) {
            this.uniqueValues = newValues;
            return true;
        } else {
            return false;
        }
    }

    // returns true if values were different
    private bucketUpRowNodes(rootNode: RowNode): any {

        // accessed from inside inner function
        var uniqueValues: any = {};
        var that = this;

        recursivelySearchForLeafNodes(rootNode);

        return uniqueValues;

        // finds all leaf groups and calls mapRowNode with it
        function recursivelySearchForLeafNodes(rowNode: RowNode): void {
            if (rowNode.leafGroup) {
                that.bucketRowNode(rowNode, uniqueValues);
            } else {
                rowNode.childrenAfterFilter.forEach( child => {
                    recursivelySearchForLeafNodes(child);
                });
            }
        }
    }

    private bucketRowNode(rowNode: RowNode, uniqueValues: any): void {

        var pivotColumns = this.columnController.getPivotColumns();

        if (pivotColumns.length===0) {
            rowNode.childrenMapped = null;
            return;
        }

        rowNode.childrenMapped = this.bucketChildren(rowNode.childrenAfterFilter, pivotColumns, 0, uniqueValues);
    }

    private bucketChildren(children: RowNode[], pivotColumns: Column[], pivotIndex: number, uniqueValues: any): any {

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
                result[key] = this.bucketChildren(value, pivotColumns, pivotIndex + 1, uniqueValues[key]);
            });
            
            return result;
        }
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
