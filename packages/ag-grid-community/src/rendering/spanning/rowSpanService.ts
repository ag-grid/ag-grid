import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { IRowNode } from '../../interfaces/iRowNode';
import { _debounce } from '../../utils/function';
import type { CellSpan } from './rowSpanCache';
import { RowSpanCache } from './rowSpanCache';

export class RowSpanService extends BeanStub<'spannedCellsUpdated'> implements NamedBean {
    beanName = 'rowSpanSvc' as const;

    private spanningColumns: Map<AgColumn, RowSpanCache> = new Map();

    public postConstruct(): void {
        const onRowDataUpdated = this.onRowDataUpdated.bind(this);
        const buildPinnedCaches = this.buildPinnedCaches.bind(this);
        this.addManagedEventListeners({
            paginationChanged: this.buildModelCaches.bind(this),
            pinnedRowDataChanged: buildPinnedCaches,
            pinnedRowsChanged: buildPinnedCaches,
            rowNodeDataChanged: onRowDataUpdated,
            cellValueChanged: onRowDataUpdated,
        });
    }

    /**
     * When a new column is created with spanning (or spanning changes for a column)
     * @param column column that is now spanning
     */
    public register(column: AgColumn): void {
        const { gos } = this.beans;
        if (!gos.get('enableCellSpan')) {
            return;
        }
        if (this.spanningColumns.has(column)) {
            return;
        }
        const cache = this.createManagedBean(new RowSpanCache(column));
        this.spanningColumns.set(column, cache);

        // make sure if row model already run we prep this cache
        cache.buildCache('top');
        cache.buildCache('bottom');
        cache.buildCache('center');
        this.debouncePinnedEvent();
        this.debounceModelEvent();
    }

    // debounced to allow spannedRowRenderer to run first, removing any old spanned rows
    private debouncePinnedEvent = _debounce(this, this.dispatchCellsUpdatedEvent.bind(this, true), 0);
    private debounceModelEvent = _debounce(this, this.dispatchCellsUpdatedEvent.bind(this, false), 0);
    private dispatchCellsUpdatedEvent(pinned: boolean): void {
        this.dispatchLocalEvent({ type: 'spannedCellsUpdated', pinned });
    }

    /**
     * When a new column is destroyed with spanning (or spanning changes for a column)
     * @param column column that is now spanning
     */
    public deregister(column: AgColumn): void {
        this.spanningColumns.delete(column);
    }

    private pinnedTimeout: number | null = null;
    private modelTimeout: number | null = null;
    // called when data changes, as this could be a hot path it's debounced
    // it uses timeouts instead of debounce so that it can be cancelled by `modelUpdated`
    // which is expected to run immediately (to exec before the rowRenderer)
    private onRowDataUpdated({ node }: { node: IRowNode }) {
        const { spannedRowRenderer } = this.beans;
        if (node.rowPinned) {
            if (this.pinnedTimeout != null) {
                return;
            }
            this.pinnedTimeout = window.setTimeout(() => {
                this.pinnedTimeout = null;
                this.buildPinnedCaches();

                // normally updated by the rowRenderer, but as this change is
                // caused by data, need to manually update
                spannedRowRenderer?.createCtrls('top');
                spannedRowRenderer?.createCtrls('bottom');
            }, 0);
            return;
        }

        if (this.modelTimeout != null) {
            return;
        }

        this.modelTimeout = window.setTimeout(() => {
            this.modelTimeout = null;
            this.buildModelCaches();

            // normally updated by the rowRenderer, but as this change is
            // caused by data, need to manually update
            spannedRowRenderer?.createCtrls('center');
        }, 0);
    }

    private buildModelCaches(): void {
        if (this.modelTimeout != null) {
            clearTimeout(this.modelTimeout);
        }

        this.spanningColumns.forEach((cache) => cache.buildCache('center'));
        this.debounceModelEvent();
    }

    private buildPinnedCaches(): void {
        if (this.pinnedTimeout != null) {
            clearTimeout(this.pinnedTimeout);
        }

        this.spanningColumns.forEach((cache) => {
            cache.buildCache('top');
            cache.buildCache('bottom');
        });
        this.debouncePinnedEvent();
    }

    public isCellSpanning(col: AgColumn, rowNode: RowNode): boolean {
        const cache = this.spanningColumns.get(col);
        if (!cache) {
            return false;
        }

        return cache.isCellSpanning(rowNode);
    }

    public getCellSpanByPosition(position: CellPosition): CellSpan | undefined {
        const { pinnedRowModel, rowModel } = this.beans;
        const col = position.column;
        const index = position.rowIndex;

        const cache = this.spanningColumns.get(col as AgColumn);
        if (!cache) {
            return undefined;
        }

        let node;
        switch (position.rowPinned) {
            case 'top':
                node = pinnedRowModel?.getPinnedTopRow(index);
                break;
            case 'bottom':
                node = pinnedRowModel?.getPinnedBottomRow(index);
                break;
            default:
                node = rowModel.getRow(index);
        }

        if (!node) {
            return undefined;
        }

        return cache.getCellSpan(node);
    }

    public getCellStart(position: CellPosition): CellPosition | undefined {
        const span = this.getCellSpanByPosition(position);
        if (!span) {
            return position;
        }

        return { ...position, rowIndex: span.firstNode.rowIndex! };
    }

    public getCellEnd(position: CellPosition): CellPosition | undefined {
        const span = this.getCellSpanByPosition(position);
        if (!span) {
            return position;
        }

        return { ...position, rowIndex: span.getLastNode().rowIndex! };
    }

    /**
     * Look-up a spanned cell given a col and node as position indicators
     *
     * @param col a column to lookup a span at this position
     * @param rowNode a node that may be spanned at this position
     * @returns the CellSpan object if one exists
     */
    public getCellSpan(col: AgColumn, rowNode: RowNode): CellSpan | undefined {
        const cache = this.spanningColumns.get(col);
        if (!cache) {
            return undefined;
        }

        return cache.getCellSpan(rowNode);
    }

    public forEachSpannedColumn(rowNode: RowNode, callback: (col: AgColumn, span: CellSpan) => void): void {
        for (const [col, cache] of this.spanningColumns) {
            if (cache.isCellSpanning(rowNode)) {
                const spanningNode = cache.getCellSpan(rowNode)!;
                callback(col, spanningNode);
            }
        }
    }

    public override destroy(): void {
        super.destroy();
        this.spanningColumns.clear();
    }
}
