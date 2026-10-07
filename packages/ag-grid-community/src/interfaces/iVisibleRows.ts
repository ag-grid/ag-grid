import type { AgGridCommon } from './iCommon';

/**
 * Why a batch of rows was passed to `onSubscribe` or `onUnsubscribe`.
 * - `'initial'`: the rows already visible when the subscription started.
 * - `'scroll'`: rows entered the view by scrolling or paging, or left the view while still in the grid.
 * - `'load'`: rows appeared in the view without scrolling, for example when their block finished loading.
 * - `'expand'`: rows shown by expanding a group.
 * - `'collapse'`: rows hidden, or brought into view, by collapsing a group.
 * - `'sort'`: rows moved into or out of the view by a sort that kept them in the grid.
 * - `'filter'`: rows filtered in or out, or moved into or out of the view by a filter.
 * - `'reset'`: rows dropped because the grid's rows were reset, for example by new row data, a purge or regrouping.
 * - `'remove'`: rows no longer in the grid, for example removed by a transaction or a refresh.
 * - `'stop'`: the subscription was stopped or the grid was destroyed.
 */
export type VisibleRowsReason =
    'initial' | 'scroll' | 'load' | 'expand' | 'collapse' | 'sort' | 'filter' | 'reset' | 'remove' | 'stop';

/** Identifies a row passed to `subscribeToVisibleRows` handlers. Captured when the row was subscribed. */
export interface VisibleRowRef {
    /** The row ID, as returned by `getRowId`. */
    id: string;
    /**
     * The keys from the top level down to and including this row.
     * Set for rows that have a key: group rows, and every row in tree data. Not set for rows in flat data or leaf rows under groups.
     */
    route?: string[];
    /** The keys of the parent groups, from the top level down. Empty for top-level rows and for rows in flat data. */
    parentKeys: string[];
    /** The row's level in the hierarchy. Top-level rows are level 0. */
    level: number;
}

export interface VisibleRow<TData = any> extends VisibleRowRef {
    /** `true` if the row is a group. */
    group: boolean;
    /** The row's data. */
    data: TData;
}

export interface VisibleRowsParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** Why the rows were passed. */
    reason: VisibleRowsReason;
}

export interface VisibleRowsHandlers<TData = any, TContext = any> {
    /**
     * Called with rows that became visible and loaded. Each row is passed once, until it is passed to `onUnsubscribe`.
     * Called straight away with the rows already visible, with `reason: 'initial'`, even if there are none.
     */
    onSubscribe(rows: VisibleRow<TData>[], params: VisibleRowsParams<TData, TContext>): void;
    /**
     * Called with rows that are no longer visible or no longer in the grid. Every subscribed row is passed here exactly once.
     * Within one batch, `onUnsubscribe` is called before `onSubscribe`.
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
     * The minimum time in milliseconds between calls while rows keep changing. A final call is always made once
     * changes stop. If not set, the handlers are called at most once per animation frame.
     */
    debounceMs?: number;
    /**
     * Set to `false` to leave group rows out.
     * @default true
     */
    includeGroups?: boolean;
}
