import {Bean} from "./context/context";
import {GridCell} from "./gridPanel/mouseEventService";
import Constants from "./constants";
import {Autowired} from "./context/context";
import {ColumnController} from "./columnController/columnController";
import {IRowModel} from "./interfaces/iRowModel";
import Column from "./entities/column";
import FloatingRowModel from "./rowControllers/floatingRowModel";
import {GridRow} from "./gridPanel/mouseEventService";
import _ from './utils';

@Bean('cellNavigationService')
export class CellNavigationService {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('floatingRowModel') private floatingRowModel: FloatingRowModel;

    public getNextCellToFocus(key: any, lastCellToFocus: GridCell): GridCell {
        switch (key) {
            case Constants.KEY_UP : return this.getCellAbove(lastCellToFocus);
            case Constants.KEY_DOWN : return this.getCellBelow(lastCellToFocus);
            case Constants.KEY_RIGHT : return this.getCellToRight(lastCellToFocus);
            case Constants.KEY_LEFT : return this.getCellToLeft(lastCellToFocus);
            default : console.log('ag-Grid: unknown key for navigation ' + key);
        }
    }

    private getCellToLeft(lastCell: GridCell): GridCell {
        var colToLeft = this.columnController.getDisplayedColBefore(lastCell.column);
        if (!colToLeft) {
            return null;
        } else {
            return this.createGridCell(lastCell.rowIndex, colToLeft, lastCell.floating);
        }
    }

    private getCellToRight(lastCell: GridCell): GridCell {
        var colToRight = this.columnController.getDisplayedColAfter(lastCell.column);
        // if already on right, do nothing
        if (!colToRight) {
            return null;
        } else {
            return this.createGridCell(lastCell.rowIndex, colToRight, lastCell.floating);
        }
    }

    private getRowBelow(lastRow: GridRow): GridRow {
        // if already on top row, do nothing
        if (this.isLastRowInContainer(lastRow)) {
            var lastCellFloatingTop = lastRow.floating===Constants.FLOATING_TOP;
            var lastCellFloatingBottom = lastRow.floating===Constants.FLOATING_BOTTOM;
            var lastCellNotFloating = !(lastCellFloatingTop || lastCellFloatingBottom);

            if (lastCellFloatingBottom) {
                return null;
            } else if (lastCellNotFloating) {
                if (this.floatingRowModel.isRowsToRender(Constants.FLOATING_BOTTOM)) {
                    return {rowIndex: 0, floating: Constants.FLOATING_BOTTOM};
                } else {
                    return null;
                }
            } else {
                if (this.rowModel.isRowsToRender()) {
                    return {rowIndex: 0, floating: null};
                } else if (this.floatingRowModel.isRowsToRender(Constants.FLOATING_BOTTOM)) {
                    return {rowIndex: 0, floating: Constants.FLOATING_BOTTOM};
                } else {
                    return null;
                }
            }

        } else {
            return {rowIndex: lastRow.rowIndex + 1, floating: lastRow.floating};
        }

    }

    private getCellBelow(lastCell: GridCell): GridCell {
        var rowBelow = this.getRowBelow({rowIndex: lastCell.rowIndex, floating: lastCell.floating});
        return {rowIndex: rowBelow.rowIndex, column: lastCell.column, floating: rowBelow.floating};
    }

    private isLastRowInContainer(gridRow: GridRow): boolean {
        switch (gridRow.floating) {
            case Constants.FLOATING_TOP:
                var lastTopIndex = this.floatingRowModel.getFloatingTopRowData().length - 1;
                return lastTopIndex === gridRow.rowIndex;
            case Constants.FLOATING_BOTTOM:
                var lastBottomIndex = this.floatingRowModel.getFloatingBottomRowData().length - 1;
                return lastBottomIndex === gridRow.rowIndex;
            default:
                var lastBodyIndex = this.rowModel.getRowCount() - 1;
                return lastBodyIndex === gridRow.rowIndex;
        }
    }

    private getRowAbove(lastRow: GridRow): GridRow {
        // if already on top row, do nothing
        if (lastRow.rowIndex === 0) {
            var lastCellFloatingTop = lastRow.floating===Constants.FLOATING_TOP;
            var lastCellFloatingBottom = lastRow.floating===Constants.FLOATING_BOTTOM;
            var lastCellNotFloating = !(lastCellFloatingTop || lastCellFloatingBottom);

            if (lastCellFloatingTop) {
                return null;
            } else if (lastCellNotFloating) {
                if (this.floatingRowModel.isRowsToRender(Constants.FLOATING_TOP)) {
                    return this.getLastFloatingTopRow();
                } else {
                    return null;
                }
            } else {
                // last floating bottom
                if (this.rowModel.isRowsToRender()) {
                    return this.getLastBodyCell();
                } else if (this.floatingRowModel.isRowsToRender(Constants.FLOATING_TOP)) {
                    return this.getLastFloatingTopRow();
                } else {
                    return null;
                }
            }

        } else {
            return {rowIndex: lastRow.rowIndex - 1, floating: lastRow.floating};
        }

    }

    private getCellAbove(lastCell: GridCell): GridCell {
        var rowAbove = this.getRowAbove({rowIndex: lastCell.rowIndex, floating: lastCell.floating});
        return {rowIndex: rowAbove.rowIndex, column: lastCell.column, floating: rowAbove.floating}
    }

    private getLastBodyCell(): GridRow {
        var lastBodyRow = this.rowModel.getRowCount() - 1;
        return {rowIndex: lastBodyRow, floating: null};
    }

    private getLastFloatingTopRow(): GridRow {
        var lastFloatingRow = this.floatingRowModel.getFloatingTopRowData().length - 1;
        return {rowIndex: lastFloatingRow, floating: Constants.FLOATING_TOP};
    }

    private createGridCell(rowIndex: number, column: Column, floating: string): GridCell {
        return {
            rowIndex: rowIndex,
            floating: floating,
            column: column
        };
    }

    public getNextTabbedCellForwards(gridCell: GridCell): GridCell {

        var displayedColumns = this.columnController.getAllDisplayedColumns();

        var newRowIndex = gridCell.rowIndex;
        var newFloating = gridCell.floating;

        // move along to the next cell
        var newColumn = this.columnController.getDisplayedColAfter(gridCell.column);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[0];

            var rowBelow = this.getRowBelow({rowIndex: gridCell.rowIndex, floating: gridCell.floating});
            if (_.missing(rowBelow)) {
                return;
            }
            newRowIndex = rowBelow.rowIndex;
            newFloating = rowBelow.floating;
        }

        return {
            rowIndex: newRowIndex,
            floating: newFloating,
            column: newColumn
        }
    }

    public getNextTabbedCellBackwards(gridCell: GridCell): GridCell {

        var displayedColumns = this.columnController.getAllDisplayedColumns();

        var newRowIndex = gridCell.rowIndex;
        var newFloating = gridCell.floating;

        // move along to the next cell
        var newColumn = this.columnController.getDisplayedColBefore(gridCell.column);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[displayedColumns.length - 1];

            var rowAbove = this.getRowAbove({rowIndex: gridCell.rowIndex, floating: gridCell.floating});
            if (_.missing(rowAbove)) {
                return;
            }
            newRowIndex = rowAbove.rowIndex;
            newFloating = rowAbove.floating;
        }

        return {
            rowIndex: newRowIndex,
            floating: newFloating,
            column: newColumn
        }
    }

}