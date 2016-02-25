import {Bean} from "./context/context";
import {Autowired} from "./context/context";
import EventService from "./eventService";
import Column from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {PostConstruct} from "./context/context";
import {Events} from "./events";
import GridOptionsWrapper from "./gridOptionsWrapper";
import {ColDef} from "./entities/colDef";
import {ColumnController} from "./columnController/columnController";

export interface FocusedCell {
    rowIndex: number,
    column: Column
}

@Bean('focusedCellController')
export class FocusedCellController {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;

    private focusedRowIndex: number;
    private focusedColumn: Column;

    @PostConstruct
    private init(): void {
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.clearFocusedCell.bind(this));

        //this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.clearFocusedCell.bind(this));
    }

    public clearFocusedCell(): void {
        this.focusedRowIndex = null;
        this.focusedColumn = null;
        this.onCellFocused(false);
    }

    public getFocusedCell(): FocusedCell {
        return {
            column: this.focusedColumn,
            rowIndex: this.focusedRowIndex
        }
    }

    public setFocusedCell(rowIndex: number, colKey: Column|ColDef|string, forceBrowserFocus = false): void {
        if (this.gridOptionsWrapper.isSuppressCellSelection()) {
            return;
        }

        this.focusedRowIndex = rowIndex;

        if (colKey) {
            this.focusedColumn = this.columnController.getColumn(colKey);
        } else {
            this.focusedColumn = null;
        }

        this.onCellFocused(forceBrowserFocus);
    }

    public isCellFocused(rowIndex: number, column: Column): boolean {
        return this.focusedRowIndex === rowIndex && this.focusedColumn === column;
    }

    public isRowFocused(rowIndex: number): boolean {
        return this.focusedRowIndex === rowIndex;
    }

    private onCellFocused(forceBrowserFocus: boolean): void {
        var event = {
            rowIndex: this.focusedRowIndex,
            column: this.focusedColumn,
            forceBrowserFocus: forceBrowserFocus
        };
        this.eventService.dispatchEvent(Events.EVENT_CELL_FOCUSED, event);
    }
}