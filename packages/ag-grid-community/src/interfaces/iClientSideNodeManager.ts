import type { RowNode } from '../entities/rowNode';
import { StageExecuteParams } from './iRowNodeStage';
import type { RowDataTransaction } from './rowDataTransaction';
import type { RowNodeTransaction } from './rowNodeTransaction';

export type RowDataChildrenGetter<TData = any> = (data: TData | null | undefined) => TData[] | null | undefined;

/** Result of IClientSideNodeManager.updateRowData method */
export interface ClientSideNodeManagerUpdateRowDataResult<TData = any> {
    /** The RowNodeTransaction containing all the removals, updates and additions */
    rowNodeTransaction: RowNodeTransaction<TData>;

    /** True if at least one row was inserted (and not just appended) */
    rowsInserted: boolean;

    /** True if the order of rows has changed */
    rowsOrderChanged: boolean;
}

export interface IClientSideNodeManager<TData = any> {
    initRootNode(rootRowNode: RowNode<TData> | null): void;

    clearRootNode(): void;

    getRowNode(id: string): RowNode<TData> | undefined;

    setNewRowData(rowData: TData[]): void;

    setImmutableRowData(rowData: TData[]): ClientSideNodeManagerUpdateRowDataResult<TData> | null;

    updateRowData(rowDataTran: RowDataTransaction<TData>): ClientSideNodeManagerUpdateRowDataResult<TData>;

    setMasterForAllRows?(rowNodes: RowNode<TData>[] | null | undefined, shouldSetExpanded: boolean): void;

    // TODO: this has to be removed in next PRs
    executeTreeStage?(params: StageExecuteParams): void;
}
