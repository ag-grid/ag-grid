import { KeyCode, _focusInto, _getActiveDomElement, _last, _makeNull, _registerKeyboardFocusEvents } from 'ag-stack';

import type { ColumnModel } from './columns/columnModel';
import { isRowNumberCol } from './columns/columnUtils';
import type { VisibleColsService } from './columns/visibleColsService';
import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { AgColumn } from './entities/agColumn';
import { _areCellsEqual, _getFirstRow, _getLastRow, _getRowNode } from './entities/positionUtils';
import type { CellFocusedParams, CommonCellFocusParams } from './events';
import type { FilterManager } from './filter/filterManager';
import { _getDomData } from './gridOptionsUtils';
import { DOM_DATA_KEY_HEADER_CTRL } from './headerRendering/cells/abstractCell/abstractHeaderCellCtrl';
import type { HeaderCellCtrl } from './headerRendering/cells/column/headerCellCtrl';
import { getFocusHeaderRowCount, isHeaderPositionEqual } from './headerRendering/headerUtils';
import type {
    NavigateToNextHeaderParams,
    TabToNextGridContainerTarget,
    TabToNextHeaderParams,
} from './interfaces/iCallbackParams';
import type { CellPosition } from './interfaces/iCellPosition';
import type { WithoutGridCommon } from './interfaces/iCommon';
import type { FocusableContainer } from './interfaces/iFocusableContainer';
import type { HeaderPosition } from './interfaces/iHeaderPosition';
import type { RowPinnedType } from './interfaces/iRowNode';
import { getHeaderIndexToFocus } from './navigation/headerNavigationService';
import type { NavigationService } from './navigation/navigationService';
import type { OverlayService } from './rendering/overlays/overlayService';
import { DOM_DATA_KEY_CELL_CTRL, DOM_DATA_KEY_ROW_CTRL } from './rendering/renderUtils';
import type { RowRenderer } from './rendering/rowRenderer';
import {
    _focusNextGridCoreContainer,
    _getDefaultTabTargetForContainer,
    _isCellFocusSuppressed,
    _isHeaderFocusSuppressed,
} from './utils/gridFocus';

type FocusDirection = 'Before' | 'After' | null;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class FocusService extends BeanStub implements NamedBean {
    beanName = 'focusSvc' as const;

    private colModel: ColumnModel;
    private visibleCols: VisibleColsService;
    private rowRenderer: RowRenderer;
    private navigation?: NavigationService;
    private filterManager?: FilterManager;
    private overlays?: OverlayService;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.visibleCols = beans.visibleCols;
        this.rowRenderer = beans.rowRenderer;
        this.navigation = beans.navigation;
        this.filterManager = beans.filterManager;
        this.overlays = beans.overlays;
    }

    private focusedCell: CellPosition | null;
    private previousCellFocusParams: CellFocusedParams | null;

    public focusedHeader: HeaderPosition | null;
    /** the column that had focus before it moved into the advanced filter */
    private advFilterFocusColumn: AgColumn | undefined;

    /** If a cell was destroyed that previously had focus, focus needs restored when the cell reappears */
    private focusFallbackTimeout: number | null = null;
    private needsFocusRestored = false;

    public postConstruct(): void {
        const clearFocusedCellListener = this.clearFocusedCell.bind(this);

        this.addManagedEventListeners({
            columnPivotModeChanged: clearFocusedCellListener,
            newColumnsLoaded: this.onColumnEverythingChanged.bind(this),
            columnGroupOpened: clearFocusedCellListener,
            columnRowGroupChanged: clearFocusedCellListener,
        });

        this.addDestroyFunc(_registerKeyboardFocusEvents(this.beans));
    }

    public attemptToRecoverFocus() {
        this.needsFocusRestored = true;

        if (this.focusFallbackTimeout != null) {
            clearTimeout(this.focusFallbackTimeout);
        }

        // fallback; don't want to leave this flag hanging for a long time as the grid may steal focus later
        // if this doesn't get consumed
        this.focusFallbackTimeout = window.setTimeout(this.setFocusRecovered.bind(this), 100);
    }

    private setFocusRecovered() {
        this.needsFocusRestored = false;
        if (this.focusFallbackTimeout != null) {
            clearTimeout(this.focusFallbackTimeout);
            this.focusFallbackTimeout = null;
        }
    }

    /**
     * Specifies whether to take focus, as grid either already has focus, or lost it due
     * to a destroyed cell
     * @returns true if the grid should re-take focus, otherwise false
     */
    public shouldTakeFocus(): boolean {
        if (this.gos.get('suppressFocusAfterRefresh')) {
            this.setFocusRecovered();
            return false;
        }

        if (this.needsFocusRestored) {
            this.setFocusRecovered();
            return true;
        }

        return this.doesRowOrCellHaveBrowserFocus();
    }

    public onColumnEverythingChanged(): void {
        // if the columns change, check and see if this column still exists. if it does, then
        // we can keep the focused cell. if it doesn't, then we need to drop the focused cell.
        if (!this.focusedCell) {
            return;
        }

        const col = this.focusedCell.column;
        const colFromColumnModel = this.colModel.getCol(col.getId());

        if (col !== colFromColumnModel) {
            this.clearFocusedCell();
        }
    }

    // we check if the browser is focusing something, and if it is, and
    // it's the cell we think is focused, then return the cell. so this
    // methods returns the cell if a) we think it has focus and b) the
    // browser thinks it has focus. this then returns nothing if we
    // first focus a cell, then second click outside the grid, as then the
    // grid cell will still be focused as far as the grid is concerned,
    // however the browser focus will have moved somewhere else.
    public getFocusCellToUseAfterRefresh(): CellPosition | null {
        const { gos, focusedCell } = this;
        if (gos.get('suppressFocusAfterRefresh') || gos.get('suppressCellFocus') || !focusedCell) {
            return null;
        }

        // we check that the browser is actually focusing on the grid, if it is not, then
        // we have nothing to worry about. we check for ROW data, as this covers both focused Rows (for Full Width Rows)
        // and Cells (covers cells as cells live in rows)
        if (!this.doesRowOrCellHaveBrowserFocus()) {
            return null;
        }

        return focusedCell;
    }

    public getFocusHeaderToUseAfterRefresh(): HeaderPosition | null {
        if (this.gos.get('suppressFocusAfterRefresh') || !this.focusedHeader) {
            return null;
        }

        // we check that the browser is actually focusing on the grid, if it is not, then
        // we have nothing to worry about
        if (!this.isDomDataPresentInHierarchy(_getActiveDomElement(this.beans), DOM_DATA_KEY_HEADER_CTRL)) {
            return null;
        }

        return this.focusedHeader;
    }

    /**
     * Check for both cells and rows, as a row might be destroyed and the dom data removed before the cell if the
     * row is animating out.
     */
    public doesRowOrCellHaveBrowserFocus() {
        const activeElement = _getActiveDomElement(this.beans);
        // check for cell first
        if (this.isDomDataPresentInHierarchy(activeElement, DOM_DATA_KEY_CELL_CTRL, true)) {
            return true;
        }
        // otherwise rows
        return this.isDomDataPresentInHierarchy(activeElement, DOM_DATA_KEY_ROW_CTRL, true);
    }

    private isDomDataPresentInHierarchy(
        eBrowserCell: Node | null,
        key: string,
        attemptToRefocusIfDestroyed?: boolean
    ): boolean {
        let ePointer = eBrowserCell;

        while (ePointer) {
            const data = _getDomData(this.gos, ePointer, key);

            if (data) {
                if (data.destroyed && attemptToRefocusIfDestroyed) {
                    this.attemptToRecoverFocus();
                    return false;
                }
                return true;
            }

            ePointer = ePointer.parentNode;
        }

        return false;
    }

    public getFocusedCell(): CellPosition | null {
        return this.focusedCell;
    }

    private getFocusEventParams(focusedCellPosition: CellPosition): CommonCellFocusParams {
        const { rowIndex, rowPinned, column } = focusedCellPosition;

        const params: CommonCellFocusParams = {
            rowIndex: rowIndex,
            rowPinned: rowPinned,
            column: column,
            isFullWidthCell: false,
        };

        const rowCtrl = this.rowRenderer.getRowByPosition({ rowIndex, rowPinned });

        if (rowCtrl) {
            params.isFullWidthCell = rowCtrl.isFullWidth();
        }

        return params;
    }

    public clearFocusedCell(): void {
        if (this.focusedCell == null) {
            return;
        }

        const focusEventParams = this.getFocusEventParams(this.focusedCell);

        this.focusedCell = null;

        this.eventSvc.dispatchEvent({
            type: 'cellFocusCleared',
            ...focusEventParams,
        });
    }

    public setFocusedCell(params: CellFocusedParams): void {
        // as focus has been set, reset the flag
        this.setFocusRecovered();

        const {
            column,
            rowIndex,
            rowPinned,
            forceBrowserFocus = false,
            preventScrollOnBrowserFocus = false,
            sourceEvent,
        } = params;

        const gridColumn = this.colModel.getCol(column);

        // if column doesn't exist, then blank the focused cell and return. this can happen when user sets new columns,
        // and the focused cell is in a column that no longer exists. after columns change, the grid refreshes and tries
        // to re-focus the focused cell.
        if (!gridColumn) {
            this.focusedCell = null;
            return;
        }

        this.focusedCell = {
            rowIndex: rowIndex!,
            rowPinned: _makeNull(rowPinned),
            column: gridColumn,
        };

        const focusEventParams = this.getFocusEventParams(this.focusedCell);

        this.eventSvc.dispatchEvent({
            type: 'cellFocused',
            ...focusEventParams,
            ...(this.previousCellFocusParams && { previousParams: this.previousCellFocusParams }),
            forceBrowserFocus,
            preventScrollOnBrowserFocus,
            sourceEvent,
        });

        this.previousCellFocusParams = focusEventParams;
    }

    public isCellFocused(cellPosition: CellPosition): boolean {
        if (this.focusedCell == null) {
            return false;
        }

        return _areCellsEqual(cellPosition, this.focusedCell);
    }

    public isHeaderWrapperFocused(headerCtrl: HeaderCellCtrl): boolean {
        if (this.focusedHeader == null) {
            return false;
        }

        const {
            column,
            rowCtrl: { rowIndex: headerRowIndex },
        } = headerCtrl;

        const { column: focusedColumn, headerRowIndex: focusedHeaderRowIndex } = this.focusedHeader;

        return column === focusedColumn && headerRowIndex === focusedHeaderRowIndex;
    }

    public focusHeaderPosition(params: {
        headerPosition: HeaderPosition | null;
        direction?: FocusDirection;
        fromTab?: boolean;
        allowUserOverride?: boolean;
        event?: KeyboardEvent;
        fromCell?: boolean;
        rowWithoutSpanValue?: number;
        scroll?: boolean;
    }): boolean {
        // focusing header has been attempted; don't try to recover focus
        this.setFocusRecovered();

        if (_isHeaderFocusSuppressed(this.beans)) {
            return false;
        }

        const { direction, fromTab, allowUserOverride, event, fromCell, rowWithoutSpanValue, scroll = true } = params;
        let { headerPosition } = params;

        if (fromCell && this.filterManager?.isAdvFilterHeaderActive()) {
            return this.focusAdvancedFilter(headerPosition);
        }

        if (allowUserOverride) {
            const currentPosition = this.focusedHeader;
            const headerRowCount = getFocusHeaderRowCount(this.beans);

            if (fromTab) {
                const userFunc = this.gos.getCallback('tabToNextHeader');
                if (userFunc) {
                    headerPosition = this.getHeaderPositionFromUserFunc({
                        userFunc,
                        direction,
                        currentPosition,
                        headerPosition,
                        headerRowCount,
                    });
                }
            } else {
                const userFunc = this.gos.getCallback('navigateToNextHeader');
                if (userFunc && event) {
                    const params: WithoutGridCommon<NavigateToNextHeaderParams> = {
                        key: event.key,
                        previousHeaderPosition: currentPosition,
                        nextHeaderPosition: headerPosition,
                        headerRowCount,
                        event,
                    };
                    const userResult = userFunc(params);
                    headerPosition = userResult === null ? currentPosition : userResult;
                }
            }
        }

        if (!headerPosition) {
            return false;
        }

        return this.focusProvidedHeaderPosition({
            headerPosition,
            direction,
            event,
            fromCell,
            rowWithoutSpanValue,
            scroll,
        });
    }

    public focusHeaderPositionFromUserFunc(params: {
        userFunc: (params: WithoutGridCommon<TabToNextHeaderParams>) => boolean | HeaderPosition;
        headerPosition: HeaderPosition | null;
        direction?: FocusDirection;
        event?: KeyboardEvent;
    }): boolean {
        if (_isHeaderFocusSuppressed(this.beans)) {
            return false;
        }
        const { userFunc, headerPosition, direction, event } = params;
        const currentPosition = this.focusedHeader;
        const headerRowCount = getFocusHeaderRowCount(this.beans);
        const newHeaderPosition = this.getHeaderPositionFromUserFunc({
            userFunc,
            direction,
            currentPosition,
            headerPosition,
            headerRowCount,
        });
        return (
            !!newHeaderPosition &&
            this.focusProvidedHeaderPosition({
                headerPosition: newHeaderPosition,
                direction,
                event,
            })
        );
    }

    private getHeaderPositionFromUserFunc(params: {
        userFunc: (params: WithoutGridCommon<TabToNextHeaderParams>) => boolean | HeaderPosition;
        direction?: FocusDirection;
        currentPosition: HeaderPosition | null;
        headerPosition: HeaderPosition | null;
        headerRowCount: number;
    }): HeaderPosition | null {
        const { userFunc, direction, currentPosition, headerPosition, headerRowCount } = params;
        const userFuncParams: WithoutGridCommon<TabToNextHeaderParams> = {
            backwards: direction === 'Before',
            previousHeaderPosition: currentPosition,
            nextHeaderPosition: headerPosition,
            headerRowCount,
        };
        const userResult = userFunc(userFuncParams);
        if (userResult === true) {
            return currentPosition;
        }
        if (userResult === false) {
            return null;
        }
        return userResult;
    }

    private focusProvidedHeaderPosition(params: {
        headerPosition: HeaderPosition;
        direction?: FocusDirection;
        event?: KeyboardEvent;
        fromCell?: boolean;
        rowWithoutSpanValue?: number;
        scroll?: boolean;
    }): boolean {
        const { headerPosition, direction, fromCell, rowWithoutSpanValue, event, scroll = true } = params;
        const { column, headerRowIndex } = headerPosition;
        const { filterManager, ctrlsSvc, headerNavigation } = this.beans;

        const browserFocusOnHeader = this.isDomDataPresentInHierarchy(
            _getActiveDomElement(this.beans),
            DOM_DATA_KEY_HEADER_CTRL
        );
        if (
            browserFocusOnHeader &&
            this.focusedHeader &&
            isHeaderPositionEqual(params.headerPosition, this.focusedHeader)
        ) {
            return false;
        }

        if (headerRowIndex === -1) {
            if (filterManager?.isAdvFilterHeaderActive()) {
                return this.focusAdvancedFilter(headerPosition);
            }
            return this.focusGridView({ column: column as AgColumn, event });
        }

        if (scroll) {
            headerNavigation?.scrollToColumn(column as AgColumn, direction);
        }

        const headerRowContainerCtrl = ctrlsSvc.getHeaderRowContainerCtrl();

        // this will automatically set the focused header
        const focusSuccess =
            headerRowContainerCtrl?.focusHeader(headerPosition.headerRowIndex, column as AgColumn, event) || false;

        if (headerNavigation && focusSuccess && (rowWithoutSpanValue != null || fromCell)) {
            headerNavigation.currentHeaderRowWithoutSpan = rowWithoutSpanValue ?? -1;
        }

        return focusSuccess;
    }

    public focusFirstHeader(): boolean {
        if (this.overlays?.exclusive && this.focusOverlay()) {
            return true;
        }

        const firstColumn: AgColumn = this.visibleCols.allCols[0];
        if (!firstColumn) {
            return false;
        }

        const headerPosition = getHeaderIndexToFocus(this.beans, firstColumn, 0);

        return this.focusHeaderPosition({
            headerPosition,
            rowWithoutSpanValue: 0,
        });
    }

    public focusLastHeader(event?: KeyboardEvent): boolean {
        if (this.overlays?.exclusive && this.focusOverlay(true)) {
            return true;
        }

        const headerRowIndex = getFocusHeaderRowCount(this.beans) - 1;
        const column = _last(this.visibleCols.allCols);

        return this.focusHeaderPosition({
            headerPosition: { headerRowIndex, column },
            rowWithoutSpanValue: -1,
            event,
        });
    }

    public focusPreviousFromFirstCell(event?: KeyboardEvent): boolean {
        if (this.filterManager?.isAdvFilterHeaderActive()) {
            return this.focusAdvancedFilter(null);
        }
        return this.focusLastHeader(event);
    }

    public isAnyCellFocused(): boolean {
        return !!this.focusedCell;
    }

    public isRowFocused(rowIndex: number, rowPinnedType: RowPinnedType): boolean {
        if (this.focusedCell == null) {
            return false;
        }

        return this.focusedCell.rowIndex === rowIndex && this.focusedCell.rowPinned === _makeNull(rowPinnedType);
    }

    public focusOverlay(backwards?: boolean): boolean {
        const overlayGui = this.overlays?.isVisible() && this.overlays.eWrapper?.getGui();
        return !!overlayGui && _focusInto(overlayGui, backwards);
    }

    public getDefaultTabToNextGridContainerTarget(params: {
        backwards: boolean;
        focusableContainers: FocusableContainer[];
        nextIndex: number;
    }): TabToNextGridContainerTarget | null {
        const { backwards, focusableContainers } = params;
        const step = backwards ? -1 : 1;
        let gridBodyTarget: TabToNextGridContainerTarget | null | undefined;
        const getGridBodyTabTarget = (): TabToNextGridContainerTarget | null => {
            if (gridBodyTarget === undefined) {
                gridBodyTarget = this.getGridBodyTabTarget(backwards);
            }

            return gridBodyTarget;
        };

        // walk container order in tab direction and return the first default target candidate.
        for (let index = params.nextIndex; index >= 0 && index < focusableContainers.length; index += step) {
            const target = _getDefaultTabTargetForContainer(focusableContainers[index], getGridBodyTabTarget);
            if (target) {
                return target;
            }
        }

        return null;
    }

    private getGridBodyTabTarget(backwards: boolean): CellPosition | HeaderPosition | null {
        if (backwards) {
            return this.getGridViewTabTarget({ column: _last(this.visibleCols.allCols), backwards: true });
        }

        const firstColumn = this.visibleCols.allCols[0];

        // forward tab into grid body mirrors focusGridBodyDefault:
        // headers first when enabled, otherwise first focusable grid cell.
        if (this.gos.get('headerHeight') === 0 || _isHeaderFocusSuppressed(this.beans)) {
            return this.getGridViewTabTarget({ column: firstColumn });
        }

        if (!firstColumn) {
            return null;
        }

        return getHeaderIndexToFocus(this.beans, firstColumn, 0);
    }

    private getGridViewTabTarget(params: {
        column?: AgColumn;
        backwards?: boolean;
    }): CellPosition | HeaderPosition | null {
        const { backwards = false } = params;
        const column: AgColumn | undefined = params.column ?? (this.focusedHeader?.column as AgColumn | undefined);

        // compute the grid-view focus target without moving browser focus or scrolling.
        if (!column) {
            return null;
        }

        if (this.overlays?.exclusive) {
            return null;
        }

        if (_isCellFocusSuppressed(this.beans)) {
            return backwards && !_isHeaderFocusSuppressed(this.beans)
                ? {
                      headerRowIndex: getFocusHeaderRowCount(this.beans) - 1,
                      column,
                  }
                : null;
        }

        const nextRow = backwards ? _getLastRow(this.beans) : _getFirstRow(this.beans);
        if (nextRow?.rowIndex == null) {
            if (this.overlays?.isVisible()) {
                return null;
            }

            if (backwards && !_isHeaderFocusSuppressed(this.beans)) {
                const lastColumn = _last(this.visibleCols.allCols);
                if (lastColumn) {
                    return {
                        headerRowIndex: getFocusHeaderRowCount(this.beans) - 1,
                        column: lastColumn,
                    };
                }
            }

            return null;
        }

        const rowNode = _getRowNode(this.beans, nextRow);

        if (!rowNode || column.isSuppressNavigable(rowNode)) {
            return null;
        }

        if (backwards) {
            const rowCtrl = this.rowRenderer.getRowByPosition(nextRow);
            if (rowCtrl?.isFullWidth()) {
                return null;
            }
        }

        return {
            rowIndex: nextRow.rowIndex,
            rowPinned: nextRow.rowPinned,
            column,
        };
    }

    public focusGridView(params: {
        column?: AgColumn;
        backwards?: boolean;
        canFocusOverlay?: boolean;
        event?: KeyboardEvent;
    }): boolean {
        const { backwards = false, canFocusOverlay = true, event } = params;
        if (this.overlays?.exclusive) {
            return canFocusOverlay && this.focusOverlay(backwards);
        }

        // if suppressCellFocus is `true`, it means the user does not want to
        // navigate between the cells using tab. Instead, we put focus on either
        // the header or after the grid, depending on whether tab or shift-tab was pressed.
        if (_isCellFocusSuppressed(this.beans)) {
            if (backwards) {
                if (!_isHeaderFocusSuppressed(this.beans)) {
                    return this.focusLastHeader();
                }
            }

            if (canFocusOverlay && this.focusOverlay(backwards)) {
                return true;
            }

            if (backwards) {
                return false;
            }

            return _focusNextGridCoreContainer(this.beans, backwards);
        }

        const nextRow = backwards ? _getLastRow(this.beans) : _getFirstRow(this.beans);

        if (nextRow) {
            const column: AgColumn | undefined = params.column ?? (this.focusedHeader?.column as AgColumn | undefined);
            const { rowIndex, rowPinned } = nextRow;
            const rowNode = _getRowNode(this.beans, nextRow);

            if (!column || !rowNode || rowIndex == null) {
                return false;
            }

            if (column.isSuppressNavigable(rowNode)) {
                const isRtl = this.gos.get('enableRtl');
                let key: string;
                if (!event || event.key === KeyCode.TAB) {
                    key = isRtl ? KeyCode.LEFT : KeyCode.RIGHT;
                } else {
                    key = event.key;
                }

                this.beans.navigation?.navigateToNextCell(
                    null,
                    key,
                    { rowIndex, column, rowPinned: rowPinned || null },
                    true
                );
                return true;
            }

            this.navigation?.ensureCellVisible({ rowIndex, column, rowPinned });

            if (backwards) {
                // if full width we need to focus into the full width cell in the correct direction
                const rowCtrl = this.rowRenderer.getRowByPosition(nextRow);
                if (rowCtrl?.isFullWidth() && this.navigation?.tryToFocusFullWidthRow(nextRow, backwards)) {
                    return true;
                }
            }

            this.setFocusedCell({
                rowIndex,
                column,
                rowPinned: _makeNull(rowPinned),
                forceBrowserFocus: true,
            });

            if (!isRowNumberCol(column)) {
                this.beans.rangeSvc?.setRangeToCell({ rowIndex, rowPinned, column });
            }

            return true;
        }

        if (canFocusOverlay && this.focusOverlay(backwards)) {
            return true;
        }

        if (backwards && this.focusLastHeader()) {
            return true;
        }

        return false;
    }

    private focusAdvancedFilter(position: HeaderPosition | null): boolean {
        this.advFilterFocusColumn = position?.column as AgColumn | undefined;
        return this.beans.advancedFilter?.getCtrl().focusHeaderComp() ?? false;
    }

    public focusNextFromAdvancedFilter(backwards?: boolean, forceFirstColumn?: boolean): boolean {
        const column = (forceFirstColumn ? undefined : this.advFilterFocusColumn) ?? this.visibleCols.allCols?.[0];
        if (backwards) {
            return this.focusHeaderPosition({
                headerPosition: {
                    column: column,
                    headerRowIndex: getFocusHeaderRowCount(this.beans) - 1,
                },
            });
        }
        return this.focusGridView({ column });
    }

    public clearAdvancedFilterColumn(): void {
        this.advFilterFocusColumn = undefined;
    }
}
