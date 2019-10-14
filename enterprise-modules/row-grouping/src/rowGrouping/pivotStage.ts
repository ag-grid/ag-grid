import {
    Autowired,
    Bean,
    ChangedPath,
    ColDef,
    ColGroupDef,
    Column,
    ColumnController,
    EventService,
    IRowModel,
    IRowNodeStage,
    RowNode,
    StageExecuteParams,
    ValueService,
    _
} from "ag-grid-community";
import { PivotColDefService } from "./pivotColDefService";

@Bean('pivotStage')
export class PivotStage implements IRowNodeStage {

    // these should go into the pivot column creator
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('pivotColDefService') private pivotColDefService: PivotColDefService;

    private uniqueValues: any = {};

    private pivotColumnGroupDefs: (ColDef | ColGroupDef)[];
    private pivotColumnDefs: ColDef[];

    private aggregationColumnsHashLastTime: string | null;
    private aggregationFuncsHashLastTime: string;

    public execute(params: StageExecuteParams): void {
        const rootNode = params.rowNode;
        const changedPath = params.changedPath;
        if (this.columnController.isPivotActive()) {
            this.executePivotOn(rootNode, changedPath);
        } else {
            this.executePivotOff(changedPath);
        }
    }

    private executePivotOff(changedPath: ChangedPath | undefined): void {
        this.aggregationColumnsHashLastTime = null;
        this.uniqueValues = {};
        if (this.columnController.isSecondaryColumnsPresent()) {
            this.columnController.setSecondaryColumns(null, "rowModelUpdated");
            if (changedPath) {
                changedPath.setInactive();
            }
        }
    }

    private executePivotOn(rootNode: RowNode, changedPath: ChangedPath | undefined): void {
        const uniqueValues = this.bucketUpRowNodes(rootNode);

        const uniqueValuesChanged = this.setUniqueValues(uniqueValues);

        const aggregationColumns = this.columnController.getValueColumns();
        const aggregationColumnsHash = aggregationColumns.map((column) => column.getId()).join('#');
        const aggregationFuncsHash = aggregationColumns.map((column) => column.getAggFunc().toString()).join('#');

        const aggregationColumnsChanged = this.aggregationColumnsHashLastTime !== aggregationColumnsHash;
        const aggregationFuncsChanged = this.aggregationFuncsHashLastTime !== aggregationFuncsHash;
        this.aggregationColumnsHashLastTime = aggregationColumnsHash;
        this.aggregationFuncsHashLastTime = aggregationFuncsHash;

        if (uniqueValuesChanged || aggregationColumnsChanged || aggregationFuncsChanged) {
            const result = this.pivotColDefService.createPivotColumnDefs(this.uniqueValues);
            this.pivotColumnGroupDefs = result.pivotColumnGroupDefs;
            this.pivotColumnDefs = result.pivotColumnDefs;
            this.columnController.setSecondaryColumns(this.pivotColumnGroupDefs, "rowModelUpdated");
            // because the secondary columns have changed, then the aggregation needs to visit the whole
            // tree again, so we make the changedPath not active, to force aggregation to visit all paths.
            if (changedPath) {
                changedPath.setInactive();
            }
        }
    }

    private setUniqueValues(newValues: any): boolean {
        const json1 = JSON.stringify(newValues);
        const json2 = JSON.stringify(this.uniqueValues);

        const uniqueValuesChanged = json1 !== json2;

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
        const uniqueValues: any = {};

        // finds all leaf groups and calls mapRowNode with it
        const recursivelySearchForLeafNodes = (rowNode: RowNode) => {
            if (rowNode.leafGroup) {
                this.bucketRowNode(rowNode, uniqueValues);
            } else {
                rowNode.childrenAfterFilter.forEach(child => {
                    recursivelySearchForLeafNodes(child);
                });
            }
        };

        recursivelySearchForLeafNodes(rootNode);

        return uniqueValues;
    }

    private bucketRowNode(rowNode: RowNode, uniqueValues: any): void {

        const pivotColumns = this.columnController.getPivotColumns();

        if (pivotColumns.length === 0) {
            rowNode.childrenMapped = null;
            return;
        }

        rowNode.childrenMapped = this.bucketChildren(rowNode.childrenAfterFilter, pivotColumns, 0, uniqueValues);
    }

    private bucketChildren(children: RowNode[], pivotColumns: Column[], pivotIndex: number, uniqueValues: any): any {

        const mappedChildren: any = {};
        const pivotColumn = pivotColumns[pivotIndex];

        // map the children out based on the pivot column
        children.forEach((child: RowNode) => {

            let key: string = this.valueService.getKeyForNode(pivotColumn, child);

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
        if (pivotIndex === pivotColumns.length - 1) {
            return mappedChildren;
        } else {
            const result: any = {};

            _.iterateObject(mappedChildren, (key: string, value: RowNode[]) => {
                result[key] = this.bucketChildren(value, pivotColumns, pivotIndex + 1, uniqueValues[key]);
            });

            return result;
        }
    }

    public getPivotColumnDefs(): ColDef[] {
        return this.pivotColumnDefs;
    }

}
