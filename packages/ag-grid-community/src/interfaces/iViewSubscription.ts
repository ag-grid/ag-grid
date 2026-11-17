import type { AgGridCommon } from './iCommon';

interface ViewportRowRefBase {
    /**
     * The row ID, the same as the row node's `id`: the value returned by `getRowId`,
     * or an ID the grid generates for the group rows and tree data filler rows it creates.
     */
    id: string;
    /** The keys of the parent groups, from the top level down. Empty for top-level rows and for rows in flat data. */
    parentKeys: string[];
    /** The row's level in the hierarchy. Top-level rows are level 0. */
    level: number;
}

/** A group row, created by row grouping or pivoting, or loaded as a group by the Server-Side Row Model. */
export interface ViewGroupRowRef extends ViewportRowRefBase {
    type: 'group';
    /** The keys from the top level down to and including this row. */
    route: string[];
}

/** A row in tree data. */
export interface ViewTreeRowRef extends ViewportRowRefBase {
    type: 'tree';
    /**
     * The keys from the top level down to and including this row.
     * Set for every row in client-side tree data, and for the expandable rows in server-side tree data.
     */
    route?: string[];
}

/** A row that is neither a group nor part of tree data: a row in flat data, or a leaf row under groups. */
export interface ViewLeafRowRef extends ViewportRowRefBase {
    type: 'leaf';
}

/** Identifies a row passed to the `viewSubscription` handlers. Captured when the row was subscribed. */
export type ViewRowRef = ViewGroupRowRef | ViewTreeRowRef | ViewLeafRowRef;

export interface ViewGroupRow<TData = any> extends ViewGroupRowRef {
    /** The row's data. `undefined` for group rows the grid creates, such as with client-side row grouping. */
    data: TData | undefined;
}

export interface ViewTreeRow<TData = any> extends ViewTreeRowRef {
    /** `true` if the row has children, including the expandable rows in server-side tree data. */
    hasChildren: boolean;
    /** The row's data. `undefined` for the filler rows the grid creates for missing parents in client-side tree data. */
    data: TData | undefined;
}

export interface ViewLeafRow<TData = any> extends ViewLeafRowRef {
    /** The row's data. */
    data: TData;
}

/** A row passed to `subscribeRows`. Narrow it with `type`. */
export type ViewRow<TData = any> = ViewGroupRow<TData> | ViewTreeRow<TData> | ViewLeafRow<TData>;

export interface ViewSubscriptionParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {}

export interface ViewSubscriptionOptions<TData = any, TContext = any> {
    /**
     * Called with rows that came into view and loaded. Each row is passed once, until it is passed to `unsubscribeRows`.
     * Called when the grid is ready, when `viewSubscriptionActive` is set back to `true`, or when a hidden grid can be seen again,
     * with the rows already in view, even if there are none.
     * Called synchronously, and a returned promise is not awaited, so queue slow work and return straight away.
     */
    subscribeRows(rows: ViewRow<TData>[], params: ViewSubscriptionParams<TData, TContext>): void;
    /**
     * Called with rows that are no longer in view or no longer in the grid. Every subscribed row is passed here exactly once.
     * When rows change, `unsubscribeRows` is called before `subscribeRows`. A row that moves to another parent is passed
     * to `unsubscribeRows` with its old `parentKeys` and `route`, then to `subscribeRows` with the new ones.
     * Called synchronously, and a returned promise is not awaited, so queue slow work and return straight away.
     */
    unsubscribeRows(rows: ViewRowRef[], params: ViewSubscriptionParams<TData, TContext>): void;
    /**
     * Wait until the view has stopped scrolling for this many milliseconds before calling the handlers.
     * Set to `0` to call them as soon as the current task ends.
     * @default 50
     */
    debounceMs?: number;
    /**
     * Unsubscribe every row while the grid cannot be seen: while the page is hidden, for example in a background browser tab
     * or a minimised window, or while the grid is scrolled out of the browser viewport or not displayed.
     * The rows in view are subscribed again once the grid can be seen.
     * Set to `false` to keep the rows subscribed while the grid cannot be seen.
     * @default true
     */
    pauseWhenHidden?: boolean;
}
