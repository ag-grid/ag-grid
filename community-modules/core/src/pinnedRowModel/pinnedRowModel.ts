import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { RowNode } from '../entities/rowNode';
import type { CssVariablesChanged, PinnedHeightChangedEvent, PinnedRowDataChangedEvent } from '../events';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { RowPinnedType } from '../interfaces/iRowNode';

export class PinnedRowModel extends BeanStub implements NamedBean {
    beanName = 'pinnedRowModel' as const;

    private beans: BeanCollection;

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
    }

    private nextId = 0;
    private pinnedTopRows = new OrderedCache<RowNode>();
    private pinnedBottomRows = new OrderedCache<RowNode>();

    public postConstruct(): void {
        this.setPinnedRowData(this.gos.get('pinnedTopRowData'), 'top');
        this.setPinnedRowData(this.gos.get('pinnedBottomRowData'), 'bottom');
        this.addManagedPropertyListener('pinnedTopRowData', (e) => this.setPinnedRowData(e.currentValue, 'top'));
        this.addManagedPropertyListener('pinnedBottomRowData', (e) => this.setPinnedRowData(e.currentValue, 'bottom'));
        this.addManagedEventListeners({ gridStylesChanged: this.onGridStylesChanges.bind(this) });
    }

    public isEmpty(floating: RowPinnedType): boolean {
        const rows = floating === 'top' ? this.pinnedTopRows : this.pinnedBottomRows;
        return rows.isEmpty();
    }

    public isRowsToRender(floating: RowPinnedType): boolean {
        return !this.isEmpty(floating);
    }

    private onGridStylesChanges(e: CssVariablesChanged) {
        if (e.rowHeightChanged) {
            const estimateRowHeight = (rowNode: RowNode) => {
                rowNode.setRowHeight(rowNode.rowHeight, true);
            };
            this.pinnedBottomRows.forEach(estimateRowHeight);
            this.pinnedTopRows.forEach(estimateRowHeight);
        }
    }

    public ensureRowHeightsValid(): boolean {
        let anyChange = false;
        let rowTop = 0;
        const updateRowHeight = (rowNode: RowNode) => {
            if (rowNode.rowHeightEstimated) {
                const rowHeight = this.gos.getRowHeightForNode(rowNode);
                rowNode.setRowTop(rowTop);
                rowNode.setRowHeight(rowHeight.height);
                rowTop += rowHeight.height;
                anyChange = true;
            }
        };
        this.pinnedBottomRows?.forEach(updateRowHeight);
        rowTop = 0;
        this.pinnedTopRows?.forEach(updateRowHeight);

        const event: WithoutGridCommon<PinnedHeightChangedEvent> = {
            type: 'pinnedHeightChanged',
        };
        this.eventService.dispatchEvent(event);

        return anyChange;
    }

    private setPinnedRowData(rowData: any[] | undefined, floating: NonNullable<RowPinnedType>): void {
        this.updateNodesFromRowData(rowData, floating);
        const event: WithoutGridCommon<PinnedRowDataChangedEvent> = {
            type: 'pinnedRowDataChanged',
        };
        this.eventService.dispatchEvent(event);
    }

    /**
     * Updates existing RowNode instances and creates new ones if necessary
     *
     * Setting data as `undefined` will clear row nodes
     */
    private updateNodesFromRowData(allData: any[] | undefined, floating: NonNullable<RowPinnedType>): void {
        const nodes = floating === 'top' ? this.pinnedTopRows : this.pinnedBottomRows;

        if (allData === undefined) {
            nodes.clear();
            return;
        }

        const getRowId = this.gos.getRowIdCallback();
        const idPrefix = floating === 'top' ? RowNode.ID_PREFIX_TOP_PINNED : RowNode.ID_PREFIX_BOTTOM_PINNED;

        // We'll want to remove all nodes that aren't matched to data
        const nodesToRemove = nodes.getIds();

        // Data that matches based on ID can nonetheless still appear in a different order than before
        const newOrder: string[] = [];

        let nextRowTop = 0;
        for (const [i, data] of allData.entries()) {
            const id = getRowId?.({ data, level: 0, rowPinned: floating }) ?? idPrefix + this.nextId++;

            newOrder.push(id);

            const existingNode = nodes.getById(id);
            if (existingNode !== undefined) {
                if (existingNode.data !== data) {
                    existingNode.setData(data);
                }
                nextRowTop += this.setRowTopAndRowIndex(existingNode, nextRowTop, i);

                // existing nodes that are re-used/updated shouldn't be deleted
                nodesToRemove.delete(id);
            } else {
                // new node
                const rowNode = new RowNode(this.beans);
                rowNode.id = id;
                rowNode.data = data;
                rowNode.rowPinned = floating;
                nextRowTop += this.setRowTopAndRowIndex(rowNode, nextRowTop, i);
                nodes.push(rowNode);
            }
        }

        nodesToRemove.forEach((id) => {
            nodes.getById(id)?.clearRowTopAndRowIndex();
        });
        nodes.removeAllById(nodesToRemove);

        nodes.setOrder(newOrder);
    }

    private setRowTopAndRowIndex(rowNode: RowNode, rowTop: number, rowIndex: number): number {
        rowNode.setRowTop(rowTop);
        rowNode.setRowHeight(this.gos.getRowHeightForNode(rowNode).height);
        rowNode.setRowIndex(rowIndex);
        return rowNode.rowHeight!;
    }

    public getPinnedTopTotalHeight(): number {
        return this.getTotalHeight(this.pinnedTopRows);
    }

    public getPinnedBottomTotalHeight(): number {
        return this.getTotalHeight(this.pinnedBottomRows);
    }

    public getPinnedTopRowCount(): number {
        return this.pinnedTopRows.getSize();
    }

    public getPinnedBottomRowCount(): number {
        return this.pinnedBottomRows.getSize();
    }

    public getPinnedTopRow(index: number): RowNode | undefined {
        return this.pinnedTopRows.getByIndex(index);
    }

    public getPinnedBottomRow(index: number): RowNode | undefined {
        return this.pinnedBottomRows.getByIndex(index);
    }

    public getPinnedRowById(id: string, floating: NonNullable<RowPinnedType>): RowNode | undefined {
        return floating === 'top' ? this.pinnedTopRows.getById(id) : this.pinnedBottomRows.getById(id);
    }

    public forEachPinnedRow(
        floating: NonNullable<RowPinnedType>,
        callback: (node: RowNode, index: number) => void
    ): void {
        return floating === 'top' ? this.pinnedTopRows.forEach(callback) : this.pinnedBottomRows.forEach(callback);
    }

    private getTotalHeight(rowNodes: OrderedCache<RowNode>): number {
        const size = rowNodes.getSize();
        if (size === 0) {
            return 0;
        }

        const node = rowNodes.getByIndex(size - 1);
        if (node === undefined) {
            return 0;
        }

        return node.rowTop! + node.rowHeight!;
    }
}

/**
 * Cache that maintains record of insertion order
 *
 * Allows lookup by key as well as insertion order (which is why we didn't use Map)
 */
class OrderedCache<T extends { id: string | undefined }> {
    private cache: Partial<Record<string, T>> = {};
    private ordering: string[] = [];

    public getById(id: string): T | undefined {
        return this.cache[id];
    }

    public getByIndex(i: number): T | undefined {
        const id = this.ordering[i];
        return this.cache[id];
    }

    public push(item: T): void {
        this.cache[item.id!] = item;
        this.ordering.push(item.id!);
    }

    public removeAllById(ids: Set<string>): void {
        for (const id of ids) {
            delete this.cache[id];
        }

        this.ordering = this.ordering.filter((id) => !ids.has(id));
    }

    public setOrder(orderedIds: string[]): void {
        this.ordering = orderedIds;
    }

    public forEach(callback: (item: T, index: number) => void): void {
        this.ordering.forEach((id, index) => {
            const node = this.cache[id];
            node && callback(node, index);
        });
    }

    public clear(): void {
        this.ordering.length = 0;
        this.cache = {};
    }

    public isEmpty(): boolean {
        return this.ordering.length === 0;
    }

    public getSize(): number {
        return this.ordering.length;
    }

    public getIds(): Set<string> {
        return new Set(this.ordering);
    }
}
