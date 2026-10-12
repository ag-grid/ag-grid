import { _areEqual, _requestAnimationFrame } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';
import type { BodyScrollEvent, DisplayedRowsChangedEvent } from '../events';
import {
    _addGridCommonParams,
    _getRowIdCallback,
    _isClientSideRowModel,
    _isDomLayout,
    _isServerSideRowModel,
} from '../gridOptionsUtils';
import type {
    VisibleRow,
    VisibleRowRef,
    VisibleRowsHandlers,
    VisibleRowsOptions,
    VisibleRowsParams,
} from '../interfaces/iVisibleRows';

interface SubscribedRow {
    ref: VisibleRowRef;
    node: RowNode;
}

interface VisibleRowsSubscription {
    readonly handlers: VisibleRowsHandlers;
    readonly includeBuffer: boolean;
    readonly includeGroups: boolean;
    readonly debounceMs: number | undefined;
    readonly throttleMs: number | undefined;
    readonly rows: Map<string, SubscribedRow>;
    scheduled: boolean;
    stopped: boolean;
    lastFlushTime: number;
    /** When the first change not yet flushed happened. */
    firstChangeTime: number;
    timer: ReturnType<typeof setTimeout> | undefined;
}

export class VisibleRowsService extends BeanStub implements NamedBean {
    beanName = 'visibleRowsSvc' as const;

    private readonly subscriptions = new Set<VisibleRowsSubscription>();

    public postConstruct(): void {
        const markDirty = () => this.markPending();
        this.addManagedEventListeners({
            modelUpdated: markDirty,
            viewportChanged: markDirty,
            // A partial redraw can change whether a row is full width, without a model or viewport change.
            displayedRowsChanged: (event: DisplayedRowsChangedEvent) => {
                if (!event.afterScroll) {
                    this.markPending();
                }
            },
            // Without virtualisation the rendered rows can stay the same while the visible pixel range changes.
            bodyHeightChanged: markDirty,
            paginationChanged: markDirty,
            bodyScroll: (event: BodyScrollEvent) => {
                if (event.direction === 'vertical') {
                    this.markPending(true);
                }
            },
            rowGroupOpened: markDirty,
            expandOrCollapseAll: markDirty,
            sortChanged: markDirty,
            filterChanged: markDirty,
            gridPreDestroyed: this.stopAll.bind(this),
        });
    }

    public subscribe(handlers: VisibleRowsHandlers, options: VisibleRowsOptions = {}): () => void {
        const gos = this.gos;
        if (!_isClientSideRowModel(gos) && !_isServerSideRowModel(gos)) {
            this.warn(311, { functionName: 'subscribeToVisibleRows', rowModels: ['clientSide', 'serverSide'] });
            return () => {};
        }
        if (!_getRowIdCallback(this.beans)) {
            this.warn(188, { feature: '`subscribeToVisibleRows`' });
            return () => {};
        }

        const sub: VisibleRowsSubscription = {
            handlers,
            includeBuffer: options.includeBuffer ?? false,
            includeGroups: options.includeGroups ?? true,
            debounceMs: options.debounceMs,
            throttleMs: options.throttleMs,
            rows: new Map(),
            scheduled: false,
            stopped: false,
            lastFlushTime: 0,
            firstChangeTime: 0,
            timer: undefined,
        };
        this.subscriptions.add(sub);

        const [first, last] = this.getRange(sub);
        const rows: VisibleRow[] = [];
        this.getVisibleRows(sub, first, last).forEach((node, id) => rows.push(this.addRow(sub, id, node)));
        sub.lastFlushTime = Date.now();
        handlers.onSubscribe(rows, this.createParams());

        return () => this.stop(sub);
    }

    public override destroy(): void {
        this.stopAll();
        super.destroy();
    }

    private stopAll(): void {
        for (const sub of Array.from(this.subscriptions)) {
            this.stop(sub);
        }
    }

    private stop(sub: VisibleRowsSubscription): void {
        if (sub.stopped) {
            return;
        }
        sub.stopped = true;
        this.subscriptions.delete(sub);

        const refs: VisibleRowRef[] = [];
        sub.rows.forEach((row) => refs.push(row.ref));
        sub.rows.clear();
        if (refs.length) {
            sub.handlers.onUnsubscribe(refs, this.createParams());
        }
    }

    /** Schedules a flush for every subscription, only for those without the buffer if `unbufferedOnly`. */
    private markPending(unbufferedOnly = false): void {
        for (const sub of this.subscriptions) {
            if (!unbufferedOnly || !sub.includeBuffer) {
                this.schedule(sub);
            }
        }
    }

    private schedule(sub: VisibleRowsSubscription): void {
        const { debounceMs, throttleMs } = sub;
        const timed = debounceMs != null || throttleMs != null;
        if (sub.stopped || (sub.scheduled && !timed)) {
            return;
        }
        if (!timed) {
            sub.scheduled = true;
            _requestAnimationFrame(this.beans, () => this.runScheduled(sub));
            return;
        }

        const now = Date.now();
        sub.firstChangeTime = sub.scheduled ? sub.firstChangeTime : now;
        sub.scheduled = true;

        // Each change pushes the debounce back, but a pending change never waits longer than `throttleMs`,
        // and calls are never closer together than `throttleMs`.
        const settledTime = now + (debounceMs ?? 0);
        const dueTime =
            throttleMs == null
                ? settledTime
                : Math.max(sub.lastFlushTime + throttleMs, Math.min(settledTime, sub.firstChangeTime + throttleMs));
        clearTimeout(sub.timer);
        sub.timer = setTimeout(() => this.runScheduled(sub), Math.max(0, dueTime - now));
    }

    private runScheduled(sub: VisibleRowsSubscription): void {
        sub.scheduled = false;
        if (sub.stopped || !this.isAlive()) {
            return;
        }
        this.flush(sub);
    }

    private flush(sub: VisibleRowsSubscription): void {
        const [first, last] = this.getRange(sub);
        const visible = this.getVisibleRows(sub, first, last);

        // A row moved to another parent by a transaction is passed again, as its captured ref is out of date.
        const removed: VisibleRowRef[] = [];
        sub.rows.forEach((row, id) => {
            if (visible.get(id) !== row.node || hasMovedParent(row.ref, row.node)) {
                removed.push(row.ref);
            }
        });
        const added: RowNode[] = [];
        visible.forEach((node, id) => {
            const existing = sub.rows.get(id);
            if (existing?.node !== node || hasMovedParent(existing.ref, node)) {
                added.push(node);
            }
        });

        sub.lastFlushTime = Date.now();
        for (let i = 0, len = removed.length; i < len; ++i) {
            sub.rows.delete(removed[i].id);
        }
        if (removed.length) {
            sub.handlers.onUnsubscribe(removed, this.createParams());
        }
        if (this.subscribeRows(sub, added)) {
            this.schedule(sub);
        }
    }

    /** Returns true when rows were skipped because they are no longer visible, so another flush is needed. */
    private subscribeRows(sub: VisibleRowsSubscription, nodes: RowNode[]): boolean {
        if (!nodes.length || sub.stopped) {
            return false;
        }
        // The `onUnsubscribe` handler can have scrolled the grid or changed the model.
        const [first, last] = this.getRange(sub);
        const rows: VisibleRow[] = [];
        let rescheduleNeeded = false;
        for (let i = 0, len = nodes.length; i < len; ++i) {
            const node = nodes[i];
            if (!this.isVisible(node, first, last) || !this.isSubscribable(node, sub.includeGroups)) {
                // The next flush picks up whatever is visible and subscribable now.
                rescheduleNeeded = true;
                continue;
            }
            rows.push(this.addRow(sub, node.id!, node));
        }
        if (rows.length) {
            sub.handlers.onSubscribe(rows, this.createParams());
        }
        return rescheduleNeeded;
    }

    private isVisible(node: RowNode, first: number, last: number): boolean {
        const index = node.rowIndex;
        return (
            !node.destroyed &&
            index != null &&
            index >= first &&
            index <= last &&
            this.beans.rowModel.getRow(index) === node
        );
    }

    private getRange(sub: VisibleRowsSubscription): [number, number] {
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
        let lastVisible = rowModel.getRowIndexAtPixel(bottom);
        const rowTop = rowModel.getRow(lastVisible)?.rowTop;
        if (lastVisible > first && rowTop != null && rowTop >= bottom) {
            lastVisible--;
        }
        last = Math.min(last, lastVisible);
        return [first, last];
    }

    private getVisibleRows(sub: VisibleRowsSubscription, first: number, last: number): Map<string, RowNode> {
        const rowModel = this.beans.rowModel;
        const visible = new Map<string, RowNode>();
        for (let i = first; i <= last; ++i) {
            const node = rowModel.getRow(i);
            const id = node?.id;
            if (node && id != null && !visible.has(id) && this.isSubscribable(node, sub.includeGroups)) {
                visible.set(id, node);
            }
        }
        return visible;
    }

    /** Stores the row as subscribed and returns the row to pass to `onSubscribe`. */
    private addRow(sub: VisibleRowsSubscription, id: string, node: RowNode): VisibleRow {
        const ref: VisibleRowRef = { id, parentKeys: node.parent?.getRoute() ?? [], level: node.level };
        const route = node.getRoute();
        if (route) {
            ref.route = route;
        }
        sub.rows.set(id, { ref, node });
        // Handlers get their own arrays: changing them must not affect the stored ref the move check compares.
        const row: VisibleRow = {
            ...ref,
            parentKeys: ref.parentKeys.slice(),
            group: this.isGroup(node),
            data: node.data,
        };
        if (route) {
            row.route = route.slice();
        }
        return row;
    }

    private createParams(): VisibleRowsParams {
        return _addGridCommonParams<VisibleRowsParams>(this.gos, {});
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

function hasMovedParent(ref: VisibleRowRef, node: RowNode): boolean {
    return (
        ref.level !== node.level ||
        !_areEqual(ref.parentKeys, node.parent?.getRoute() ?? []) ||
        !_areEqual(ref.route, node.getRoute())
    );
}
