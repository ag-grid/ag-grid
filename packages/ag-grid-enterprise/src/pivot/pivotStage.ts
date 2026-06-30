import { _areEqual, _jsonEquals, _missing } from 'ag-stack';

import type {
    AgColumn,
    BeanCollection,
    ChangedPath,
    ClientSideRowModelStage,
    GridOptions,
    IPivotResultColsService,
    NamedBean,
    RowNode,
    _IRowNodePivotStage,
} from 'ag-grid-community';
import { BeanStub, _forEachChangedGroupDepthFirst } from 'ag-grid-community';

import type { PivotColDefService } from './pivotColDefService';

const EXCEEDED_MAX_UNIQUE_VALUES = 'Exceeded maximum allowed pivot column count.';

const mapToObject = (map: Map<string, any>): Record<string, any> => {
    const obj: Record<string, any> = {};
    map.forEach((value, key) => (obj[key] = value instanceof Map ? mapToObject(value) : value));
    return obj;
};

export class PivotStage extends BeanStub implements NamedBean, _IRowNodePivotStage {
    beanName = 'pivotStage' as const;

    public readonly step: ClientSideRowModelStage = 'pivot';
    public readonly refreshProps: (keyof GridOptions)[] = [
        'removePivotHeaderRowWhenSingleValueColumn',
        'pivotRowTotals',
        'pivotColumnGroupTotals',
        'suppressExpandablePivotGroups',
        'enableStrictPivotColumnOrder',
    ];

    private pivotResultCols: IPivotResultColsService;
    private pivotColDefSvc: PivotColDefService;

    public wireBeans(beans: BeanCollection) {
        this.pivotResultCols = beans.pivotResultCols!;
        this.pivotColDefSvc = beans.pivotColDefSvc as PivotColDefService;
    }

    private uniqueValues: Map<string, any> = new Map();

    private aggregationColumnsHashLastTime: string | null;
    private aggregationFuncsHashLastTime: string;
    private pivotOrderLastTime: string[] = [];

    private groupColumnsHashLastTime: string | null;

    private lastTimeFailed = false;

    private maxUniqueValues: number = -1;

    /** Returns `true` if the changedPath should be deactivated (e.g. pivot columns changed). */
    public execute(changedPath: ChangedPath | undefined, changedProps: Set<keyof GridOptions> | undefined): boolean {
        if (this.beans.colModel.isPivotActive()) {
            return this.executePivotOn(changedPath, changedProps);
        } else {
            return this.executePivotOff();
        }
    }

    private executePivotOff(): boolean {
        this.aggregationColumnsHashLastTime = null;
        this.pivotOrderLastTime = [];
        this.uniqueValues = new Map();
        if (this.pivotResultCols.pivotCols) {
            this.pivotResultCols.setPivotResultCols(null, 'rowModelUpdated');
            return true; // columns changed, deactivate changedPath
        }
        return false;
    }

    private executePivotOn(
        changedPath: ChangedPath | undefined,
        changedProps: Set<keyof GridOptions> | undefined
    ): boolean {
        const { valueColsSvc, gos, rowGroupColsSvc, pivotColsSvc } = this.beans;
        const numberOfAggregationColumns = valueColsSvc?.columns.length ?? 1;

        // As unique values creates one column per aggregation column, divide max columns by number of aggregation columns
        // to get the max number of unique values.
        const configuredMaxCols = gos.get('pivotMaxGeneratedColumns');
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
                return false;
            }
            throw e;
        }

        const uniqueValuesChanged = this.setUniqueValues(uniqueValues);

        const aggregationColumns = valueColsSvc?.columns ?? [];
        const aggregationColumnsHash = aggregationColumns
            .map((column) => `${column.getId()}-${column.colDef.headerName}`)
            .join('#');
        const aggregationFuncsHash = aggregationColumns.map((column) => column.aggFunc?.toString()).join('#');

        const aggregationColumnsChanged = this.aggregationColumnsHashLastTime !== aggregationColumnsHash;
        const aggregationFuncsChanged = this.aggregationFuncsHashLastTime !== aggregationFuncsHash;
        this.aggregationColumnsHashLastTime = aggregationColumnsHash;
        this.aggregationFuncsHashLastTime = aggregationFuncsHash;

        const groupColumnsHash = (rowGroupColsSvc?.columns ?? []).map((column) => column.getId()).join('#');
        const groupColumnsChanged = groupColumnsHash !== this.groupColumnsHashLastTime;
        this.groupColumnsHashLastTime = groupColumnsHash;

        const pivotColumns = pivotColsSvc?.columns ?? [];
        const shouldTrackPivotOrder = pivotColsSvc?.isStrictColumnOrder() ?? false;
        const pivotOrder = shouldTrackPivotOrder ? computePivotOrder(this.uniqueValues, pivotColumns, 0) : [];
        const pivotOrderChanged = !_areEqual(pivotOrder, this.pivotOrderLastTime);
        this.pivotOrderLastTime = pivotOrder;

        const anyGridOptionsChanged = this.refreshProps.some((p) => changedProps?.has(p));

        if (
            this.lastTimeFailed ||
            uniqueValuesChanged ||
            aggregationColumnsChanged ||
            groupColumnsChanged ||
            aggregationFuncsChanged ||
            pivotOrderChanged ||
            anyGridOptionsChanged
        ) {
            const pivotColumnGroupDefs = this.pivotColDefSvc.createPivotColumnDefs(this.uniqueValues);
            this.pivotResultCols.setPivotResultCols(pivotColumnGroupDefs, 'rowModelUpdated');
            // Because the secondary columns have changed, the aggregation needs to visit the whole
            // tree again, so signal the caller to deactivate the changedPath.
            this.lastTimeFailed = false;
            return true;
        }
        this.lastTimeFailed = false;
        return false;
    }

    private setUniqueValues(newValues: Map<string, any>): boolean {
        const uniqueValuesChanged = !_jsonEquals(mapToObject(this.uniqueValues), mapToObject(newValues));
        // we only continue the below if the unique values are different, as otherwise
        // the result will be the same as the last time we did it
        if (uniqueValuesChanged) {
            this.uniqueValues = newValues;
            return true;
        }
        return false;
    }

    private currentUniqueCount = 0;
    private bucketUpRowNodes(changedPath: ChangedPath | undefined): Map<string, any> {
        const rowModel = this.beans.rowModel;
        this.currentUniqueCount = 0;
        // accessed from inside inner function
        const uniqueValues: Map<string, any> = new Map();

        // ensure childrenMapped is cleared, as if a node has been filtered out it should not have mapped children.
        _forEachChangedGroupDepthFirst(rowModel.rootNode, rowModel.hierarchical, changedPath, (node) => {
            if (node.leafGroup) {
                node.childrenMapped = null;
            }
        });

        const recursivelyBucketFilteredChildren = (node: RowNode) => {
            if (node.leafGroup) {
                this.bucketRowNode(node, uniqueValues);
            } else {
                const children = node.childrenAfterFilter;
                if (children) {
                    for (let i = 0, len = children.length; i < len; ++i) {
                        recursivelyBucketFilteredChildren(children[i]);
                    }
                }
            }
        };

        recursivelyBucketFilteredChildren(rowModel.rootNode!);

        return uniqueValues;
    }

    private bucketRowNode(rowNode: RowNode, uniqueValues: Map<string, any>): void {
        const pivotColumns = this.beans.pivotColsSvc?.columns;

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
        const mappedChildren = new Map<string, RowNode[]>();
        const pivotColumn = pivotColumns[pivotIndex];
        const doesGeneratedColMaxExist = this.maxUniqueValues !== -1;

        // map the children out based on the pivot column
        for (let i = 0, len = children.length; i < len; ++i) {
            const child = children[i];
            let key: string | null | undefined = this.beans.valueSvc.getKeyForNode(pivotColumn, child);

            if (_missing(key)) {
                key = '';
            }

            if (!uniqueValues.get(key)) {
                this.currentUniqueCount += 1;
                uniqueValues.set(key, new Map());

                const hasExceededColMax = this.currentUniqueCount > this.maxUniqueValues;
                if (doesGeneratedColMaxExist && hasExceededColMax) {
                    // throw an error to prevent all additional execution and escape the loops.
                    throw new Error(EXCEEDED_MAX_UNIQUE_VALUES);
                }
            }

            if (!mappedChildren.has(key)) {
                mappedChildren.set(key, []);
            }
            mappedChildren.get(key)!.push(child);
        }

        // if it's the last pivot column, return as is, otherwise go one level further in the map
        if (pivotIndex === pivotColumns.length - 1) {
            return mappedChildren;
        }

        const result = new Map<string, any>();

        for (const key of mappedChildren.keys()) {
            result.set(
                key,
                this.bucketChildren(mappedChildren.get(key)!, pivotColumns, pivotIndex + 1, uniqueValues.get(key))
            );
        }

        return result;
    }
}

/**
 * Returns a flat depth-first array of pivot value keys ordered at each level to mirror pivotColDefService's
 * rendered column order (honouring `pivotSort` and the column's `pivotComparator`). Used to detect when that
 * order changes (e.g. a sort toggle or comparator closure mutation) without relying on function reference or
 * source equality.
 */
function computePivotOrder(values: Map<string, any>, pivotColumns: AgColumn[], depth: number): string[] {
    const pivotColumn = pivotColumns[depth];
    const keys = [...values.keys()];
    // Mirror pivotColDefService's ordering so the snapshot tracks the rendered order and a toggle is detected as
    // an order change: `null` keeps the natural (insertion) key order, `'desc'` reverses, and the unset default
    // and `'asc'` sort ascending by the custom comparator or string order.
    const pivotSort = pivotColumn?.pivotSort;
    if (pivotSort !== null) {
        const comparator = pivotColumn?.colDef.pivotComparator;
        if (comparator) {
            keys.sort(comparator);
        } else {
            keys.sort();
        }
        if (pivotSort === 'desc') {
            keys.reverse();
        }
    }
    if (depth === pivotColumns.length - 1) {
        return keys;
    }
    const result: string[] = [];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        result.push(key);
        const child = values.get(key);
        // child is a nested Map at non-leaf levels; if absent (sparse map), skip its subtree.
        if (child instanceof Map) {
            const childKeys = computePivotOrder(child, pivotColumns, depth + 1);
            for (let j = 0; j < childKeys.length; j++) {
                result.push(childKeys[j]);
            }
        }
    }
    return result;
}
