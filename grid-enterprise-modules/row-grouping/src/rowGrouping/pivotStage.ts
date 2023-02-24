import {
    Autowired,
    Bean,
    BeanStub,
    ChangedPath,
    ColDef,
    Column,
    ColumnModel,
    IRowNodeStage,
    RowNode,
    StageExecuteParams,
    ValueService,
    _
} from "@ag-grid-community/core";
import { PivotColDefService } from "./pivotColDefService";

@Bean('pivotStage')
export class PivotStage extends BeanStub implements IRowNodeStage {

    // these should go into the pivot column creator
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('pivotColDefService') private pivotColDefService: PivotColDefService;

    private uniqueValues: any = {};

    private pivotColumnDefs: ColDef[];

    private aggregationColumnsHashLastTime: string | null;
    private aggregationFuncsHashLastTime: string;

    private groupColumnsHashLastTime: string | null;

    public execute(params: StageExecuteParams): void {
        const changedPath = params.changedPath;
        if (this.columnModel.isPivotActive()) {
            this.executePivotOn(changedPath!);
        } else {
            this.executePivotOff(changedPath!);
        }
    }

    private executePivotOff(changedPath: ChangedPath): void {
        this.aggregationColumnsHashLastTime = null;
        this.uniqueValues = {};
        if (this.columnModel.isSecondaryColumnsPresent()) {
            this.columnModel.setSecondaryColumns(null, "rowModelUpdated");
            if (changedPath) {
                changedPath.setInactive();
            }
        }
    }

    private executePivotOn(changedPath: ChangedPath): void {
        const uniqueValues = this.bucketUpRowNodes(changedPath);

        const uniqueValuesChanged = this.setUniqueValues(uniqueValues);

        const aggregationColumns = this.columnModel.getValueColumns();
        const aggregationColumnsHash = aggregationColumns.map((column) => `${column.getId()}-${column.getColDef().headerName}`).join('#');
        const aggregationFuncsHash = aggregationColumns.map((column) => column.getAggFunc()!.toString()).join('#');

        const aggregationColumnsChanged = this.aggregationColumnsHashLastTime !== aggregationColumnsHash;
        const aggregationFuncsChanged = this.aggregationFuncsHashLastTime !== aggregationFuncsHash;
        this.aggregationColumnsHashLastTime = aggregationColumnsHash;
        this.aggregationFuncsHashLastTime = aggregationFuncsHash;

        const groupColumnsHash = this.columnModel.getRowGroupColumns().map((column) => column.getId()).join('#');
        const groupColumnsChanged = groupColumnsHash !== this.groupColumnsHashLastTime;
        this.groupColumnsHashLastTime = groupColumnsHash;

        if (uniqueValuesChanged || aggregationColumnsChanged || groupColumnsChanged || aggregationFuncsChanged) {
            const {pivotColumnGroupDefs, pivotColumnDefs} = this.pivotColDefService.createPivotColumnDefs(this.uniqueValues);
            this.pivotColumnDefs = pivotColumnDefs;
            this.columnModel.setSecondaryColumns(pivotColumnGroupDefs, "rowModelUpdated");
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

    private bucketUpRowNodes(changedPath: ChangedPath): any {
        // accessed from inside inner function
        const uniqueValues: any = {};

        // ensure childrenMapped is cleared, as if a node has been filtered out it should not have mapped children.
        changedPath.forEachChangedNodeDepthFirst(node => {
            if (node.leafGroup) {
                node.childrenMapped = null;
            }
        });

        const recursivelyBucketFilteredChildren = (node: RowNode) => {
            if (node.leafGroup) {
                this.bucketRowNode(node, uniqueValues);
            } else {
                node.childrenAfterFilter?.forEach(recursivelyBucketFilteredChildren);
            }
        }

        changedPath.executeFromRootNode(recursivelyBucketFilteredChildren);

        return uniqueValues;
    }

    private bucketRowNode(rowNode: RowNode, uniqueValues: any): void {

        const pivotColumns = this.columnModel.getPivotColumns();

        if (pivotColumns.length === 0) {
            rowNode.childrenMapped = null;
        } else {
            rowNode.childrenMapped = this.bucketChildren(rowNode.childrenAfterFilter!, pivotColumns, 0, uniqueValues);
        }

        if (rowNode.sibling) {
            rowNode.sibling.childrenMapped = rowNode.childrenMapped;
        }
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
