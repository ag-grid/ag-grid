import { _areEqual, _getDocument, _observeIntersection } from 'ag-stack';

import {
    BeanStub,
    GRAND_TOTAL_ROW_ID,
    _addGridCommonParams,
    _getRowIdCallback,
    _isDomLayout,
    _isServerSideRowModel,
} from 'ag-grid-community';
import type {
    BodyScrollEvent,
    NamedBean,
    PaginationChangedEvent,
    RowNode,
    ViewGroupRowRef,
    ViewRow,
    ViewRowRef,
    ViewSubscriptionOptions,
    ViewSubscriptionParams,
} from 'ag-grid-community';

interface SubscribedRow {
    ref: ViewRowRef;
    node: RowNode;
    isGroup: boolean;
}

interface ActiveSubscription {
    readonly rows: Map<string, SubscribedRow>;
    stopped: boolean;
    /** Set while a flush is scheduled. */
    timer: ReturnType<typeof setTimeout> | undefined;
    /** The view at the last flush or scroll. */
    view: ViewEnds;
    /** Set once a failed `subscribeRows` call has scheduled a retry, so a handler that keeps throwing is retried once. */
    retried: boolean;
}

interface ViewEnds {
    first: RowNode | undefined;
    last: RowNode | undefined;
    page: number | undefined;
}

const DEFAULT_DEBOUNCE_MS = 50;

export class ViewSubscriptionService extends BeanStub implements NamedBean {
    beanName = 'viewSubSvc' as const;

    private sub: ActiveSubscription | undefined;
    /** Set on `gridPreDestroyed`, after which a handler that turns the subscription back on cannot start it. */
    private preDestroyed = false;
    /** Set while the grid is scrolled out of the browser viewport, or not displayed. */
    private offscreen = false;
    /** The grid viewport, once the grid body is ready. */
    private eViewport: HTMLElement | undefined;
    /** The page visibility listener and the viewport observer exist only while a subscription is wanted. */
    private removeVisibilityListener: (() => null) | undefined;
    private stopObserving: (() => void) | undefined;
    /**
     * The last handlers set. One `updateGridOptions` call can remove `viewSubscription` and change another option,
     * whose listener may run first and find the option gone, so the rows are unsubscribed through these.
     */
    private lastOptions: ViewSubscriptionOptions | undefined;

    public postConstruct(): void {
        const markDirty = () => this.schedule();
        const markViewMoved = () => this.schedule(true);
        const markScrolled = () => this.onScroll();
        this.addManagedEventListeners({
            gridReady: () => this.refresh(),
            modelUpdated: markDirty,
            viewportChanged: markScrolled,
            // Without virtualisation the rendered rows can stay the same while the visible pixel range changes.
            bodyHeightChanged: markViewMoved,
            // Fired after every model update too, so only a new page moves the view.
            paginationChanged: (event: PaginationChangedEvent) => this.schedule(event.newPage),
            bodyScroll: (event: BodyScrollEvent) => {
                if (event.direction === 'vertical') {
                    markScrolled();
                }
            },
            rowGroupOpened: markDirty,
            expandOrCollapseAll: markDirty,
            sortChanged: markDirty,
            filterChanged: markDirty,
            pinnedRowsChanged: markDirty,
            gridPreDestroyed: () => {
                this.preDestroyed = true;
                this.stop();
            },
        });
        this.addManagedPropertyListener('viewSubscription', ({ previousValue }) => this.refresh(previousValue));
        this.addManagedPropertyListener('viewSubscriptionActive', () => this.refresh());
        this.addManagedPropertyListener('domLayout', markViewMoved);
        this.beans.ctrlsSvc.whenReady(this, ({ gridBodyCtrl }) => {
            this.eViewport = gridBodyCtrl.eGridViewport;
        });
    }

    private setWatching(watch: boolean): void {
        if (!watch) {
            this.stopWatching();
            return;
        }
        if (!this.removeVisibilityListener) {
            [this.removeVisibilityListener] = this.addManagedListeners(_getDocument(this.beans), {
                visibilitychange: () => this.refresh(),
            });
        }
        const eViewport = this.eViewport;
        if (eViewport && !this.stopObserving) {
            this.stopObserving = _observeIntersection(this.beans, eViewport, (entry) =>
                this.setOffscreen(!entry.isIntersecting)
            );
        }
    }

    private stopWatching(): void {
        this.removeVisibilityListener?.();
        this.stopObserving?.();
        this.removeVisibilityListener = undefined;
        this.stopObserving = undefined;
        // Unknown until a new observer reports, so the grid counts as on screen until then.
        this.offscreen = false;
    }

    private setOffscreen(offscreen: boolean): void {
        if (this.offscreen !== offscreen) {
            this.offscreen = offscreen;
            this.refresh();
        }
    }

    /** Only turning the subscription on or off acts here. The handlers and `debounceMs` are read each time they are used. */
    private refresh(previousOptions?: ViewSubscriptionOptions): void {
        const options = this.getOptions();
        const lastOptions = options ?? previousOptions ?? this.lastOptions;
        this.lastOptions = options;
        const wanted =
            !!options && this.gos.get('viewSubscriptionActive') !== false && !this.preDestroyed && this.canSubscribe();
        this.setWatching(wanted);
        if (!options || !wanted || this.isPaused(options)) {
            // Once the option is removed, the rows are unsubscribed through the handlers that were set before.
            this.stop(lastOptions);
        } else if (!this.sub) {
            this.start(options);
        }
    }

    private canSubscribe(): boolean {
        if (!_isServerSideRowModel(this.gos)) {
            return false;
        }
        if (!_getRowIdCallback(this.beans)) {
            this.warn(188, { feature: '`viewSubscription`' });
            return false;
        }
        return true;
    }

    private start(options: ViewSubscriptionOptions): void {
        const sub: ActiveSubscription = {
            rows: new Map(),
            stopped: false,
            timer: undefined,
            view: this.getViewEnds(),
            retried: false,
        };
        this.sub = sub;

        const rows: ViewRow[] = [];
        this.getViewportRows().forEach((node, id) => rows.push(this.addRow(sub, id, node)));
        this.callSubscribeRows(sub, rows, options);
    }

    /** Unsubscribes every subscribed row. Cleared first, so a handler that turns the subscription back on starts afresh. */
    private stop(options = this.getOptions()): void {
        const sub = this.sub;
        if (!sub) {
            return;
        }
        sub.stopped = true;
        this.sub = undefined;
        clearTimeout(sub.timer);

        const refs = Array.from(sub.rows.values(), (row) => row.ref);
        if (refs.length) {
            options?.unsubscribeRows(refs, this.createParams());
        }
    }

    /** Rows on a hidden page, or in a grid scrolled off screen, are unsubscribed until they can be seen again. */
    private isPaused(options: ViewSubscriptionOptions): boolean {
        return options.pauseWhenHidden !== false && (this.offscreen || _getDocument(this.beans).hidden);
    }

    private getOptions(): ViewSubscriptionOptions | undefined {
        return this.gos.get('viewSubscription');
    }

    public override destroy(): void {
        this.stop();
        this.stopWatching();
        super.destroy();
    }

    /** Only a moving view pushes a pending debounce back, so a steady stream of data updates cannot starve it. */
    private schedule(viewMoved = false): void {
        const sub = this.sub;
        if (!sub || (sub.timer !== undefined && !viewMoved)) {
            return;
        }
        clearTimeout(sub.timer);
        sub.timer = setTimeout(() => this.runScheduled(sub), this.getOptions()?.debounceMs ?? DEFAULT_DEBOUNCE_MS);
    }

    /** Keeping rows in view after an update scrolls the grid without changing the rows in view. */
    private onScroll(): void {
        const sub = this.sub;
        if (!sub) {
            return;
        }
        const previous = sub.view;
        const view = this.getViewEnds();
        sub.view = view;
        this.schedule(previous.first !== view.first || previous.last !== view.last || previous.page !== view.page);
    }

    private getViewEnds(): ViewEnds {
        const [first, last] = this.getRange();
        const { rowModel, pagination } = this.beans;
        return { first: rowModel.getRow(first), last: rowModel.getRow(last), page: pagination?.getCurrentPage() };
    }

    private runScheduled(sub: ActiveSubscription): void {
        sub.timer = undefined;
        if (sub.stopped || !this.isAlive()) {
            return;
        }
        this.flush(sub);
    }

    private flush(sub: ActiveSubscription): void {
        sub.view = this.getViewEnds();
        const inView = this.getViewportRows();

        // A stale row is unsubscribed and subscribed again, as its captured ref is out of date.
        const removed: ViewRowRef[] = [];
        sub.rows.forEach((row, id) => {
            if (inView.get(id) !== row.node || this.isStale(row, row.node)) {
                removed.push(row.ref);
                sub.rows.delete(id);
            }
        });
        const added: RowNode[] = [];
        inView.forEach((node, id) => {
            if (!sub.rows.has(id)) {
                added.push(node);
            }
        });

        if (removed.length) {
            try {
                this.getOptions()?.unsubscribeRows(removed, this.createParams());
            } catch (e) {
                // The added rows are not subscribed yet, and no change may come to schedule them.
                this.schedule();
                throw e;
            }
        }
        this.subscribeNodes(sub, added);
    }

    /** Schedules another flush when rows are no longer in view, before calling the handler, which can throw. */
    private subscribeNodes(sub: ActiveSubscription, nodes: RowNode[]): void {
        if (!nodes.length || sub.stopped) {
            return;
        }
        // The `unsubscribeRows` handler can have scrolled the grid or changed the model.
        const inView = this.getViewportRows();
        const rows: ViewRow[] = [];
        let rescheduleNeeded = false;
        for (let i = 0, len = nodes.length; i < len; ++i) {
            const node = nodes[i];
            if (inView.get(node.id!) !== node) {
                // The next flush picks up whatever is in view and subscribable now.
                rescheduleNeeded = true;
                continue;
            }
            rows.push(this.addRow(sub, node.id!, node));
        }
        if (rescheduleNeeded) {
            this.schedule();
        }
        if (rows.length) {
            this.callSubscribeRows(sub, rows, this.getOptions());
        }
    }

    /** Rows passed to a `subscribeRows` call that throws are not subscribed, so they are not passed to `unsubscribeRows`. */
    private callSubscribeRows(
        sub: ActiveSubscription,
        rows: ViewRow[],
        options: ViewSubscriptionOptions | undefined
    ): void {
        // Read before the call, as the handler owns the array and can change it.
        const ids = rows.map((row) => row.id);
        try {
            options?.subscribeRows(rows, this.createParams());
            sub.retried = false;
        } catch (e) {
            for (const id of ids) {
                sub.rows.delete(id);
            }
            if (!sub.retried) {
                // Try the rows in view once more, as no other change may come to subscribe them.
                sub.retried = true;
                this.schedule();
            }
            throw e;
        }
    }

    private getRange(): [number, number] {
        const { rowRenderer, rowModel, ctrlsSvc } = this.beans;
        const first = rowRenderer.firstRenderedRow;
        const last = rowRenderer.lastRenderedRow;
        let top = rowRenderer.firstVisibleVPixel;
        let bottom = rowRenderer.lastVisibleVPixel;
        if (top == null || bottom == null) {
            return [first, last];
        }
        // Sticky rows cover the rows behind them, and are added on their own.
        const gridBodyCtrl = ctrlsSvc.getGridBodyCtrl();
        top += gridBodyCtrl?.stickyTopHeight ?? 0;
        bottom -= gridBodyCtrl?.stickyBottomHeight ?? 0;
        // Only rendered rows can be in view, so they are scanned instead of looking up the pixels in the whole cache.
        let firstInView = -1;
        let lastInView = -1;
        for (let i = first; i <= last; ++i) {
            const row = rowModel.getRow(i);
            const rowTop = row?.rowTop;
            if (rowTop == null || rowTop + (row!.rowHeight ?? 0) <= top) {
                continue;
            }
            // Scroll positions and row heights can be fractional, so a row starting at the bottom edge is not in view.
            if (rowTop >= bottom) {
                break;
            }
            if (firstInView < 0) {
                firstInView = i;
            }
            lastInView = i;
        }
        return firstInView < 0 ? [0, -1] : [firstInView, lastInView];
    }

    /**
     * The subscribable rows in view, by row ID, including the sticky rows over the view
     * and the source rows of rows the user has pinned, as those are always in view.
     */
    private getViewportRows(): Map<string, RowNode> {
        const inView = new Map<string, RowNode>();
        // Print layout renders every row to print the grid, so no row is subscribed.
        if (_isDomLayout(this.gos, 'print')) {
            return inView;
        }
        const [first, last] = this.getRange();
        const { rowModel, pinnedRowModel, rowRenderer } = this.beans;
        const addIfSubscribable = (row: RowNode | undefined) => {
            // A group total row shows its group's values, so it keeps its group subscribed.
            const node = row?.footer && row.id !== GRAND_TOTAL_ROW_ID ? row.sibling : row;
            const id = node?.id;
            if (node && id != null && !inView.has(id) && this.isSubscribable(node)) {
                inView.set(id, node);
            }
        };
        for (let i = first; i <= last; ++i) {
            addIfSubscribable(rowModel.getRow(i));
        }
        // A sticky row stays on screen after its own position scrolls out of view.
        for (const ctrl of rowRenderer.getStickyTopRowCtrls()) {
            addIfSubscribable(ctrl.rowNode);
        }
        for (const ctrl of rowRenderer.getStickyBottomRowCtrls()) {
            addIfSubscribable(ctrl.rowNode);
        }
        if (pinnedRowModel?.isManual()) {
            const addSource = (pinned: RowNode) => {
                const source = pinned.pinnedSibling;
                if (!source?.destroyed) {
                    addIfSubscribable(source);
                }
            };
            pinnedRowModel.forEachPinnedRow('top', addSource);
            pinnedRowModel.forEachPinnedRow('bottom', addSource);
        }
        return inView;
    }

    /** Stores the row as subscribed and returns the row to pass to `subscribeRows`. */
    private addRow(sub: ActiveSubscription, id: string, node: RowNode): ViewRow {
        const ref = this.createRef(id, node);
        const isGroup = this.isGroup(node);
        sub.rows.set(id, { ref, node, isGroup });
        // Handlers get their own arrays: changing them must not affect the stored ref the move check compares.
        const row = { ...ref, parentKeys: ref.parentKeys.slice(), data: node.data } as ViewRow;
        if (row.type !== 'leaf' && row.route) {
            row.route = row.route.slice();
        }
        if (row.type === 'tree') {
            row.hasChildren = isGroup;
        }
        return row;
    }

    private createRef(id: string, node: RowNode): ViewRowRef {
        const parentKeys = node.parent?.getRoute() ?? [];
        const level = node.level;
        const type = this.getRowType(node);
        const ref = { type, id, parentKeys, level } as ViewRowRef;
        const route = this.getRefRoute(node, type);
        if (route) {
            (ref as ViewGroupRowRef).route = route;
        }
        return ref;
    }

    /** Server-side tree data keeps the key of a row that loses its children, so only expandable tree rows get a route. */
    private getRefRoute(node: RowNode, type: ViewRowRef['type']): string[] | undefined {
        if (type === 'group') {
            return node.id === GRAND_TOTAL_ROW_ID ? [] : (node.getRoute() ?? []);
        }
        return type === 'tree' && this.isGroup(node) ? node.getRoute() : undefined;
    }

    private getRowType(node: RowNode): ViewRowRef['type'] {
        // The grand total row is a group row with an empty route: the totals of the whole grid.
        if (node.id === GRAND_TOTAL_ROW_ID) {
            return 'group';
        }
        if (this.gos.get('treeData')) {
            return 'tree';
        }
        return node.group ? 'group' : 'leaf';
    }

    /** A row that moved to another parent, or gained or lost children, has an out of date ref. */
    private isStale({ ref, isGroup }: SubscribedRow, node: RowNode): boolean {
        return (
            isGroup !== this.isGroup(node) ||
            ref.level !== node.level ||
            !_areEqual(ref.parentKeys, node.parent?.getRoute() ?? []) ||
            !_areEqual(ref.type === 'leaf' ? undefined : ref.route, this.getRefRoute(node, ref.type))
        );
    }

    private createParams(): ViewSubscriptionParams {
        return _addGridCommonParams<ViewSubscriptionParams>(this.gos, {});
    }

    /** Server-side tree data leaves `group` unset, so its expandable rows are found by whether they have children. */
    private isGroup(node: RowNode): boolean {
        return !!node.group || (!!this.gos.get('treeData') && node.hasChildren());
    }

    private isSubscribable(node: RowNode): boolean {
        if (node.id === GRAND_TOTAL_ROW_ID) {
            // Pinned, the grand total is shown by a pinned copy and found through its `pinnedSibling`.
            return node.rowPinned == null && !node.destroyed;
        }
        // Level -1 is the root row, shown in pivot mode without row groups. It holds totals.
        return !(
            node.level === -1 ||
            node.stub ||
            node.failedLoad ||
            node.detail ||
            node.footer ||
            node.rowPinned != null
        );
    }
}
