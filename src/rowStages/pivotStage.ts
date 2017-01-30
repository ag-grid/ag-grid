import {
    IRowNodeStage,
    Autowired,
    ColumnController,
    ValueService,
    EventService,
    RowNode,
    StageExecuteParams,
    Column,
    Utils,
    ColDef,
    ColGroupDef,
    IRowModel,
    Bean
} from "ag-grid/main";
import {PivotColDefService} from "./pivotColDefService";

@Bean('pivotStage')
export class PivotStage implements IRowNodeStage {

    // these should go into the pivot column creator
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('pivotColDefService') private pivotColDefService: PivotColDefService;

    private uniqueValues: any = {};

    private pivotColumnGroupDefs: (ColDef|ColGroupDef)[];
    private pivotColumnDefs: ColDef[];

    private aggregationColumnsHashLastTime: string;

    public execute(params: StageExecuteParams): void {
        let rootNode = params.rowNode;
        if (this.columnController.isPivotActive()) {
            this.executePivotOn(rootNode);
        } else {
            this.executePivotOff();
        }
    }

    private executePivotOff(): void {
        this.aggregationColumnsHashLastTime = null;
        this.uniqueValues = {};
        this.columnController.setSecondaryColumns(null);
    }

    private executePivotOn(rootNode: RowNode): void {
        var uniqueValues = this.bucketUpRowNodes(rootNode);

        var uniqueValuesChanged = this.setUniqueValues(uniqueValues);

        var aggregationColumns = this.columnController.getValueColumns();
        var aggregationColumnsHash = aggregationColumns.map( (column)=> column.getId() ).join('#');

        var aggregationColumnsChanged = this.aggregationColumnsHashLastTime !== aggregationColumnsHash;
        this.aggregationColumnsHashLastTime = aggregationColumnsHash;

        if (uniqueValuesChanged || aggregationColumnsChanged) {
            var result = this.pivotColDefService.createPivotColumnDefs(this.uniqueValues);
            this.pivotColumnGroupDefs = result.pivotColumnGroupDefs;
            this.pivotColumnDefs = result.pivotColumnDefs;
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
            if (Utils.missing(key)) {
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

            Utils.iterateObject(mappedChildren, (key: string, value: RowNode[])=> {
                result[key] = this.bucketChildren(value, pivotColumns, pivotIndex + 1, uniqueValues[key]);
            });

            return result;
        }
    }

    public getPivotColumnDefs(): ColDef[] {
        return this.pivotColumnDefs;
    }

}