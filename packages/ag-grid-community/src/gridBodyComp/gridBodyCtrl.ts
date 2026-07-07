import { _getInnerWidth, _getScrollLeft, _isElementChildOfClass, _setScrollLeft } from 'ag-stack';

import type { ColumnModel } from '../columns/columnModel';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { RowResizeEndedEvent, RowResizeStartedEvent } from '../events';
import type { FilterManager } from '../filter/filterManager';
import { _isAnimateRows } from '../gridOptionsUtils';
import { getAriaHeaderRowCount } from '../headerRendering/headerUtils';
import type { IRowGroupColsService } from '../interfaces/iColsService';
import type { VerticalSection } from '../interfaces/iGridSection';
import type { IPinnedRowModel } from '../interfaces/iPinnedRowModel';
import type { LayoutView } from '../styling/layoutFeature';
import { LayoutFeature } from '../styling/layoutFeature';
import type { PopupService } from '../widgets/popupService';
import { GridBodyScrollFeature } from './gridBodyScrollFeature';
import type { ScrollVisibleService } from './scrollVisibleService';

const CSS_CLASS_CELL_SELECTABLE = 'ag-selectable';
const CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';

export interface PinnedSectionState {
    height: number;
    invisible: boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGridBodyComp extends LayoutView {
    setColumnMovingCss(cssClass: string, on: boolean): void;
    setCellSelectableCss(cssClass: string | null, on: boolean): void;
    setPinnedSection(section: VerticalSection, state: PinnedSectionState): void;
    setStickyBottomHeight(height: string): void;
    setStickyBottomWidth(width: string): void;
    setColumnCount(count: number): void;
    setRowCount(count: number): void;
    setRowAnimationCssOnScrollableArea(animate: boolean): void;
    setPreventRowAnimationCssOnContainers(prevent: boolean): void;
    setGridScrollableAreaWidth(width: string): void;
    setGridRole(role: 'grid' | 'treegrid'): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class GridBodyCtrl extends BeanStub {
    private ctrlsSvc: CtrlsService;
    private colModel: ColumnModel;
    private scrollVisibleSvc: ScrollVisibleService;
    private rowGroupColsSvc?: IRowGroupColsService;
    private pinnedRowModel?: IPinnedRowModel;
    private filterManager?: FilterManager;

    public wireBeans(beans: BeanCollection): void {
        this.ctrlsSvc = beans.ctrlsSvc;
        this.colModel = beans.colModel;
        this.scrollVisibleSvc = beans.scrollVisibleSvc;
        this.pinnedRowModel = beans.pinnedRowModel;
        this.filterManager = beans.filterManager;
        this.rowGroupColsSvc = beans.rowGroupColsSvc;
    }

    private comp: IGridBodyComp;
    public eGridBody: HTMLElement;
    public eGridViewport: HTMLElement;
    public eScrollingRows: HTMLElement;
    private eTop: HTMLElement;
    private eTopExtraRows: HTMLElement;
    private eBottom: HTMLElement;
    private topPinnedRowsHeight = 0;
    private bottomPinnedRowsHeight = 0;

    public stickyTopHeight: number = 0;
    public stickyBottomHeight: number = 0;

    public scrollFeature: GridBodyScrollFeature;

    public setComp(
        comp: IGridBodyComp,
        eGridBody: HTMLElement,
        eGridViewport: HTMLElement,
        eScrollingRows: HTMLElement,
        eTop: HTMLElement,
        eTopExtraRows: HTMLElement,
        eBottom: HTMLElement
    ): void {
        this.comp = comp;
        this.eGridBody = eGridBody;
        this.eGridViewport = eGridViewport;
        this.eScrollingRows = eScrollingRows;
        this.eTop = eTop;
        this.eTopExtraRows = eTopExtraRows;
        this.eBottom = eBottom;

        this.setCellTextSelection(this.gos.get('enableCellTextSelection'));
        this.addManagedPropertyListener('enableCellTextSelection', (props) =>
            this.setCellTextSelection(props.currentValue)
        );
        this.createManagedBean(new LayoutFeature(this.comp));
        this.scrollFeature = this.createManagedBean(new GridBodyScrollFeature(eGridViewport));
        this.beans.rowDragSvc?.setupRowDrag(eScrollingRows, this);

        this.setupRowAnimationCssClass();

        this.addEventListeners();
        this.addFocusListeners([eTop, eGridViewport, eBottom]);
        this.setGridRole();
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
        this.setPinnedRowsHeights();
        this.disableBrowserDragging();
        this.addStopEditingWhenGridLosesFocus();
        this.updatePinnedColumnStickyOffsets();
        this.updateScrollingClasses();

        this.filterManager?.mountAdvFilterTopSectionComp({
            mountComp: (eGui) => eTopExtraRows.appendChild(eGui),
            unmountComp: (eGui) => eGui.remove(),
        });

        this.ctrlsSvc.register('gridBodyCtrl', this);
    }

    private addEventListeners(): void {
        const setPinnedRowsHeights = this.setPinnedRowsHeights.bind(this);
        const setGridRootRole = this.setGridRole.bind(this);
        const toggleRowResizeStyle = this.toggleRowResizeStyles.bind(this);
        const updatePinnedColumnStickyOffsets = this.updatePinnedColumnStickyOffsets.bind(this);
        const onGridSizeChanged = this.onGridSizeChanged.bind(this);

        const onPinnedWidthChanged = () => {
            this.updateScrollableAreaWidth();
            this.updateScrollingClasses();
        };

        this.addManagedEventListeners({
            gridColumnsChanged: this.onGridColumnsChanged.bind(this),
            displayedColumnsWidthChanged: this.updateScrollableAreaWidth.bind(this),
            leftPinnedWidthChanged: onPinnedWidthChanged,
            rightPinnedWidthChanged: onPinnedWidthChanged,
            scrollVisibilityChanged: this.onScrollVisibilityChanged.bind(this),
            scrollbarWidthChanged: updatePinnedColumnStickyOffsets,
            scrollGapChanged: this.updateScrollingClasses.bind(this),
            pinnedRowDataChanged: setPinnedRowsHeights,
            pinnedHeightChanged: setPinnedRowsHeights,
            pinnedRowsChanged: setPinnedRowsHeights,
            headerHeightChanged: setPinnedRowsHeights,
            gridSizeChanged: onGridSizeChanged,
            columnRowGroupChanged: setGridRootRole,
            columnPivotChanged: setGridRootRole,
            rowResizeStarted: toggleRowResizeStyle,
            rowResizeEnded: toggleRowResizeStyle,
        });

        this.addManagedPropertyListener('treeData', setGridRootRole);
        this.addManagedPropertyListener('enableRtl', updatePinnedColumnStickyOffsets);
    }

    private toggleRowResizeStyles(params: RowResizeStartedEvent | RowResizeEndedEvent) {
        const isResizingRow = params.type === 'rowResizeStarted';
        this.comp.setPreventRowAnimationCssOnContainers(isResizingRow);
    }

    private onGridColumnsChanged(): void {
        const columns = this.beans.colModel.colsList;
        this.comp.setColumnCount(columns.length);
        this.updateScrollableAreaWidth();
    }

    private onScrollVisibilityChanged(): void {
        const { scrollVisibleSvc } = this;
        const visible = scrollVisibleSvc.verticalScrollShowing;
        this.setStickyWidth(visible);
        this.updatePinnedColumnStickyOffsets();
        this.updateScrollableAreaWidth();
        this.updateScrollingClasses();
        this.updateAnchorWidth();
    }

    private onGridSizeChanged(): void {
        this.updateScrollableAreaWidth();
        this.updatePinnedColumnStickyOffsets();
        this.updateAnchorWidth();
    }

    private updateScrollableAreaWidth(): void {
        const contentWidth = this.getHorizontalContentWidth();
        const viewportWidth = this.getHorizontalViewportWidth();
        this.comp.setGridScrollableAreaWidth(`${Math.max(contentWidth, viewportWidth, 1)}px`);
    }

    public getHorizontalContentWidth(
        verticalScrollShowing: boolean = this.scrollVisibleSvc.verticalScrollShowing
    ): number {
        const { visibleCols } = this.beans;
        const baseWidth =
            visibleCols.bodyWidth +
            visibleCols.getLeftStickyColumnContainerWidth() +
            visibleCols.getRightStickyColumnContainerWidth();

        if (!verticalScrollShowing) {
            return baseWidth;
        }

        return baseWidth + this.getVerticalScrollbarWidth(verticalScrollShowing);
    }

    public getHorizontalViewportWidth(): number {
        return this.eGridViewport.getBoundingClientRect().width;
    }

    public getViewportWidthWithoutScrollbar(
        verticalScrollShowing: boolean = this.scrollVisibleSvc.verticalScrollShowing
    ): number {
        return Math.max(0, _getInnerWidth(this.eGridViewport) - this.getVerticalScrollbarWidth(verticalScrollShowing));
    }

    public getCenterWidth(verticalScrollShowing: boolean = this.scrollVisibleSvc.verticalScrollShowing): number {
        const { visibleCols } = this.beans;
        const pinnedWidth =
            visibleCols.getLeftStickyColumnContainerWidth() + visibleCols.getRightStickyColumnContainerWidth();
        return Math.max(0, this.getViewportWidthWithoutScrollbar(verticalScrollShowing) - pinnedWidth);
    }

    public getHorizontalScrollLeft(): number {
        return _getScrollLeft(this.eGridViewport, this.gos.get('enableRtl'));
    }

    public setHorizontalScrollLeft(value: number): void {
        _setScrollLeft(this.eGridViewport, value, this.gos.get('enableRtl'));
    }

    public getHorizontalScrollPosition(): { left: number; right: number } {
        const left = this.getHorizontalScrollLeft();
        return {
            left,
            right: left + this.getCenterWidth(),
        };
    }

    public updateColumnViewport(afterScroll: boolean = false): void {
        this.beans.colViewport.setScrollPosition(this.getCenterWidth(), this.getHorizontalScrollLeft(), afterScroll);
    }

    private updateAnchorWidth(): void {
        const anchorWidth = this.getViewportWidthWithoutScrollbar();
        this.eGridViewport.style.setProperty('--ag-internal-fw-anchor-width', `${anchorWidth}px`);
    }

    private setGridRole(): void {
        const { rowGroupColsSvc, colModel, gos } = this;

        let isTreeGrid = gos.get('treeData');

        if (!isTreeGrid) {
            const isPivotActive = colModel.pivotMode;
            const rowGroupColumnLen = !rowGroupColsSvc ? 0 : rowGroupColsSvc.columns.length;
            const columnsNeededForGrouping = isPivotActive ? 2 : 1;
            isTreeGrid = rowGroupColumnLen >= columnsNeededForGrouping;
        }

        this.comp.setGridRole(isTreeGrid ? 'treegrid' : 'grid');
    }

    private addFocusListeners(elements: HTMLElement[]): void {
        for (const element of elements) {
            this.addManagedElementListeners(element, {
                focusin: (e: FocusEvent) => {
                    const { target } = e;
                    // element being focused is nested?
                    const isFocusedElementNested = _isElementChildOfClass(target as HTMLElement, 'ag-root', element);

                    element.classList.toggle('ag-has-focus', !isFocusedElementNested);
                },
                focusout: (e: FocusEvent) => {
                    const { target, relatedTarget } = e;
                    const gridContainRelatedTarget = element.contains(relatedTarget as HTMLElement);
                    const isNestedRelatedTarget = _isElementChildOfClass(
                        relatedTarget as HTMLElement,
                        'ag-root',
                        element
                    );
                    const isNestedTarget = _isElementChildOfClass(target as HTMLElement, 'ag-root', element);

                    // element losing focus belongs to a nested grid,
                    // it should not be handled here.
                    if (isNestedTarget) {
                        return;
                    }

                    // the grid does not contain, or the focus element is within
                    // a nested grid
                    if (!gridContainRelatedTarget || isNestedRelatedTarget) {
                        element.classList.remove('ag-has-focus');
                    }
                },
            });
        }
    }

    // used by ColumnAnimationService
    public setColumnMovingCss(moving: boolean): void {
        this.comp.setColumnMovingCss(CSS_CLASS_COLUMN_MOVING, moving);
    }

    public setCellTextSelection(selectable: boolean = false): void {
        this.comp.setCellSelectableCss(CSS_CLASS_CELL_SELECTABLE, selectable);
    }

    private updateScrollingClasses(): void {
        const {
            eGridBody: { classList },
            scrollVisibleSvc,
            beans: { visibleCols },
        } = this;
        classList.toggle('ag-body-vertical-content-no-gap', !scrollVisibleSvc.verticalScrollGap);
        classList.toggle('ag-body-horizontal-content-no-gap', !scrollVisibleSvc.horizontalScrollGap);
        classList.toggle('ag-has-left-pinned-cols', visibleCols.getLeftStickyColumnContainerWidth() > 0);
        classList.toggle('ag-has-right-pinned-cols', visibleCols.getRightStickyColumnContainerWidth() > 0);
    }

    private updatePinnedColumnStickyOffsets(): void {
        const { scrollVisibleSvc, gos, eGridBody } = this;
        const scrollbarWidth = scrollVisibleSvc.verticalScrollShowing ? this.getVerticalScrollbarWidth() : 0;
        const isRtl = gos.get('enableRtl');
        const leftOffset = isRtl ? scrollbarWidth : 0;
        const rightOffset = isRtl ? 0 : scrollbarWidth;

        eGridBody.style.setProperty('--ag-internal-pinned-left-sticky-offset', `${leftOffset}px`);
        eGridBody.style.setProperty('--ag-internal-pinned-right-sticky-offset', `${rightOffset}px`);
    }

    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
    private disableBrowserDragging(): void {
        this.addManagedElementListeners(this.eGridBody, {
            dragstart: (event: DragEvent) => {
                if (event.target instanceof HTMLImageElement) {
                    event.preventDefault();
                    return false;
                }
            },
        });
    }

    private addStopEditingWhenGridLosesFocus(): void {
        this.beans.editSvc?.addStopEditingWhenGridLosesFocus([this.eGridViewport, this.eBottom, this.eTop]);
    }

    public updateRowCount(): void {
        const headerCount = getAriaHeaderRowCount(this.beans);

        const { rowModel, pinnedRowModel } = this.beans;
        const pinnedTopCount = pinnedRowModel?.getPinnedTopRowCount() ?? 0;
        const pinnedBottomCount = pinnedRowModel?.getPinnedBottomRowCount() ?? 0;
        const rowCount = rowModel.isLastRowIndexKnown() ? rowModel.getRowCount() : -1;
        const total = rowCount === -1 ? -1 : headerCount + pinnedTopCount + rowCount + pinnedBottomCount;

        this.comp.setRowCount(total);
    }

    private setupRowAnimationCssClass(): void {
        const { rowContainerHeight, environment } = this.beans;
        let initialSizeMeasurementComplete = environment.sizesMeasured;

        const updateAnimationClass = () => {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            const animateRows =
                initialSizeMeasurementComplete && _isAnimateRows(this.gos) && !rowContainerHeight.stretching;
            this.comp.setRowAnimationCssOnScrollableArea(animateRows);
        };

        updateAnimationClass();

        this.addManagedEventListeners({ heightScaleChanged: updateAnimationClass });
        this.addManagedPropertyListener('animateRows', updateAnimationClass);

        this.addManagedEventListeners({
            stylesChanged: () => {
                if (!initialSizeMeasurementComplete && environment.sizesMeasured) {
                    initialSizeMeasurementComplete = true;
                    updateAnimationClass();
                }
            },
        });
    }

    private addBodyViewportListener(): void {
        const {
            eGridViewport,
            eTop,
            eBottom,
            beans: { popupSvc, touchSvc },
        } = this;
        // we want to listen for clicks directly on the eGridViewport, so the user has a way of showing
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        const listener = this.onBodyViewportContextMenu.bind(this);
        this.addManagedElementListeners(eGridViewport, { contextmenu: listener });
        touchSvc?.mockBodyContextMenu(this, listener);

        this.addManagedElementListeners(eGridViewport, {
            wheel: this.onBodyViewportWheel.bind(this, popupSvc),
        });

        const onStickyWheel = this.onStickyWheel.bind(this);

        for (const container of [eTop, eBottom]) {
            this.addManagedElementListeners(container, { wheel: onStickyWheel });
        }
    }

    private onStickyWheel(e: WheelEvent): void {
        const { deltaY } = e;

        const scrolled = this.scrollVertically(deltaY);
        if (scrolled > 0) {
            e.preventDefault();
        }
    }

    private onBodyViewportContextMenu(mouseEvent?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent): void {
        if (!mouseEvent && !touchEvent) {
            return;
        }

        if (this.gos.get('preventDefaultOnContextMenu')) {
            const event = (mouseEvent || touchEvent)!;
            event.preventDefault();
        }

        const target = (mouseEvent || touch)?.target;
        const eTarget = target instanceof Element ? target : null;
        const isOnGridViewport =
            eTarget != null && (eTarget === this.eGridViewport || this.eGridViewport.contains(eTarget));
        const isOnRenderedRow = !!eTarget?.closest('.ag-row, .ag-header-row');
        const isOnPinnedTopSection = !!eTarget?.closest('.ag-grid-pinned-top-rows');

        if (isOnGridViewport && !isOnRenderedRow && !isOnPinnedTopSection) {
            // show it
            this.beans.contextMenuSvc?.showContextMenu({
                mouseEvent,
                touchEvent: touchEvent!,
                value: null,
                anchorToElement: this.eGridBody,
                source: 'ui',
            });
        }
    }

    private onBodyViewportWheel(popupSvc: PopupService, e: WheelEvent): void {
        if (!this.gos.get('suppressScrollWhenPopupsAreOpen')) {
            return;
        }

        if (popupSvc?.hasAnchoredPopup()) {
            e.preventDefault();
        }
    }

    // called by rowDragFeature
    public scrollVertically(pixels: number): number {
        const oldScrollPosition = this.eGridViewport.scrollTop;

        this.scrollFeature.setVerticalScrollPosition(oldScrollPosition + pixels);
        return this.eGridViewport.scrollTop - oldScrollPosition;
    }

    private setPinnedRowsHeights(): void {
        const { pinnedRowModel } = this;

        const pinnedTopHeight = pinnedRowModel?.getPinnedTopTotalHeight();
        const pinnedBottomHeight = pinnedRowModel?.getPinnedBottomTotalHeight();

        const { environment } = this.beans;
        const borderAdjustment = environment.getPinnedRowBorderWidth();

        const normalisedPinnedTopHeight = (pinnedTopHeight ?? 0) + (pinnedTopHeight ? borderAdjustment : 0);
        const normalisedPinnedBottomHeight = (pinnedBottomHeight ?? 0) + (pinnedBottomHeight ? borderAdjustment : 0);
        this.topPinnedRowsHeight = normalisedPinnedTopHeight;
        this.bottomPinnedRowsHeight = normalisedPinnedBottomHeight;

        this.ctrlsSvc.get('pinnedTop')?.setContainerHeight(normalisedPinnedTopHeight);
        this.ctrlsSvc.get('pinnedBottom')?.setContainerHeight(normalisedPinnedBottomHeight);

        this.refreshTopSection();
        this.refreshBottomSection();
    }

    private refreshTopSection(): void {
        const advancedFilterHeaderHeight = this.filterManager?.getHeaderHeight() ?? 0;
        const headerRowsOffset = this.getHeaderRowsOffset();

        // set top on eTopExtraRows
        this.eTopExtraRows.style.top = 'var(--ag-header-rows-height, 0px)';

        // set top on pinnedTop container
        const pinnedTopTop = headerRowsOffset;
        this.ctrlsSvc.get('pinnedTop')?.setContainerTop(pinnedTopTop);

        // set top on stickyTop container
        const stickyTopTop = pinnedTopTop + this.topPinnedRowsHeight;
        this.ctrlsSvc.get('stickyTop')?.setContainerTop(stickyTopTop);

        this.comp.setPinnedSection('top', {
            height: this.topPinnedRowsHeight + advancedFilterHeaderHeight,
            invisible: this.topPinnedRowsHeight <= 0,
        });
    }

    private refreshBottomSection(): void {
        this.ctrlsSvc.get('stickyBottom')?.setContainerTop(0);
        this.ctrlsSvc.get('pinnedBottom')?.setContainerTop(this.stickyBottomHeight);

        this.comp.setPinnedSection('bottom', {
            height: this.bottomPinnedRowsHeight,
            invisible: this.bottomPinnedRowsHeight <= 0,
        });
    }

    public setStickyTopHeight(height: number = 0): void {
        if (this.stickyTopHeight === height) {
            return;
        }
        this.stickyTopHeight = height;
        this.ctrlsSvc.get('stickyTop')?.setContainerHeight(height);
        this.refreshTopSection();
    }

    public setStickyBottomHeight(height: number = 0): void {
        if (this.stickyBottomHeight === height) {
            return;
        }
        this.stickyBottomHeight = height;
        this.ctrlsSvc.get('stickyBottom')?.setContainerHeight(height);
        this.comp.setStickyBottomHeight(`${height}px`);
        this.refreshBottomSection();
        this.updateStickyRowsHeightAdjustment();
        this.eventSvc.dispatchEvent({
            type: 'stickyBottomOffsetChanged',
            offset: height,
        });
    }

    private updateStickyRowsHeightAdjustment(): void {
        const {
            stickyBottomHeight,
            beans: { rowContainerHeight },
        } = this;
        // only adjust for stickyBottom as stickyTopRows overflow the container
        if (rowContainerHeight.stickyBottomRowsHeight !== stickyBottomHeight) {
            rowContainerHeight.stickyBottomRowsHeight = stickyBottomHeight;
            this.eventSvc.dispatchEvent({ type: 'rowContainerHeightChanged' });
        }
    }

    private setStickyWidth(vScrollVisible: boolean) {
        this.comp.setStickyBottomWidth(vScrollVisible ? `calc(100% - ${this.getVerticalScrollbarWidth()}px)` : '100%');
    }

    public getHeaderRowsOffset(): number {
        const gridHeaderCtrl = this.ctrlsSvc.get('gridHeaderCtrl');
        const headerHeight = gridHeaderCtrl?.headerHeight ?? 0;
        const advancedFilterHeaderHeight = this.filterManager?.getHeaderHeight() ?? 0;
        const borderWidth = this.beans.environment.getHeaderRowBorderWidth();

        return advancedFilterHeaderHeight + headerHeight + borderWidth;
    }

    public getTopPinnedRowsOffset(): number {
        return this.getHeaderRowsOffset() + this.topPinnedRowsHeight;
    }

    public getBottomPinnedRowsOffset(): number {
        return this.bottomPinnedRowsHeight;
    }

    public getBodyViewportHeight(totalViewportHeight: number): number {
        const bodyHeight = totalViewportHeight - this.getTopPinnedRowsOffset() - this.bottomPinnedRowsHeight;
        return Math.max(0, bodyHeight);
    }

    /** Total scroll content height calculated from JS values. Used by FakeVScrollComp
     *  to avoid reading eGridViewport.scrollHeight which can return stale intermediate values. */
    public getScrollContentHeight(): number {
        const topSectionHeight = this.getTopPinnedRowsOffset();
        const scrollingHeight = this.beans.rowContainerHeight.getAdjustedUiContainerHeight() ?? 0;
        const bottomSectionHeight = this.bottomPinnedRowsHeight + this.stickyBottomHeight;
        const contentHeight = topSectionHeight + scrollingHeight + bottomSectionHeight;
        // scrollHeight is never less than clientHeight (min-height: 100% on scrollable area)
        return Math.max(contentHeight, this.eGridViewport.clientHeight);
    }

    public getVerticalScrollbarWidth(
        verticalScrollShowing: boolean = this.scrollVisibleSvc.verticalScrollShowing
    ): number {
        const { scrollVisibleSvc } = this;
        if (!verticalScrollShowing) {
            return 0;
        }

        const configuredScrollbarWidth = scrollVisibleSvc.getScrollbarWidth() || 0;

        if (configuredScrollbarWidth === 0) {
            return 0;
        }

        return configuredScrollbarWidth;
    }

    public getHorizontalScrollbarHeight(): number {
        const hScrollShowing =
            this.scrollVisibleSvc.horizontalScrollShowing && !this.gos.get('suppressHorizontalScroll');
        if (!hScrollShowing) {
            return 0;
        }

        const fakeHScrollComp = this.ctrlsSvc.get('fakeHScrollComp');
        const fakeScrollbarHeight = fakeHScrollComp?.getGui().offsetHeight ?? 0;
        if (fakeScrollbarHeight > 0) {
            return fakeScrollbarHeight;
        }

        const scrollbarWidth = this.scrollVisibleSvc.getScrollbarWidth() || 0;
        return scrollbarWidth;
    }
}
