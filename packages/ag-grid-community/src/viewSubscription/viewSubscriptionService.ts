import { _areEqual } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';
import type { BodyScrollEvent, DisplayedRowsChangedEvent, PaginationChangedEvent } from '../events';
import {
    _addGridCommonParams,
    _getRowIdCallback,
    _isClientSideRowModel,
    _isDomLayout,
    _isServerSideRowModel,
} from '../gridOptionsUtils';
import type {
    ViewGroupRowRef,
    ViewRow,
    ViewRowRef,
    ViewSubscriptionOptions,
    ViewSubscriptionParams,
} from '../interfaces/iViewSubscription';

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
}

const DEFAULT_DEBOUNCE_MS = 50;

export class ViewSubscriptionService extends BeanStub implements NamedBean {
    beanName = 'viewSubSvc' as const;

    private sub: ActiveSubscription | undefined;

    public postConstruct(): void {
        const markDirty = () => this.schedule();
        const markViewMoved = () => this.schedule(true);
        this.addManagedEventListeners({
            gridReady: () => this.refresh(),
            modelUpdated: markDirty,
            viewportChanged: markViewMoved,
            // A partial redraw can change whether a row is full width, without a model or viewport change.
            displayedRowsChanged: (event: DisplayedRowsChangedEvent) => {
                if (!event.afterScroll) {
                    markDirty();
                }
            },
            // Without virtualisation the rendered rows can stay the same while the visible pixel range changes.
            bodyHeightChanged: markViewMoved,
            // Fired after every model update too, so only a new page moves the view.
            paginationChanged: (event: PaginationChangedEvent) => this.schedule(event.newPage),
            bodyScroll: (event: BodyScrollEvent) => {
                if (event.direction === 'vertical') {
                    markViewMoved();
                }
            },
            rowGroupOpened: markDirty,
            expandOrCollapseAll: markDirty,
            sortChanged: markDirty,
            filterChanged: markDirty,
            pinnedRowsChanged: markDirty,
            gridPreDestroyed: () => this.stop(),
        });
        this.addManagedPropertyListener('viewSubscription', ({ previousValue }) => this.refresh(previousValue));
        this.addManagedPropertyListener('viewSubscriptionActive', () => this.refresh());
        this.addManagedPropertyListener('domLayout', markViewMoved);
    }

    /** Only turning the subscription on or off acts here. The handlers and `debounceMs` are read each time they are used. */
    private refresh(previousOptions?: ViewSubscriptionOptions): void {
        const options = this.getOptions();
        if (!options || this.gos.get('viewSubscriptionActive') === false) {
            // Once the option is removed, the rows are unsubscribed through the handlers that were set before.
            this.stop(options ?? previousOptions);
        } else if (!this.sub) {
            this.start(options);
        }
    }

    private start(options: ViewSubscriptionOptions): void {
        const { gos, beans } = this;
        if (!_isClientSideRowModel(gos) && !_isServerSideRowModel(gos)) {
            return;
        }
        if (!_getRowIdCallback(beans)) {
            this.warn(188, { feature: '`viewSubscription`' });
            return;
        }

        const sub: ActiveSubscription = { rows: new Map(), stopped: false, timer: undefined };
        this.sub = sub;

        const rows: ViewRow[] = [];
        this.getViewportRows().forEach((node, id) => rows.push(this.addRow(sub, id, node)));
        options.subscribeRows(rows, this.createParams());
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

    private getOptions(): ViewSubscriptionOptions | undefined {
        return this.gos.get('viewSubscription');
    }

    public override destroy(): void {
        this.stop();
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

    private runScheduled(sub: ActiveSubscription): void {
        sub.timer = undefined;
        if (sub.stopped || !this.isAlive()) {
            return;
        }
        this.flush(sub);
    }

    private flush(sub: ActiveSubscription): void {
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
            this.getOptions()?.subscribeRows(rows, this.createParams());
        }
    }

    private getRange(): [number, number] {
        const { rowRenderer, rowModel } = this.beans;
        let first = rowRenderer.firstRenderedRow;
        let last = rowRenderer.lastRenderedRow;
        const top = rowRenderer.firstVisibleVPixel;
        const bottom = rowRenderer.lastVisibleVPixel;
        if (top == null || bottom == null) {
            return [first, last];
        }
        if (bottom <= top) {
            return [0, -1];
        }
        first = Math.max(first, rowModel.getRowIndexAtPixel(top));
        // Scroll positions and row heights can be fractional, so check where the row at the bottom edge starts.
        let lastInView = rowModel.getRowIndexAtPixel(bottom);
        const rowTop = rowModel.getRow(lastInView)?.rowTop;
        if (lastInView > first && rowTop != null && rowTop >= bottom) {
            lastInView--;
        }
        last = Math.min(last, lastInView);
        return [first, last];
    }

    /** The subscribable rows in view, and the source rows of rows the user has pinned, as those are always in view, by row ID. */
    private getViewportRows(): Map<string, RowNode> {
        const inView = new Map<string, RowNode>();
        // Print layout renders every row to print the grid, so no row is subscribed.
        if (_isDomLayout(this.gos, 'print')) {
            return inView;
        }
        const [first, last] = this.getRange();
        const { rowModel, pinnedRowModel } = this.beans;
        const addIfSubscribable = (node: RowNode | undefined) => {
            const id = node?.id;
            if (node && id != null && !inView.has(id) && this.isSubscribable(node)) {
                inView.set(id, node);
            }
        };
        for (let i = first; i <= last; ++i) {
            addIfSubscribable(rowModel.getRow(i));
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
        const route = node.getRoute();
        const type = this.getRowType(node);
        const ref = { type, id, parentKeys, level } as ViewRowRef;
        if (type === 'group' || (type === 'tree' && route)) {
            (ref as ViewGroupRowRef).route = route ?? [];
        }
        return ref;
    }

    private getRowType(node: RowNode): ViewRowRef['type'] {
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
            !_areEqual(ref.type === 'leaf' ? undefined : ref.route, node.getRoute())
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
        // Level -1 is the root row, shown in pivot mode without row groups. It holds totals, like the grand total row.
        if (node.level === -1 || node.stub || node.failedLoad || node.detail || node.footer || node.rowPinned != null) {
            return false;
        }
        const isFullWidthRow = this.gos.getCallback('isFullWidthRow');
        return !isFullWidthRow?.({ rowNode: node });
    }
}
