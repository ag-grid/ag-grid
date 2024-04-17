import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { CellPosition } from "../entities/cellPositionUtils";
import { MouseEventService } from "./mouseEventService";
import { PaginationProxy } from "../pagination/paginationProxy";
import { Column } from "../entities/column";
import { FocusService } from "../focusService";
import { IRangeService } from "../interfaces/IRangeService";
import { ColumnModel } from "../columns/columnModel";
import { BeanStub } from "../context/beanStub";
import { exists, missing } from "../utils/generic";
import { last } from "../utils/array";
import { KeyCode } from '../constants/keyCode';
import { CtrlsService } from "../ctrlsService";
import { GridBodyCtrl } from "./gridBodyCtrl";
import { CellCtrl } from "../rendering/cell/cellCtrl";
import { RowCtrl } from "../rendering/row/rowCtrl";
import { warnOnce, throttle } from "../utils/function";
import { RowPosition, RowPositionUtils } from "../entities/rowPositionUtils";
import { RowRenderer } from "../rendering/rowRenderer";
import { HeaderNavigationService } from "../headerRendering/common/headerNavigationService";
import { CellNavigationService } from "../cellNavigationService";
import { PinnedRowModel } from "../pinnedRowModel/pinnedRowModel";
import { NavigateToNextCellParams, TabToNextCellParams } from "../interfaces/iCallbackParams";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { Events } from "../eventKeys";
import { FullWidthRowFocusedEvent } from "../events";
import { IRowModel } from "../interfaces/iRowModel";

interface NavigateParams {
    /** The rowIndex to vertically scroll to. */
    scrollIndex: number;
    /** The position to put scroll index. */
    scrollType: 'top' | 'bottom' | null;
    /**  The column to horizontally scroll to. */
    scrollColumn: Column | null;
    /** For page up/down, we want to scroll to one row/column but focus another (ie. scrollRow could be stub). */
    focusIndex: number;
    focusColumn: Column;
    isAsync?: boolean;
}

@Bean('navigationService')
export class NavigationService extends BeanStub {

    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('ctrlsService') public ctrlsService: CtrlsService;
    @Autowired('rowRenderer') public rowRenderer: RowRenderer;
    @Autowired('headerNavigationService') public headerNavigationService: HeaderNavigationService;
    @Autowired("rowPositionUtils") private rowPositionUtils: RowPositionUtils;
    @Autowired("cellNavigationService") private cellNavigationService: CellNavigationService;
    @Autowired("pinnedRowModel") private pinnedRowModel: PinnedRowModel;
    
    @Optional('rangeService') private rangeService?: IRangeService;

    private gridBodyCon: GridBodyCtrl;

    constructor() {
        super();
        this.onPageDown = throttle(this.onPageDown, 100);
        this.onPageUp = throttle(this.onPageUp, 100);
    }

    @PostConstruct
    private postConstruct(): void {
        this.ctrlsService.whenReady(p => {
            this.gridBodyCon = p.gridBodyCtrl;
        });
    }

    public handlePageScrollingKey(event: KeyboardEvent, fromFullWidth = false): boolean {
        const key = event.key;
        const alt = event.altKey;
        const ctrl = event.ctrlKey || event.metaKey;
        const rangeServiceShouldHandleShift = !!this.rangeService && event.shiftKey;

        // home and end can be processed without knowing the currently selected cell, this can occur for full width rows.
        const currentCell: CellPosition | null = this.mouseEventService.getCellPositionForEvent(event);

        let processed = false;

        switch (key) {
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                // handle home and end when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onHomeOrEndKey(key);
                    processed = true;
                }
                break;
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
            case KeyCode.UP:
            case KeyCode.DOWN:
                if (!currentCell) { return false; }
                // handle when ctrl is pressed only, if shift is pressed
                // it will be handled by the rangeService
                if (ctrl && !alt && !rangeServiceShouldHandleShift) {
                    this.onCtrlUpDownLeftRight(key, currentCell);
                    processed = true;
                }
                break;
            case KeyCode.PAGE_DOWN:
            case KeyCode.PAGE_UP:
                // handle page up and page down when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    processed = this.handlePageUpDown(key, currentCell, fromFullWidth);
                }
                break;
        }

        if (processed) {
            event.preventDefault();
        }

        return processed;
    }

    private handlePageUpDown(
        key: string,
        currentCell: CellPosition | null,
        fromFullWidth: boolean
    ): boolean {
        if (fromFullWidth) {
            currentCell = this.focusService.getFocusedCell();
        }

        if (!currentCell) { return false; }

        if (key === KeyCode.PAGE_UP) {
            this.onPageUp(currentCell);
        } else {
            this.onPageDown(currentCell);
        }

        return true;
    }

    private navigateTo(navigateParams: NavigateParams): void {
        const { scrollIndex, scrollType, scrollColumn, focusIndex, focusColumn } = navigateParams;

        if (exists(scrollColumn) && !scrollColumn.isPinned()) {
            this.gridBodyCon.getScrollFeature().ensureColumnVisible(scrollColumn);
        }

        if (exists(scrollIndex)) {
            this.gridBodyCon.getScrollFeature().ensureIndexVisible(scrollIndex, scrollType);
        }

        // setFocusedCell relies on the browser default focus behavior to scroll the focused cell into view,
        // however, this behavior will cause the cell border to be cut off, or if we have sticky rows, the
        // cell will be completely hidden, so we call ensureIndexVisible without a position to guarantee
        // minimal scroll to get the row into view.
        if (!navigateParams.isAsync) {
            this.gridBodyCon.getScrollFeature().ensureIndexVisible(focusIndex);
        }

        // if we don't do this, the range will be left on the last cell, which will leave the last focused cell
        // highlighted.
        this.focusService.setFocusedCell({ rowIndex: focusIndex, column: focusColumn, rowPinned: null, forceBrowserFocus: true });

        this.rangeService?.setRangeToCell({ rowIndex: focusIndex, rowPinned: null, column: focusColumn });
    }

    // this method is throttled, see the `constructor`
    private onPageDown(gridCell: CellPosition): void {
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        const scrollPosition = gridBodyCon.getScrollFeature().getVScrollPosition();
        const pixelsInOnePage = this.getViewportHeight();

        const pagingPixelOffset = this.paginationProxy.getPixelOffset();

        const currentPageBottomPixel = scrollPosition.top + pixelsInOnePage;
        const currentPageBottomRow = this.paginationProxy.getRowIndexAtPixel(currentPageBottomPixel + pagingPixelOffset);

        if (this.columnModel.isAutoRowHeightActive()) {
            this.navigateToNextPageWithAutoHeight(gridCell, currentPageBottomRow);
        } else {
            this.navigateToNextPage(gridCell, currentPageBottomRow);
        }
    }

    // this method is throttled, see the `constructor`
    private onPageUp(gridCell: CellPosition): void {
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        const scrollPosition = gridBodyCon.getScrollFeature().getVScrollPosition();

        const pagingPixelOffset = this.paginationProxy.getPixelOffset();

        const currentPageTopPixel = scrollPosition.top;
        const currentPageTopRow = this.paginationProxy.getRowIndexAtPixel(currentPageTopPixel + pagingPixelOffset);

        if (this.columnModel.isAutoRowHeightActive()) {
            this.navigateToNextPageWithAutoHeight(gridCell, currentPageTopRow, true);
        } else {
            this.navigateToNextPage(gridCell, currentPageTopRow, true);
        }
    }

    private navigateToNextPage(gridCell: CellPosition, scrollIndex: number, up: boolean = false): void {
        const pixelsInOnePage = this.getViewportHeight();
        const firstRow = this.paginationProxy.getPageFirstRow();
        const lastRow = this.paginationProxy.getPageLastRow();
        const pagingPixelOffset = this.paginationProxy.getPixelOffset();
        const currentRowNode = this.paginationProxy.getRow(gridCell.rowIndex);

        const rowPixelDiff = up
            ? (currentRowNode?.rowHeight! - pixelsInOnePage - pagingPixelOffset)
            : (pixelsInOnePage - pagingPixelOffset);

        const nextCellPixel = currentRowNode?.rowTop! + rowPixelDiff;

        let focusIndex = this.paginationProxy.getRowIndexAtPixel(nextCellPixel + pagingPixelOffset);

        if (focusIndex === gridCell.rowIndex) {
            const diff = up ? -1 : 1;
            scrollIndex = focusIndex = gridCell.rowIndex + diff;
        }

        let scrollType: 'top' | 'bottom';

        if (up) {
            scrollType = 'bottom';
            if (focusIndex < firstRow) { focusIndex = firstRow; }
            if (scrollIndex < firstRow) { scrollIndex = firstRow; }
        } else {
            scrollType = 'top';
            if (focusIndex > lastRow) { focusIndex = lastRow; }
            if (scrollIndex > lastRow) { scrollIndex = lastRow; }
        }

        if (this.isRowTallerThanView(focusIndex)) {
            scrollIndex = focusIndex;
            scrollType = 'top';
        }

        this.navigateTo({
            scrollIndex,
            scrollType,
            scrollColumn: null,
            focusIndex,
            focusColumn: gridCell.column
        });
    }

    private navigateToNextPageWithAutoHeight(gridCell: CellPosition, scrollIndex: number, up: boolean = false): void {
        // because autoHeight will calculate the height of rows after scroll
        // first we scroll towards the required point, then we add a small
        // delay to allow the height to be recalculated, check which index
        // should be focused and then finally navigate to that index.
        // TODO: we should probably have an event fired once to scrollbar has
        // settled and all rowHeights have been calculated instead of relying
        // on a setTimeout of 50ms.
        this.navigateTo({
            scrollIndex: scrollIndex,
            scrollType: up ? 'bottom' : 'top',
            scrollColumn: null,
            focusIndex: scrollIndex,
            focusColumn: gridCell.column
        });
        setTimeout(() => {
            const focusIndex = this.getNextFocusIndexForAutoHeight(gridCell, up);

            this.navigateTo({
                scrollIndex: scrollIndex,
                scrollType: up ? 'bottom' : 'top',
                scrollColumn: null,
                focusIndex: focusIndex,
                focusColumn: gridCell.column,
                isAsync: true
            });
        }, 50);
    }

    private getNextFocusIndexForAutoHeight(gridCell: CellPosition, up: boolean = false): number {
        const step = up ? -1 : 1;
        const pixelsInOnePage = this.getViewportHeight();
        const lastRowIndex = this.paginationProxy.getPageLastRow();

        let pixelSum = 0;
        let currentIndex = gridCell.rowIndex;

        while (currentIndex >= 0 && currentIndex <= lastRowIndex) {
            const currentCell = this.paginationProxy.getRow(currentIndex);

            if (currentCell) {
                const currentCellHeight = currentCell.rowHeight ?? 0;

                if (pixelSum + currentCellHeight > pixelsInOnePage) { break; }
                pixelSum += currentCellHeight;
            }

            currentIndex += step;
        }

        return Math.max(0, Math.min(currentIndex, lastRowIndex));
    }

    private getViewportHeight(): number {
        const {gridBodyCtrl, center } = this.ctrlsService.getParams();
        const scrollPosition = gridBodyCtrl.getScrollFeature().getVScrollPosition();
        const scrollbarWidth = this.gos.getScrollbarWidth();
        let pixelsInOnePage = scrollPosition.bottom - scrollPosition.top;

        if (center.isHorizontalScrollShowing()) {
            pixelsInOnePage -= scrollbarWidth;
        }

        return pixelsInOnePage;
    }

    private isRowTallerThanView(rowIndex: number): boolean {
        const rowNode = this.paginationProxy.getRow(rowIndex);
        if (!rowNode) { return false; }

        const rowHeight = rowNode.rowHeight;

        if (typeof rowHeight !== 'number') { return false; }

        return rowHeight > this.getViewportHeight();
    }

    private onCtrlUpDownLeftRight(key: string, gridCell: CellPosition): void {
        const cellToFocus = this.cellNavigationService.getNextCellToFocus(key, gridCell, true)!;
        const { rowIndex, column } = cellToFocus;

        this.navigateTo({
            scrollIndex: rowIndex,
            scrollType: null,
            scrollColumn: column,
            focusIndex: rowIndex,
            focusColumn: column
        });
    }

    // home brings focus to top left cell, end brings focus to bottom right, grid scrolled to bring
    // same cell into view (which means either scroll all the way up, or all the way down).
    private onHomeOrEndKey(key: string): void {
        const homeKey = key === KeyCode.PAGE_HOME;
        const allColumns: Column[] = this.columnModel.getAllDisplayedColumns();
        const columnToSelect = homeKey ? allColumns[0] : last(allColumns);
        const scrollIndex = homeKey ? this.paginationProxy.getPageFirstRow() : this.paginationProxy.getPageLastRow();

        this.navigateTo({
            scrollIndex: scrollIndex,
            scrollType: null,
            scrollColumn: columnToSelect,
            focusIndex: scrollIndex,
            focusColumn: columnToSelect
        });
    }

    // result of keyboard event
    public onTabKeyDown(previous: CellCtrl | RowCtrl, keyboardEvent: KeyboardEvent): void {
        const backwards = keyboardEvent.shiftKey;
        const movedToNextCell = this.tabToNextCellCommon(previous, backwards, keyboardEvent);

        if (movedToNextCell) {
            // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
            // to the normal tabbing so user can exit the grid.
            keyboardEvent.preventDefault();
            return;
        }

        // if we didn't move to next cell, then need to tab out of the cells, ie to the header (if going
        // backwards)
        if (backwards) {
            const { rowIndex, rowPinned } = previous.getRowPosition();
            const firstRow = rowPinned ? rowIndex === 0 : rowIndex === this.paginationProxy.getPageFirstRow();
            if (firstRow) {
                if (this.gos.get('headerHeight') === 0 || this.gos.get('suppressHeaderFocus')) {
                    this.focusService.focusNextGridCoreContainer(true, true);
                } else {
                    keyboardEvent.preventDefault();
                    this.focusService.focusPreviousFromFirstCell(keyboardEvent);
                }
                
            }
        } else {
            // if the case it's a popup editor, the focus is on the editor and not the previous cell.
            // in order for the tab navigation to work, we need to focus the browser back onto the
            // previous cell.
            if (previous instanceof CellCtrl) {
                previous.focusCell(true);
            }

            if (this.focusService.focusNextGridCoreContainer(backwards)) {
                keyboardEvent.preventDefault();
            }
        }
    }

    // comes from API
    public tabToNextCell(backwards: boolean, event?: KeyboardEvent): boolean {
        const focusedCell = this.focusService.getFocusedCell();
        // if no focus, then cannot navigate
        if (!focusedCell) { return false; }

        let cellOrRow: CellCtrl | RowCtrl | null = this.getCellByPosition(focusedCell);

        // if cell is not rendered, means user has scrolled away from the cell
        // or that the focusedCell is a Full Width Row
        if (!cellOrRow) {
            cellOrRow = this.rowRenderer.getRowByPosition(focusedCell);
            if (!cellOrRow || !cellOrRow.isFullWidth()) {
                return false;
            }
        }

        return this.tabToNextCellCommon(cellOrRow, backwards, event);
    }

    private tabToNextCellCommon(previous: CellCtrl | RowCtrl, backwards: boolean, event?: KeyboardEvent): boolean {
        let editing = previous.isEditing();

        // if cell is not editing, there is still chance row is editing if it's Full Row Editing
        if (!editing && previous instanceof CellCtrl) {
            const cell = previous as CellCtrl;
            const row = cell.getRowCtrl();
            if (row) {
                editing = row.isEditing();
            }
        }

        let res: boolean;

        if (editing) {
            // if we are editing, we know it's not a Full Width Row (RowComp)
            if (this.gos.get('editType') === 'fullRow') {
                res = this.moveToNextEditingRow(previous as CellCtrl, backwards, event);
            } else {
                res = this.moveToNextEditingCell(previous as CellCtrl, backwards, event);
            }
        } else {
            res = this.moveToNextCellNotEditing(previous, backwards);
        }

        // if a cell wasn't found, it's possible that focus was moved to the header
        return res || !!this.focusService.getFocusedHeader();
    }

    private moveToNextEditingCell(previousCell: CellCtrl, backwards: boolean, event: KeyboardEvent | null = null): boolean {
        const previousPos = previousCell.getCellPosition();

        // before we stop editing, we need to focus the cell element
        // so the grid doesn't detect that focus has left the grid
        previousCell.getGui().focus();

        // need to do this before getting next cell to edit, in case the next cell
        // has editable function (eg colDef.editable=func() ) and it depends on the
        // result of this cell, so need to save updates from the first edit, in case
        // the value is referenced in the function.
        previousCell.stopEditing();

        // find the next cell to start editing
        const nextCell = this.findNextCellToFocusOn(previousPos, backwards, true) as CellCtrl;

        if (nextCell == null) { return false; }

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        nextCell.startEditing(null, true, event);
        nextCell.focusCell(false);
        return true;
    }

    private moveToNextEditingRow(previousCell: CellCtrl, backwards: boolean, event: KeyboardEvent | null = null): boolean {
        const previousPos = previousCell.getCellPosition();

        // find the next cell to start editing
        const nextCell = this.findNextCellToFocusOn(previousPos, backwards, true) as CellCtrl;
        if (nextCell == null) { return false; }

        const nextPos = nextCell.getCellPosition();

        const previousEditable = this.isCellEditable(previousPos);
        const nextEditable = this.isCellEditable(nextPos);

        const rowsMatch = nextPos && previousPos.rowIndex === nextPos.rowIndex && previousPos.rowPinned === nextPos.rowPinned;

        if (previousEditable) {
            previousCell.setFocusOutOnEditor();
        }

        if (!rowsMatch) {
            const pRow = previousCell.getRowCtrl();
            pRow!.stopEditing();

            const nRow = nextCell.getRowCtrl();
            nRow!.startRowEditing(undefined, undefined, event);
        }

        if (nextEditable) {
            nextCell.setFocusInOnEditor();
            nextCell.focusCell();
        } else {
            nextCell.focusCell(true);
        }

        return true;
    }

    private moveToNextCellNotEditing(previousCell: CellCtrl | RowCtrl, backwards: boolean): boolean {
        const displayedColumns = this.columnModel.getAllDisplayedColumns();
        let cellPos: CellPosition;

        if (previousCell instanceof RowCtrl) {
            cellPos = {
                ...previousCell.getRowPosition(),
                column: backwards ? displayedColumns[0] : last(displayedColumns)
            };
        } else {
            cellPos = previousCell.getCellPosition();
        }
        // find the next cell to start editing
        const nextCell = this.findNextCellToFocusOn(cellPos, backwards, false);

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (nextCell instanceof CellCtrl) {
            nextCell.focusCell(true);
        } else if (nextCell) {
            return this.tryToFocusFullWidthRow(nextCell.getRowPosition(), backwards);
        }

        return exists(nextCell);
    }

    // called by the cell, when tab is pressed while editing.
    // @return: RenderedCell when navigation successful, otherwise null
    private findNextCellToFocusOn(previousPosition: CellPosition, backwards: boolean, startEditing: boolean): CellCtrl | RowCtrl | null {
        let nextPosition: CellPosition | null = previousPosition;

        while (true) {
            if (previousPosition !== nextPosition) { previousPosition = nextPosition; }

            if (!backwards) {
                nextPosition = this.getLastCellOfColSpan(nextPosition);
            }
            nextPosition = this.cellNavigationService.getNextTabbedCell(nextPosition, backwards);

            // allow user to override what cell to go to next
            const userFunc = this.gos.getCallback('tabToNextCell');

            if (exists(userFunc)) {
                const params: WithoutGridCommon<TabToNextCellParams> = {
                    backwards: backwards,
                    editing: startEditing,
                    previousCellPosition: previousPosition,
                    nextCellPosition: nextPosition ? nextPosition : null
                };
                const userCell = userFunc(params);
                if (exists(userCell)) {
                    if ((userCell as any).floating) {
                        warnOnce(`tabToNextCellFunc return type should have attributes: rowIndex, rowPinned, column. However you had 'floating', maybe you meant 'rowPinned'?`);
                        userCell.rowPinned = (userCell as any).floating;
                    }
                    nextPosition = {
                        rowIndex: userCell.rowIndex,
                        column: userCell.column,
                        rowPinned: userCell.rowPinned
                    } as CellPosition;
                } else {
                    nextPosition = null;
                }
            }

            // if no 'next cell', means we have got to last cell of grid, so nothing to move to,
            // so bottom right cell going forwards, or top left going backwards
            if (!nextPosition) { return null; }

            if (nextPosition.rowIndex < 0) {
                const headerLen = this.headerNavigationService.getHeaderRowCount();

                this.focusService.focusHeaderPosition({
                    headerPosition: {
                        headerRowIndex: headerLen + (nextPosition.rowIndex),
                        column: nextPosition.column
                    },
                    fromCell: true
                });

                return null;
            }

            // if editing, but cell not editable, skip cell. we do this before we do all of
            // the 'ensure index visible' and 'flush all frames', otherwise if we are skipping
            // a bunch of cells (eg 10 rows) then all the work on ensuring cell visible is useless
            // (except for the last one) which causes grid to stall for a while.
            // note - for full row edit, we do focus non-editable cells, as the row stays in edit mode.
            const fullRowEdit = this.gos.get('editType') === 'fullRow';
            if (startEditing && !fullRowEdit) {
                const cellIsEditable = this.isCellEditable(nextPosition);
                if (!cellIsEditable) { continue; }
            }

            this.ensureCellVisible(nextPosition);

            // we have to call this after ensureColumnVisible - otherwise it could be a virtual column
            // or row that is not currently in view, hence the renderedCell would not exist
            const nextCell = this.getCellByPosition(nextPosition);

            // if next cell is fullWidth row, then no rendered cell,
            // as fullWidth rows have no cells, so we skip it
            if (!nextCell) {
                const row = this.rowRenderer.getRowByPosition(nextPosition);
                if (!row || !row.isFullWidth() || startEditing) {
                    continue;
                }
                return row;
            }

            if (nextCell.isSuppressNavigable()) { continue; }

            // by default, when we click a cell, it gets selected into a range, so to keep keyboard navigation
            // consistent, we set into range here also.
            this.rangeService?.setRangeToCell(nextPosition);

            // we successfully tabbed onto a grid cell, so return true
            return nextCell;
        }
    }

    private isCellEditable(cell: CellPosition): boolean {
        const rowNode = this.lookupRowNodeForCell(cell);

        if (rowNode) {
            return cell.column.isCellEditable(rowNode);
        }

        return false;
    }

    public getCellByPosition(cellPosition: CellPosition): CellCtrl | null {
        const rowCtrl = this.rowRenderer.getRowByPosition(cellPosition);
        if (!rowCtrl) { return null; }

        return rowCtrl.getCellCtrl(cellPosition.column);
    }

    private lookupRowNodeForCell(cell: CellPosition) {
        if (cell.rowPinned === 'top') {
            return this.pinnedRowModel.getPinnedTopRow(cell.rowIndex);
        }

        if (cell.rowPinned === 'bottom') {
            return this.pinnedRowModel.getPinnedBottomRow(cell.rowIndex);
        }

        return this.paginationProxy.getRow(cell.rowIndex);
    }

    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    public navigateToNextCell(event: KeyboardEvent | null, key: string, currentCell: CellPosition, allowUserOverride: boolean) {
        // we keep searching for a next cell until we find one. this is how the group rows get skipped
        let nextCell: CellPosition | null = currentCell;
        let hitEdgeOfGrid = false;

        while (nextCell && (nextCell === currentCell || !this.isValidNavigateCell(nextCell))) {
            // if the current cell is spanning across multiple columns, we need to move
            // our current position to be the last cell on the right before finding the
            // the next target.
            if (this.gos.get('enableRtl')) {
                if (key === KeyCode.LEFT) {
                    nextCell = this.getLastCellOfColSpan(nextCell);
                }
            } else if (key === KeyCode.RIGHT) {
                nextCell = this.getLastCellOfColSpan(nextCell);
            }

            nextCell = this.cellNavigationService.getNextCellToFocus(key, nextCell);

            // eg if going down, and nextCell=undefined, means we are gone past the last row
            hitEdgeOfGrid = missing(nextCell);
        }

        if (hitEdgeOfGrid && event && event.key === KeyCode.UP) {
            nextCell = {
                rowIndex: -1,
                rowPinned: null,
                column: currentCell.column
            };
        }

        // allow user to override what cell to go to next. when doing normal cell navigation (with keys)
        // we allow this, however if processing 'enter after edit' we don't allow override
        if (allowUserOverride) {
            const userFunc = this.gos.getCallback('navigateToNextCell');
            if (exists(userFunc)) {
                const params: WithoutGridCommon<NavigateToNextCellParams> = {
                    key: key,
                    previousCellPosition: currentCell,
                    nextCellPosition: nextCell ? nextCell : null,
                    event: event
                };
                const userCell = userFunc(params);
                if (exists(userCell)) {
                    if ((userCell as any).floating) {
                        warnOnce(`tabToNextCellFunc return type should have attributes: rowIndex, rowPinned, column. However you had 'floating', maybe you meant 'rowPinned'?`);
                        userCell.rowPinned = (userCell as any).floating;
                    }
                    nextCell = {
                        rowPinned: userCell.rowPinned,
                        rowIndex: userCell.rowIndex,
                        column: userCell.column
                    } as CellPosition;
                } else {
                    nextCell = null;
                }
            }
        }

        // no next cell means we have reached a grid boundary, eg left, right, top or bottom of grid
        if (!nextCell) { return; }

        if (nextCell.rowIndex < 0) {
            const headerLen = this.headerNavigationService.getHeaderRowCount();

            this.focusService.focusHeaderPosition({
                headerPosition: { headerRowIndex: headerLen + (nextCell.rowIndex), column: currentCell.column },
                event: event || undefined,
                fromCell: true
            });

            return;
        }

        // in case we have col spanning we get the cellComp and use it to get the
        // position. This was we always focus the first cell inside the spanning.
        const normalisedPosition = this.getNormalisedPosition(nextCell);
        if (normalisedPosition) {
            this.focusPosition(normalisedPosition);
        } else {
            this.tryToFocusFullWidthRow(nextCell);
        }
    }

    private getNormalisedPosition(cellPosition: CellPosition): CellPosition | null {
        // ensureCellVisible first, to make sure cell at position is rendered.
        this.ensureCellVisible(cellPosition);

        const cellCtrl = this.getCellByPosition(cellPosition);

        // not guaranteed to have a cellComp when using the SSRM as blocks are loading.
        if (!cellCtrl) { return null; }

        cellPosition = cellCtrl.getCellPosition();
        // we call this again, as nextCell can be different to it's previous value due to Column Spanning
        // (ie if cursor moving from right to left, and cell is spanning columns, then nextCell was the
        // last column in the group, however now it's the first column in the group). if we didn't do
        // ensureCellVisible again, then we could only be showing the last portion (last column) of the
        // merged cells.
        this.ensureCellVisible(cellPosition);

        return cellPosition;
    }

    private tryToFocusFullWidthRow(position: CellPosition | RowPosition, backwards: boolean = false): boolean {
        const displayedColumns = this.columnModel.getAllDisplayedColumns();
        const rowComp = this.rowRenderer.getRowByPosition(position);
        if (!rowComp || !rowComp.isFullWidth()) { return false; }

        const currentCellFocused = this.focusService.getFocusedCell();

        const cellPosition: CellPosition = {
            rowIndex: position.rowIndex,
            rowPinned: position.rowPinned,
            column: (position as CellPosition).column || (backwards ? last(displayedColumns) : displayedColumns[0])
        };

        this.focusPosition(cellPosition);

        const fromBelow = currentCellFocused != null ? this.rowPositionUtils.before(cellPosition, currentCellFocused) : false;

        const focusEvent: WithoutGridCommon<FullWidthRowFocusedEvent> = {
            type: Events.EVENT_FULL_WIDTH_ROW_FOCUSED,
            rowIndex: cellPosition.rowIndex,
            rowPinned: cellPosition.rowPinned,
            column: cellPosition.column,
            isFullWidthCell: true,
            floating: cellPosition.rowPinned,
            fromBelow
        };

        this.eventService.dispatchEvent(focusEvent);

        return true;
    }

    private focusPosition(cellPosition: CellPosition) {
        this.focusService.setFocusedCell({
            rowIndex: cellPosition.rowIndex,
            column: cellPosition.column,
            rowPinned: cellPosition.rowPinned,
            forceBrowserFocus: true
        });

        this.rangeService?.setRangeToCell(cellPosition);
    }

    private isValidNavigateCell(cell: CellPosition): boolean {
        const rowNode = this.rowPositionUtils.getRowNode(cell);

        // we do not allow focusing on detail rows and full width rows
        return !!rowNode;
    }

    private getLastCellOfColSpan(cell: CellPosition): CellPosition {
        const cellCtrl = this.getCellByPosition(cell);

        if (!cellCtrl) { return cell; }

        const colSpanningList = cellCtrl.getColSpanningList();

        if (colSpanningList.length === 1) { return cell; }

        return {
            rowIndex: cell.rowIndex,
            column: last(colSpanningList),
            rowPinned: cell.rowPinned
        };
    }

    public ensureCellVisible(gridCell: CellPosition): void {
        const isGroupStickyEnabled = this.gos.isGroupRowsSticky();

        const rowNode = this.rowModel.getRow(gridCell.rowIndex);
        // sticky rows are always visible, so the grid shouldn't scroll to focus them.
        const skipScrollToRow = isGroupStickyEnabled && rowNode?.sticky;

        // this scrolls the row into view
        if (!skipScrollToRow && missing(gridCell.rowPinned)) {
            this.gridBodyCon.getScrollFeature().ensureIndexVisible(gridCell.rowIndex);
        }

        if (!gridCell.column.isPinned()) {
            this.gridBodyCon.getScrollFeature().ensureColumnVisible(gridCell.column);
        }
    }
}
