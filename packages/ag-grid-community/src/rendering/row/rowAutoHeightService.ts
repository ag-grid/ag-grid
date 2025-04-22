import type { ColumnCollections } from '../../columns/columnModel';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { _getDocument, _getRowHeightForNode } from '../../gridOptionsUtils';
import type { IClientSideRowModel } from '../../interfaces/iClientSideRowModel';
import type { IServerSideRowModel } from '../../interfaces/iServerSideRowModel';
import { _getElementSize, _observeResize } from '../../utils/dom';
import { _debounce } from '../../utils/function';
import type { CellCtrl } from '../cell/cellCtrl';

export class RowAutoHeightService extends BeanStub implements NamedBean {
    beanName = 'rowAutoHeight' as const;

    /** grid columns have colDef.autoHeight set */
    public active: boolean;
    private wasEverActive = false;

    /**
     * If row height has been active, request a refresh of the row heights.
     */
    public requestCheckAutoHeight(): void {
        if (!this.wasEverActive) {
            return;
        }

        this._debouncedCalculateRowHeights();
    }

    private _debouncedCalculateRowHeights = _debounce(this, this.calculateRowHeights.bind(this), 1);
    private calculateRowHeights() {
        const { visibleCols, rowModel, rowSpanSvc, pinnedRowModel } = this.beans;
        const displayedAutoHeightCols = visibleCols.autoHeightCols;

        let anyNodeChanged = false;
        const updateDisplayedRowHeights = (row: RowNode) => {
            const autoHeights = row.__autoHeights;

            let newRowHeight = _getRowHeightForNode(this.beans, row).height;
            for (const col of displayedAutoHeightCols) {
                let cellHeight = autoHeights?.[col.getColId()];

                const spannedCell = rowSpanSvc?.getCellSpan(col, row);
                if (spannedCell) {
                    // only last row gets additional auto height of spanned cell
                    if (spannedCell.getLastNode() !== row) {
                        continue;
                    }

                    cellHeight = rowSpanSvc?.getCellSpan(col, row)?.getLastNodeAutoHeight();
                    // if this is the last row, but no span value, skip this row as auto height not ready
                    if (!cellHeight) {
                        return;
                    }
                }

                // if no cell height, auto height not ready skip row
                if (cellHeight == null) {
                    // if using col span then the cell might be omitted due to being spanned
                    // if so auto height for that cell is not needed
                    if (this.colSpanSkipCell(col, row)) {
                        continue;
                    }
                    return;
                }

                newRowHeight = Math.max(cellHeight, newRowHeight);
            }

            if (newRowHeight !== row.rowHeight) {
                row.setRowHeight(newRowHeight);
                anyNodeChanged = true;
            }
        };

        pinnedRowModel?.forEachPinnedRow?.('top', updateDisplayedRowHeights);
        pinnedRowModel?.forEachPinnedRow?.('bottom', updateDisplayedRowHeights);
        rowModel.forEachDisplayedNode?.(updateDisplayedRowHeights);

        if (anyNodeChanged) {
            (rowModel as IClientSideRowModel | IServerSideRowModel).onRowHeightChanged?.();
        }
    }

    /**
     * Set the cell height into the row node, and request a refresh of the row heights if there's been a change.
     * @param rowNode the node to set the auto height on
     * @param cellHeight the height to set, undefined if the cell has just been destroyed
     * @param column the column of the cell
     */
    private setRowAutoHeight(rowNode: RowNode, cellHeight: number | undefined, column: AgColumn): void {
        rowNode.__autoHeights ??= {};

        // if the cell comp has been unmounted, delete the auto height
        if (cellHeight == undefined) {
            delete rowNode.__autoHeights[column.getId()];
            return;
        }

        const previousCellHeight = rowNode.__autoHeights[column.getId()];
        rowNode.__autoHeights[column.getId()] = cellHeight;
        if (previousCellHeight !== cellHeight) {
            this.requestCheckAutoHeight();
        }
    }

    /**
     * If using col span, then cells which have been spanned over do not need an auto height value
     * @param col the column of the cell
     * @param node the node of the cell
     * @returns whether the row needs auto height value for that column
     */
    private colSpanSkipCell(col: AgColumn, node: RowNode): boolean {
        const { colModel, colViewport, visibleCols } = this.beans;
        if (!colModel.colSpanActive) {
            return false;
        }

        let activeColsForRow: AgColumn[] = [];
        switch (col.getPinned()) {
            case 'left':
                activeColsForRow = visibleCols.getLeftColsForRow(node);
                break;
            case 'right':
                activeColsForRow = visibleCols.getRightColsForRow(node);
                break;
            case null:
                activeColsForRow = colViewport.getColsWithinViewport(node);
                break;
        }
        return !activeColsForRow.includes(col);
    }

    /**
     * If required, sets up observers to continuously measure changes in the cell height.
     * @param cellCtrl the cellCtrl of the cell
     * @param eCellWrapper the HTMLElement to track the height of
     * @param compBean the component bean to add the destroy/cleanup function to
     * @returns whether or not auto height has been set up on this cell
     */
    public setupCellAutoHeight(cellCtrl: CellCtrl, eCellWrapper: HTMLElement | undefined, compBean: BeanStub): boolean {
        if (!cellCtrl.column.isAutoHeight() || !eCellWrapper) {
            return false;
        }

        this.wasEverActive = true;

        const eParentCell = eCellWrapper.parentElement!;
        const { rowNode, column } = cellCtrl;
        const beans = this.beans;

        const measureHeight = (timesCalled: number) => {
            if (cellCtrl.editing) {
                return;
            }
            // because of the retry's below, it's possible the retry's go beyond
            // the rows life.
            if (!cellCtrl.isAlive() || !compBean.isAlive()) {
                return;
            }

            const { paddingTop, paddingBottom, borderBottomWidth, borderTopWidth } = _getElementSize(eParentCell);
            const extraHeight = paddingTop + paddingBottom + borderBottomWidth + borderTopWidth;

            const wrapperHeight = eCellWrapper!.offsetHeight;
            const autoHeight = wrapperHeight + extraHeight;

            if (timesCalled < 5) {
                // if not in doc yet, means framework not yet inserted, so wait for next VM turn,
                // maybe it will be ready next VM turn
                const doc = _getDocument(beans);
                const notYetInDom = !doc || !doc.contains(eCellWrapper);

                // this happens in React, where React hasn't put any content in. we say 'possibly'
                // as a) may not be React and b) the cell could be empty anyway
                const possiblyNoContentYet = autoHeight == 0;

                if (notYetInDom || possiblyNoContentYet) {
                    window.setTimeout(() => measureHeight(timesCalled + 1), 0);
                    return;
                }
            }

            this.setRowAutoHeight(rowNode, autoHeight, column);
        };

        const listener = () => measureHeight(0);

        // do once to set size in case size doesn't change, common when cell is blank
        listener();

        const destroyResizeObserver = _observeResize(beans, eCellWrapper, listener);

        compBean.addDestroyFunc(() => {
            destroyResizeObserver();
            this.setRowAutoHeight(rowNode, undefined, column);
        });
        return true;
    }

    public setAutoHeightActive(cols: ColumnCollections): void {
        this.active = cols.list.some((col) => col.isVisible() && col.isAutoHeight());
    }

    /**
     * Determines if the row auto height service has cells to grow.
     * @returns true if all of the rendered rows are at least as tall as their rendered cells.
     */
    public areRowsMeasured(): boolean {
        if (!this.active) {
            return true;
        }

        const rowCtrls = this.beans.rowRenderer.getAllRowCtrls();
        let renderedAutoHeightCols: AgColumn[] | null = null;
        for (const { rowNode } of rowCtrls) {
            // if colSpanActive is false, then all rows will have the same cols, so shortcut
            // and avoid filtering the cols for each row
            if (!renderedAutoHeightCols || this.beans.colModel.colSpanActive) {
                const renderedCols = this.beans.colViewport.getColsWithinViewport(rowNode);
                renderedAutoHeightCols = renderedCols.filter((col) => col.isAutoHeight());
            }

            if (renderedAutoHeightCols.length === 0) {
                continue;
            }

            if (!rowNode.__autoHeights) {
                return false;
            }

            for (const col of renderedAutoHeightCols) {
                const cellHeight = rowNode.__autoHeights[col.getColId()];
                if (!cellHeight || rowNode.rowHeight! < cellHeight) {
                    return false;
                }
            }
        }

        return true;
    }
}
