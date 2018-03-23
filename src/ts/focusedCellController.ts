import {Bean, Autowired, PostConstruct} from "./context/context";
import {EventService} from "./eventService";
import {Column} from "./entities/column";
import {CellFocusedEvent, Events} from "./events";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ColumnApi} from "./columnController/columnApi";
import {ColumnController} from "./columnController/columnController";
import {Utils as _} from "./utils";
import {GridCell} from "./entities/gridCell";
import {RowNode} from "./entities/rowNode";
import {GridApi} from "./gridApi";
import {CellComp} from "./rendering/cellComp";

@Bean('focusedCellController')
export class FocusedCellController {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

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

        // we check that the browser is actually focusing on the grid, if it is not, then
        // we have nothing to worry about
        let browserFocusedCell = this.getGridCellForDomElement(document.activeElement);
        if (!browserFocusedCell) {
            return null;
        }

        return this.focusedCell;
    }

    private getGridCellForDomElement(eBrowserCell: Node): GridCell {

        let ePointer = eBrowserCell;
        while (ePointer) {
            let cellComp = <CellComp> this.gridOptionsWrapper.getDomData(ePointer, CellComp.DOM_DATA_KEY_CELL_COMP);
            if (cellComp) {
                return cellComp.getGridCell();
            }
            ePointer = ePointer.parentNode;
        }

        return null;
    }

    public setFocusedCell(rowIndex: number, colKey: string|Column, floating: string, forceBrowserFocus = false): void {
        let column = _.makeNull(this.columnController.getGridColumn(colKey));
        this.focusedCell = new GridCell({rowIndex: rowIndex,
                                        floating: _.makeNull(floating),
                                        column: column});

        this.onCellFocused(forceBrowserFocus);
    }

    public isCellFocused(gridCell: GridCell): boolean {
        if (_.missing(this.focusedCell)) { return false; }
        return this.focusedCell.column === gridCell.column && this.isRowFocused(gridCell.rowIndex, gridCell.floating);
    }

    public isRowNodeFocused(rowNode: RowNode): boolean {
        return this.isRowFocused(rowNode.rowIndex, rowNode.rowPinned);
    }

    public isAnyCellFocused(): boolean {
        return !!this.focusedCell;
    }

    public isRowFocused(rowIndex: number, floating: string): boolean {
        if (_.missing(this.focusedCell)) { return false; }
        let floatingOrNull = _.makeNull(floating);
        return this.focusedCell.rowIndex === rowIndex && this.focusedCell.floating === floatingOrNull;
    }

    private onCellFocused(forceBrowserFocus: boolean): void {
        let event: CellFocusedEvent = {
            type: Events.EVENT_CELL_FOCUSED,
            forceBrowserFocus: forceBrowserFocus,
            rowIndex: <number> null,
            column: <Column> null,
            floating: <string> null,
            api: this.gridApi,
            columnApi: this.columnApi,
            rowPinned: <string> null
        };

        if (this.focusedCell) {
            event.rowIndex = this.focusedCell.rowIndex;
            event.column = this.focusedCell.column;
            event.rowPinned = this.focusedCell.floating;
        }

        this.eventService.dispatchEvent(event);
    }
}