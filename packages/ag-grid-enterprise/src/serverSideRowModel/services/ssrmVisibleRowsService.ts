import { _requestAnimationFrame } from 'ag-stack';

import type {
    BeanCollection,
    BodyScrollEvent,
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
    resetPending: boolean;
    scrollPending: boolean;
    scheduled: boolean;
    stopped: boolean;
    lastFlushTime: number;
    lastFirst: number;
    lastLast: number;
}

type RowsByReason<T> = Map<VisibleRowsReason, T[]>;

const UNSUBSCRIBE_ORDER: VisibleRowsReason[] = ['reset', 'remove', 'collapse', 'scroll'];
const SUBSCRIBE_ORDER: VisibleRowsReason[] = ['expand', 'collapse', 'load', 'scroll'];

export class SsrmVisibleRowsService extends BeanStub implements NamedBean {
    beanName = 'ssrmVisibleRowsSvc' as const;

    private readonly subscriptions = new Set<VisibleRowsSubscription>();

    public postConstruct(): void {
        const markAllDirty = () => this.markAllDirty(false);
        this.addManagedEventListeners({
            modelUpdated: markAllDirty,
            viewportChanged: markAllDirty,
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
            resetPending: false,
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

    /** Called when SSRM drops loaded rows wholesale, e.g. a purge or a reset of the root store. */
    public onRowsReset(): void {
        for (const sub of this.subscriptions) {
            sub.resetPending = true;
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

        const removed: RowsByReason<SubscribedRow> = new Map();
        sub.rows.forEach((row, id) => {
            if (visible.get(id) !== row.node) {
                addToReason(removed, this.getUnsubscribeReason(row.node, sub.resetPending), row);
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
        sub.resetPending = false;
        sub.scrollPending = false;
        sub.lastFirst = first;
        sub.lastLast = last;
        sub.lastFlushTime = Date.now();

        for (const reason of UNSUBSCRIBE_ORDER) {
            const rows = removed.get(reason);
            if (!rows || sub.stopped) {
                continue;
            }
            const refs: VisibleRowRef[] = [];
            for (let i = 0, len = rows.length; i < len; ++i) {
                const ref = rows[i].ref;
                sub.rows.delete(ref.id);
                refs.push(ref);
            }
            sub.handlers.onUnsubscribe(refs, this.createParams(reason));
        }

        for (const reason of SUBSCRIBE_ORDER) {
            const nodes = added.get(reason);
            if (!nodes || sub.stopped) {
                continue;
            }
            const rows: VisibleRow[] = [];
            for (let i = 0, len = nodes.length; i < len; ++i) {
                const node = nodes[i];
                const id = node.id!;
                const ref = this.createRef(id, node);
                sub.rows.set(id, { ref, node });
                rows.push(this.createVisibleRow(ref, node));
            }
            sub.handlers.onSubscribe(rows, this.createParams(reason));
        }
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
        if (top != null && bottom != null && bottom > top) {
            first = Math.max(first, rowModel.getRowIndexAtPixel(top));
            last = Math.min(last, rowModel.getRowIndexAtPixel(bottom - 1));
        }
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

    private getUnsubscribeReason(node: RowNode, resetPending: boolean): VisibleRowsReason {
        if (isUnderCollapsedGroup(node)) {
            return 'collapse';
        }
        if (node.destroyed) {
            return resetPending ? 'reset' : 'remove';
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

function isUnderCollapsedGroup(node: RowNode): boolean {
    let parent = node.parent;
    while (parent && parent.level >= 0) {
        if (!parent.expanded) {
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
