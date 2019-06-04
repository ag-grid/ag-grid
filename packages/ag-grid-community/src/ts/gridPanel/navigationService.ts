import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { CellPosition } from "../entities/cellPosition";
import { Constants } from "../constants";
import { MouseEventService } from "./mouseEventService";
import { PaginationProxy } from "../rowModels/paginationProxy";
import { Column } from "../entities/column";
import { FocusedCellController } from "../focusedCellController";
import { GridPanel } from "./gridPanel";
import { AnimationFrameService } from "../misc/animationFrameService";
import { IRangeController } from "../interfaces/iRangeController";
import { ColumnController } from "../columnController/columnController";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { _ } from "../utils";

@Bean('navigationService')
export class NavigationService {

    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private scrollWidth: number;
    private gridPanel: GridPanel;

    private timeLastPageEventProcessed = 0;

    @PostConstruct
    private init(): void {
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    public handlePageScrollingKey(event: KeyboardEvent): boolean {

        const key = event.which || event.keyCode;
        const alt = event.altKey;
        const ctrl = event.ctrlKey;

        const currentCell: CellPosition = this.mouseEventService.getCellPositionForEvent(event);
        if (!currentCell) { return false; }

        let processed = false;

        switch (key) {
            case Constants.KEY_PAGE_HOME :
            case Constants.KEY_PAGE_END :
                // handle home and end when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onHomeOrEndKey(key);
                    processed = true;
                }
                break;
            case Constants.KEY_LEFT :
            case Constants.KEY_RIGHT :
                // handle left and right when ctrl is pressed only
                if (ctrl && !alt) {
                    this.onCtrlLeftOrRight(key, currentCell);
                    processed = true;
                }
                break;
            case Constants.KEY_UP :
            case Constants.KEY_DOWN :
                // handle up and down when ctrl is pressed only
                if (ctrl && !alt) {
                    this.onCtrlUpOrDown(key, currentCell);
                    processed = true;
                }
                break;
            case Constants.KEY_PAGE_DOWN :
                // handle page up and page down when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onPageDown(currentCell);
                    processed = true;
                }
                break;
            case Constants.KEY_PAGE_UP :
                // handle page up and page down when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onPageUp(currentCell);
                    processed = true;
                }
                break;
        }

        if (processed) {
            event.preventDefault();
        }

        return processed;
    }

    // the page up/down keys caused a problem, in that if the user
    // held the page up/down key down, lots of events got generated,
    // which clogged up the event queue (as they take time to process)
    // which in turn froze the grid. Logic below makes sure we wait 100ms
    // between processing the page up/down events, so when user has finger
    // held down on key, we ignore page up/down events until 100ms has passed,
    // which effectively empties the queue of page up/down events.
    private isTimeSinceLastPageEventToRecent(): boolean {
        const now = new Date().getTime();
        const diff = now - this.timeLastPageEventProcessed;
        return (diff < 100);
    }

    private setTimeLastPageEventProcessed(): void {
        this.timeLastPageEventProcessed = new Date().getTime();
    }

    private onPageDown(gridCell: CellPosition): void {

        if (this.isTimeSinceLastPageEventToRecent()) { return; }

        const scrollPosition = this.gridPanel.getVScrollPosition();
        let pixelsInOnePage = scrollPosition.bottom - scrollPosition.top;

        if (this.gridPanel.isHorizontalScrollShowing()) {
            pixelsInOnePage -= this.scrollWidth;
        }

        const pagingPixelOffset = this.paginationProxy.getPixelOffset();

        const currentPageBottomPixel = scrollPosition.top + pixelsInOnePage;
        const currentPageBottomRow = this.paginationProxy.getRowIndexAtPixel(currentPageBottomPixel + pagingPixelOffset);
        let scrollIndex = currentPageBottomRow;

        const currentCellPixel = this.paginationProxy.getRow(gridCell.rowIndex).rowTop;
        const nextCellPixel = currentCellPixel + pixelsInOnePage - pagingPixelOffset;
        let focusIndex = this.paginationProxy.getRowIndexAtPixel(nextCellPixel + pagingPixelOffset);

        const pageLastRow = this.paginationProxy.getPageLastRow();

        if (focusIndex > pageLastRow) { focusIndex = pageLastRow; }
        if (scrollIndex > pageLastRow) { scrollIndex = pageLastRow; }

        this.navigateTo(scrollIndex, 'top', null, focusIndex, gridCell.column);

        this.setTimeLastPageEventProcessed();
    }

    private onPageUp(gridCell: CellPosition): void {

        if (this.isTimeSinceLastPageEventToRecent()) { return; }

        const scrollPosition = this.gridPanel.getVScrollPosition();
        let pixelsInOnePage = scrollPosition.bottom - scrollPosition.top;

        if (this.gridPanel.isHorizontalScrollShowing()) {
            pixelsInOnePage -= this.scrollWidth;
        }

        const pagingPixelOffset = this.paginationProxy.getPixelOffset();

        const currentPageTopPixel = scrollPosition.top;
        const currentPageTopRow = this.paginationProxy.getRowIndexAtPixel(currentPageTopPixel + pagingPixelOffset);
        let scrollIndex = currentPageTopRow;

        const currentRowNode = this.paginationProxy.getRow(gridCell.rowIndex);
        const nextCellPixel = currentRowNode.rowTop + currentRowNode.rowHeight - pixelsInOnePage - pagingPixelOffset;
        let focusIndex = this.paginationProxy.getRowIndexAtPixel(nextCellPixel + pagingPixelOffset);

        const firstRow = this.paginationProxy.getPageFirstRow();

        if (focusIndex < firstRow) { focusIndex = firstRow; }
        if (scrollIndex < firstRow) { scrollIndex = firstRow; }

        this.navigateTo(scrollIndex, 'bottom', null, focusIndex, gridCell.column);

        this.setTimeLastPageEventProcessed();
    }

    // common logic to navigate. takes parameters:
    // scrollIndex - what row to vertically scroll to
    // scrollType - what position to put scroll index ie top/bottom
    // scrollColumn - what column to horizontally scroll to
    // focusIndex / focusColumn - for page up / down, we want to scroll to one row/column, but focus another
    private navigateTo(scrollIndex: number, scrollType: string, scrollColumn: Column, focusIndex: number, focusColumn: Column): void {
        if (_.exists(scrollColumn)) {
            this.gridPanel.ensureColumnVisible(scrollColumn);
        }

        if (_.exists(scrollIndex)) {
            this.gridPanel.ensureIndexVisible(scrollIndex, scrollType);
        }

        // make sure the cell is rendered, needed if we are to focus
        this.animationFrameService.flushAllFrames();

        // if we don't do this, the range will be left on the last cell, which will leave the last focused cell
        // highlighted.
        this.focusedCellController.setFocusedCell(focusIndex, focusColumn, null, true);
        if (this.rangeController) {
            const cellPosition: CellPosition = {rowIndex: focusIndex, rowPinned: null, column: focusColumn};
            this.rangeController.setRangeToCell(cellPosition);
        }
    }

    // ctrl + up/down will bring focus to same column, first/last row. no horizontal scrolling.
    private onCtrlUpOrDown(key: number, gridCell: CellPosition): void {

        const upKey = key === Constants.KEY_UP;
        const rowIndexToScrollTo = upKey ? 0 : this.paginationProxy.getPageLastRow();

        this.navigateTo(rowIndexToScrollTo, null, gridCell.column, rowIndexToScrollTo, gridCell.column);
    }

    // ctrl + left/right will bring focus to same row, first/last cell. no vertical scrolling.
    private onCtrlLeftOrRight(key: number, gridCell: CellPosition): void {

        const leftKey = key === Constants.KEY_LEFT;

        const allColumns: Column[] = this.columnController.getAllDisplayedColumns();
        const columnToSelect: Column = leftKey ? allColumns[0] : _.last(allColumns);

        this.navigateTo(gridCell.rowIndex, null, columnToSelect, gridCell.rowIndex, columnToSelect);
    }

    // home brings focus to top left cell, end brings focus to bottom right, grid scrolled to bring
    // same cell into view (which means either scroll all the way up, or all the way down).
    private onHomeOrEndKey(key: number): void {

        const homeKey = key === Constants.KEY_PAGE_HOME;

        const allColumns: Column[] = this.columnController.getAllDisplayedColumns();
        const columnToSelect = homeKey ? allColumns[0] : _.last(allColumns);
        const rowIndexToScrollTo = homeKey ? 0 : this.paginationProxy.getPageLastRow();

        this.navigateTo(rowIndexToScrollTo, null, columnToSelect, rowIndexToScrollTo, columnToSelect);
    }
}
