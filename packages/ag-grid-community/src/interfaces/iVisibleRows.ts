import type { AgGridCommon } from './iCommon';

/** Identifies a row passed to `subscribeToVisibleRows` handlers. Captured when the row was subscribed. */
export interface VisibleRowRef {
    /** The row ID, as returned by `getRowId`. */
    id: string;
    /**
     * The keys from the top level down to and including this row.
     * Set for rows that have a key: group rows, every row in client-side tree data, and the expandable rows in server-side tree data.
     * Not set for rows in flat data, leaf rows under groups, or leaf rows in server-side tree data.
     */
    route?: string[];
    /** The keys of the parent groups, from the top level down. Empty for top-level rows and for rows in flat data. */
    parentKeys: string[];
    /** The row's level in the hierarchy. Top-level rows are level 0. */
    level: number;
}

export interface VisibleRow<TData = any> extends VisibleRowRef {
    /** `true` if the row is a group, including the expandable rows in server-side tree data. */
    group: boolean;
    /** The row's data. Can be `undefined` for group rows the grid creates, such as with client-side row grouping. */
    data: TData | undefined;
}

export interface VisibleRowsParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {}

export interface VisibleRowsHandlers<TData = any, TContext = any> {
    /**
     * Called with rows that became visible and loaded. Each row is passed once, until it is passed to `onUnsubscribe`.
     * Called straight away with the rows already visible, even if there are none.
     */
    onSubscribe(rows: VisibleRow<TData>[], params: VisibleRowsParams<TData, TContext>): void;
    /**
     * Called with rows that are no longer visible or no longer in the grid. Every subscribed row is passed here exactly once.
     * When rows change, `onUnsubscribe` is called before `onSubscribe`. A row that moves to another parent is passed
     * to `onUnsubscribe` with its old `parentKeys` and `route`, then to `onSubscribe` with the new ones.
     */
    onUnsubscribe(rows: VisibleRowRef[], params: VisibleRowsParams<TData, TContext>): void;
}

export interface VisibleRowsOptions {
    /**
     * Set to `true` to include the rows rendered in the row buffer above and below the visible rows.
     * @default false
     */
    includeBuffer?: boolean;
    /**
     * Wait until rows have stopped changing for this many milliseconds before calling the handlers.
     * If neither `debounceMs` nor `throttleMs` is set, changes are passed to the handlers at most once per animation frame.
     */
    debounceMs?: number;
    /**
     * The minimum time in milliseconds between calls while rows keep changing. A final call is always made once
     * changes stop. With `debounceMs`, also the longest a change waits for rows to stop changing.
     */
    throttleMs?: number;
    /**
     * Set to `false` to leave group rows out.
     * @default true
     */
    includeGroups?: boolean;
}
