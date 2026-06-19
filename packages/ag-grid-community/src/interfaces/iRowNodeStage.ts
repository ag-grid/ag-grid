import type { ChangedRowNodes } from '../clientSideRowModel/changedRowNodes';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { ChangedPath } from '../utils/changedPath';
import type { ClientSideRowModelStage, RefreshModelParams } from './iClientSideRowModel';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowNodeStage<TData = any> {
    readonly step: ClientSideRowModelStage;
    readonly refreshProps: (keyof GridOptions<TData>)[] | null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowNodeSortStage<TData = any> extends IRowNodeStage<TData> {
    execute(changedPath: ChangedPath | undefined, changedRowNodes: ChangedRowNodes<TData> | undefined): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowNodeFilterStage<TData = any> extends IRowNodeStage<TData> {
    execute(changedPath: ChangedPath | undefined): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowNodePivotStage<TData = any> extends IRowNodeStage<TData> {
    /** Returns `true` if the changedPath should be deactivated (e.g. pivot columns changed). */
    execute(changedPath: ChangedPath | undefined, changedProps: Set<keyof GridOptions> | undefined): boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowNodeAggregationStage<TData = any> extends IRowNodeStage<TData> {
    execute(changedPath: ChangedPath | undefined): void;
    /** Re-aggregates only the root node, leaving group aggregates untouched — for when a feature needs the root
     *  total switched on without the cost of a full re-aggregation (the groups are already correct). */
    aggregateRootOnly(): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowNodeFilterAggregateStage<TData = any> extends IRowNodeStage<TData> {
    execute(changedPath: ChangedPath | undefined): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowNodeFlattenStage<TData = any> extends IRowNodeStage<TData> {
    execute(): RowNode<TData>[];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type NestedDataGetter<TData = any> = (data: TData) => TData[] | null | undefined;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowNodeGroupStage<TData = any> extends IRowNodeStage<TData> {
    readonly treeData: boolean;
    readonly grouping: boolean;
    /** Whether the TreeData / RowGrouping module is registered — lets callers distinguish "not available"
     *  (undefined) from "available but inactive" (false). */
    readonly hasTreeData: boolean;
    readonly hasRowGrouping: boolean;

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

    /** Clears all stored group rows / tree data fillers without dispatching position events. */
    clearNonLeafs(): void;

    /** Called when row group columns might have changed */
    invalidateGroupCols(): void;
}
