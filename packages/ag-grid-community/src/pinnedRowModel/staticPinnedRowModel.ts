import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { ROW_ID_PREFIX_BOTTOM_PINNED, ROW_ID_PREFIX_TOP_PINNED, RowNode } from '../entities/rowNode';
import { _addRowHeightChangedListener, _getRowHeightForNode, _getRowIdCallback } from '../gridOptionsUtils';
import type { RowPinningState } from '../interfaces/gridState';
import type { IPinnedRowModel } from '../interfaces/iPinnedRowModel';
import type { RowPinnedType } from '../interfaces/iRowNode';

/** One section's pinned rows, in display order and by id. */
interface OrderedCache {
    readonly cache: Map<string, RowNode>;
    order: RowNode[];
}

export class StaticPinnedRowModel extends BeanStub implements IPinnedRowModel {
    private nextId = 0;
    private readonly pinnedTopRows: OrderedCache = { cache: new Map(), order: [] };
    private readonly pinnedBottomRows: OrderedCache = { cache: new Map(), order: [] };
    private topHeight = 0;
    private bottomHeight = 0;

    public postConstruct(): void {
        const gos = this.gos;
        this.setPinnedRowData(gos.get('pinnedTopRowData'), 'top');
        this.setPinnedRowData(gos.get('pinnedBottomRowData'), 'bottom');
        this.addManagedPropertyListener('pinnedTopRowData', (e) => this.setPinnedRowData(e.currentValue, 'top'));
        this.addManagedPropertyListener('pinnedBottomRowData', (e) => this.setPinnedRowData(e.currentValue, 'bottom'));
        _addRowHeightChangedListener(this, () => {
            estimateSectionRowHeights(this.pinnedBottomRows.order);
            estimateSectionRowHeights(this.pinnedTopRows.order);
            this.ensureRowHeightsValid();
        });
    }

    public reset(): void {
        // Not implemented for static pinned row model
    }

    public isEmpty(floating: RowPinnedType): boolean {
        return this.getCache(floating).order.length === 0;
    }

    public isRowsToRender(floating: RowPinnedType): boolean {
        return !this.isEmpty(floating);
    }

    public isManual(): boolean {
        return false;
    }

    public pinRow(_node: RowNode<any>, _container: RowPinnedType): void {
        // Not implemented for static pinned row model
    }

    public ensureRowHeightsValid(): boolean {
        const beans = this.beans;
        const bottomChanged = ensureSectionRowHeightsValid(beans, this.pinnedBottomRows.order);
        const topChanged = ensureSectionRowHeightsValid(beans, this.pinnedTopRows.order);
        const topHeight = getTotalHeight(this.pinnedTopRows);
        const bottomHeight = getTotalHeight(this.pinnedBottomRows);

        // A height applied outside this pass, by column autoHeight, moves no row top when it lands on the
        // last row of its section, so only the total reports it.
        if (!bottomChanged && !topChanged && topHeight === this.topHeight && bottomHeight === this.bottomHeight) {
            return false;
        }

        this.topHeight = topHeight;
        this.bottomHeight = bottomHeight;
        this.eventSvc.dispatchEvent({ type: 'pinnedHeightChanged' });
        return true;
    }

    private setPinnedRowData(rowData: any[] | undefined, floating: NonNullable<RowPinnedType>): void {
        this.updateNodesFromRowData(rowData, floating);
        this.eventSvc.dispatchEvent({
            type: 'pinnedRowDataChanged',
        });
    }

    /**
     * Updates existing RowNode instances and creates new ones if necessary
     *
     * Setting data as `undefined` will clear row nodes
     */
    private updateNodesFromRowData(allData: any[] | undefined, floating: NonNullable<RowPinnedType>): void {
        const nodes = this.getCache(floating);
        const cache = nodes.cache;

        if (allData === undefined) {
            const order = nodes.order;
            for (let i = 0, len = order.length; i < len; ++i) {
                order[i].clearRowTopAndRowIndex();
            }
            // replaced, not emptied, as a walk of the rows in progress reads up to the length it started with
            nodes.order = [];
            cache.clear();
            return;
        }

        const getRowId = _getRowIdCallback(this.beans);
        const idPrefix = floating === 'top' ? ROW_ID_PREFIX_TOP_PINNED : ROW_ID_PREFIX_BOTTOM_PINNED;

        // Data that matches based on ID can nonetheless still appear in a different order than before
        const newOrder: RowNode[] = [];

        // Used for catching duplicate IDs/rows within `allData` itself
        const dataIds = new Set<string>();

        let nextRowTop = 0;
        let i = -1;
        for (const data of allData) {
            const id = getRowId?.({ data, level: 0, rowPinned: floating }) ?? idPrefix + this.nextId++;

            if (dataIds.has(id)) {
                this.warn(96, { id, data });
                continue;
            }

            i++;
            dataIds.add(id);

            const existingNode = cache.get(id);
            if (existingNode !== undefined) {
                if (existingNode.data !== data) {
                    existingNode.updateData(data);
                }
                nextRowTop += this.setRowTopAndRowIndex(existingNode, nextRowTop, i);
                newOrder.push(existingNode);
            } else {
                const rowNode = new RowNode(this.beans);
                rowNode.id = id;
                rowNode.data = data;
                rowNode.rowPinned = floating;
                nextRowTop += this.setRowTopAndRowIndex(rowNode, nextRowTop, i);
                cache.set(id, rowNode);
                newOrder.push(rowNode);
            }
        }

        const oldOrder = nodes.order;
        for (let j = 0, len = oldOrder.length; j < len; ++j) {
            const oldNode = oldOrder[j];
            const oldId = oldNode.id!;
            if (!dataIds.has(oldId)) {
                oldNode.clearRowTopAndRowIndex();
                cache.delete(oldId);
            }
        }

        nodes.order = newOrder;
    }

    private setRowTopAndRowIndex(rowNode: RowNode, rowTop: number, rowIndex: number): number {
        rowNode.setRowTop(rowTop);
        rowNode.setRowHeight(_getRowHeightForNode(this.beans, rowNode).height);
        rowNode.setRowIndex(rowIndex);
        return rowNode.rowHeight!;
    }

    public getPinnedTopTotalHeight(): number {
        return getTotalHeight(this.pinnedTopRows);
    }

    public getPinnedBottomTotalHeight(): number {
        return getTotalHeight(this.pinnedBottomRows);
    }

    public getPinnedTopRowCount(): number {
        return this.pinnedTopRows.order.length;
    }

    public getPinnedBottomRowCount(): number {
        return this.pinnedBottomRows.order.length;
    }

    public getPinnedTopRow(index: number): RowNode | undefined {
        return this.pinnedTopRows.order[index];
    }

    public getPinnedBottomRow(index: number): RowNode | undefined {
        return this.pinnedBottomRows.order[index];
    }

    public getPinnedRowById(id: string, floating: NonNullable<RowPinnedType>): RowNode | undefined {
        return this.getCache(floating).cache.get(id);
    }

    public forEachPinnedRow(
        floating: NonNullable<RowPinnedType>,
        callback: (node: RowNode, index: number) => void
    ): void {
        const { cache, order } = this.getCache(floating);
        for (let i = 0, len = order.length; i < len; ++i) {
            const node = order[i];
            // a row the callback removed is skipped
            if (cache.get(node.id!) === node) {
                callback(node, i);
            }
        }
    }

    private getCache(floating: RowPinnedType): OrderedCache {
        return floating === 'top' ? this.pinnedTopRows : this.pinnedBottomRows;
    }

    public getPinnedState(): RowPinningState {
        // Not implemented for static pinned row model
        return { top: [], bottom: [] };
    }

    public setPinnedState(): void {
        // Not implemented for static pinned row model
    }

    public getUserGrandTotalPinned(): RowPinnedType {
        // Not implemented for static pinned row model
        return;
    }

    public setGrandTotalNode(): void {
        // Not implemented for static pinned row model
    }

    public resetGrandTotalPin(): void {
        // Not implemented for static pinned row model
    }
}

function getTotalHeight(rowNodes: OrderedCache): number {
    const order = rowNodes.order;
    const size = order.length;
    if (size === 0) {
        return 0;
    }

    const node = order[size - 1];
    return node.rowTop! + node.rowHeight!;
}

function estimateSectionRowHeights(order: RowNode[]): void {
    for (let i = 0, len = order.length; i < len; ++i) {
        const rowNode = order[i];
        rowNode.setRowHeight(rowNode.rowHeight, true);
    }
}

/** Works out estimated heights and re-stacks row tops; true if any height or top changed. */
function ensureSectionRowHeightsValid(beans: BeanCollection, order: RowNode[]): boolean {
    let anyChange = false;
    let rowTop = 0;
    for (let i = 0, len = order.length; i < len; ++i) {
        const rowNode = order[i];
        if (rowNode.rowHeightEstimated) {
            const rowHeight = _getRowHeightForNode(beans, rowNode).height;
            anyChange ||= rowHeight !== rowNode.rowHeight;
            rowNode.setRowHeight(rowHeight);
        }
        // column autoHeight can grow a height without flipping rowHeightEstimated, so every row top is re-stacked
        if (rowNode.rowTop !== rowTop) {
            rowNode.setRowTop(rowTop);
            anyChange = true;
        }
        rowTop += rowNode.rowHeight!;
    }
    return anyChange;
}
