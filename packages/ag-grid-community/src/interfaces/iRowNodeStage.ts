import type { ChangedRowNodes } from '../clientSideRowModel/changedRowNodes';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { ChangedPath } from '../utils/changedPath';
import type { ClientSideRowModelStage } from './iClientSideRowModel';

export interface StageExecuteParams<TData = any> {
    rowNode: RowNode<TData>;

    // used in sort stage, as sort stage looks at all transactions in one go
    changedRowNodes?: ChangedRowNodes<TData>;

    // true if the order of root.allLeafChildren has changed
    // This can happen if order of root.allLeafChildren is updated or rows are inserted (and not just appended at the end)
    rowNodesOrderChanged?: boolean;
    changedPath?: ChangedPath;
    afterColumnsChanged?: boolean;
}

export interface IRowNodeStage<TResult = void, TData = any> {
    readonly step: ClientSideRowModelStage;
    readonly refreshProps: (keyof GridOptions<any>)[];
    execute(params: StageExecuteParams<TData>): TResult;
}

export type NestedDataGetter<TData = any> = (data: TData) => TData[] | null | undefined;

export interface IRowGroupStage<TResult = void, TData = any> extends IRowNodeStage<TResult, TData> {
    readonly treeData: boolean;
    getNestedDataGetter(): NestedDataGetter<TData> | null | undefined;
    onPropChange(changedProps: ReadonlySet<keyof GridOptions<any>>): boolean;
    extractData(): TData[];
    getNode(id: string): RowNode<TData> | undefined;
}
