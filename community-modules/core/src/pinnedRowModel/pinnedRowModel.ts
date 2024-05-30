import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { RowNode } from '../entities/rowNode';
import type { CssVariablesChanged, PinnedRowDataChangedEvent } from '../events';
import { Events } from '../events';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { RowPinnedType } from '../interfaces/iRowNode';
import { _last } from '../utils/array';
import { _missingOrEmpty } from '../utils/generic';

export class PinnedRowModel extends BeanStub implements NamedBean {
    beanName = 'pinnedRowModel' as const;

    private beans: BeanCollection;

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
    }

    private pinnedTopRows: RowNode[];
    private pinnedBottomRows: RowNode[];

    public postConstruct(): void {
        this.setPinnedTopRowData();
        this.setPinnedBottomRowData();
        this.addManagedPropertyListener('pinnedTopRowData', () => this.setPinnedTopRowData());
        this.addManagedPropertyListener('pinnedBottomRowData', () => this.setPinnedBottomRowData());
        this.addManagedListener(
            this.eventService,
            Events.EVENT_GRID_STYLES_CHANGED,
            this.onGridStylesChanges.bind(this)
        );
    }

    public isEmpty(floating: RowPinnedType): boolean {
        const rows = floating === 'top' ? this.pinnedTopRows : this.pinnedBottomRows;
        return _missingOrEmpty(rows);
    }

    public isRowsToRender(floating: RowPinnedType): boolean {
        return !this.isEmpty(floating);
    }

    public getRowAtPixel(pixel: number, floating: RowPinnedType): number {
        const rows = floating === 'top' ? this.pinnedTopRows : this.pinnedBottomRows;
        if (_missingOrEmpty(rows)) {
            return 0; // this should never happen, just in case, 0 is graceful failure
        }
        for (let i = 0; i < rows.length; i++) {
            const rowNode = rows[i];
            const rowTopPixel = rowNode.rowTop! + rowNode.rowHeight! - 1;
            // only need to range check against the top pixel, as we are going through the list
            // in order, first row to hit the pixel wins
            if (rowTopPixel >= pixel) {
                return i;
            }
        }
        return rows.length - 1;
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

        const event: WithoutGridCommon<PinnedRowDataChangedEvent> = {
            type: Events.EVENT_PINNED_HEIGHT_CHANGED,
        };
        this.eventService.dispatchEvent(event);

        return anyChange;
    }

    private setPinnedTopRowData(): void {
        const rowData = this.gos.get('pinnedTopRowData');
        this.pinnedTopRows = this.createNodesFromData(rowData, true);
        const event: WithoutGridCommon<PinnedRowDataChangedEvent> = {
            type: Events.EVENT_PINNED_ROW_DATA_CHANGED,
        };
        this.eventService.dispatchEvent(event);
    }

    private setPinnedBottomRowData(): void {
        const rowData = this.gos.get('pinnedBottomRowData');
        this.pinnedBottomRows = this.createNodesFromData(rowData, false);
        const event: WithoutGridCommon<PinnedRowDataChangedEvent> = {
            type: Events.EVENT_PINNED_ROW_DATA_CHANGED,
        };
        this.eventService.dispatchEvent(event);
    }

    private createNodesFromData(allData: any[] | undefined, isTop: boolean): RowNode[] {
        const rowNodes: RowNode[] = [];
        if (allData) {
            let nextRowTop = 0;
            allData.forEach((dataItem: any, index: number) => {
                const rowNode = new RowNode(this.beans);
                rowNode.data = dataItem;

                const idPrefix = isTop ? RowNode.ID_PREFIX_TOP_PINNED : RowNode.ID_PREFIX_BOTTOM_PINNED;
                rowNode.id = idPrefix + index;

                rowNode.rowPinned = isTop ? 'top' : 'bottom';
                rowNode.setRowTop(nextRowTop);
                rowNode.setRowHeight(this.gos.getRowHeightForNode(rowNode).height);
                rowNode.setRowIndex(index);
                nextRowTop += rowNode.rowHeight!;
                rowNodes.push(rowNode);
            });
        }
        return rowNodes;
    }

    public getPinnedTopRowData(): RowNode[] {
        return this.pinnedTopRows;
    }

    public getPinnedBottomRowData(): RowNode[] {
        return this.pinnedBottomRows;
    }

    public getPinnedTopTotalHeight(): number {
        return this.getTotalHeight(this.pinnedTopRows);
    }

    public getPinnedTopRowCount(): number {
        return this.pinnedTopRows ? this.pinnedTopRows.length : 0;
    }

    public getPinnedBottomRowCount(): number {
        return this.pinnedBottomRows ? this.pinnedBottomRows.length : 0;
    }

    public getPinnedTopRow(index: number): RowNode | undefined {
        return this.pinnedTopRows[index];
    }

    public getPinnedBottomRow(index: number): RowNode | undefined {
        return this.pinnedBottomRows[index];
    }

    public forEachPinnedTopRow(callback: (rowNode: RowNode, index: number) => void): void {
        if (_missingOrEmpty(this.pinnedTopRows)) {
            return;
        }
        this.pinnedTopRows.forEach(callback);
    }

    public forEachPinnedBottomRow(callback: (rowNode: RowNode, index: number) => void): void {
        if (_missingOrEmpty(this.pinnedBottomRows)) {
            return;
        }
        this.pinnedBottomRows.forEach(callback);
    }

    public getPinnedBottomTotalHeight(): number {
        return this.getTotalHeight(this.pinnedBottomRows);
    }

    private getTotalHeight(rowNodes: RowNode[]): number {
        if (!rowNodes || rowNodes.length === 0) {
            return 0;
        }

        const lastNode = _last(rowNodes);
        return lastNode.rowTop! + lastNode.rowHeight!;
    }
}
