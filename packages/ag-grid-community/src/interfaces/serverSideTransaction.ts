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
     * Updates to rows loaded or updated at a newer version are skipped and returned in `unapplied`.
     * When the level's data version is this version or a newer one, its blocks already include the transaction's adds and removes, so they are skipped and returned in `unapplied`. When `serverSideDataVersionMode` is `'stream'`, the loaded rows are then loaded again at the level's version, as blocks read from older versions may be cached alongside.
     * When `serverSideDataVersionMode` is `'stream'`, a block of the level read from a version older than this transaction is loaded again, so rows of blocks still loading are not changed by it.
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
     * If any rows were not added, updated or removed, the row data for those rows. This happens when the transaction
     * has a `version` and, for updated rows, the row is loaded or updated at a newer version, or, for added and removed
     * rows, the level's data version is this version or a newer one, which already includes them.
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
