import { _requestAnimationFrame } from 'ag-stack';

import type {
    BeanCollection,
    BodyScrollEvent,
    GridOptionsService,
    NamedBean,
    PaginationChangedEvent,
    RowGroupOpenedEvent,
    RowNode,
    VisibleRow,
    VisibleRowRef,
    VisibleRowsHandlers,
    VisibleRowsOptions,
    VisibleRowsParams,
    VisibleRowsReason,
} from 'ag-grid-community';
import { BeanStub, _addGridCommonParams, _getRowIdCallback, _isDomLayout } from 'ag-grid-community';

import { _isUnbalancedGroup } from '../blocks/blockUtils';

interface SubscribedRow {
    ref: VisibleRowRef;
    node: RowNode;
}

interface VisibleRowsSubscription {
    readonly handlers: VisibleRowsHandlers;
    readonly includeBuffer: boolean;
    readonly includeGroups: boolean;
    readonly debounceMs: number | undefined;
    readonly rows: Map<string, SubscribedRow>;
    readonly expandedGroups: Set<RowNode>;
    collapsePending: boolean;
    scrollPending: boolean;
    scheduled: boolean;
    stopped: boolean;
    lastFlushTime: number;
    lastFirst: number;
    lastLast: number;
}

type RowsByReason<T> = Map<VisibleRowsReason, T[]>;

/** Why the grid destroyed a row, when it was not removed, e.g. by a transaction. */
export type VisibleRowsDestroyReason = Extract<VisibleRowsReason, 'reset' | 'collapse'>;

const UNSUBSCRIBE_ORDER: VisibleRowsReason[] = ['reset', 'remove', 'collapse', 'scroll'];
const SUBSCRIBE_ORDER: VisibleRowsReason[] = ['expand', 'collapse', 'load', 'scroll'];

export class SsrmVisibleRowsService extends BeanStub implements NamedBean {
    beanName = 'ssrmVisibleRowsSvc' as const;

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
            gridPreDestroyed: this.stopAll.bind(this),
        });
    }

    public subscribe(handlers: VisibleRowsHandlers, options: VisibleRowsOptions = {}): () => void {
        if (!_getRowIdCallback(this.beans)) {
            this.warn(188, { feature: 'subscribeToVisibleRows' });
            return () => {};
        }

        const sub: VisibleRowsSubscription = {
            handlers,
            includeBuffer: options.includeBuffer ?? false,
            includeGroups: options.includeGroups ?? true,
            debounceMs: options.debounceMs,
            rows: new Map(),
            expandedGroups: new Set(),
            collapsePending: false,
            scrollPending: false,
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
            sub.rows.set(id, { ref, node });
            rows.push(this.createVisibleRow(ref, node));
        });
        sub.lastFirst = first;
        sub.lastLast = last;
        sub.lastFlushTime = Date.now();
        handlers.onSubscribe(rows, this.createParams('initial'));

        return () => this.stop(sub);
    }

    /** Rows destroyed while `destroy` runs, including those in child stores, are reported with `reason`. */
    public runDestroying(reason: VisibleRowsDestroyReason, destroy: () => void): void {
        const previous = this.destroyReason;
        this.destroyReason = reason;
        try {
            destroy();
        } finally {
            this.destroyReason = previous;
        }
    }

    /** Called by a store cache before it destroys one of its rows. */
    public onRowDestroying(node: RowNode): void {
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
            }
        });

        sub.expandedGroups.clear();
        sub.collapsePending = false;
        sub.scrollPending = false;
        sub.lastFirst = first;
        sub.lastLast = last;
        sub.lastFlushTime = Date.now();

        while (removed.length && !sub.stopped) {
            // Worked out again after each handler, which can purge or remove the rows still waiting.
            const byReason: RowsByReason<SubscribedRow> = new Map();
            for (const row of removed) {
                addToReason(byReason, this.getUnsubscribeReason(row.node), row);
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
                sub.rows.set(id, { ref, node });
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
            if (node && id != null && !visible.has(id) && isSubscribable(node, sub.includeGroups)) {
                visible.set(id, node);
            }
        }
        return visible;
    }

    private getUnsubscribeReason(node: RowNode): VisibleRowsReason {
        if (node.destroyed) {
            return this.destroyedRowReasons.get(node) ?? 'remove';
        }
        if (isUnderCollapsedGroup(this.gos, node)) {
            return 'collapse';
        }
        return node.rowIndex == null ? 'remove' : 'scroll';
    }

    private getSubscribeReason(node: RowNode, sub: VisibleRowsSubscription): VisibleRowsReason {
        if (sub.expandedGroups.size && hasAncestorIn(node, sub.expandedGroups)) {
            return 'expand';
        }
        if (sub.collapsePending) {
            return 'collapse';
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
}

function isSubscribable(node: RowNode, includeGroups: boolean): boolean {
    return (
        !node.stub &&
        !node.failedLoad &&
        !node.detail &&
        !node.footer &&
        node.rowPinned == null &&
        (includeGroups || !node.group)
    );
}

function isUnderCollapsedGroup(gos: GridOptionsService, node: RowNode): boolean {
    let parent = node.parent;
    while (parent && parent.level >= 0) {
        // Matches BlockUtils.setDisplayIndex, which always shows the children of an unbalanced group.
        if (!parent.expanded && !_isUnbalancedGroup(gos, parent)) {
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

export function _getSsrmVisibleRowsService(beans: BeanCollection): SsrmVisibleRowsService | undefined {
    return beans.ssrmVisibleRowsSvc as SsrmVisibleRowsService | undefined;
}
