import type { IViewportDatasource, IViewportRowModel, NamedBean, RowBounds, RowModelType } from 'ag-grid-community';
import { BeanStub, RowNode, _getRowHeightAsNumber, _getRowIdCallback, _warn } from 'ag-grid-community';

/**
 * To stop the heightsState getting out of control, we limit the number of entries. If the user
 * has more than this number of rows with non-default heights, then we just drop half the oldest entries.
 *
 * Essentially, this is the max number of rows a user can have with variable heights before we start dropping
 */
const HEIGHT_STATE_SIZE_LIMIT = 1000;

export class ViewportRowModel extends BeanStub implements NamedBean, IViewportRowModel {
    beanName = 'rowModel' as const;

    // rowRenderer tells us these
    private firstRow = -1;
    private lastRow = -1;

    // datasource tells us this
    private rowCount = -1;
    private rowNodesByIndex: { [index: number]: RowNode } = {};
    private rowHeight: number;
    private datasource: IViewportDatasource;
    /**
     * If a row height is different to the default row height, then we store it here.
     * This is used to calculate the rowTop's when rows have variable heights.
     */
    private heightsState = new Map<number, number>();

    /**
     * Used to see if setRowData has been called inside of the viewportChanged event context,
     * if so the new rows are already being calculated, and the model does not need updated
     * otherwise, a new model event needs to fire as rows have changed externally.
     */
    private viewportChangedContext: boolean = false;

    // we don't implement as lazy row heights is not supported in this row model
    public ensureRowHeightsValid(
        _startPixel: number,
        _endPixel: number,
        _startLimitIndex: number,
        _endLimitIndex: number
    ): boolean {
        return false;
    }

    public postConstruct(): void {
        const beans = this.beans;
        this.rowHeight = _getRowHeightAsNumber(beans);
        this.addManagedEventListeners({ viewportChanged: this.onViewportChanged.bind(this) });
        this.addManagedPropertyListener('viewportDatasource', () => this.updateDatasource());
        this.addManagedPropertyListener('rowHeight', () => {
            this.rowHeight = _getRowHeightAsNumber(beans);
            this.updateRowHeights();
        });
    }

    public start(): void {
        this.updateDatasource();
    }

    public isLastRowIndexKnown(): boolean {
        return true;
    }

    public override destroy(): void {
        this.destroyDatasource();
        super.destroy();
    }

    private destroyDatasource(): void {
        const datasource = this.datasource;
        if (!datasource) {
            return;
        }

        datasource.destroy?.();

        this.beans.rowRenderer.datasourceChanged();
        this.firstRow = -1;
        this.lastRow = -1;
    }

    private updateDatasource(): void {
        const datasource = this.gos.get('viewportDatasource');
        if (datasource) {
            this.setViewportDatasource(datasource);
        }
    }

    private getPageSize(): number | undefined {
        return this.gos.get('viewportRowModelPageSize');
    }

    private getBufferSize(): number {
        return this.gos.get('viewportRowModelBufferSize');
    }

    private calculateFirstRow(firstRenderedRow: number): number {
        const bufferSize = this.getBufferSize();
        const pageSize = this.getPageSize()!;
        const afterBuffer = firstRenderedRow - bufferSize;

        if (afterBuffer < 0) {
            return 0;
        }

        return Math.floor(afterBuffer / pageSize) * pageSize;
    }

    private calculateLastRow(lastRenderedRow: number): number {
        if (lastRenderedRow === -1) {
            return lastRenderedRow;
        }

        const bufferSize = this.getBufferSize();
        const pageSize = this.getPageSize()!;
        const afterBuffer = lastRenderedRow + bufferSize;
        const result = Math.ceil(afterBuffer / pageSize) * pageSize;
        const lastRowIndex = this.rowCount - 1;

        return Math.min(result, lastRowIndex);
    }

    private onViewportChanged(event: any): void {
        const newFirst = this.calculateFirstRow(event.firstRow);
        const newLast = this.calculateLastRow(event.lastRow);

        if (this.firstRow !== newFirst || this.lastRow !== newLast) {
            this.firstRow = newFirst;
            this.lastRow = newLast;
            this.purgeRowsNotInViewport();
            this.viewportChangedContext = true;
            this.datasource?.setViewportRange(this.firstRow, this.lastRow);
            this.viewportChangedContext = false;
        }
    }

    public purgeRowsNotInViewport(): void {
        const rowNodesByIndex = this.rowNodesByIndex;
        Object.keys(rowNodesByIndex).forEach((indexStr) => {
            const index = parseInt(indexStr, 10);
            if (index < this.firstRow || index > this.lastRow) {
                if (this.isRowFocused(index) || this.beans.editSvc?.isRowEditing(rowNodesByIndex[index])) {
                    return;
                }

                delete rowNodesByIndex[index];
            }
        });
    }

    private isRowFocused(rowIndex: number): boolean {
        const focusedCell = this.beans.focusSvc.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }

        const hasFocus = focusedCell.rowIndex === rowIndex;
        return hasFocus;
    }

    public setViewportDatasource(viewportDatasource: IViewportDatasource): void {
        this.destroyDatasource();

        this.datasource = viewportDatasource;
        this.rowCount = -1;

        if (!viewportDatasource.init) {
            _warn(226);
        } else {
            viewportDatasource.init({
                setRowCount: this.setRowCount.bind(this),
                setRowData: this.setRowData.bind(this),
                getRow: this.getRow.bind(this),
            });
        }
    }

    public getType(): RowModelType {
        return 'viewport';
    }

    public getRow(rowIndex: number): RowNode {
        if (!this.rowNodesByIndex[rowIndex]) {
            this.rowNodesByIndex[rowIndex] = this.createBlankRowNode(rowIndex);
        }

        return this.rowNodesByIndex[rowIndex];
    }

    public getRowNode(id: string): RowNode | undefined {
        let result: RowNode | undefined;
        this.forEachNode((rowNode) => {
            if (rowNode.id === id) {
                result = rowNode;
            }
        });
        return result;
    }

    public getRowCount(): number {
        return this.rowCount === -1 ? 0 : this.rowCount;
    }

    public getRowIndexAtPixel(pixel: number): number {
        if (this.rowHeight !== 0) {
            // do a binary search to find the row, as rows can be variable heights we
            // cannot just do a pixel / rowHeight

            let lower = 0;
            let upper = this.getRowCount() - 1;
            let mid: number;
            let rowTop: number;
            let rowBottom: number;
            while (lower <= upper) {
                mid = Math.floor((lower + upper) / 2);
                rowTop = this.getRowTop(mid);
                rowBottom = rowTop + this.getRowBounds(mid).rowHeight;

                if (rowTop <= pixel && rowBottom > pixel) {
                    return mid;
                } else if (rowTop < pixel) {
                    lower = mid + 1;
                } else {
                    upper = mid - 1;
                }
            }

            // if not found, just return last row
            return this.getRowCount() - 1;
        }

        return 0;
    }

    /**
     * Index is likely out of bounds, so we need to handle this
     */
    public getRowBounds(index: number): RowBounds {
        const node = this.rowNodesByIndex[index];
        return { rowHeight: node?.rowHeight ?? this.rowHeight, rowTop: node?.rowTop ?? this.getRowTop(index) };
    }

    resetRowHeights(): void {
        this.updateRowHeights();
    }

    onRowHeightChanged(): void {
        this.updateRowHeights(false);
    }

    private updateRowHeights(resetRowHeights = true) {
        const rowHeight = this.rowHeight;

        const heightsState = this.heightsState;
        this.forEachNode((node) => {
            if (resetRowHeights) {
                node.setRowHeight(rowHeight);
                heightsState.clear();
            } else {
                if (node.rowHeight === rowHeight) {
                    heightsState.delete(node.rowIndex!);
                } else {
                    heightsState.set(node.rowIndex!, node.rowHeight!);
                }
            }
            node.setRowTop(this.getRowTop(node.rowIndex!));
        });

        // keeping it tidy
        if (heightsState.size > HEIGHT_STATE_SIZE_LIMIT) {
            heightsState.forEach((entry, index) => {
                if (index < HEIGHT_STATE_SIZE_LIMIT / 2) {
                    heightsState.delete(entry);
                }
            });
        }

        this.eventSvc.dispatchEvent({
            type: 'modelUpdated',
            newData: false,
            newPage: false,
            keepRenderedRows: true,
            animate: false,
        });
    }

    /**
     * Semi-expensive operation to calculate the rowTop of a row, used when rows have dynamic heights.
     * For budget reasons we limit the number of entries we keep in the heightsState map using the HEIGHT_STATE_SIZE_LIMIT.
     */
    private getRowTop(rowIndex: number): number {
        const rowHeight = this.rowHeight;
        let rowTop = rowHeight * rowIndex;
        this.heightsState.forEach((height, index) => {
            if (index < rowIndex) {
                rowTop += height - rowHeight;
            }
        });
        return rowTop;
    }

    public getTopLevelRowCount(): number {
        return this.getRowCount();
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        return topLevelIndex;
    }

    public isEmpty(): boolean {
        return this.rowCount > 0;
    }

    public isRowsToRender(): boolean {
        return this.rowCount > 0;
    }

    public getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        const firstIndex = firstInRange.rowIndex!;
        const lastIndex = lastInRange.rowIndex!;

        const firstNodeOutOfRange = firstIndex < this.firstRow || firstIndex > this.lastRow;
        const lastNodeOutOfRange = lastIndex < this.firstRow || lastIndex > this.lastRow;

        if (firstNodeOutOfRange || lastNodeOutOfRange) {
            return [];
        }

        const result: RowNode[] = [];

        const startIndex = firstIndex <= lastIndex ? firstIndex : lastIndex;
        const endIndex = firstIndex <= lastIndex ? lastIndex : firstIndex;

        for (let i = startIndex; i <= endIndex; i++) {
            result.push(this.rowNodesByIndex[i]);
        }

        return result;
    }

    public forEachDisplayedNode = this.forEachNode;

    public forEachNode(callback: (rowNode: RowNode, index: number, stateIndex: number) => void): void {
        Object.keys(this.rowNodesByIndex).forEach((indexStr, index) => {
            const rowIndex = parseInt(indexStr, 10);
            const rowNode: RowNode = this.rowNodesByIndex[rowIndex];
            callback(rowNode, index, rowIndex);
        });
    }

    private setRowData(rowData: { [key: number]: any }): void {
        // see if user is providing the id's
        const getRowIdFunc = _getRowIdCallback(this.beans.gos);
        const existingNodesById = new Map<string, RowNode>();
        if (getRowIdFunc) {
            for (const row of Object.values(this.rowNodesByIndex)) {
                existingNodesById.set(row.id!, row);
            }
        }

        for (let i = this.firstRow; i <= this.lastRow; i++) {
            const data = rowData[i];

            // the response does not have to include every row - any omitted rows will be left unchanged
            if (!data) {
                continue;
            }

            let rowId: string | undefined;
            let row: RowNode | undefined;
            if (getRowIdFunc) {
                rowId = getRowIdFunc({ data, rowPinned: undefined, level: 0, parentKeys: undefined });
                row = existingNodesById.get(rowId);
            } else {
                row = this.rowNodesByIndex[i];
            }

            if (row) {
                row.updateData(data);
                row.setRowIndex(i);
                row.setRowTop(this.getRowTop(i));
            } else {
                // if we don't have a row, then we create a new one
                row = this.createBlankRowNode(i);
                row.setDataAndId(data, rowId ?? i.toString());
            }
            this.rowNodesByIndex[i] = row;
        }

        if (!this.viewportChangedContext) {
            this.eventSvc.dispatchEvent({
                type: 'modelUpdated',
                newData: false,
                newPage: false,
                keepRenderedRows: true,
                animate: false,
            });
        }
    }

    private createBlankRowNode(rowIndex: number): RowNode {
        const rowNode = new RowNode(this.beans);

        const rowHeight = this.rowHeight;
        rowNode.setRowHeight(this.heightsState.get(rowIndex) ?? rowHeight);
        rowNode.setRowTop(this.getRowTop(rowIndex));
        rowNode.setRowIndex(rowIndex);

        return rowNode;
    }

    public setRowCount(rowCount: number, keepRenderedRows = false): void {
        if (rowCount === this.rowCount) {
            return;
        }

        this.rowCount = rowCount;

        const eventSvc = this.eventSvc;
        eventSvc.dispatchEventOnce({
            type: 'rowCountReady',
        });

        eventSvc.dispatchEvent({
            type: 'modelUpdated',
            newData: false,
            newPage: false,
            keepRenderedRows: keepRenderedRows,
            animate: false,
        });
    }

    public isRowPresent(rowNode: RowNode): boolean {
        const foundRowNode = this.getRowNode(rowNode.id!);
        return !!foundRowNode;
    }
}
