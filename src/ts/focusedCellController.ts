import {Bean, Autowired, PostConstruct} from "./context/context";
import {EventService} from "./eventService";
import {Column} from "./entities/column";
import {Events} from "./events";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ColDef} from "./entities/colDef";
import {ColumnController} from "./columnController/columnController";
import {Utils as _} from "./utils";
import {GridCell} from "./entities/gridCell";
import {Constants} from "./constants";

@Bean('focusedCellController')
export class FocusedCellController {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;

    private focusedCell: GridCell;

    @PostConstruct
    private init(): void {
        this.eventService.addEventListener(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.clearFocusedCell.bind(this));
    }

    public clearFocusedCell(): void {
        this.focusedCell = null;
        this.onCellFocused(false);
    }

    public getFocusedCell(): GridCell {
        return this.focusedCell;
    }

    // we check if the browser is focusing something, and if it is, and
    // it's the cell we think is focused, then return the cell. so this
    // methods returns the cell if a) we think it has focus and b) the
    // browser thinks it has focus. this then returns nothing if we
    // first focus a cell, then second click outside the grid, as then the
    // grid cell will still be focused as far as the grid is concerned,
    // however the browser focus will have moved somewhere else.
    public getFocusCellToUseAfterRefresh(): GridCell {
        if (this.gridOptionsWrapper.isSuppressFocusAfterRefresh()) {
            return null;
        }
        
        if (!this.focusedCell) {
            return null;
        }
        
        var browserFocusedCell = this.getGridCellForDomElement(document.activeElement);
        if (!browserFocusedCell) {
            return null;
        }

        var gridFocusId = this.focusedCell.createId();
        var browserFocusId = browserFocusedCell.createId();

        if (gridFocusId === browserFocusId) {
            return this.focusedCell;
        } else {
            return null;
        }
    }

    private getGridCellForDomElement(eBrowserCell: Node): GridCell {
        if (!eBrowserCell) {
            return null;
        }

        var column: Column = null;
        var row: number  = null;
        var floating: string = null;
        var that = this;

        while (eBrowserCell) {
            checkRow(eBrowserCell);
            checkColumn(eBrowserCell);
            eBrowserCell = eBrowserCell.parentNode;
        }

        if (_.exists(column) && _.exists(row)) {
            var gridCell = new GridCell(row, floating, column);
            return gridCell;
        } else {
            return null;
        }

        function checkRow(eTarget: Node): void {
            // match the column by checking a) it has a valid colId and b) it has the 'ag-cell' class
            var rowId = _.getElementAttribute(eTarget, 'row');
            if (_.exists(rowId) && _.containsClass(eTarget, 'ag-row')) {
                if (rowId.indexOf('ft')===0) {
                    floating = Constants.FLOATING_TOP;
                    rowId = rowId.substr(3);
                } else if (rowId.indexOf('fb')===0) {
                    floating = Constants.FLOATING_BOTTOM;
                    rowId = rowId.substr(3);
                } else {
                    floating = null;
                }
                row = parseInt(rowId);
            }
        }

        function checkColumn(eTarget: Node): void {
            // match the column by checking a) it has a valid colId and b) it has the 'ag-cell' class
            var colId = _.getElementAttribute(eTarget, 'colid');
            if (_.exists(colId) && _.containsClass(eTarget, 'ag-cell')) {
                var foundColumn = that.columnController.getGridColumn(colId);
                if (foundColumn) {
                    column = foundColumn;
                }
            }
        }
    }

    public setFocusedCell(rowIndex: number, colKey: Column|ColDef|string, floating: string, forceBrowserFocus = false): void {
        if (this.gridOptionsWrapper.isSuppressCellSelection()) {
            return;
        }

        var column = _.makeNull(this.columnController.getGridColumn(colKey));
        this.focusedCell = new GridCell(rowIndex, _.makeNull(floating), column);

        this.onCellFocused(forceBrowserFocus);
    }

    public isCellFocused(gridCell: GridCell): boolean {
        if (_.missing(this.focusedCell)) { return false; }
        return this.focusedCell.column === gridCell.column && this.isRowFocused(gridCell.rowIndex, gridCell.floating);
    }

    public isRowFocused(rowIndex: number, floating: string): boolean {
        if (_.missing(this.focusedCell)) { return false; }
        var floatingOrNull = _.makeNull(floating);
        return this.focusedCell.rowIndex === rowIndex && this.focusedCell.floating === floatingOrNull;
    }

    private onCellFocused(forceBrowserFocus: boolean): void {
        var event = {
            rowIndex: <number> null,
            column: <Column> null,
            floating: <string> null,
            forceBrowserFocus: forceBrowserFocus
        };
        if (this.focusedCell) {
            event.rowIndex = this.focusedCell.rowIndex;
            event.column = this.focusedCell.column;
            event.floating = this.focusedCell.floating;
        }

        this.eventService.dispatchEvent(Events.EVENT_CELL_FOCUSED, event);
    }
}