import type { IRowModel, IViewportDatasource, NamedBean, RowBounds, RowModelType } from 'ag-grid-community';
import {
    BeanStub,
    RowNode,
    _addGridCommonParams,
    _getRowHeightAsNumber,
    _getRowIdCallback,
    _warn,
} from 'ag-grid-community';

export class ViewportRowModel extends BeanStub implements NamedBean, IRowModel {
    beanName = 'rowModel' as const;

    // rowRenderer tells us these
    private firstRow = -1;
    private lastRow = -1;

    // datasource tells us this
    private rowCount = -1;
    private rowNodesByIndex: { [index: number]: RowNode } = {};
    private rowHeight: number;
    private datasource: IViewportDatasource;

    /** Dummy root node */
    public rootNode: RowNode | null = null;

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

        const rootNode = new RowNode(beans);
        this.rootNode = rootNode;
        rootNode.level = -1;

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
        this.rootNode = null;
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
        for (const indexStr of Object.keys(rowNodesByIndex)) {
            const index = parseInt(indexStr, 10);
            if (index < this.firstRow || index > this.lastRow) {
                if (this.isRowFocused(index) || this.beans.editSvc?.isRowEditing(rowNodesByIndex[index])) {
                    continue;
                }

                delete rowNodesByIndex[index];
            }
        }
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
            viewportDatasource.init(
                _addGridCommonParams(this.gos, {
                    setRowCount: this.setRowCount.bind(this),
                    setRowData: this.setRowData.bind(this),
                    getRow: this.getRow.bind(this),
                })
            );
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
            // avoid divide by zero error
            return Math.floor(pixel / this.rowHeight);
        }

        return 0;
    }

    /** Viewport row model does not support dynamic row heights by design and while it is possible to implement this feature, it leads to view-model desync due to data being not isotropic in time */
    resetRowHeights() {}
    onRowHeightChanged() {}

    public getRowBounds(index: number): RowBounds {
        const rowHeight = this.rowHeight;
        return {
            rowHeight,
            rowTop: rowHeight * index,
        };
    }

    private updateRowHeights() {
        const rowHeight = this.rowHeight;
        this.forEachNode((node) => {
            node.setRowHeight(rowHeight);
            node.setRowTop(rowHeight * node.rowIndex!);
        });

        this.eventSvc.dispatchEvent({
            type: 'modelUpdated',
            newData: false,
            newPage: false,
            keepRenderedRows: true,
            animate: false,
        });
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

    public forEachNode(callback: (rowNode: RowNode, index: number) => void): void {
        let callbackCount = 0;

        for (const indexStr of Object.keys(this.rowNodesByIndex)) {
            const index = parseInt(indexStr, 10);
            const rowNode: RowNode = this.rowNodesByIndex[index];
            callback(rowNode, callbackCount);
            callbackCount++;
        }
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
                row.setRowTop(this.rowHeight * i);
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
        rowNode.setRowHeight(rowHeight);
        rowNode.setRowTop(rowHeight * rowIndex);
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
