import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { ChangedPath } from '../utils/changedPath';
import type { ClientSideRowModelStage, IChangedRowNodes } from './iClientSideRowModel';

export interface StageExecuteParams<TData = any> {
    rowNode: RowNode<TData>;

    // used in sort stage, as sort stage looks at all transactions in one go
    changedRowNodes?: IChangedRowNodes<TData>;

    // true if the order of root.allLeafChildren has changed
    // This can happen if order of root.allLeafChildren is updated or rows are inserted (and not just appended at the end)
    rowNodesOrderChanged?: boolean;
    changedPath?: ChangedPath;
    afterColumnsChanged?: boolean;
}

export interface IRowNodeStage<TData = any> {
    step: ClientSideRowModelStage;
    refreshProps: Set<keyof GridOptions>;
    execute(params: StageExecuteParams<TData>): void;
}

export interface IRowGroupStage<TData = any> extends IRowNodeStage<TData> {
    getNode(id: string): RowNode<TData> | undefined;
}

export interface IRowFlattenStage<TData = any> extends IRowNodeStage<TData> {
    /** The maximum uiLevel, computed during execute */
    readonly maxUiLevel: number;

    execute(params: StageExecuteParams<TData>): RowNode<TData>[];
}
