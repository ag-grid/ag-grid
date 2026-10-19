import type { IRowNode } from './iRowNode';

export interface ServerSideTransaction<TData = any> {
    /**
     * The Row Store to apply the transaction to, ie what group level.
     * eg ['Ireland','2002'] to update the child store found after expanding Ireland and 2002 groups.
     * Passing in blank to empty applies the transaction to the top level.
     */
    route?: string[];
    /** Index position to add at. If missing, rows will be added to the end. */
    addIndex?: number;
    /** Rows to add */
    add?: TData[];
    /** Rows to remove */
    remove?: TData[];
    /** Rows to update */
    update?: TData[];
    /** Optional new total row count. Use this when a transaction deletes rows that are not currently in cache. */
    rowCount?: number;
    /**
     * The version of the data after this transaction, in the same form as `LoadSuccessParams.dataVersion`.
     * Changes to rows loaded or updated at a newer version are skipped and returned in `unapplied`.
     * A transaction that arrives while blocks of its level are loading is applied again to those blocks when they load, if it is newer than their version.
     * Numbers are compared numerically; provide `compareServerSideDataVersions` to compare other versions.
     */
    version?: string | number;
}

export interface ServerSideTransactionResult<TData = any> {
    /** The status of applying the transaction. */
    status: ServerSideTransactionResultStatus;
    /** If rows were added, the newly created Row Nodes for those rows. */
    add?: IRowNode<TData>[];
    /** If rows were removed, the deleted Row Nodes. */
    remove?: IRowNode<TData>[];
    /** If rows were updated, the updated Row Nodes. */
    update?: IRowNode<TData>[];
    /**
     * If any rows to add were not added, the row data for those rows. This happens when no `addIndex`
     * is provided while the store's row count is unknown, when `addIndex` is past the end of the store,
     * or when a row with the same ID is already loaded.
     * The status is still `Applied`, as the rest of the transaction was applied.
     */
    unapplied?: TData[];
}

export enum ServerSideTransactionResultStatus {
    /** Transaction was successfully applied */
    Applied = 'Applied',
    /**
     * Store was not found, transaction not applied.
     * Either invalid route, or the parent row has not yet been expanded.
     */
    StoreNotFound = 'StoreNotFound',
    /**
     * Store is loading, transaction not applied.
     */
    StoreLoading = 'StoreLoading',
    /**
     * Store is loading (as max loads exceeded), transaction not applied.
     */
    StoreWaitingToLoad = 'StoreWaitingToLoad',
    /**
     * Store load attempt failed, transaction not applied.
     */
    StoreLoadingFailed = 'StoreLoadingFailed',
    /**
     * Store is type Partial, which doesn't accept transactions
     */
    StoreWrongType = 'StoreWrongType',
    /**
     * Transaction was cancelled, due to grid.
     * Callback isApplyServerSideTransaction() returning false
     */
    Cancelled = 'Cancelled',
    /**
     * Store has not started yet, transaction not applied
     */
    StoreNotStarted = 'StoreNotStarted',
}
