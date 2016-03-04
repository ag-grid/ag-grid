import {Bean} from "./context/context";
import {Autowired} from "./context/context";
import {EventService} from "./eventService";
import {Column} from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {PostConstruct} from "./context/context";
import {Events} from "./events";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ColDef} from "./entities/colDef";
import {ColumnController} from "./columnController/columnController";
import {Utils as _} from './utils';
import {GridCell} from "./entities/gridCell";

@Bean('focusedCellController')
export class FocusedCellController {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;

    private focusedCell: GridCell;

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
        this.focusedCell = null;
        this.onCellFocused(false);
    }

    public getFocusedCell(): GridCell {
        return this.focusedCell;
    }

    public setFocusedCell(rowIndex: number, colKey: Column|ColDef|string, floating: string, forceBrowserFocus = false): void {
        if (this.gridOptionsWrapper.isSuppressCellSelection()) {
            return;
        }

        var column = _.makeNull(this.columnController.getColumn(colKey));
        this.focusedCell = new GridCell(rowIndex, _.makeNull(floating), column);

        this.onCellFocused(forceBrowserFocus);
    }

    public isCellFocused(rowIndex: number, column: Column, floating: string): boolean {
        if (_.missing(this.focusedCell)) { return false; }
        return this.focusedCell.column === column && this.isRowFocused(rowIndex, floating);
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