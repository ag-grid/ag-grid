import type {
    AgColumn,
    BeanCollection,
    ChangedPath,
    ClientSideRowModelStage,
    ColDef,
    ColumnModel,
    GridOptions,
    IColsService,
    IPivotResultColsService,
    IRowNodeStage,
    NamedBean,
    RowNode,
    StageExecuteParams,
    ValueService,
} from 'ag-grid-community';
import { BeanStub, _missing } from 'ag-grid-community';

import type { PivotColDefService } from './pivotColDefService';

const EXCEEDED_MAX_UNIQUE_VALUES = 'Exceeded maximum allowed pivot column count.';

const mapToObject = (map: Map<string, any>): Record<string, any> => {
    const obj: Record<string, any> = {};
    map.forEach((value, key) => (obj[key] = value instanceof Map ? mapToObject(value) : value));
    return obj;
};

export class PivotStage extends BeanStub implements NamedBean, IRowNodeStage {
    beanName = 'pivotStage' as const;

    public refreshProps: Set<keyof GridOptions<any>> = new Set([
        'removePivotHeaderRowWhenSingleValueColumn',
        'pivotRowTotals',
        'pivotColumnGroupTotals',
        'suppressExpandablePivotGroups',
    ]);
    public step: ClientSideRowModelStage = 'pivot';

    private valueSvc: ValueService;
    private colModel: ColumnModel;
    private pivotResultCols: IPivotResultColsService;
    private rowGroupColsSvc?: IColsService;
    private valueColsSvc?: IColsService;
    private pivotColsSvc?: IColsService;
    private pivotColDefSvc: PivotColDefService;

    public wireBeans(beans: BeanCollection) {
        this.valueSvc = beans.valueSvc;
        this.colModel = beans.colModel;
        this.pivotResultCols = beans.pivotResultCols!;
        this.rowGroupColsSvc = beans.rowGroupColsSvc;
        this.valueColsSvc = beans.valueColsSvc;
        this.pivotColsSvc = beans.pivotColsSvc;
        this.pivotColDefSvc = beans.pivotColDefSvc as PivotColDefService;
    }

    private uniqueValues: Map<string, any> = new Map();

    private pivotColumnDefs: ColDef[];

    private aggregationColumnsHashLastTime: string | null;
    private aggregationFuncsHashLastTime: string;

    private groupColumnsHashLastTime: string | null;

    private pivotRowTotalsLastTime: GridOptions['pivotRowTotals'];
    private pivotColumnGroupTotalsLastTime: GridOptions['pivotColumnGroupTotals'];
    private suppressExpandablePivotGroupsLastTime: GridOptions['suppressExpandablePivotGroups'];
    private removePivotHeaderRowWhenSingleValueColumnLastTime: GridOptions['removePivotHeaderRowWhenSingleValueColumn'];

    private lastTimeFailed = false;

    private maxUniqueValues: number = -1;

    public execute(params: StageExecuteParams): void {
        const changedPath = params.changedPath;
        if (this.colModel.isPivotActive()) {
            this.executePivotOn(changedPath!);
        } else {
            this.executePivotOff(changedPath!);
        }
    }

    private executePivotOff(changedPath: ChangedPath): void {
        this.aggregationColumnsHashLastTime = null;
        this.uniqueValues = new Map();
        if (this.pivotResultCols.isPivotResultColsPresent()) {
            this.pivotResultCols.setPivotResultCols(null, 'rowModelUpdated');
            if (changedPath) {
                changedPath.active = false;
            }
        }
    }

    private executePivotOn(changedPath: ChangedPath): void {
        const numberOfAggregationColumns = this.valueColsSvc?.columns.length ?? 1;

        // As unique values creates one column per aggregation column, divide max columns by number of aggregation columns
        // to get the max number of unique values.
        const configuredMaxCols = this.gos.get('pivotMaxGeneratedColumns');
        this.maxUniqueValues = configuredMaxCols === -1 ? -1 : configuredMaxCols / numberOfAggregationColumns;
        let uniqueValues: Map<string, any>;
        try {
            // try catch is used to force execution to stop when the max count is exceeded.
            uniqueValues = this.bucketUpRowNodes(changedPath);
        } catch (e) {
            // message is checked rather than inheritance as the build seems to break instanceof
            if (e.message === EXCEEDED_MAX_UNIQUE_VALUES) {
                this.pivotResultCols.setPivotResultCols([], 'rowModelUpdated');
                this.eventSvc.dispatchEvent({
                    type: 'pivotMaxColumnsExceeded',
                    message: e.message,
                });
                this.lastTimeFailed = true;
                return;
            }
            throw e;
        }

        const uniqueValuesChanged = this.setUniqueValues(uniqueValues);

        const aggregationColumns = this.valueColsSvc?.columns ?? [];
        const aggregationColumnsHash = aggregationColumns
            .map((column) => `${column.getId()}-${column.getColDef().headerName}`)
            .join('#');
        const aggregationFuncsHash = aggregationColumns.map((column) => column.getAggFunc()!.toString()).join('#');

        const aggregationColumnsChanged = this.aggregationColumnsHashLastTime !== aggregationColumnsHash;
        const aggregationFuncsChanged = this.aggregationFuncsHashLastTime !== aggregationFuncsHash;
        this.aggregationColumnsHashLastTime = aggregationColumnsHash;
        this.aggregationFuncsHashLastTime = aggregationFuncsHash;

        const groupColumnsHash = (this.rowGroupColsSvc?.columns ?? []).map((column) => column.getId()).join('#');
        const groupColumnsChanged = groupColumnsHash !== this.groupColumnsHashLastTime;
        this.groupColumnsHashLastTime = groupColumnsHash;

        const pivotRowTotals = this.gos.get('pivotRowTotals');
        const pivotColumnGroupTotals = this.gos.get('pivotColumnGroupTotals');
        const suppressExpandablePivotGroups = this.gos.get('suppressExpandablePivotGroups');
        const removePivotHeaderRowWhenSingleValueColumn = this.gos.get('removePivotHeaderRowWhenSingleValueColumn');

        const anyGridOptionsChanged =
            pivotRowTotals !== this.pivotRowTotalsLastTime ||
            pivotColumnGroupTotals !== this.pivotColumnGroupTotalsLastTime ||
            suppressExpandablePivotGroups !== this.suppressExpandablePivotGroupsLastTime ||
            removePivotHeaderRowWhenSingleValueColumn !== this.removePivotHeaderRowWhenSingleValueColumnLastTime;

        this.pivotRowTotalsLastTime = pivotRowTotals;
        this.pivotColumnGroupTotalsLastTime = pivotColumnGroupTotals;
        this.suppressExpandablePivotGroupsLastTime = suppressExpandablePivotGroups;
        this.removePivotHeaderRowWhenSingleValueColumnLastTime = removePivotHeaderRowWhenSingleValueColumn;

        if (
            this.lastTimeFailed ||
            uniqueValuesChanged ||
            aggregationColumnsChanged ||
            groupColumnsChanged ||
            aggregationFuncsChanged ||
            anyGridOptionsChanged
        ) {
            const { pivotColumnGroupDefs, pivotColumnDefs } = this.pivotColDefSvc.createPivotColumnDefs(
                this.uniqueValues
            );
            this.pivotColumnDefs = pivotColumnDefs;
            this.pivotResultCols.setPivotResultCols(pivotColumnGroupDefs, 'rowModelUpdated');
            // because the secondary columns have changed, then the aggregation needs to visit the whole
            // tree again, so we make the changedPath not active, to force aggregation to visit all paths.
            if (changedPath) {
                changedPath.active = false;
            }
        }
        this.lastTimeFailed = false;
    }

    private setUniqueValues(newValues: Map<string, any>): boolean {
        const json1 = JSON.stringify(mapToObject(this.uniqueValues));
        const json2 = JSON.stringify(mapToObject(newValues));

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

    private currentUniqueCount = 0;
    private bucketUpRowNodes(changedPath: ChangedPath): Map<string, any> {
        this.currentUniqueCount = 0;
        // accessed from inside inner function
        const uniqueValues: Map<string, any> = new Map();

        // ensure childrenMapped is cleared, as if a node has been filtered out it should not have mapped children.
        changedPath.forEachChangedNodeDepthFirst((node) => {
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
        };

        changedPath.executeFromRootNode(recursivelyBucketFilteredChildren);

        return uniqueValues;
    }

    private bucketRowNode(rowNode: RowNode, uniqueValues: any): void {
        const pivotColumns = this.pivotColsSvc?.columns;

        if (pivotColumns?.length === 0) {
            rowNode.childrenMapped = null;
        } else {
            rowNode.childrenMapped = mapToObject(
                this.bucketChildren(rowNode.childrenAfterFilter!, pivotColumns, 0, uniqueValues)
            );
        }

        if (rowNode.sibling) {
            rowNode.sibling.childrenMapped = rowNode.childrenMapped;
        }
    }

    private bucketChildren(
        children: RowNode[],
        pivotColumns: AgColumn[] = [],
        pivotIndex: number,
        uniqueValues: Map<string, any>
    ): Map<string, any> {
        const mappedChildren: Map<string, RowNode[]> = new Map();
        const pivotColumn = pivotColumns[pivotIndex];

        // map the children out based on the pivot column
        children.forEach((child: RowNode) => {
            let key: string = this.valueSvc.getKeyForNode(pivotColumn, child);

            if (_missing(key)) {
                key = '';
            }

            if (!uniqueValues.get(key)) {
                this.currentUniqueCount += 1;
                uniqueValues.set(key, new Map());

                const doesGeneratedColMaxExist = this.maxUniqueValues !== -1;
                const hasExceededColMax = this.currentUniqueCount > this.maxUniqueValues;
                if (doesGeneratedColMaxExist && hasExceededColMax) {
                    // throw an error to prevent all additional execution and escape the loops.
                    throw Error(EXCEEDED_MAX_UNIQUE_VALUES);
                }
            }

            if (!mappedChildren.has(key)) {
                mappedChildren.set(key, []);
            }
            mappedChildren.get(key)!.push(child);
        });

        // if it's the last pivot column, return as is, otherwise go one level further in the map
        if (pivotIndex === pivotColumns.length - 1) {
            return mappedChildren;
        }

        const result: Map<string, any> = new Map();

        for (const key of mappedChildren.keys()) {
            result.set(
                key,
                this.bucketChildren(mappedChildren.get(key)!, pivotColumns, pivotIndex + 1, uniqueValues.get(key)!)
            );
        }

        return result;
    }

    public getPivotColumnDefs(): ColDef[] {
        return this.pivotColumnDefs;
    }
}
