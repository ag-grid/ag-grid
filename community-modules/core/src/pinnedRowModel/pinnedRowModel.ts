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
        this.setPinnedTopRowData();
        this.setPinnedBottomRowData();
        this.addManagedPropertyListener('pinnedTopRowData', () => this.setPinnedTopRowData());
        this.addManagedPropertyListener('pinnedBottomRowData', () => this.setPinnedBottomRowData());
        this.addManagedEventListeners({ gridStylesChanged: this.onGridStylesChanges.bind(this) });
    }

    public isEmpty(floating: RowPinnedType): boolean {
        const rows = floating === 'top' ? this.pinnedTopRows : this.pinnedBottomRows;
        return rows.isEmpty();
    }

    public isRowsToRender(floating: RowPinnedType): boolean {
        return !this.isEmpty(floating);
    }

    /** @deprecated */
    public getRowAtPixel(pixel: number, floating: RowPinnedType): number {
        const rows = floating === 'top' ? this.pinnedTopRows : this.pinnedBottomRows;
        if (rows.isEmpty()) {
            return 0; // this should never happen, just in case, 0 is graceful failure
        }

        let rowNumber = rows.getSize() - 1;

        rows.forEach((rowNode, i) => {
            const rowTopPixel = rowNode.rowTop! + rowNode.rowHeight! - 1;
            // only need to range check against the top pixel, as we are going through the list
            // in order, first row to hit the pixel wins
            if (rowTopPixel >= pixel) {
                rowNumber = Math.min(rowNumber, i);
            }
        });

        return rowNumber;
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

    private setPinnedTopRowData(): void {
        const rowData = this.gos.get('pinnedTopRowData');
        this.updateNodesFromRowData(rowData, 'top');
        const event: WithoutGridCommon<PinnedRowDataChangedEvent> = {
            type: 'pinnedRowDataChanged',
        };
        this.eventService.dispatchEvent(event);
    }

    private setPinnedBottomRowData(): void {
        const rowData = this.gos.get('pinnedBottomRowData');
        this.updateNodesFromRowData(rowData, 'bottom');
        const event: WithoutGridCommon<PinnedRowDataChangedEvent> = {
            type: 'pinnedRowDataChanged',
        };
        this.eventService.dispatchEvent(event);
    }

    private updateNodesFromRowData(allData: any[] | undefined, container: NonNullable<RowPinnedType>): void {
        const nodes = container === 'top' ? this.pinnedTopRows : this.pinnedBottomRows;

        if (allData === undefined) {
            nodes.clear();
            return;
        }

        const nodesToRemove = nodes.getIds();
        const getRowId = this.gos.getRowIdCallback();
        const idPrefix = container === 'top' ? RowNode.ID_PREFIX_TOP_PINNED : RowNode.ID_PREFIX_BOTTOM_PINNED;

        const newOrder: string[] = [];
        let nextRowTop = 0;
        for (const [i, data] of allData.entries()) {
            const id = getRowId?.({ data, level: 0, rowPinned: container }) ?? idPrefix + this.nextId++;

            newOrder.push(id);

            const existingNode = nodes.getById(id);
            if (existingNode !== undefined) {
                if (existingNode.data !== data) {
                    existingNode.setData(data);
                }
                existingNode.setRowTop(nextRowTop);
                existingNode.setRowHeight(this.gos.getRowHeightForNode(existingNode).height);
                existingNode.setRowIndex(i);
                nextRowTop += existingNode.rowHeight!;

                // don't want to remove these ones
                nodesToRemove.delete(id);
            } else {
                // new node
                const rowNode = new RowNode(this.beans);
                rowNode.id = id;
                rowNode.data = data;
                rowNode.rowPinned = container;
                rowNode.setRowTop(nextRowTop);
                rowNode.setRowHeight(this.gos.getRowHeightForNode(rowNode).height);
                rowNode.setRowIndex(i);
                nextRowTop += rowNode.rowHeight!;
                nodes.push(rowNode);
            }
        }

        nodesToRemove.forEach((id) => {
            nodes.getById(id)?.clearRowTopAndRowIndex();
        });
        nodes.removeAllById(nodesToRemove);

        nodes.setOrder(newOrder);
    }

    public getPinnedTopRowNodes(): RowNode[] {
        return this.pinnedTopRows.asArray();
    }

    public getPinnedBottomRowNodes(): RowNode[] {
        return this.pinnedBottomRows.asArray();
    }

    public getPinnedTopTotalHeight(): number {
        return this.getTotalHeight(this.pinnedTopRows);
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

    public forEachPinnedTopRow(callback: (rowNode: RowNode, index: number) => void): void {
        this.pinnedTopRows.forEach(callback);
    }

    public forEachPinnedBottomRow(callback: (rowNode: RowNode, index: number) => void): void {
        this.pinnedBottomRows.forEach(callback);
    }

    public getPinnedBottomTotalHeight(): number {
        return this.getTotalHeight(this.pinnedBottomRows);
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

    public asArray(): T[] {
        return this.ordering.map((id) => this.cache[id]!);
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
