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
    ViewportRow,
    ViewportRowRef,
    ViewportSubscriptionOptions,
    ViewportSubscriptionParams,
    ViewportTreeRow,
} from '../interfaces/iViewportSubscription';

interface SubscribedRow {
    ref: ViewportRowRef;
    node: RowNode;
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
        this.stop();
        const { gos, beans } = this;
        if (!_isClientSideRowModel(gos) && !_isServerSideRowModel(gos)) {
            return;
        }
        const options = gos.get('viewportSubscription');
        if (!options) {
            if (fromApi) {
                this.warn(336);
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
        const sub = this.sub;
        if (!sub) {
            return;
        }
        sub.stopped = true;
        this.sub = undefined;
        clearTimeout(sub.timer);

        const refs: ViewportRowRef[] = [];
        sub.rows.forEach((row) => refs.push(row.ref));
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

        // A row moved to another parent by a transaction is passed again, as its captured ref is out of date.
        const removed: ViewportRowRef[] = [];
        sub.rows.forEach((row, id) => {
            if (inView.get(id) !== row.node || hasMovedParent(row.ref, row.node)) {
                removed.push(row.ref);
            }
        });
        const added: RowNode[] = [];
        inView.forEach((node, id) => {
            const existing = sub.rows.get(id);
            if (existing?.node !== node || hasMovedParent(existing.ref, node)) {
                added.push(node);
            }
        });

        for (let i = 0, len = removed.length; i < len; ++i) {
            sub.rows.delete(removed[i].id);
        }
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
        const [first, last] = this.getRange(sub);
        const pinned = this.getPinnedSourceRows();
        const rows: ViewportRow[] = [];
        let rescheduleNeeded = false;
        for (let i = 0, len = nodes.length; i < len; ++i) {
            const node = nodes[i];
            const inView = pinned.has(node) || this.isInRange(node, first, last);
            if (!inView || !this.isSubscribable(node, sub.includeGroups)) {
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

    private isInRange(node: RowNode, first: number, last: number): boolean {
        const index = node.rowIndex;
        return (
            !node.destroyed &&
            index != null &&
            index >= first &&
            index <= last &&
            this.beans.rowModel.getRow(index) === node
        );
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

    /** The subscribable rows in view, and the source rows of rows the user has pinned, by row ID. */
    private getViewportRows(sub: ActiveSubscription): Map<string, RowNode> {
        const [first, last] = this.getRange(sub);
        const { includeGroups } = sub;
        const rowModel = this.beans.rowModel;
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
        this.getPinnedSourceRows().forEach(addIfSubscribable);
        return inView;
    }

    /** Rows pinned by the user are always in view, so their source rows count as in view too. */
    private getPinnedSourceRows(): Set<RowNode> {
        const sources = new Set<RowNode>();
        const pinnedRowModel = this.beans.pinnedRowModel;
        if (!pinnedRowModel?.isManual()) {
            return sources;
        }
        const addSource = (pinned: RowNode) => {
            const source = pinned.pinnedSibling;
            if (source && !source.destroyed) {
                sources.add(source);
            }
        };
        pinnedRowModel.forEachPinnedRow('top', addSource);
        pinnedRowModel.forEachPinnedRow('bottom', addSource);
        return sources;
    }

    /** Stores the row as subscribed and returns the row to pass to `onSubscribe`. */
    private addRow(sub: ActiveSubscription, id: string, node: RowNode): ViewportRow {
        const ref = this.createRef(id, node);
        sub.rows.set(id, { ref, node });
        // Handlers get their own arrays: changing them must not affect the stored ref the move check compares.
        const parentKeys = ref.parentKeys.slice();
        const data = node.data;
        switch (ref.type) {
            case 'group':
                return { ...ref, parentKeys, route: ref.route.slice(), data };
            case 'tree': {
                const row: ViewportTreeRow = { ...ref, parentKeys, hasChildren: this.isGroup(node), data };
                if (ref.route) {
                    row.route = ref.route.slice();
                }
                return row;
            }
            default:
                return { ...ref, parentKeys, data };
        }
    }

    private createRef(id: string, node: RowNode): ViewportRowRef {
        const parentKeys = node.parent?.getRoute() ?? [];
        const level = node.level;
        const route = node.getRoute();
        if (this.gos.get('treeData')) {
            return route ? { type: 'tree', id, parentKeys, level, route } : { type: 'tree', id, parentKeys, level };
        }
        if (node.group) {
            return { type: 'group', id, parentKeys, level, route: route ?? [] };
        }
        return { type: 'leaf', id, parentKeys, level };
    }

    private createParams(): ViewportSubscriptionParams {
        return _addGridCommonParams<ViewportSubscriptionParams>(this.gos, {});
    }

    /** Server-side tree data leaves `group` unset, so its expandable rows are found by whether they have children. */
    private isGroup(node: RowNode): boolean {
        return !!node.group || (!!this.gos.get('treeData') && node.hasChildren());
    }

    private isSubscribable(node: RowNode, includeGroups: boolean): boolean {
        if (node.stub || node.failedLoad || node.detail || node.footer || node.rowPinned != null) {
            return false;
        }
        if (!includeGroups && this.isGroup(node)) {
            return false;
        }
        const isFullWidthRow = this.gos.getCallback('isFullWidthRow');
        return !isFullWidthRow?.({ rowNode: node });
    }
}

function hasMovedParent(ref: ViewportRowRef, node: RowNode): boolean {
    const route = ref.type === 'leaf' ? undefined : ref.route;
    return (
        ref.level !== node.level ||
        !_areEqual(ref.parentKeys, node.parent?.getRoute() ?? []) ||
        !_areEqual(route, node.getRoute())
    );
}
