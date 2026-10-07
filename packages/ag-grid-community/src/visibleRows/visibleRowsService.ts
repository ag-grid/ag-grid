import { _requestAnimationFrame } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';
import type { BodyScrollEvent, ExpandOrCollapseAllEvent, PaginationChangedEvent, RowGroupOpenedEvent } from '../events';
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
    VisibleRowsReason,
} from '../interfaces/iVisibleRows';

interface SubscribedRow {
    ref: VisibleRowRef;
    node: RowNode;
    /** The row's index when last checked, to tell rows moved by a sort or filter from rows scrolled past. */
    index: number | null;
}

interface VisibleRowsSubscription {
    readonly handlers: VisibleRowsHandlers;
    readonly includeBuffer: boolean;
    readonly includeGroups: boolean;
    readonly debounceMs: number | undefined;
    readonly rows: Map<string, SubscribedRow>;
    readonly expandedGroups: Set<RowNode>;
    expandAllPending: boolean;
    collapsePending: boolean;
    scrollPending: boolean;
    sortPending: boolean;
    filterPending: boolean;
    scheduled: boolean;
    stopped: boolean;
    lastFlushTime: number;
    lastFirst: number;
    lastLast: number;
}

type RowsByReason<T> = Map<VisibleRowsReason, T[]>;

/** Why the grid destroyed a row, when it was not removed, e.g. by a transaction. */
export type VisibleRowsDestroyReason = Extract<VisibleRowsReason, 'reset' | 'collapse'>;

const UNSUBSCRIBE_ORDER: VisibleRowsReason[] = ['reset', 'remove', 'collapse', 'filter', 'sort', 'scroll'];
const SUBSCRIBE_ORDER: VisibleRowsReason[] = ['expand', 'collapse', 'filter', 'sort', 'load', 'scroll'];

export class VisibleRowsService extends BeanStub implements NamedBean {
    beanName = 'visibleRowsSvc' as const;

    private readonly subscriptions = new Set<VisibleRowsSubscription>();
    /** Rows destroyed by a purge, reset or collapse, as opposed to a removal, e.g. by a transaction. */
    private readonly destroyedRowReasons = new WeakMap<RowNode, VisibleRowsDestroyReason>();
    private destroyReason: VisibleRowsDestroyReason | undefined;

    public postConstruct(): void {
        const markAllDirty = () => this.markAllDirty(false);
        this.addManagedEventListeners({
            modelUpdated: markAllDirty,
            viewportChanged: markAllDirty,
            // Without virtualisation the rendered rows can stay the same while the visible pixel range changes.
            bodyHeightChanged: () => this.onScroll(false),
            paginationChanged: (event: PaginationChangedEvent) => {
                if (event.newPage) {
                    this.onScroll(false);
                } else {
                    this.markAllDirty(false);
                }
            },
            bodyScroll: (event: BodyScrollEvent) => {
                if (event.direction === 'vertical') {
                    this.onScroll(true);
                }
            },
            rowGroupOpened: this.onRowGroupOpened.bind(this),
            expandOrCollapseAll: this.onExpandOrCollapseAll.bind(this),
            sortChanged: () => this.markPending('sortPending'),
            filterChanged: () => this.markPending('filterPending'),
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
            this.warn(336);
            return () => {};
        }

        const sub: VisibleRowsSubscription = {
            handlers,
            includeBuffer: options.includeBuffer ?? false,
            includeGroups: options.includeGroups ?? true,
            debounceMs: options.debounceMs,
            rows: new Map(),
            expandedGroups: new Set(),
            expandAllPending: false,
            collapsePending: false,
            scrollPending: false,
            sortPending: false,
            filterPending: false,
            scheduled: false,
            stopped: false,
            lastFlushTime: 0,
            lastFirst: 0,
            lastLast: -1,
        };
        this.subscriptions.add(sub);

        const [first, last] = this.getRange(sub);
        const visible = this.getVisibleRows(sub, first, last);
        const rows: VisibleRow[] = [];
        visible.forEach((node, id) => {
            const ref = this.createRef(id, node);
            sub.rows.set(id, { ref, node, index: node.rowIndex });
            rows.push(this.createVisibleRow(ref, node));
        });
        sub.lastFirst = first;
        sub.lastLast = last;
        sub.lastFlushTime = Date.now();
        handlers.onSubscribe(rows, this.createParams('initial'));

        return () => this.stop(sub);
    }

    /** Rows destroyed while `destroy` runs, including their child rows, are reported with `reason`. */
    public runDestroying(reason: VisibleRowsDestroyReason, destroy: () => void): void {
        const previous = this.destroyReason;
        this.destroyReason = reason;
        try {
            destroy();
        } finally {
            this.destroyReason = previous;
        }
    }

    /** Called by every row node as it is destroyed. */
    public onRowDestroyed(node: RowNode): void {
        if (this.destroyReason) {
            this.destroyedRowReasons.set(node, this.destroyReason);
        }
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
        sub.expandedGroups.clear();
        if (refs.length) {
            sub.handlers.onUnsubscribe(refs, this.createParams('stop'));
        }
    }

    private onRowGroupOpened(event: RowGroupOpenedEvent): void {
        const node = event.node as RowNode;
        for (const sub of this.subscriptions) {
            if (event.expanded) {
                sub.expandedGroups.add(node);
            } else {
                sub.collapsePending = true;
            }
        }
        this.markAllDirty(false);
    }

    private onExpandOrCollapseAll(event: ExpandOrCollapseAllEvent): void {
        const expanded = event.source === 'expandAll';
        for (const sub of this.subscriptions) {
            if (expanded) {
                sub.expandAllPending = true;
            } else {
                sub.collapsePending = true;
            }
        }
        this.markAllDirty(false);
    }

    private markPending(pending: 'sortPending' | 'filterPending'): void {
        for (const sub of this.subscriptions) {
            sub[pending] = true;
        }
        this.markAllDirty(false);
    }

    private onScroll(fromBodyScroll: boolean): void {
        for (const sub of this.subscriptions) {
            sub.scrollPending = true;
        }
        this.markAllDirty(fromBodyScroll);
    }

    private markAllDirty(unbufferedOnly: boolean): void {
        for (const sub of this.subscriptions) {
            if (!unbufferedOnly || !sub.includeBuffer) {
                this.schedule(sub);
            }
        }
    }

    private schedule(sub: VisibleRowsSubscription): void {
        if (sub.scheduled || sub.stopped) {
            return;
        }
        sub.scheduled = true;

        const run = () => {
            sub.scheduled = false;
            if (sub.stopped || !this.isAlive()) {
                return;
            }
            this.flush(sub);
        };

        const debounceMs = sub.debounceMs;
        if (debounceMs == null) {
            _requestAnimationFrame(this.beans, run);
            return;
        }
        const delay = Math.max(0, sub.lastFlushTime + debounceMs - Date.now());
        setTimeout(run, delay);
    }

    private flush(sub: VisibleRowsSubscription): void {
        const [first, last] = this.getRange(sub);
        const visible = this.getVisibleRows(sub, first, last);

        let removed: SubscribedRow[] = [];
        sub.rows.forEach((row, id) => {
            if (visible.get(id) !== row.node) {
                removed.push(row);
            }
        });

        const added: RowsByReason<RowNode> = new Map();
        visible.forEach((node, id) => {
            const existing = sub.rows.get(id);
            if (existing?.node !== node) {
                addToReason(added, this.getSubscribeReason(node, sub), node);
            } else {
                // Taken before any handler runs, so a sort or filter a handler applies is seen by the next flush.
                existing.index = node.rowIndex;
            }
        });

        // Read before the pending flags below are cleared.
        const removedReasons = new Map<SubscribedRow, VisibleRowsReason>();
        for (const row of removed) {
            removedReasons.set(row, this.getMovedReason(row, sub));
        }

        sub.expandedGroups.clear();
        sub.expandAllPending = false;
        sub.collapsePending = false;
        sub.scrollPending = false;
        sub.sortPending = false;
        sub.filterPending = false;
        sub.lastFirst = first;
        sub.lastLast = last;
        sub.lastFlushTime = Date.now();

        while (removed.length && !sub.stopped) {
            // Worked out again after each handler, which can purge or remove the rows still waiting.
            const byReason: RowsByReason<SubscribedRow> = new Map();
            for (const row of removed) {
                addToReason(byReason, this.getUnsubscribeReason(row, removedReasons.get(row)!), row);
            }
            const reason = UNSUBSCRIBE_ORDER.find((r) => byReason.has(r))!;
            const rows = byReason.get(reason)!;
            byReason.delete(reason);
            removed = Array.from(byReason.values()).flat();

            const refs: VisibleRowRef[] = [];
            for (let i = 0, len = rows.length; i < len; ++i) {
                const ref = rows[i].ref;
                sub.rows.delete(ref.id);
                refs.push(ref);
            }
            sub.handlers.onUnsubscribe(refs, this.createParams(reason));
        }

        let rescheduleNeeded = false;
        for (const reason of SUBSCRIBE_ORDER) {
            const nodes = added.get(reason);
            if (!nodes || sub.stopped) {
                continue;
            }
            // An earlier handler can have scrolled the grid or changed the model.
            const [first, last] = this.getRange(sub);
            const rows: VisibleRow[] = [];
            for (let i = 0, len = nodes.length; i < len; ++i) {
                const node = nodes[i];
                if (!this.isVisible(node, first, last)) {
                    // The next flush picks up whatever is visible now.
                    rescheduleNeeded = true;
                    continue;
                }
                const id = node.id!;
                const ref = this.createRef(id, node);
                sub.rows.set(id, { ref, node, index: node.rowIndex });
                rows.push(this.createVisibleRow(ref, node));
            }
            if (rows.length) {
                sub.handlers.onSubscribe(rows, this.createParams(reason));
            }
        }

        if (rescheduleNeeded) {
            this.schedule(sub);
        }
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
        last = Math.min(last, rowModel.getRowIndexAtPixel(bottom - 1));
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

    /**
     * The reason for a row that is still alive, taken while the batch's sort and filter flags are set.
     * Destruction is checked separately, as a handler can destroy rows while the batch runs.
     */
    private getMovedReason(row: SubscribedRow, sub: VisibleRowsSubscription): VisibleRowsReason {
        const node = row.node;
        if (isUnderCollapsedGroup(node)) {
            return 'collapse';
        }
        // A refresh can keep a replaced row alive, with its old index, until the refresh finishes.
        const index = node.rowIndex;
        if (index != null && this.beans.rowModel.getRow(index) === node) {
            if (index !== row.index) {
                if (sub.sortPending) {
                    return 'sort';
                }
                if (sub.filterPending) {
                    return 'filter';
                }
            }
            return 'scroll';
        }
        // A row filtered out is still in the grid, unlike a removed row.
        return sub.filterPending && this.beans.rowModel.getRowNode(row.ref.id) === node ? 'filter' : 'remove';
    }

    private getUnsubscribeReason(row: SubscribedRow, movedReason: VisibleRowsReason): VisibleRowsReason {
        const node = row.node;
        if (node.destroyed) {
            return this.destroyedRowReasons.get(node) ?? 'remove';
        }
        return movedReason;
    }

    private getSubscribeReason(node: RowNode, sub: VisibleRowsSubscription): VisibleRowsReason {
        if (sub.expandAllPending || (sub.expandedGroups.size && hasAncestorIn(node, sub.expandedGroups))) {
            return 'expand';
        }
        if (sub.collapsePending) {
            return 'collapse';
        }
        if (sub.filterPending) {
            return 'filter';
        }
        if (sub.sortPending) {
            return 'sort';
        }
        const index = node.rowIndex;
        const wasOutOfRange = index == null || index < sub.lastFirst || index > sub.lastLast;
        return sub.scrollPending && wasOutOfRange ? 'scroll' : 'load';
    }

    private createRef(id: string, node: RowNode): VisibleRowRef {
        const ref: VisibleRowRef = {
            id,
            parentKeys: node.parent?.getRoute() ?? [],
            level: node.level,
        };
        const route = node.getRoute();
        if (route) {
            ref.route = route;
        }
        return ref;
    }

    private createVisibleRow(ref: VisibleRowRef, node: RowNode): VisibleRow {
        return { ...ref, group: !!node.group, data: node.data };
    }

    private createParams(reason: VisibleRowsReason): VisibleRowsParams {
        return _addGridCommonParams<VisibleRowsParams>(this.gos, { reason });
    }

    private isSubscribable(node: RowNode, includeGroups: boolean): boolean {
        if (node.stub || node.failedLoad || node.detail || node.footer || node.rowPinned != null) {
            return false;
        }
        if (!includeGroups && node.group) {
            return false;
        }
        const isFullWidthRow = this.gos.getCallback('isFullWidthRow');
        return !isFullWidthRow?.({ rowNode: node });
    }
}

/** A hidden group, such as one with an empty key under `groupAllowUnbalanced`, does not hide its children. */
function isUnderCollapsedGroup(node: RowNode): boolean {
    let parent = node.parent;
    while (parent && parent.level >= 0) {
        if (!parent.expanded && parent.rowIndex != null) {
            return true;
        }
        parent = parent.parent;
    }
    return false;
}

function hasAncestorIn(node: RowNode, groups: Set<RowNode>): boolean {
    let parent = node.parent;
    while (parent && parent.level >= 0) {
        if (groups.has(parent)) {
            return true;
        }
        parent = parent.parent;
    }
    return false;
}

function addToReason<T>(map: RowsByReason<T>, reason: VisibleRowsReason, item: T): void {
    const list = map.get(reason);
    if (list) {
        list.push(item);
    } else {
        map.set(reason, [item]);
    }
}
