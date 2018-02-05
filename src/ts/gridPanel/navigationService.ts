
import {Autowired, Bean, Optional, PostConstruct} from "../context/context";
import {GridCell, GridCellDef} from "../entities/gridCell";
import {Constants} from "../constants";
import {MouseEventService} from "./mouseEventService";
import {PaginationProxy} from "../rowModels/paginationProxy";
import {Column} from "../entities/column";
import {FocusedCellController} from "../focusedCellController";
import {_} from "../utils";
import {GridPanel} from "./gridPanel";
import {AnimationFrameService} from "../misc/animationFrameService";
import {IRangeController} from "../interfaces/iRangeController";
import {ColumnController} from "../columnController/columnController";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

@Bean('navigationService')
export class NavigationService {

    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private scrollWidth: number;

    @PostConstruct
    private init(): void {
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
    }

    public handlePageScrollingKey(event: KeyboardEvent): boolean {

        let key = event.which || event.keyCode;
        let alt = event.altKey;
        let ctrl = event.ctrlKey;

        let currentCell: GridCellDef = this.mouseEventService.getGridCellForEvent(event).getGridCellDef();
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

    private onPageDown(gridCell: GridCellDef): void {

        let viewport: HTMLElement = this.gridPanel.getPrimaryScrollViewport();
        let pixelsInOnePage = viewport.offsetHeight;

        if (this.gridPanel.isHorizontalScrollShowing()) {
            pixelsInOnePage -= this.scrollWidth;
        }

        let pagingPixelOffset = this.paginationProxy.getPixelOffset();

        let currentPageBottomPixel = viewport.scrollTop + pixelsInOnePage;
        let currentPageBottomRow = this.paginationProxy.getRowIndexAtPixel(currentPageBottomPixel + pagingPixelOffset);
        let scrollIndex = currentPageBottomRow;

        let currentCellPixel = this.paginationProxy.getRow(gridCell.rowIndex).rowTop;
        let nextCellPixel = currentCellPixel + pixelsInOnePage - pagingPixelOffset;
        let focusIndex = this.paginationProxy.getRowIndexAtPixel(nextCellPixel + pagingPixelOffset);

        let pageLastRow = this.paginationProxy.getPageLastRow();

        if (focusIndex > pageLastRow) { focusIndex = pageLastRow; }
        if (scrollIndex > pageLastRow) { scrollIndex = pageLastRow; }

        this.navigateTo(scrollIndex, 'top', null, focusIndex, gridCell.column);
    }

    private onPageUp(gridCell: GridCellDef): void {

        let viewport: HTMLElement = this.gridPanel.getPrimaryScrollViewport();
        let pixelsInOnePage = viewport.offsetHeight;

        if (this.gridPanel.isHorizontalScrollShowing()) {
            pixelsInOnePage -= this.scrollWidth;
        }

        let pagingPixelOffset = this.paginationProxy.getPixelOffset();

        let currentPageTopPixel = viewport.scrollTop;
        let currentPageTopRow = this.paginationProxy.getRowIndexAtPixel(currentPageTopPixel + pagingPixelOffset);
        let scrollIndex = currentPageTopRow;

        let currentRowNode = this.paginationProxy.getRow(gridCell.rowIndex);
        let nextCellPixel = currentRowNode.rowTop + currentRowNode.rowHeight - pixelsInOnePage - pagingPixelOffset;
        let focusIndex = this.paginationProxy.getRowIndexAtPixel(nextCellPixel + pagingPixelOffset);

        let firstRow = this.paginationProxy.getPageFirstRow();

        if (focusIndex < firstRow) { focusIndex = firstRow; }
        if (scrollIndex < firstRow) { scrollIndex = firstRow; }

        this.navigateTo(scrollIndex, 'bottom', null, focusIndex, gridCell.column);
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
            let gridCell = new GridCell({rowIndex: focusIndex, floating: null, column: focusColumn});
            this.rangeController.setRangeToCell(gridCell);
        }
    }

    // ctrl + up/down will bring focus to same column, first/last row. no horizontal scrolling.
    private onCtrlUpOrDown(key: number, gridCell: GridCellDef): void {

        let upKey = key === Constants.KEY_UP;
        let rowIndexToScrollTo = upKey ? 0 : this.paginationProxy.getPageLastRow();

        this.navigateTo(rowIndexToScrollTo, null, gridCell.column, rowIndexToScrollTo, gridCell.column);
    }

    // ctrl + left/right will bring focus to same row, first/last cell. no vertical scrolling.
    private onCtrlLeftOrRight(key: number, gridCell: GridCellDef): void {

        let leftKey = key === Constants.KEY_LEFT;

        let allColumns: Column[] = this.columnController.getAllDisplayedColumns();
        let columnToSelect : Column = leftKey ? allColumns[0]: allColumns[allColumns.length - 1];

        this.navigateTo(gridCell.rowIndex, null, columnToSelect, gridCell.rowIndex, columnToSelect);
    }

    // home brings focus to top left cell, end brings focus to bottom right, grid scrolled to bring
    // same cell into view (which means either scroll all the way up, or all the way down).
    private onHomeOrEndKey(key: number): void {

        let homeKey = key === Constants.KEY_PAGE_HOME;

        let allColumns: Column[] = this.columnController.getAllDisplayedColumns();
        let columnToSelect = homeKey ? allColumns[0] : allColumns[allColumns.length - 1];
        let rowIndexToScrollTo = homeKey ? 0 : this.paginationProxy.getPageLastRow();

        this.navigateTo(rowIndexToScrollTo, null, columnToSelect, rowIndexToScrollTo, columnToSelect);
    }
}
