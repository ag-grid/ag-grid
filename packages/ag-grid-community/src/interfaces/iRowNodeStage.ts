import type { ChangedRowNodes } from '../clientSideRowModel/changedRowNodes';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { ChangedPath } from '../utils/changedPath';
import type { ClientSideRowModelStage, RefreshModelParams } from './iClientSideRowModel';

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
