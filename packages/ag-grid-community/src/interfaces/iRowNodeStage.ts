import type { ChangedRowNodes } from '../clientSideRowModel/changedRowNodes';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { ChangedPath } from '../utils/changedPath';
import type { ClientSideRowModelStage, RefreshModelParams } from './iClientSideRowModel';
import type { GetAggregatedChildrenParams } from './iRowNode';

export interface IRowNodeStage<TData = any> {
    readonly step: ClientSideRowModelStage;
    readonly refreshProps: (keyof GridOptions<TData>)[];
}

export interface IRowNodeSortStage<TData = any> extends IRowNodeStage<TData> {
    execute(changedPath: ChangedPath, changedRowNodes: ChangedRowNodes<TData> | undefined): void;
}

export interface IRowNodeFilterStage<TData = any> extends IRowNodeStage<TData> {
    execute(changedPath: ChangedPath): void;
}

export interface IRowNodePivotStage<TData = any> extends IRowNodeStage<TData> {
    execute(changedPath: ChangedPath): void;
}

export interface IRowNodeAggregationStage<TData = any> extends IRowNodeStage<TData> {
    execute(changedPath: ChangedPath): void;

    /**
     * Returns the immediate child rows that contribute to the aggregated value of a group row.
     * This respects the current aggregation settings including `suppressAggFilteredOnly` and `groupAggFiltering`.
     *
     * For pivot columns, this returns only the children that match the column's pivot keys.
     * For non-pivot columns, this returns all children used for aggregation.
     *
     * **Warning:** The returned array is a direct reference to internal grid data and must not be modified.
     *
     * @param rowNode - The group row node to get children for.
     * @param params - Optional parameters to configure which children to return.
     * @returns Array of child row nodes that contribute to aggregation. Do not modify this array.
     */
    getAggregatedChildren(rowNode: RowNode<TData>, params?: GetAggregatedChildrenParams): RowNode<TData>[];
}

export interface IRowNodeFilterAggregateStage<TData = any> extends IRowNodeStage<TData> {
    execute(changedPath: ChangedPath): void;
}

export interface IRowNodeFlattenStage<TData = any> extends IRowNodeStage<TData> {
    execute(): RowNode<TData>[];
}

export type NestedDataGetter<TData = any> = (data: TData) => TData[] | null | undefined;

export interface IRowNodeGroupStage<TData = any> extends IRowNodeStage<TData> {
    readonly treeData: boolean;

    execute(params: RefreshModelParams<TData>): boolean | undefined;

    getNestedDataGetter(): NestedDataGetter<TData> | null | undefined;
    onPropChange(changedProps: ReadonlySet<keyof GridOptions<any>>): boolean;
    extractData(): TData[];
    /** Gets a tree data filler or row grouping group row by id */
    getNonLeaf(id: string): RowNode<TData> | undefined;
    /** Used to lazily compute and store allLeafChildren for a row node */
    loadLeafs(node: RowNode<TData>): RowNode<TData>[] | null;
    /** Used to lazily compute and store groupData for a row node - not for siblings */
    loadGroupData(node: RowNode<TData>): Record<string, any> | null;

    /** Clears all stored group rows / tree data fillers */
    clearNonLeafs(): void;

    /** Called when row group columns might have changed */
    invalidateGroupCols(): void;
}
