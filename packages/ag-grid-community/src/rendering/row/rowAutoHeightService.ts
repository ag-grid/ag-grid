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
        const { visibleCols, rowModel, rowSpanSvc } = this.beans;
        const displayedAutoHeightCols = visibleCols.autoHeightCols;

        let anyNodeChanged = false;
        rowModel.forEachDisplayedNode?.((row) => {
            const autoHeights = row.__autoHeights;

            let newRowHeight = _getRowHeightForNode(this.beans, row).height;
            for (const col of displayedAutoHeightCols) {
                // if using col span, we don't allow auto height.
                if (this.colSpanSkipRow(col, row)) {
                    return;
                }

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
                    return;
                }

                newRowHeight = Math.max(cellHeight, newRowHeight);
            }

            if (newRowHeight !== row.rowHeight) {
                row.setRowHeight(newRowHeight);
                anyNodeChanged = true;
            }
        });

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
        if (!rowNode.__autoHeights) {
            rowNode.__autoHeights = {};
        }

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
     * If using col span, we don't allow auto height on rows that span columns.
     * @param col the column of the cell
     * @param node the node of the cell
     * @returns whether the row should skip auto height
     */
    private colSpanSkipRow(col: AgColumn, node: RowNode): boolean {
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
        return activeColsForRow.includes(col);
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
}
