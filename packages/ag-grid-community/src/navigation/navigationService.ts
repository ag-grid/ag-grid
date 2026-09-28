import { KeyCode, _exists, _last, _missing, _throttle } from 'ag-stack';

import { isRowNumberCol } from '../columns/columnUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { RowFocusResolver, _getCellByPosition, _getRowNode, _isRowBefore } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';
import { _getCellPositionForEvent } from '../gridBodyComp/mouseEventUtils';
import { _isGroupRowsSticky } from '../gridOptionsUtils';
import { getFocusHeaderRowCount } from '../headerRendering/headerUtils';
import type { NavigateToNextCellParams, TabToNextCellParams } from '../interfaces/iCallbackParams';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { Column } from '../interfaces/iColumn';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { VerticalScrollPosition } from '../interfaces/iRowNode';
import type { RowPosition } from '../interfaces/iRowPosition';
import { CellCtrl } from '../rendering/cell/cellCtrl';
import { RowCtrl } from '../rendering/row/rowCtrl';
import { _focusNextGridCoreContainer, _isHeaderFocusSuppressed } from '../utils/gridFocus';
import { _clamp } from '../utils/number';

type FindNextCellToFocusOnParams = {
    backwards: boolean;
    startEditing: boolean;
    skipToNextEditableCell?: boolean;
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class NavigationService extends BeanStub implements NamedBean {
    beanName = 'navigation' as const;

    private gridBodyCon: GridBodyCtrl;
    private currentColumnWithoutSpan: Column | null = null;
    private hasColumnWithoutSpanListener = false;
    private autoHeightFocusTimer = 0;

    constructor() {
        super();
        this.onPageDown = _throttle(this.onPageDown, 100);
        this.onPageUp = _throttle(this.onPageUp, 100);
    }

    public postConstruct(): void {
        this.beans.ctrlsSvc.whenReady(this, (p) => {
            this.gridBodyCon = p.gridBodyCtrl;
        });
    }

    public override destroy(): void {
        window.clearTimeout(this.autoHeightFocusTimer);
        super.destroy();
    }

    public handlePageScrollingKey(event: KeyboardEvent, fromFullWidth = false): boolean {
        const key = event.key;
        const alt = event.altKey;
        const ctrl = event.ctrlKey || event.metaKey;
        const rangeServiceShouldHandleShift = !!this.beans.rangeSvc && event.shiftKey;

        // home and end can be processed without knowing the currently selected cell, this can occur for full width rows.
        const eventCell = _getCellPositionForEvent(this.gos, event);

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
                if (!eventCell) {
                    return false;
                }
                // handle when ctrl is pressed only, if shift is pressed
                // it will be handled by the rangeService
                if (ctrl && !alt && !rangeServiceShouldHandleShift) {
                    // Ctrl+Left/Right read only the row, so the covered column is a safe start for every arrow
                    this.onCtrlUpDownLeftRight(key, this.getVerticalStart(eventCell));
                    processed = true;
                }
                break;
            case KeyCode.PAGE_DOWN:
            case KeyCode.PAGE_UP:
                // handle page up and page down when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    processed = this.handlePageUpDown(
                        key,
                        eventCell && this.getVerticalStart(eventCell),
                        fromFullWidth
                    );
                }
                break;
        }

        if (processed) {
            event.preventDefault();
        }

        return processed;
    }

    private handlePageUpDown(key: string, currentCell: CellPosition | null, fromFullWidth: boolean): boolean {
        if (fromFullWidth) {
            currentCell = this.beans.focusSvc.getFocusedCell();
        }

        if (!currentCell) {
            return false;
        }

        if (key === KeyCode.PAGE_UP) {
            this.onPageUp(currentCell);
        } else {
            this.onPageDown(currentCell);
        }

        return true;
    }

    /** Page up/down scroll to one row but focus another, as the row scrolled to can be a stub. */
    private navigateTo(scrollIndex: number, scrollType: 'top' | 'bottom' | null, focus: CellPosition): void {
        this.gridBodyCon.scrollFeature.ensureIndexVisible(scrollIndex, scrollType);
        // scrolled in first: the browser's focus scroll cuts off the cell's border or leaves it under sticky rows
        this.beans.focusSvc.focusCellAt(focus, true);
    }

    // this method is throttled, see the `constructor`
    private onPageDown(gridCell: CellPosition): void {
        const beans = this.beans;
        const scrollPosition = getVScroll(beans);
        const pixelsInOnePage = this.getViewportHeight();

        const { pageBounds, rowModel, rowAutoHeight } = beans;

        const pagingPixelOffset = pageBounds.getPixelOffset();

        const currentPageBottomPixel = scrollPosition.top + pixelsInOnePage;
        const currentPageBottomRow = rowModel.getRowIndexAtPixel(currentPageBottomPixel + pagingPixelOffset);

        if (rowAutoHeight?.active) {
            this.navigateToNextPageWithAutoHeight(gridCell, currentPageBottomRow);
        } else {
            this.navigateToNextPage(gridCell, currentPageBottomRow);
        }
    }

    // this method is throttled, see the `constructor`
    private onPageUp(gridCell: CellPosition): void {
        const beans = this.beans;
        const scrollPosition = getVScroll(beans);

        const { pageBounds, rowModel, rowAutoHeight } = beans;

        const pagingPixelOffset = pageBounds.getPixelOffset();

        const currentPageTopPixel = scrollPosition.top;
        const currentPageTopRow = rowModel.getRowIndexAtPixel(currentPageTopPixel + pagingPixelOffset);

        if (rowAutoHeight?.active) {
            this.navigateToNextPageWithAutoHeight(gridCell, currentPageTopRow, true);
        } else {
            this.navigateToNextPage(gridCell, currentPageTopRow, true);
        }
    }

    private navigateToNextPage(gridCell: CellPosition, scrollIndex: number, up: boolean = false): void {
        const { pageBounds, rowModel } = this.beans;
        const pixelsInOnePage = this.getViewportHeight();
        const firstRow = pageBounds.getFirstRow();
        const lastRow = pageBounds.getLastRow();
        const pagingPixelOffset = pageBounds.getPixelOffset();
        const currentRowNode = rowModel.getRow(gridCell.rowIndex);

        const rowPixelDiff = up
            ? // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
              currentRowNode?.rowHeight! - pixelsInOnePage - pagingPixelOffset
            : pixelsInOnePage - pagingPixelOffset;

        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        const nextCellPixel = currentRowNode?.rowTop! + rowPixelDiff;

        let focusIndex = rowModel.getRowIndexAtPixel(nextCellPixel + pagingPixelOffset);

        if (focusIndex === gridCell.rowIndex) {
            const diff = up ? -1 : 1;
            scrollIndex = focusIndex = gridCell.rowIndex + diff;
        }

        let scrollType: 'top' | 'bottom';

        if (up) {
            scrollType = 'bottom';
            if (focusIndex < firstRow) {
                focusIndex = firstRow;
            }
            if (scrollIndex < firstRow) {
                scrollIndex = firstRow;
            }
        } else {
            scrollType = 'top';
            if (focusIndex > lastRow) {
                focusIndex = lastRow;
            }
            if (scrollIndex > lastRow) {
                scrollIndex = lastRow;
            }
        }

        if (this.isRowTallerThanView(rowModel.getRow(focusIndex))) {
            scrollIndex = focusIndex;
            scrollType = 'top';
        }

        this.navigateTo(scrollIndex, scrollType, {
            rowIndex: focusIndex,
            column: gridCell.column,
            rowPinned: undefined,
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
        const scrollType = up ? 'bottom' : 'top';
        const column = gridCell.column;
        this.navigateTo(scrollIndex, scrollType, { rowIndex: scrollIndex, column, rowPinned: undefined });
        // a later page key supersedes this one's settling pass
        window.clearTimeout(this.autoHeightFocusTimer);
        this.autoHeightFocusTimer = window.setTimeout(() => {
            this.autoHeightFocusTimer = 0;
            const focusIndex = this.getNextFocusIndexForAutoHeight(gridCell, up);
            this.gridBodyCon.scrollFeature.ensureIndexVisible(scrollIndex, scrollType);
            // follows the scroll already made
            this.beans.focusSvc.focusCellAt({ rowIndex: focusIndex, column, rowPinned: undefined }, false);
        }, 50);
    }

    private getNextFocusIndexForAutoHeight(gridCell: CellPosition, up: boolean = false): number {
        const step = up ? -1 : 1;
        const pixelsInOnePage = this.getViewportHeight();
        const { pageBounds, rowModel } = this.beans;
        const lastRowIndex = pageBounds.getLastRow();

        let pixelSum = 0;
        let currentIndex = gridCell.rowIndex;

        while (currentIndex >= 0 && currentIndex <= lastRowIndex) {
            const currentCell = rowModel.getRow(currentIndex);

            if (currentCell) {
                const currentCellHeight = currentCell.rowHeight ?? 0;

                if (pixelSum + currentCellHeight > pixelsInOnePage) {
                    break;
                }
                pixelSum += currentCellHeight;
            }

            currentIndex += step;
        }

        return _clamp(currentIndex, 0, lastRowIndex);
    }

    private getViewportHeight(): number {
        const beans = this.beans;
        const scrollPosition = getVScroll(beans);
        const scrollbarWidth = this.beans.scrollVisibleSvc.getScrollbarWidth();
        let pixelsInOnePage = scrollPosition.bottom - scrollPosition.top;

        if (beans.scrollVisibleSvc.isHorizontalScrollShowing()) {
            pixelsInOnePage -= scrollbarWidth;
        }

        return pixelsInOnePage;
    }

    private isRowTallerThanView(rowNode: RowNode | undefined): boolean {
        if (!rowNode) {
            return false;
        }

        const rowHeight = rowNode.rowHeight;

        if (typeof rowHeight !== 'number') {
            return false;
        }

        return rowHeight > this.getViewportHeight();
    }

    private onCtrlUpDownLeftRight(key: string, gridCell: CellPosition): void {
        const cellToFocus = this.beans.cellNavigation!.getNextCellToFocus(key, gridCell, true);

        if (!cellToFocus) {
            return;
        }

        this.navigateTo(cellToFocus.rowIndex, null, cellToFocus);
    }

    // home brings focus to top left cell, end brings focus to bottom right, grid scrolled to bring
    // same cell into view (which means either scroll all the way up, or all the way down).
    private onHomeOrEndKey(key: string): void {
        const homeKey = key === KeyCode.PAGE_HOME;
        const { pageBounds, cellNavigation } = this.beans;
        const scrollIndex = homeKey ? pageBounds.getFirstRow() : pageBounds.getLastRow();
        const columnToSelect = cellNavigation!.getRowEdgeCol(scrollIndex, null, !homeKey);

        if (!columnToSelect) {
            return;
        }

        this.navigateTo(scrollIndex, null, { rowIndex: scrollIndex, column: columnToSelect, rowPinned: undefined });
    }

    // result of keyboard event
    public onTabKeyDown(previous: CellCtrl | RowCtrl, keyboardEvent: KeyboardEvent): void {
        const backwards = keyboardEvent.shiftKey;
        const movedToNextCell = this.tabToNextCellCommon(previous, backwards, keyboardEvent);

        const beans = this.beans;
        const { ctrlsSvc, pageBounds, focusSvc, gos } = beans;

        if (movedToNextCell !== false) {
            // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
            // to the normal tabbing so user can exit the grid.
            if (movedToNextCell) {
                keyboardEvent.preventDefault();
            } else if (movedToNextCell === null) {
                // want to let browser handle, however some of the containers prevent browser focus
                ctrlsSvc.get('gridCtrl')?.allowFocusForNextCoreContainer(backwards);
            }
            return;
        }

        // if we didn't move to next cell, then need to tab out of the cells, ie to the header (if going
        // backwards)
        if (backwards) {
            const { rowIndex, rowPinned } = previous.getRowPosition();
            const firstRow = rowPinned ? rowIndex === 0 : rowIndex === pageBounds.getFirstRow();
            if (firstRow) {
                if (gos.get('headerHeight') === 0 || _isHeaderFocusSuppressed(beans)) {
                    _focusNextGridCoreContainer(beans, true, 'force');
                } else {
                    keyboardEvent.preventDefault();
                    focusSvc.focusPreviousFromFirstCell(keyboardEvent);
                }
            }
        } else {
            // anchor container navigation on the cell when focus is in an editor or renderer child.
            // re-focusing the cell itself would unnecessarily re-dispatch cellFocused.
            if (previous instanceof CellCtrl && !previous.hasBrowserFocus(true)) {
                previous.focusCell({ forceBrowserFocus: true });
            }

            if (focusSvc.focusOverlay(false) || _focusNextGridCoreContainer(beans, backwards)) {
                keyboardEvent.preventDefault();
            }
        }
    }

    // comes from API
    public tabToNextCell(backwards: boolean, event?: KeyboardEvent): boolean {
        const beans = this.beans;
        const { focusSvc, rowRenderer } = beans;
        const focusedCell = focusSvc.getFocusedCell();
        // if no focus, then cannot navigate
        if (!focusedCell) {
            return false;
        }

        let cellOrRow: CellCtrl | RowCtrl | null = _getCellByPosition(beans, focusedCell);

        // if cell is not rendered, means user has scrolled away from the cell
        // or that the focusedCell is a Full Width Row
        if (!cellOrRow) {
            cellOrRow = rowRenderer.getRowByPosition(focusedCell);
            if (!cellOrRow?.isFullWidth()) {
                return false;
            }
        }

        return !!this.tabToNextCellCommon(cellOrRow, backwards, event, 'api');
    }

    private tabToNextCellCommon(
        previous: CellCtrl | RowCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const { editSvc, focusSvc } = this.beans;

        let res: boolean | null | undefined;
        const cellCtrl = previous instanceof CellCtrl ? previous : previous.getAllCellCtrls()?.[0];

        const wasEditing = editSvc?.isEditing();
        if (wasEditing) {
            res = editSvc?.moveToNextCell(cellCtrl, backwards, event, source);
        }

        // if the cell was editing and res is false, it could be because validation blocked the edit
        // if that is not the case and we are no longer editing, this means the `moveToNextCell` couldn't find
        // another editable cell, so we switch to `moveToNextCellNotEditing` to find the next cell to focus on.
        if (!wasEditing || (res === false && !editSvc?.isEditing())) {
            res = this.moveToNextCellNotEditing(previous, backwards);
        }

        if (res === null) {
            return res;
        }

        // if a cell wasn't found, it's possible that focus was moved to the header
        return res || !!focusSvc.focusedHeader;
    }

    // returns null if no navigation should be performed
    private moveToNextCellNotEditing(previousCell: CellCtrl | RowCtrl, backwards: boolean): boolean | null {
        const displayedColumns = this.beans.visibleCols.allCols;
        let cellPos: CellPosition;

        if (previousCell instanceof RowCtrl) {
            cellPos = {
                ...previousCell.getRowPosition(),
                column: backwards ? displayedColumns[0] : _last(displayedColumns),
            };

            if (this.gos.get('embedFullWidthRows')) {
                cellPos.column = previousCell.getNavigationColumn();
            }
        } else {
            cellPos = previousCell.getFocusedCellPosition();
        }
        // find the next cell to start editing
        const nextCell = this.findNextCellToFocusOn(cellPos, { backwards, startEditing: false });

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (nextCell === false) {
            return null;
        }
        if (nextCell instanceof CellCtrl) {
            nextCell.focusCell({ forceBrowserFocus: true });
        } else if (nextCell) {
            return this.tryToFocusFullWidthRow(nextCell, backwards);
        }

        return _exists(nextCell);
    }

    /**
     * called by the cell, when tab is pressed while editing.
     * @returns RenderedCell when navigation successful, false if navigation should not be performed, otherwise null
     */
    public findNextCellToFocusOn(
        previousPosition: CellPosition,
        { backwards, startEditing, skipToNextEditableCell }: FindNextCellToFocusOnParams
    ): CellCtrl | CellPosition | null | false {
        let nextPosition: CellPosition | null | undefined = previousPosition;
        const beans = this.beans;
        const { cellNavigation, gos, focusSvc, rowRenderer } = beans;
        const resolver = new RowFocusResolver(beans);

        while (true) {
            if (previousPosition !== nextPosition) {
                previousPosition = nextPosition;
            }

            if (!backwards) {
                nextPosition = this.getLastCellOfColSpan(nextPosition);
            }
            nextPosition = cellNavigation!.getNextTabbedCell(nextPosition, backwards);

            // allow user to override what cell to go to next
            const userFunc = gos.getCallback('tabToNextCell');

            if (_exists(userFunc)) {
                const params: WithoutGridCommon<TabToNextCellParams> = {
                    backwards: backwards,
                    editing: startEditing,
                    previousCellPosition: previousPosition,
                    nextCellPosition: nextPosition ? nextPosition : null,
                };
                const userResult = userFunc(params);
                if (userResult === true) {
                    nextPosition = previousPosition;
                } else if (userResult === false) {
                    return false;
                } else {
                    nextPosition = {
                        rowIndex: userResult.rowIndex,
                        column: userResult.column,
                        rowPinned: userResult.rowPinned,
                    } as CellPosition;
                }
            }

            // if no 'next cell', means we have got to last cell of grid, so nothing to move to,
            // so bottom right cell going forwards, or top left going backwards
            if (!nextPosition) {
                return null;
            }

            if (nextPosition.rowIndex < 0) {
                const headerLen = getFocusHeaderRowCount(beans);

                focusSvc.focusHeaderPosition({
                    headerPosition: {
                        headerRowIndex: headerLen + nextPosition.rowIndex,
                        column: nextPosition.column,
                    },
                    fromCell: true,
                });

                return null;
            }

            // if editing, but cell not editable, skip cell. we do this before we do all of
            // the 'ensure index visible' and 'flush all frames', otherwise if we are skipping
            // a bunch of cells (eg 10 rows) then all the work on ensuring cell visible is useless
            // (except for the last one) which causes grid to stall for a while.
            // note - for full row edit, we do focus non-editable cells, as the row stays in edit mode.
            const fullRowEdit = gos.get('editType') === 'fullRow';
            if (startEditing && (!fullRowEdit || skipToNextEditableCell)) {
                const cellIsEditable = this.isCellEditable(nextPosition, resolver);
                if (!cellIsEditable) {
                    continue;
                }
            }

            this.ensureCellVisible(nextPosition);

            // we have to call this after ensureColumnVisible - otherwise it could be a virtual column
            // or row that is not currently in view, hence the renderedCell would not exist
            const nextCell = _getCellByPosition(beans, nextPosition);

            // if next cell is fullWidth row, then no rendered cell,
            // as fullWidth rows have no cells, so we skip it
            if (!nextCell) {
                const row = rowRenderer.getRowByPosition(nextPosition);
                if (!row || !row.isFullWidth() || startEditing) {
                    continue;
                }

                return { ...row.getRowPosition(), column: nextPosition?.column };
            }

            if (cellNavigation!.isSuppressNavigable(nextCell.column, nextCell.rowNode)) {
                continue;
            }

            // when spanning we need to focus a specific index of the spanned cell, by
            // setting it into the focused cell position we can try to force focus to this specific pos
            nextCell.setFocusedCellPosition(nextPosition);

            // by default, when we click a cell, it gets selected into a range, so to keep keyboard navigation
            // consistent, we set into range here also.
            if (!isRowNumberCol(nextCell.column)) {
                beans.rangeSvc?.setRangeToCell({ ...nextPosition, column: nextCell.column });
            }

            // we successfully tabbed onto a grid cell, so return true
            return nextCell;
        }
    }

    private isCellEditable(cell: CellPosition, resolver: RowFocusResolver): boolean {
        const rowNode = resolver.getRowNode(cell);
        return !!rowNode && resolver.getFocusColumn(cell).isCellEditable(rowNode);
    }

    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    public navigateToNextCell(
        event: KeyboardEvent | null,
        key: string,
        currentCell: CellPosition,
        allowUserOverride: boolean
    ): boolean {
        const isVertical = key === KeyCode.UP || key === KeyCode.DOWN;
        const currentCellWithoutSpan = isVertical ? this.getVerticalStart(currentCell) : currentCell;
        const beans = this.beans;
        const { focusSvc, gos } = beans;

        let nextCell = this.findNextCell(key, currentCellWithoutSpan);
        if (!nextCell && currentCellWithoutSpan !== currentCell) {
            // the covered column is only a preference: nothing navigable that way, so move from the cell itself
            nextCell = this.findNextCell(key, currentCell);
        }

        if (!nextCell && event?.key === KeyCode.UP) {
            nextCell = {
                rowIndex: -1,
                rowPinned: null,
                column: currentCellWithoutSpan.column,
            };
        }

        // allow user to override what cell to go to next. when doing normal cell navigation (with keys)
        // we allow this, however if processing 'enter after edit' we don't allow override
        if (allowUserOverride) {
            const userFunc = gos.getCallback('navigateToNextCell');
            if (_exists(userFunc)) {
                const params: WithoutGridCommon<NavigateToNextCellParams> = {
                    key: key,
                    previousCellPosition: currentCell,
                    nextCellPosition: nextCell ? nextCell : null,
                    event: event,
                };
                const userCell = userFunc(params);
                if (_exists(userCell)) {
                    nextCell = {
                        rowPinned: userCell.rowPinned,
                        rowIndex: userCell.rowIndex,
                        column: userCell.column,
                    } as CellPosition;
                } else {
                    nextCell = null;
                }
            }
        }

        // no next cell means we have reached a grid boundary, eg left, right, top or bottom of grid
        if (!nextCell) {
            return false;
        }

        if (nextCell.rowIndex < 0) {
            const headerLen = getFocusHeaderRowCount(beans);

            return focusSvc.focusHeaderPosition({
                headerPosition: {
                    headerRowIndex: headerLen + nextCell.rowIndex,
                    column: nextCell.column ?? currentCell.column,
                },
                event: event || undefined,
                fromCell: true,
            });
        }

        return this.focusCellOrRow(nextCell, true);
    }

    /**
     * Focuses the cell at `position`, or the cell spanning its column, keeping the covered column for the next
     * vertical move, or enters the full-width row there; false when neither is rendered.
     */
    public focusCellOrRow(position: CellPosition, scroll: boolean, backwards?: boolean): boolean {
        const normalisedPosition = this.getNormalisedPosition(position, scroll);
        if (!normalisedPosition) {
            return this.tryToFocusFullWidthRow(position, backwards);
        }

        this.beans.focusSvc.focusPosition(normalisedPosition);
        this.keepCoveredColumn(position, normalisedPosition.column);
        return true;
    }

    /** After a cell spanning `position`'s column took focus, keeps that column for the next vertical move. */
    public keepCoveredColumn(position: CellPosition, focusedColumn: Column): void {
        const column = position.column as AgColumn;
        const rowNode = focusedColumn !== column ? _getRowNode(this.beans, position) : undefined;
        // only a column the user can stop on is kept: Page and Ctrl+Up/Down move to it without judging it
        if (rowNode && !column.isSuppressNavigable(rowNode)) {
            this.setCurrentColumnWithoutSpan(column);
        }
    }

    /** The next navigable cell from `start` in the direction of `key`, skipping rows that do not exist; null if none. */
    private findNextCell(key: string, start: CellPosition): CellPosition | null {
        const { cellNavigation, gos } = this.beans;
        const fromSpanEnd = key === (gos.get('enableRtl') ? KeyCode.LEFT : KeyCode.RIGHT);
        let nextCell: CellPosition | null = start;

        while (nextCell && (nextCell === start || !this.isValidNavigateCell(nextCell))) {
            if (fromSpanEnd) {
                nextCell = this.getLastCellOfColSpan(nextCell);
            }
            nextCell = cellNavigation!.getNextCellToFocus(key, nextCell);
        }
        return nextCell;
    }

    /** A vertical move from a spanning cell continues in the column it was entered from, while the cell still covers it. */
    private getVerticalStart(cell: CellPosition): CellPosition {
        const column = this.currentColumnWithoutSpan;
        if (!column) {
            return cell;
        }
        const start = { ...cell, column };
        // hiding, moving or sorting can leave focus on a cell that no longer covers it
        return new RowFocusResolver(this.beans).getFocusColumn(start) === cell.column ? start : cell;
    }

    private setCurrentColumnWithoutSpan(column: Column): void {
        if (!this.hasColumnWithoutSpanListener) {
            const clearCurrentColumnWithoutSpan = () => {
                this.currentColumnWithoutSpan = null;
            };
            this.addManagedEventListeners({
                cellFocused: clearCurrentColumnWithoutSpan,
                headerFocused: clearCurrentColumnWithoutSpan,
            });
            this.hasColumnWithoutSpanListener = true;
        }

        // preserve the requested column while focus is on the cell that spans it
        this.currentColumnWithoutSpan = column;
    }

    private getNormalisedPosition(cellPosition: CellPosition, scroll: boolean): CellPosition | null {
        // ensureCellVisible first, to make sure cell at position is rendered.
        if (scroll) {
            this.ensureCellVisible(cellPosition);
        }

        const isSpannedCell = !!this.beans.spannedRowRenderer?.getCellByPosition(cellPosition);
        if (isSpannedCell) {
            return cellPosition;
        }

        const cellCtrl = _getCellByPosition(this.beans, cellPosition);

        // not guaranteed to have a cellComp when using the SSRM as blocks are loading.
        if (!cellCtrl) {
            return null;
        }

        const focusedPosition = cellCtrl.getFocusedCellPosition();

        // a spanning cell starts before the covered column scrolled to above, so bring its start into view too
        if (scroll && focusedPosition.column !== cellPosition.column) {
            this.ensureCellVisible(focusedPosition);
        }

        return focusedPosition;
    }

    public tryToFocusFullWidthRow(position: CellPosition | RowPosition, backwards?: boolean): boolean {
        const { visibleCols, rowRenderer, focusSvc, eventSvc } = this.beans;
        const displayedColumns = visibleCols.allCols;
        const rowComp = rowRenderer.getRowByPosition(position);
        if (!rowComp?.isFullWidth()) {
            return false;
        }

        const currentCellFocused = focusSvc.getFocusedCell();

        const cellPosition: CellPosition = {
            rowIndex: position.rowIndex,
            rowPinned: position.rowPinned,
            column: (position as CellPosition).column || (backwards ? _last(displayedColumns) : displayedColumns[0]),
        };

        focusSvc.focusPosition(cellPosition);

        const fromBelow =
            backwards == null
                ? currentCellFocused != null && _isRowBefore(cellPosition, currentCellFocused)
                : backwards;

        eventSvc.dispatchEvent({
            type: 'fullWidthRowFocused',
            rowIndex: cellPosition.rowIndex,
            rowPinned: cellPosition.rowPinned,
            column: cellPosition.column,
            isFullWidthCell: true,
            fromBelow,
        });

        return true;
    }

    private isValidNavigateCell(cell: CellPosition): boolean {
        const rowNode = _getRowNode(this.beans, cell);

        // we do not allow focusing on detail rows and full width rows
        return !!rowNode;
    }

    private getLastCellOfColSpan(cell: CellPosition): CellPosition {
        const colsSpanning = _getCellByPosition(this.beans, cell)?.colsSpanning;
        return colsSpanning ? { ...cell, column: _last(colsSpanning) } : cell;
    }

    public ensureCellVisible(gridCell: CellPosition): void {
        const isGroupStickyEnabled = _isGroupRowsSticky(this.gos);

        const rowNode = this.beans.rowModel.getRow(gridCell.rowIndex);
        // sticky rows are always visible, so the grid shouldn't scroll to focus them.
        const skipScrollToRow = isGroupStickyEnabled && rowNode?.sticky;

        const { scrollFeature } = this.gridBodyCon;

        // this scrolls the row into view
        if (!skipScrollToRow && _missing(gridCell.rowPinned)) {
            scrollFeature.ensureIndexVisible(gridCell.rowIndex);
        }

        if (!gridCell.column.isPinned()) {
            scrollFeature.ensureColumnVisible(gridCell.column);
        }
    }

    public ensureColumnVisible(column: AgColumn): void {
        const scrollFeature = this.gridBodyCon.scrollFeature;

        // this scrolls the column into view
        if (!column.isPinned()) {
            scrollFeature.ensureColumnVisible(column);
        }
    }

    public ensureRowVisible(rowIndex: number): void {
        const scrollFeature = this.gridBodyCon.scrollFeature;
        scrollFeature.ensureIndexVisible(rowIndex);
    }
}

function getVScroll(beans: BeanCollection): VerticalScrollPosition {
    return beans.ctrlsSvc.getScrollFeature().getVScrollPosition();
}
