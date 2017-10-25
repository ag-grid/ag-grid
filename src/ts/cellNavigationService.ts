import {Bean, Autowired} from "./context/context";
import {Constants} from "./constants";
import {ColumnController} from "./columnController/columnController";
import {IRowModel} from "./interfaces/iRowModel";
import {Utils as _} from "./utils";
import {GridRow} from "./entities/gridRow";
import {GridCell, GridCellDef} from "./entities/gridCell";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {PinnedRowModel} from "./rowModels/pinnedRowModel";
import {RowNode} from "./entities/rowNode";
import {Column} from "./entities/column";

@Bean('cellNavigationService')
export class CellNavigationService {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    // returns null if no cell to focus on, ie at the end of the grid
    public getNextCellToFocus(key: any, lastCellToFocus: GridCell): GridCell {

        // starting with the provided cell, we keep moving until we find a cell we can
        // focus on.
        let pointer = lastCellToFocus;
        let finished = false;

        // finished will be true when either:
        // a) cell found that we can focus on
        // b) run out of cells (ie the method returns null)
        while (!finished) {

            switch (key) {
                case Constants.KEY_UP :
                    pointer = this.getCellAbove(pointer);
                    break;
                case Constants.KEY_DOWN :
                    pointer = this.getCellBelow(pointer);
                    break;
                case Constants.KEY_RIGHT :
                    if (this.gridOptionsWrapper.isEnableRtl()) {
                        pointer = this.getCellToLeft(pointer);
                    } else {
                        pointer = this.getCellToRight(pointer);
                    }
                    break;
                case Constants.KEY_LEFT :
                    if (this.gridOptionsWrapper.isEnableRtl()) {
                        pointer = this.getCellToRight(pointer);
                    } else {
                        pointer = this.getCellToLeft(pointer);
                    }
                    break;
                default : console.log('ag-Grid: unknown key for navigation ' + key);
                    pointer = null;
                    break;
            }

            if (pointer) {
                finished = this.isCellGoodToFocusOn(pointer);
            } else {
                finished = true;
            }
        }

        return pointer;
    }

    private isCellGoodToFocusOn(gridCell: GridCell): boolean {
        let column: Column = gridCell.column;
        let rowNode: RowNode;

        switch (gridCell.floating) {
            case Constants.PINNED_TOP:
                rowNode = this.pinnedRowModel.getPinnedTopRow(gridCell.rowIndex);
                break;
            case Constants.PINNED_BOTTOM:
                rowNode = this.pinnedRowModel.getPinnedBottomRow(gridCell.rowIndex);
                break;
            default:
                rowNode = this.rowModel.getRow(gridCell.rowIndex);
                break;
        }

        let suppressNavigable = column.isSuppressNavigable(rowNode);
        return !suppressNavigable;
    }

    private getCellToLeft(lastCell: GridCell): GridCell {
        let colToLeft = this.columnController.getDisplayedColBefore(lastCell.column);
        if (!colToLeft) {
            return null;
        } else {
            let gridCellDef = <GridCellDef> {rowIndex: lastCell.rowIndex, column: colToLeft, floating: lastCell.floating};
            return new GridCell(gridCellDef);
        }
    }

    private getCellToRight(lastCell: GridCell): GridCell {
        let colToRight = this.columnController.getDisplayedColAfter(lastCell.column);
        // if already on right, do nothing
        if (!colToRight) {
            return null;
        } else {
            let gridCellDef = <GridCellDef> {rowIndex: lastCell.rowIndex, column: colToRight, floating: lastCell.floating};
            return new GridCell(gridCellDef);
        }
    }

    public getRowBelow(lastRow: GridRow): GridRow {
        // if already on top row, do nothing
        if (this.isLastRowInContainer(lastRow)) {

            if (lastRow.isFloatingBottom()) {
                return null;
            } else if (lastRow.isNotFloating()) {
                if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_BOTTOM)) {
                    return new GridRow(0, Constants.PINNED_BOTTOM);
                } else {
                    return null;
                }
            } else {
                if (this.rowModel.isRowsToRender()) {
                    return new GridRow(0, null);
                } else if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_BOTTOM)) {
                    return new GridRow(0, Constants.PINNED_BOTTOM);
                } else {
                    return null;
                }
            }

        } else {
            return new GridRow(lastRow.rowIndex + 1, lastRow.floating);
        }

    }

    private getCellBelow(lastCell: GridCell): GridCell {
        let rowBelow = this.getRowBelow(lastCell.getGridRow());
        if (rowBelow) {
            let gridCellDef = <GridCellDef> {rowIndex: rowBelow.rowIndex, column: lastCell.column, floating: rowBelow.floating};
            return new GridCell(gridCellDef);
        } else {
            return null;
        }
    }

    private isLastRowInContainer(gridRow: GridRow): boolean {
        if (gridRow.isFloatingTop()) {
            let lastTopIndex = this.pinnedRowModel.getPinnedTopRowData().length - 1;
            return lastTopIndex <= gridRow.rowIndex;
        } else if (gridRow.isFloatingBottom()) {
            let lastBottomIndex = this.pinnedRowModel.getPinnedBottomRowData().length - 1;
            return lastBottomIndex <= gridRow.rowIndex;
        } else {
            let lastBodyIndex = this.rowModel.getPageLastRow();
            return lastBodyIndex <= gridRow.rowIndex;
        }
    }

    private getRowAbove(lastRow: GridRow): GridRow {
        // if already on top row, do nothing
        if (lastRow.rowIndex === 0) {
            if (lastRow.isFloatingTop()) {
                return null;
            } else if (lastRow.isNotFloating()) {
                if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_TOP)) {
                    return this.getLastFloatingTopRow();
                } else {
                    return null;
                }
            } else {
                // last floating bottom
                if (this.rowModel.isRowsToRender()) {
                    return this.getLastBodyCell();
                } else if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_TOP)) {
                    return this.getLastFloatingTopRow();
                } else {
                    return null;
                }
            }

        } else {
            return new GridRow(lastRow.rowIndex - 1, lastRow.floating);
        }

    }

    private getCellAbove(lastCell: GridCell): GridCell {
        let rowAbove = this.getRowAbove(lastCell.getGridRow());
        if (rowAbove) {
            let gridCellDef = <GridCellDef> {rowIndex: rowAbove.rowIndex, column: lastCell.column, floating: rowAbove.floating};
            return new GridCell(gridCellDef);
        } else {
            return null;
        }
    }

    private getLastBodyCell(): GridRow {
        let lastBodyRow = this.rowModel.getPageLastRow();
        return new GridRow(lastBodyRow, null);
    }

    private getLastFloatingTopRow(): GridRow {
        let lastFloatingRow = this.pinnedRowModel.getPinnedTopRowData().length - 1;
        return new GridRow(lastFloatingRow, Constants.PINNED_TOP);
    }

    public getNextTabbedCell(gridCell: GridCell, backwards: boolean): GridCell {
        if (backwards) {
            return this.getNextTabbedCellBackwards(gridCell);
        } else {
            return this.getNextTabbedCellForwards(gridCell);
        }
    }
    
    public getNextTabbedCellForwards(gridCell: GridCell): GridCell {

        let displayedColumns = this.columnController.getAllDisplayedColumns();

        let newRowIndex = gridCell.rowIndex;
        let newFloating = gridCell.floating;

        // move along to the next cell
        let newColumn = this.columnController.getDisplayedColAfter(gridCell.column);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[0];

            let rowBelow = this.getRowBelow(gridCell.getGridRow());
            if (_.missing(rowBelow)) {
                return;
            }
            newRowIndex = rowBelow.rowIndex;
            newFloating = rowBelow.floating;
        }

        let gridCellDef = <GridCellDef> {rowIndex: newRowIndex, column: newColumn, floating: newFloating};
        return new GridCell(gridCellDef);
    }

    public getNextTabbedCellBackwards(gridCell: GridCell): GridCell {

        let displayedColumns = this.columnController.getAllDisplayedColumns();

        let newRowIndex = gridCell.rowIndex;
        let newFloating = gridCell.floating;

        // move along to the next cell
        let newColumn = this.columnController.getDisplayedColBefore(gridCell.column);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[displayedColumns.length - 1];

            let rowAbove = this.getRowAbove(gridCell.getGridRow());
            if (_.missing(rowAbove)) {
                return;
            }
            newRowIndex = rowAbove.rowIndex;
            newFloating = rowAbove.floating;
        }

        let gridCellDef = <GridCellDef> {rowIndex: newRowIndex, column: newColumn, floating: newFloating};
        return new GridCell(gridCellDef);
    }

}