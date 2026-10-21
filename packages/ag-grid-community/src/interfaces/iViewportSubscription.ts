import type { AgGridCommon } from './iCommon';

interface ViewportRowRefBase {
    /** The row ID, as returned by `getRowId`. */
    id: string;
    /** The keys of the parent groups, from the top level down. Empty for top-level rows and for rows in flat data. */
    parentKeys: string[];
    /** The row's level in the hierarchy. Top-level rows are level 0. */
    level: number;
}

/** A group row, created by row grouping or pivoting, or loaded as a group by the Server-Side Row Model. */
export interface ViewportGroupRowRef extends ViewportRowRefBase {
    type: 'group';
    /** The keys from the top level down to and including this row. */
    route: string[];
}

/** A row in tree data. */
export interface ViewportTreeRowRef extends ViewportRowRefBase {
    type: 'tree';
    /**
     * The keys from the top level down to and including this row.
     * Set for every row in client-side tree data, and for the expandable rows in server-side tree data.
     */
    route?: string[];
}

/** A row that is neither a group nor part of tree data: a row in flat data, or a leaf row under groups. */
export interface ViewportLeafRowRef extends ViewportRowRefBase {
    type: 'leaf';
}

/** Identifies a row passed to the `viewportSubscription` handlers. Captured when the row was subscribed. */
export type ViewportRowRef = ViewportGroupRowRef | ViewportTreeRowRef | ViewportLeafRowRef;

export interface ViewportGroupRow<TData = any> extends ViewportGroupRowRef {
    /** The row's data. `undefined` for group rows the grid creates, such as with client-side row grouping. */
    data: TData | undefined;
}

export interface ViewportTreeRow<TData = any> extends ViewportTreeRowRef {
    /** `true` if the row has children, including the expandable rows in server-side tree data. */
    hasChildren: boolean;
    /** The row's data. `undefined` for the filler rows the grid creates for missing parents in client-side tree data. */
    data: TData | undefined;
}

export interface ViewportLeafRow<TData = any> extends ViewportLeafRowRef {
    /** The row's data. */
    data: TData;
}

/** A row passed to `onSubscribe`. Narrow it with `type`. */
export type ViewportRow<TData = any> = ViewportGroupRow<TData> | ViewportTreeRow<TData> | ViewportLeafRow<TData>;

export interface ViewportSubscriptionParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {}

export interface ViewportSubscriptionOptions<TData = any, TContext = any> {
    /**
     * Called with rows that came into view and loaded. Each row is passed once, until it is passed to `onUnsubscribe`.
     * Called when the grid is ready, or the subscription starts, with the rows already in view, even if there are none.
     */
    onSubscribe(rows: ViewportRow<TData>[], params: ViewportSubscriptionParams<TData, TContext>): void;
    /**
     * Called with rows that are no longer in view or no longer in the grid. Every subscribed row is passed here exactly once.
     * When rows change, `onUnsubscribe` is called before `onSubscribe`. A row that moves to another parent is passed
     * to `onUnsubscribe` with its old `parentKeys` and `route`, then to `onSubscribe` with the new ones.
     */
    onUnsubscribe(rows: ViewportRowRef[], params: ViewportSubscriptionParams<TData, TContext>): void;
    /**
     * Set to `true` to include the rows rendered in the row buffer above and below the rows in view.
     * @default false
     */
    includeBuffer?: boolean;
    /**
     * Set to `false` to leave out group rows, and tree data rows that have children.
     * @default true
     */
    includeGroups?: boolean;
    /**
     * Wait until the view has stopped scrolling for this many milliseconds before calling the handlers.
     * If not set, changes are passed to the handlers at most once per animation frame.
     */
    debounceMs?: number;
}
