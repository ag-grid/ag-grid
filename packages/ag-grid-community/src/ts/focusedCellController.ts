import { Bean, Autowired, PostConstruct } from "./context/context";
import { EventService } from "./eventService";
import { Column } from "./entities/column";
import { CellFocusedEvent, Events } from "./events";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { ColumnApi } from "./columnController/columnApi";
import { ColumnController } from "./columnController/columnController";
import { CellPosition } from "./entities/cellPosition";
import { RowNode } from "./entities/rowNode";
import { GridApi } from "./gridApi";
import { CellComp } from "./rendering/cellComp";
import { _ } from "./utils";

@Bean('focusedCellController')
export class FocusedCellController {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private focusedCellPosition: CellPosition;

    @PostConstruct
    private init(): void {
        this.eventService.addEventListener(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.clearFocusedCell.bind(this));

        // we used to remove focus when moving column, am not sure why. so taking this out and see who complains.
        // we can delete these three lines of code soon.
        // this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.clearFocusedCell.bind(this));
        // this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.clearFocusedCell.bind(this));
        // this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.clearFocusedCell.bind(this));
    }

    public clearFocusedCell(): void {
        this.focusedCellPosition = null;
        this.onCellFocused(false);
    }

    public getFocusedCell(): CellPosition {
        return this.focusedCellPosition;
    }

    // we check if the browser is focusing something, and if it is, and
    // it's the cell we think is focused, then return the cell. so this
    // methods returns the cell if a) we think it has focus and b) the
    // browser thinks it has focus. this then returns nothing if we
    // first focus a cell, then second click outside the grid, as then the
    // grid cell will still be focused as far as the grid is concerned,
    // however the browser focus will have moved somewhere else.
    public getFocusCellToUseAfterRefresh(): CellPosition {
        if (this.gridOptionsWrapper.isSuppressFocusAfterRefresh()) {
            return null;
        }

        if (!this.focusedCellPosition) {
            return null;
        }

        // we check that the browser is actually focusing on the grid, if it is not, then
        // we have nothing to worry about
        const browserFocusedCell = this.getGridCellForDomElement(document.activeElement);
        if (!browserFocusedCell) {
            return null;
        }

        return this.focusedCellPosition;
    }

    private getGridCellForDomElement(eBrowserCell: Node): CellPosition {

        let ePointer = eBrowserCell;
        while (ePointer) {
            const cellComp = this.gridOptionsWrapper.getDomData(ePointer, CellComp.DOM_DATA_KEY_CELL_COMP) as CellComp;
            if (cellComp) {
                return cellComp.getCellPosition();
            }
            ePointer = ePointer.parentNode;
        }

        return null;
    }

    public setFocusedCell(rowIndex: number, colKey: string | Column, floating: string | undefined, forceBrowserFocus = false): void {
        const column = _.makeNull(this.columnController.getGridColumn(colKey));
        this.focusedCellPosition = {rowIndex: rowIndex, rowPinned: _.makeNull(floating), column: column};
        this.onCellFocused(forceBrowserFocus);
    }

    public isCellFocused(cellPosition: CellPosition): boolean {
        if (_.missing(this.focusedCellPosition)) { return false; }
        return this.focusedCellPosition.column === cellPosition.column && this.isRowFocused(cellPosition.rowIndex, cellPosition.rowPinned);
    }

    public isRowNodeFocused(rowNode: RowNode): boolean {
        return this.isRowFocused(rowNode.rowIndex, rowNode.rowPinned);
    }

    public isAnyCellFocused(): boolean {
        return !!this.focusedCellPosition;
    }

    public isRowFocused(rowIndex: number, floating: string): boolean {
        if (_.missing(this.focusedCellPosition)) { return false; }
        const floatingOrNull = _.makeNull(floating);
        return this.focusedCellPosition.rowIndex === rowIndex && this.focusedCellPosition.rowPinned === floatingOrNull;
    }

    private onCellFocused(forceBrowserFocus: boolean): void {
        const event: CellFocusedEvent = {
            type: Events.EVENT_CELL_FOCUSED,
            forceBrowserFocus: forceBrowserFocus,
            rowIndex: null as number,
            column: null as Column,
            floating: null as string,
            api: this.gridApi,
            columnApi: this.columnApi,
            rowPinned: null as string
        };

        if (this.focusedCellPosition) {
            event.rowIndex = this.focusedCellPosition.rowIndex;
            event.column = this.focusedCellPosition.column;
            event.rowPinned = this.focusedCellPosition.rowPinned;
        }

        this.eventService.dispatchEvent(event);
    }
}