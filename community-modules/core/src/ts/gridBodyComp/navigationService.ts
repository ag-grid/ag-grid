import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { CellPosition } from "../entities/cellPosition";
import { MouseEventService } from "./mouseEventService";
import { PaginationProxy } from "../pagination/paginationProxy";
import { Column } from "../entities/column";
import { FocusService } from "../focusService";
import { AnimationFrameService } from "../misc/animationFrameService";
import { IRangeService } from "../interfaces/IRangeService";
import { ColumnModel } from "../columns/columnModel";
import { BeanStub } from "../context/beanStub";
import { exists } from "../utils/generic";
import { last } from "../utils/array";
import { KeyCode } from '../constants/keyCode';
import { ControllersService } from "../controllersService";
import { GridBodyCtrl } from "./gridBodyCtrl";

interface NavigateParams {
     // The rowIndex to vertically scroll to
    scrollIndex: number;
     // The position to put scroll index
    scrollType: 'top' | 'bottom' | null;
    //  The column to horizontally scroll to
    scrollColumn: Column | null;
    // For page up/down, we want to scroll to one row/column but focus another (ie. scrollRow could be stub).
    focusIndex: number;
    focusColumn: Column;
}

@Bean('navigationService')
export class NavigationService extends BeanStub {

    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Optional('rangeService') private rangeService: IRangeService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('controllersService') public controllersService: ControllersService;

    private gridBodyCon: GridBodyCtrl;

    private timeLastPageEventProcessed = 0;

    @PostConstruct
    private postConstruct(): void {
        this.controllersService.whenReady(p => {
            this.gridBodyCon = p.gridBodyCon;
        });
    }

    public handlePageScrollingKey(event: KeyboardEvent): boolean {
        const key = event.which || event.keyCode;
        const alt = event.altKey;
        const ctrl = event.ctrlKey || event.metaKey;

        const currentCell: CellPosition | null = this.mouseEventService.getCellPositionForEvent(event);
        if (!currentCell) { return false; }

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
                // handle left and right when ctrl is pressed only
                if (ctrl && !alt) {
                    this.onCtrlLeftOrRight(key, currentCell);
                    processed = true;
                }
                break;
            case KeyCode.UP:
            case KeyCode.DOWN:
                // handle up and down when ctrl is pressed only
                if (ctrl && !alt) {
                    this.onCtrlUpOrDown(key, currentCell);
                    processed = true;
                }
                break;
            case KeyCode.PAGE_DOWN:
                // handle page up and page down when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onPageDown(currentCell);
                    processed = true;
                }
                break;
            case KeyCode.PAGE_UP:
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

    private navigateTo(navigateParams: NavigateParams): void {
        const { scrollIndex, scrollType, scrollColumn, focusIndex, focusColumn } = navigateParams;

        if (exists(scrollColumn)) {
            this.gridBodyCon.getScrollFeature().ensureColumnVisible(scrollColumn);
        }

        if (exists(scrollIndex)) {
            this.gridBodyCon.getScrollFeature().ensureIndexVisible(scrollIndex, scrollType);
        }

        // make sure the cell is rendered, needed if we are to focus
        this.animationFrameService.flushAllFrames();

        // if we don't do this, the range will be left on the last cell, which will leave the last focused cell
        // highlighted.
        this.focusService.setFocusedCell(focusIndex, focusColumn, null, true);

        if (this.rangeService) {
            const cellPosition: CellPosition = { rowIndex: focusIndex, rowPinned: null, column: focusColumn };
            this.rangeService.setRangeToCell(cellPosition);
        }
    }

    private onPageDown(gridCell: CellPosition): void {
        if (this.isTimeSinceLastPageEventToRecent()) { return; }

        const gridBodyCon = this.controllersService.getGridBodyController();
        const scrollPosition = gridBodyCon.getScrollFeature().getVScrollPosition();
        const scrollbarWidth = this.gridOptionsWrapper.getScrollbarWidth();
        let pixelsInOnePage = scrollPosition.bottom - scrollPosition.top;

        if (this.controllersService.getCenterRowContainerCon().isHorizontalScrollShowing()) {
            pixelsInOnePage -= scrollbarWidth;
        }

        const pagingPixelOffset = this.paginationProxy.getPixelOffset();

        const currentPageBottomPixel = scrollPosition.top + pixelsInOnePage;
        const currentPageBottomRow = this.paginationProxy.getRowIndexAtPixel(currentPageBottomPixel + pagingPixelOffset);
        let scrollIndex = currentPageBottomRow;

        const currentCellPixel = this.paginationProxy.getRow(gridCell.rowIndex)!.rowTop;
        const nextCellPixel = currentCellPixel! + pixelsInOnePage - pagingPixelOffset;
        let focusIndex = this.paginationProxy.getRowIndexAtPixel(nextCellPixel + pagingPixelOffset);

        const pageLastRow = this.paginationProxy.getPageLastRow();

        if (focusIndex > pageLastRow) { focusIndex = pageLastRow; }
        if (scrollIndex > pageLastRow) { scrollIndex = pageLastRow; }

        this.navigateTo({
            scrollIndex,
            scrollType: 'top',
            scrollColumn: null,
            focusIndex,
            focusColumn: gridCell.column
        });

        this.setTimeLastPageEventProcessed();
    }

    private onPageUp(gridCell: CellPosition): void {
        if (this.isTimeSinceLastPageEventToRecent()) { return; }

        const gridBodyCon = this.controllersService.getGridBodyController();
        const scrollPosition = gridBodyCon.getScrollFeature().getVScrollPosition();
        const scrollbarWidth = this.gridOptionsWrapper.getScrollbarWidth();
        let pixelsInOnePage = scrollPosition.bottom - scrollPosition.top;

        if (this.controllersService.getCenterRowContainerCon().isHorizontalScrollShowing()) {
            pixelsInOnePage -= scrollbarWidth;
        }

        const pagingPixelOffset = this.paginationProxy.getPixelOffset();

        const currentPageTopPixel = scrollPosition.top;
        const currentPageTopRow = this.paginationProxy.getRowIndexAtPixel(currentPageTopPixel + pagingPixelOffset);
        let scrollIndex = currentPageTopRow;

        const currentRowNode = this.paginationProxy.getRow(gridCell.rowIndex)!;
        const nextCellPixel = currentRowNode.rowTop! + currentRowNode.rowHeight! - pixelsInOnePage - pagingPixelOffset;
        let focusIndex = this.paginationProxy.getRowIndexAtPixel(nextCellPixel + pagingPixelOffset);

        const firstRow = this.paginationProxy.getPageFirstRow();

        if (focusIndex < firstRow) { focusIndex = firstRow; }
        if (scrollIndex < firstRow) { scrollIndex = firstRow; }

        this.navigateTo({
            scrollIndex,
            scrollType: 'bottom',
            scrollColumn: null,
            focusIndex,
            focusColumn: gridCell.column
        });

        this.setTimeLastPageEventProcessed();
    }

    private getIndexToFocus(indexToScrollTo: number, isDown: boolean) {
        let indexToFocus = indexToScrollTo;

        // for SSRM, when user hits ctrl+down, we can end up trying to focus the loading row.
        // instead we focus the last row with data instead.
        if (isDown) {
            const node = this.paginationProxy.getRow(indexToScrollTo);
            if (node && node.stub) {
                indexToFocus -= 1;
            }
        }

        return indexToFocus;
    }

    // ctrl + up/down will bring focus to same column, first/last row. no horizontal scrolling.
    private onCtrlUpOrDown(key: number, gridCell: CellPosition): void {
        const upKey = key === KeyCode.UP;
        const rowIndexToScrollTo = upKey ? this.paginationProxy.getPageFirstRow() : this.paginationProxy.getPageLastRow();

        this.navigateTo({
            scrollIndex: rowIndexToScrollTo,
            scrollType: null,
            scrollColumn: gridCell.column,
            focusIndex: this.getIndexToFocus(rowIndexToScrollTo, !upKey),
            focusColumn: gridCell.column
        });
    }

    // ctrl + left/right will bring focus to same row, first/last cell. no vertical scrolling.
    private onCtrlLeftOrRight(key: number, gridCell: CellPosition): void {
        const leftKey = key === KeyCode.LEFT;
        const allColumns: Column[] = this.columnModel.getAllDisplayedColumns();
        const columnToSelect: Column = leftKey ? allColumns[0] : last(allColumns);

        this.navigateTo({
            scrollIndex: gridCell.rowIndex,
            scrollType: null,
            scrollColumn: columnToSelect,
            focusIndex: gridCell.rowIndex,
            focusColumn: columnToSelect
        });
    }

    // home brings focus to top left cell, end brings focus to bottom right, grid scrolled to bring
    // same cell into view (which means either scroll all the way up, or all the way down).
    private onHomeOrEndKey(key: number): void {
        const homeKey = key === KeyCode.PAGE_HOME;
        const allColumns: Column[] = this.columnModel.getAllDisplayedColumns();
        const columnToSelect = homeKey ? allColumns[0] : last(allColumns);
        const scrollIndex = homeKey ? this.paginationProxy.getPageFirstRow() : this.paginationProxy.getPageLastRow();

        this.navigateTo({
            scrollIndex: scrollIndex,
            scrollType: null,
            scrollColumn: columnToSelect,
            focusIndex: this.getIndexToFocus(scrollIndex, !homeKey),
            focusColumn: columnToSelect
        });
    }
}
