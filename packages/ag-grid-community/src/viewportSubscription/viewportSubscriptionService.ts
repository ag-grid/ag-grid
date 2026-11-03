import { _areEqual, _requestAnimationFrame } from 'ag-stack';

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
    ViewportGroupRowRef,
    ViewportRow,
    ViewportRowRef,
    ViewportSubscriptionOptions,
    ViewportSubscriptionParams,
} from '../interfaces/iViewportSubscription';

interface SubscribedRow {
    ref: ViewportRowRef;
    node: RowNode;
    isGroup: boolean;
}

interface ActiveSubscription {
    readonly options: ViewportSubscriptionOptions;
    readonly includeBuffer: boolean;
    readonly includeGroups: boolean;
    readonly rows: Map<string, SubscribedRow>;
    scheduled: boolean;
    stopped: boolean;
    timer: ReturnType<typeof setTimeout> | undefined;
}

export class ViewportSubscriptionService extends BeanStub implements NamedBean {
    beanName = 'viewportSubSvc' as const;

    private sub: ActiveSubscription | undefined;
    /** Bumped by every start and stop, so a restart can tell whether its `onUnsubscribe` handler started or stopped again. */
    private generation = 0;

    public postConstruct(): void {
        const markDirty = () => this.markPending();
        const markViewMoved = () => this.markPending(true);
        this.addManagedEventListeners({
            gridReady: () => this.start(false),
            modelUpdated: markDirty,
            viewportChanged: markViewMoved,
            // A partial redraw can change whether a row is full width, without a model or viewport change.
            displayedRowsChanged: (event: DisplayedRowsChangedEvent) => {
                if (!event.afterScroll) {
                    this.markPending();
                }
            },
            // Without virtualisation the rendered rows can stay the same while the visible pixel range changes.
            bodyHeightChanged: markViewMoved,
            // Fired after every model update too, so only a new page moves the view.
            paginationChanged: (event: PaginationChangedEvent) => this.markPending(event.newPage),
            bodyScroll: (event: BodyScrollEvent) => {
                if (event.direction === 'vertical') {
                    this.markPending(true, true);
                }
            },
            rowGroupOpened: markDirty,
            expandOrCollapseAll: markDirty,
            sortChanged: markDirty,
            filterChanged: markDirty,
            pinnedRowsChanged: markDirty,
            gridPreDestroyed: this.stop.bind(this),
        });
        this.addManagedPropertyListener('viewportSubscription', () => this.start(false));
    }

    /** Unsubscribes any current rows, then subscribes to the rows in view with the `viewportSubscription` grid option. */
    public start(fromApi: boolean): void {
        const generation = ++this.generation;
        this.release();
        // The `onUnsubscribe` handler can have destroyed the grid, stopped, or changed the option, which has already restarted.
        if (generation !== this.generation || !this.isAlive()) {
            return;
        }
        const { gos, beans } = this;
        if (!_isClientSideRowModel(gos) && !_isServerSideRowModel(gos)) {
            return;
        }
        const options = gos.get('viewportSubscription');
        if (!options) {
            if (fromApi) {
                this.warn(342);
            }
            return;
        }
        if (!_getRowIdCallback(beans)) {
            this.warn(188, { feature: '`viewportSubscription`' });
            return;
        }

        const sub: ActiveSubscription = {
            options,
            includeBuffer: options.includeBuffer ?? false,
            includeGroups: options.includeGroups ?? true,
            rows: new Map(),
            scheduled: false,
            stopped: false,
            timer: undefined,
        };
        this.sub = sub;

        const rows: ViewportRow[] = [];
        this.getViewportRows(sub).forEach((node, id) => rows.push(this.addRow(sub, id, node)));
        options.onSubscribe(rows, this.createParams());
    }

    /** Unsubscribes every subscribed row and detaches the handlers. */
    public stop(): void {
        ++this.generation;
        this.release();
    }

    private release(): void {
        const sub = this.sub;
        if (!sub) {
            return;
        }
        sub.stopped = true;
        this.sub = undefined;
        clearTimeout(sub.timer);

        const refs = Array.from(sub.rows.values(), (row) => row.ref);
        sub.rows.clear();
        if (refs.length) {
            sub.options.onUnsubscribe(refs, this.createParams());
        }
    }

    public override destroy(): void {
        this.stop();
        super.destroy();
    }

    /** Schedules a flush, unless `unbufferedOnly` and the subscription includes the buffer. */
    private markPending(viewMoved = false, unbufferedOnly = false): void {
        const sub = this.sub;
        if (sub && (!unbufferedOnly || !sub.includeBuffer)) {
            this.schedule(sub, viewMoved);
        }
    }

    /** Only a moving view pushes a pending debounce back, so a steady stream of data updates cannot starve it. */
    private schedule(sub: ActiveSubscription, viewMoved = false): void {
        const debounceMs = sub.options.debounceMs;
        if (sub.stopped || (sub.scheduled && (debounceMs == null || !viewMoved))) {
            return;
        }
        sub.scheduled = true;
        if (debounceMs == null) {
            _requestAnimationFrame(this.beans, () => this.runScheduled(sub));
            return;
        }
        clearTimeout(sub.timer);
        sub.timer = setTimeout(() => this.runScheduled(sub), debounceMs);
    }

    private runScheduled(sub: ActiveSubscription): void {
        sub.scheduled = false;
        if (sub.stopped || !this.isAlive()) {
            return;
        }
        this.flush(sub);
    }

    private flush(sub: ActiveSubscription): void {
        const inView = this.getViewportRows(sub);

        // A stale row is unsubscribed and subscribed again, as its captured ref is out of date.
        const removed: ViewportRowRef[] = [];
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
            sub.options.onUnsubscribe(removed, this.createParams());
        }
        if (this.subscribeRows(sub, added)) {
            this.schedule(sub);
        }
    }

    /** Returns true when rows were skipped because they are no longer in view, so another flush is needed. */
    private subscribeRows(sub: ActiveSubscription, nodes: RowNode[]): boolean {
        if (!nodes.length || sub.stopped) {
            return false;
        }
        // The `onUnsubscribe` handler can have scrolled the grid or changed the model.
        const inView = this.getViewportRows(sub);
        const rows: ViewportRow[] = [];
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
        if (rows.length) {
            sub.options.onSubscribe(rows, this.createParams());
        }
        return rescheduleNeeded;
    }

    private getRange(sub: ActiveSubscription): [number, number] {
        const { rowRenderer, rowModel, gos } = this.beans;
        let first = rowRenderer.firstRenderedRow;
        let last = rowRenderer.lastRenderedRow;
        if (sub.includeBuffer || _isDomLayout(gos, 'print')) {
            return [first, last];
        }

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
    private getViewportRows(sub: ActiveSubscription): Map<string, RowNode> {
        const [first, last] = this.getRange(sub);
        const { includeGroups } = sub;
        const { rowModel, pinnedRowModel } = this.beans;
        const inView = new Map<string, RowNode>();
        const addIfSubscribable = (node: RowNode | undefined) => {
            const id = node?.id;
            if (node && id != null && !inView.has(id) && this.isSubscribable(node, includeGroups)) {
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

    /** Stores the row as subscribed and returns the row to pass to `onSubscribe`. */
    private addRow(sub: ActiveSubscription, id: string, node: RowNode): ViewportRow {
        const ref = this.createRef(id, node);
        const isGroup = this.isGroup(node);
        sub.rows.set(id, { ref, node, isGroup });
        // Handlers get their own arrays: changing them must not affect the stored ref the move check compares.
        const row = { ...ref, parentKeys: ref.parentKeys.slice(), data: node.data } as ViewportRow;
        if (row.type !== 'leaf' && row.route) {
            row.route = row.route.slice();
        }
        if (row.type === 'tree') {
            row.hasChildren = isGroup;
        }
        return row;
    }

    private createRef(id: string, node: RowNode): ViewportRowRef {
        const parentKeys = node.parent?.getRoute() ?? [];
        const level = node.level;
        const route = node.getRoute();
        const type = this.gos.get('treeData') ? 'tree' : node.group ? 'group' : 'leaf';
        const ref = { type, id, parentKeys, level } as ViewportRowRef;
        if (type === 'group' || (type === 'tree' && route)) {
            (ref as ViewportGroupRowRef).route = route ?? [];
        }
        return ref;
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

    private createParams(): ViewportSubscriptionParams {
        return _addGridCommonParams<ViewportSubscriptionParams>(this.gos, {});
    }

    /** Server-side tree data leaves `group` unset, so its expandable rows are found by whether they have children. */
    private isGroup(node: RowNode): boolean {
        return !!node.group || (!!this.gos.get('treeData') && node.hasChildren());
    }

    private isSubscribable(node: RowNode, includeGroups: boolean): boolean {
        // Level -1 is the root row, shown in pivot mode without row groups. It holds totals, like the grand total row.
        if (node.level === -1 || node.stub || node.failedLoad || node.detail || node.footer || node.rowPinned != null) {
            return false;
        }
        if (!includeGroups && this.isGroup(node)) {
            return false;
        }
        const isFullWidthRow = this.gos.getCallback('isFullWidthRow');
        return !isFullWidthRow?.({ rowNode: node });
    }
}
