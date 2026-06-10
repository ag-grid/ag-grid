import { _debounce } from 'ag-stack';

import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellSpan } from './rowSpanCache';
import { RowSpanCache } from './rowSpanCache';

export class RowSpanService extends BeanStub<'spannedCellsUpdated'> implements NamedBean {
    beanName = 'rowSpanSvc' as const;

    /** Active only if `enableCellSpan=true` */
    public active: boolean = false;
    private spanningColumns: Map<AgColumn, RowSpanCache> | null = null;

    public postConstruct(): void {
        if (!this.gos.get('enableCellSpan')) {
            // Don't setup listeners when the feature is not configured.
            return;
        }
        this.active = true;

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

    /** Create and build a span cache for `column`. Idempotent. */
    private register(column: AgColumn): void {
        let spanningColumns = this.spanningColumns;
        if (!spanningColumns) {
            spanningColumns = new Map();
            this.spanningColumns = spanningColumns;
        } else if (spanningColumns.has(column)) {
            return;
        }

        const cache = new RowSpanCache(this.beans, column);
        spanningColumns.set(column, cache);

        // make sure if row model already run we prep this cache
        this.buildCache(cache);
    }

    /** `spanRows` config changed: start spanning, stop spanning, or rebuild if it still spans. */
    public columnRowSpanChanged(column: AgColumn): void {
        if (!this.active) {
            return;
        }
        const cache = this.spanningColumns?.get(column);
        if (column.colDef.spanRows) {
            if (!cache) {
                this.register(column);
                return;
            }
            this.buildCache(cache);
        } else if (cache) {
            this.deregister(column);
        }
    }

    /** Register newly-added spanning columns. Called post-commit, when values (e.g. calc cols) resolve. */
    public refreshCols(): void {
        if (this.active) {
            const cols = this.beans.colModel.colsList;
            for (let i = 0, len = cols.length; i < len; ++i) {
                const col = cols[i];
                if (col.colDef.spanRows) {
                    this.register(col);
                }
            }
        }
    }

    /** Rebuild all regions for one column's cache and signal consumers to re-render. */
    private buildCache(cache: RowSpanCache): void {
        cache.buildCache('top');
        cache.buildCache('bottom');
        cache.buildCache('center');
        this.debouncePinnedEvent();
        this.debounceModelEvent();
    }

    // debounced to allow spannedRowRenderer to run first, removing any old spanned rows
    private readonly debouncePinnedEvent = _debounce(this, this.dispatchCellsUpdatedEvent.bind(this, true), 0);
    private readonly debounceModelEvent = _debounce(this, this.dispatchCellsUpdatedEvent.bind(this, false), 0);
    private dispatchCellsUpdatedEvent(pinned: boolean): void {
        if (this.isAlive()) {
            this.dispatchLocalEvent({ type: 'spannedCellsUpdated', pinned });
        }
    }

    /** Drop `column`'s span cache (column destroyed or no longer spanning). */
    public deregister(column: AgColumn): void {
        this.spanningColumns?.delete(column);
    }

    private pinnedTimeout: number | null = null;
    private modelTimeout: number | null = null;
    // Data-change hot path: debounced via timeouts (not `_debounce`) so it can be cancelled by
    // `modelUpdated`, which must run immediately (before the rowRenderer).
    private onRowDataUpdated({ node }: { node: IRowNode }) {
        const spannedRowRenderer = this.beans.spannedRowRenderer;
        if (node.rowPinned) {
            this.pinnedTimeout ??= window.setTimeout(() => {
                this.pinnedTimeout = null;
                this.buildPinnedCaches();

                // data-driven change: rowRenderer won't, so update manually
                spannedRowRenderer?.createCtrls('top');
                spannedRowRenderer?.createCtrls('bottom');
            }, 0);
            return;
        }

        this.modelTimeout ??= window.setTimeout(() => {
            this.modelTimeout = null;
            this.buildModelCaches();

            // data-driven change: rowRenderer won't, so update manually
            spannedRowRenderer?.createCtrls('center');
        }, 0);
    }

    private buildModelCaches(): void {
        this.clearModelTimeout();
        const spanningColumns = this.spanningColumns;
        if (spanningColumns) {
            for (const cache of spanningColumns.values()) {
                cache.buildCache('center');
            }
        }
        this.debounceModelEvent();
    }

    private buildPinnedCaches(): void {
        this.clearPinnedTimeout();
        const spanningColumns = this.spanningColumns;
        if (spanningColumns) {
            for (const cache of spanningColumns.values()) {
                cache.buildCache('top');
                cache.buildCache('bottom');
            }
        }
        this.debouncePinnedEvent();
    }

    public isCellSpanning(col: AgColumn, rowNode: RowNode): boolean {
        return !!this.spanningColumns?.get(col)?.getCellSpan(rowNode);
    }

    public getCellSpanByPosition(position: CellPosition): CellSpan | undefined {
        const { column, rowIndex } = position;
        const cache = this.spanningColumns?.get(column as AgColumn);
        if (!cache) {
            return undefined;
        }

        const { pinnedRowModel, rowModel } = this.beans;

        let node;
        switch (position.rowPinned) {
            case 'top':
                node = pinnedRowModel?.getPinnedTopRow(rowIndex);
                break;
            case 'bottom':
                node = pinnedRowModel?.getPinnedBottomRow(rowIndex);
                break;
            default:
                node = rowModel.getRow(rowIndex);
        }

        return node && cache.getCellSpan(node);
    }

    public getCellStart(position: CellPosition): CellPosition | undefined {
        const span = this.getCellSpanByPosition(position);
        return span ? { ...position, rowIndex: span.firstNode.rowIndex! } : position;
    }

    public getCellEnd(position: CellPosition): CellPosition | undefined {
        const span = this.getCellSpanByPosition(position);
        return span ? { ...position, rowIndex: span.getLastNode().rowIndex! } : position;
    }

    /** Look up the spanned cell at `column`/`rowNode`, if any. */
    public getCellSpan(column: AgColumn, rowNode: RowNode): CellSpan | undefined {
        return this.spanningColumns?.get(column)?.getCellSpan(rowNode);
    }

    public forEachSpannedColumn(rowNode: RowNode, callback: (column: AgColumn, span: CellSpan) => void): void {
        const spanningColumns = this.spanningColumns;
        if (spanningColumns) {
            for (const cache of spanningColumns.values()) {
                const span = cache.getCellSpan(rowNode);
                if (span) {
                    callback(cache.column, span);
                }
            }
        }
    }

    private clearModelTimeout(): void {
        const modelTimeout = this.modelTimeout;
        if (modelTimeout != null) {
            this.modelTimeout = null;
            clearTimeout(modelTimeout);
        }
    }

    private clearPinnedTimeout(): void {
        const pinnedTimeout = this.pinnedTimeout;
        if (pinnedTimeout != null) {
            this.pinnedTimeout = null;
            clearTimeout(pinnedTimeout);
        }
    }

    public override destroy(): void {
        super.destroy();
        this.active = false;
        this.spanningColumns = null;
        this.clearPinnedTimeout();
        this.clearModelTimeout();
    }
}
