import { _isElementChildOfClass } from '../agStack/utils/dom';
import { _isEventFromThisInstance } from '../agStack/utils/event';
import type { ColumnModel } from '../columns/columnModel';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { RowResizeEndedEvent, RowResizeStartedEvent } from '../events';
import type { FilterManager } from '../filter/filterManager';
import { _isAnimateRows, _isDomLayout } from '../gridOptionsUtils';
import { GridHeaderFeature } from '../headerRendering/gridHeaderFeature';
import type { IColsService } from '../interfaces/iColsService';
import type { IPinnedRowModel } from '../interfaces/iPinnedRowModel';
import type { LayoutView } from '../styling/layoutFeature';
import { LayoutFeature } from '../styling/layoutFeature';
import type { PopupService } from '../widgets/popupService';
import { GridBodyScrollFeature } from './gridBodyScrollFeature';
import { PinnedRowContainerRendererFeature } from './pinnedRowContainerRendererFeature';
import type { IPinnedRowContainerRendererFeature } from './pinnedRowContainerRendererFeature';
import type { ScrollVisibleService } from './scrollVisibleService';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type RowAnimationCssClasses = 'ag-row-animation' | 'ag-row-no-animation';

export const CSS_CLASS_FORCE_VERTICAL_SCROLL = 'ag-force-vertical-scroll';

const CSS_CLASS_CELL_SELECTABLE = 'ag-selectable';
const CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';

export type PinnedSection = 'top' | 'bottom';

export interface PinnedSectionState {
    height: number;
    invisible: boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGridBodyComp extends LayoutView {
    setColumnMovingCss(cssClass: string, on: boolean): void;
    setCellSelectableCss(cssClass: string | null, on: boolean): void;
    setPinnedSection(section: PinnedSection, state: PinnedSectionState): void;
    setStickyBottomHeight(height: string): void;
    setStickyBottomWidth(width: string): void;
    setColumnCount(count: number): void;
    setRowCount(count: number): void;
    setRowAnimationCssOnBodyViewport(cssClass: RowAnimationCssClasses, animate: boolean): void;
    setAlwaysVerticalScrollClass(cssClass: string | null, on: boolean): void;
    setGridScrollableAreaWidth(width: string): void;
    setGridRootRole(role: 'grid' | 'treegrid'): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class GridBodyCtrl extends BeanStub {
    private ctrlsSvc: CtrlsService;
    private colModel: ColumnModel;
    private scrollVisibleSvc: ScrollVisibleService;
    private rowGroupColsSvc?: IColsService;
    private pinnedRowModel?: IPinnedRowModel;
    private filterManager?: FilterManager;
    private pinnedRowContainerRendererFeature!: IPinnedRowContainerRendererFeature;

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
    private eFullWidthContainer: HTMLElement;
    private eTop: HTMLElement;
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
        eFullWidthContainer: HTMLElement,
        eTopRowsContainer: HTMLElement,
        eTopRowsFullWidthContainer: HTMLElement,
        eTop: HTMLElement,
        eBottomRowsContainer: HTMLElement,
        eBottomRowsFullWidthContainer: HTMLElement,
        eBottom: HTMLElement
    ): void {
        this.comp = comp;
        this.eGridBody = eGridBody;
        this.eGridViewport = eGridViewport;
        this.eScrollingRows = eScrollingRows;
        this.eFullWidthContainer = eFullWidthContainer;
        this.eTop = eTop;
        this.eBottom = eBottom;
        this.pinnedRowContainerRendererFeature = this.createManagedBean(
            new PinnedRowContainerRendererFeature(
                eTopRowsContainer,
                eTopRowsFullWidthContainer,
                eBottomRowsContainer,
                eBottomRowsFullWidthContainer,
                eGridViewport
            )
        );
        this.createManagedBean(
            new GridHeaderFeature(eTopRowsContainer, eTop, eGridViewport, this.pinnedRowContainerRendererFeature)
        );

        this.setCellTextSelection(this.gos.get('enableCellTextSelection'));
        this.addManagedPropertyListener('enableCellTextSelection', (props) =>
            this.setCellTextSelection(props.currentValue)
        );

        this.createManagedBean(new LayoutFeature(this.comp));
        this.scrollFeature = this.createManagedBean(new GridBodyScrollFeature(eGridViewport));
        this.beans.rowDragSvc?.setupRowDrag(eGridViewport, this);

        this.setupRowAnimationCssClass();

        this.addEventListeners();
        this.addFocusListeners([eTop, eGridViewport, eBottom]);
        this.setGridRootRole();
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
        this.setPinnedRowsHeights();
        this.disableBrowserDragging();
        this.addStopEditingWhenGridLosesFocus();
        this.updatePinnedColumnStickyOffsets();
        this.updateScrollingClasses();

        this.filterManager?.setupAdvFilterHeaderComp(
            this.pinnedRowContainerRendererFeature.createCompHost({
                section: 'top',
                stream: 'center',
                lane: 'edge',
                order: 1,
                pinToViewportX: true,
                getViewportOffsetTop: () => this.ctrlsSvc.get('gridHeaderCtrl')?.headerHeight ?? 0,
                insertAfterHeadersBeforeRows: true,
            })
        );

        this.ctrlsSvc.register('gridBodyCtrl', this);
    }

    private addEventListeners(): void {
        const setPinnedRowsHeights = this.setPinnedRowsHeights.bind(this);
        const setGridRootRole = this.setGridRootRole.bind(this);
        const toggleRowResizeStyle = this.toggleRowResizeStyles.bind(this);
        const updatePinnedColumnStickyOffsets = this.updatePinnedColumnStickyOffsets.bind(this);
        const onGridSizeChanged = this.onGridSizeChanged.bind(this);

        this.addManagedEventListeners({
            gridColumnsChanged: this.onGridColumnsChanged.bind(this),
            displayedColumnsWidthChanged: this.updateScrollableAreaWidth.bind(this),
            leftPinnedWidthChanged: this.updateScrollableAreaWidth.bind(this),
            rightPinnedWidthChanged: this.updateScrollableAreaWidth.bind(this),
            scrollVisibilityChanged: this.onScrollVisibilityChanged.bind(this),
            scrollbarWidthChanged: updatePinnedColumnStickyOffsets,
            scrollGapChanged: this.updateScrollingClasses.bind(this),
            pinnedRowDataChanged: setPinnedRowsHeights,
            pinnedHeightChanged: setPinnedRowsHeights,
            pinnedRowsChanged: setPinnedRowsHeights,
            headerHeightChanged: setPinnedRowsHeights,
            headerRowsChanged: () => this.pinnedRowContainerRendererFeature.refresh(),
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
        this.eGridViewport.classList.toggle('ag-prevent-animation', isResizingRow);
    }

    private onGridColumnsChanged(): void {
        const columns = this.beans.colModel.getCols();
        this.comp.setColumnCount(columns.length);
        this.updateScrollableAreaWidth();
    }

    private onScrollVisibilityChanged(): void {
        const { scrollVisibleSvc } = this;
        const visible = scrollVisibleSvc.verticalScrollShowing;
        this.setStickyWidth(visible);
        this.updatePinnedColumnStickyOffsets();
        this.updateScrollableAreaWidth();
        this.pinnedRowContainerRendererFeature.refresh();

        this.updateScrollingClasses();
    }

    private onGridSizeChanged(): void {
        this.updateScrollableAreaWidth();
        this.updatePinnedColumnStickyOffsets();
        this.pinnedRowContainerRendererFeature.refresh();
    }

    private updateScrollableAreaWidth(): void {
        const contentWidth = this.getHorizontalContentWidth();
        const viewportWidth = this.getHorizontalViewportWidth();
        this.comp.setGridScrollableAreaWidth(`${Math.max(contentWidth, viewportWidth, 1)}px`);
    }

    public getHorizontalContentWidth(): number {
        const { visibleCols } = this.beans;
        const baseWidth =
            visibleCols.bodyWidth +
            visibleCols.getLeftStickyColumnContainerWidth() +
            visibleCols.getRightStickyColumnContainerWidth();

        if (!this.scrollVisibleSvc.verticalScrollShowing) {
            return baseWidth;
        }

        return baseWidth + this.getVerticalScrollbarWidth();
    }

    public getHorizontalViewportWidth(): number {
        return this.eGridViewport.getBoundingClientRect().width;
    }

    private setGridRootRole(): void {
        const { rowGroupColsSvc, colModel, gos } = this;

        let isTreeGrid = gos.get('treeData');

        if (!isTreeGrid) {
            const isPivotActive = colModel.isPivotMode();
            const rowGroupColumnLen = !rowGroupColsSvc ? 0 : rowGroupColsSvc.columns.length;
            const columnsNeededForGrouping = isPivotActive ? 2 : 1;
            isTreeGrid = rowGroupColumnLen >= columnsNeededForGrouping;
        }

        this.comp.setGridRootRole(isTreeGrid ? 'treegrid' : 'grid');
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
        } = this;
        classList.toggle('ag-body-vertical-content-no-gap', !scrollVisibleSvc.verticalScrollGap);
        classList.toggle('ag-body-horizontal-content-no-gap', !scrollVisibleSvc.horizontalScrollGap);
        classList.toggle('ag-body-horizontal-scroll', scrollVisibleSvc.horizontalScrollShowing);
    }

    private updatePinnedColumnStickyOffsets(): void {
        const { scrollVisibleSvc, gos, eGridBody } = this;
        const scrollbarWidth = scrollVisibleSvc.verticalScrollShowing ? this.getVerticalScrollbarWidth() : 0;
        const isRtl = gos.get('enableRtl');
        const leftOffset = isRtl ? scrollbarWidth : 0;
        const rightOffset = isRtl ? 0 : scrollbarWidth;

        eGridBody.style.setProperty('--ag-pinned-left-sticky-offset', `${leftOffset}px`);
        eGridBody.style.setProperty('--ag-pinned-right-sticky-offset', `${rightOffset}px`);
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
        const headerCount =
            (this.ctrlsSvc.getHeaderRowContainerCtrl()?.getRowCount() ?? 0) +
            (this.filterManager?.getHeaderRowCount() ?? 0);

        const { rowModel } = this.beans;
        const rowCount = rowModel.isLastRowIndexKnown() ? rowModel.getRowCount() : -1;
        const total = rowCount === -1 ? -1 : headerCount + rowCount;

        this.comp.setRowCount(total);
    }

    public isVerticalScrollShowing(): boolean {
        const { gos, comp } = this;
        const show = gos.get('alwaysShowVerticalScroll');

        const cssClass = show ? CSS_CLASS_FORCE_VERTICAL_SCROLL : null;
        const allowVerticalScroll = _isDomLayout(gos, 'normal');

        comp.setAlwaysVerticalScrollClass(cssClass, show);

        if (show) {
            return true;
        }

        if (!allowVerticalScroll) {
            return false;
        }

        const bodyViewportHeight = this.getBodyViewportHeight(this.eGridViewport.clientHeight);
        const rowContainerHeight = this.beans.rowContainerHeight.uiContainerHeight ?? 0;
        return rowContainerHeight > bodyViewportHeight;
    }

    private setupRowAnimationCssClass(): void {
        const { rowContainerHeight, environment } = this.beans;
        let initialSizeMeasurementComplete = environment.sizesMeasured;

        const updateAnimationClass = () => {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            const animateRows =
                initialSizeMeasurementComplete && _isAnimateRows(this.gos) && !rowContainerHeight.stretching;
            const animateRowsCssClass: RowAnimationCssClasses = animateRows
                ? 'ag-row-animation'
                : 'ag-row-no-animation';
            this.comp.setRowAnimationCssOnBodyViewport(animateRowsCssClass, animateRows);
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
            scroll: () => this.pinnedRowContainerRendererFeature.refreshViewportPinned(),
        });

        const onStickyWheel = this.onStickyWheel.bind(this);

        for (const container of [eTop, eBottom]) {
            this.addManagedElementListeners(container, { wheel: onStickyWheel });
        }

        const onHorizontalWheel = this.onHorizontalWheel.bind(this);
        this.ctrlsSvc.whenReady(this, () => {
            for (const container of ['scrollingCenter', 'pinnedTopCenter', 'pinnedBottomCenter'] as const) {
                const rowContainer = this.ctrlsSvc.get(container);
                if (!rowContainer) {
                    continue;
                }
                this.addManagedElementListeners(rowContainer.eContainer, {
                    wheel: onHorizontalWheel,
                });
            }
        });

        // allow mouseWheel on the Full Width Container to Scroll the Viewport
        this.addFullWidthContainerWheelListener();
    }

    private addFullWidthContainerWheelListener(): void {
        this.addManagedElementListeners(this.eFullWidthContainer, {
            wheel: (e: WheelEvent) => this.onFullWidthContainerWheel(e),
        });
    }

    private onFullWidthContainerWheel(e: WheelEvent): void {
        const { deltaX, deltaY, shiftKey } = e;
        const isHorizontalScroll = shiftKey || Math.abs(deltaX) > Math.abs(deltaY);

        if (isHorizontalScroll && _isEventFromThisInstance(this.beans, e)) {
            this.scrollGridBodyToMatchEvent(e);
        }
    }

    private onStickyWheel(e: WheelEvent): void {
        const { deltaY } = e;

        const scrolled = this.scrollVertically(deltaY);
        if (scrolled > 0) {
            e.preventDefault();
        }
    }

    private onHorizontalWheel(e: WheelEvent): void {
        const { deltaX, deltaY, shiftKey } = e;

        const isHorizontalScroll = shiftKey || Math.abs(deltaX) > Math.abs(deltaY);

        if (!isHorizontalScroll) {
            return;
        }

        this.scrollGridBodyToMatchEvent(e);
    }

    private scrollGridBodyToMatchEvent(e: WheelEvent): void {
        const { deltaX, deltaY } = e;
        e.preventDefault();
        // if it is a horizontal scroll and deltaX is zero,
        // it means the OS has flipped the axis and it's using deltaY
        this.eGridViewport.scrollBy({ left: deltaX || deltaY });
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
        const advancedFilterHeaderHeight = this.filterManager?.getHeaderHeight() ?? 0;

        const { environment } = this.beans;
        const borderAdjustment = environment.getPinnedRowBorderWidth() - environment.getRowBorderWidth();

        const normalisedPinnedTopHeight = (pinnedTopHeight ?? 0) + (pinnedTopHeight ? borderAdjustment : 0);
        const normalisedPinnedBottomHeight = (pinnedBottomHeight ?? 0) + (pinnedBottomHeight ? borderAdjustment : 0);
        this.topPinnedRowsHeight = normalisedPinnedTopHeight;
        this.bottomPinnedRowsHeight = normalisedPinnedBottomHeight;

        this.comp.setPinnedSection('top', {
            height: normalisedPinnedTopHeight + advancedFilterHeaderHeight,
            invisible: normalisedPinnedTopHeight <= 0,
        });
        this.comp.setPinnedSection('bottom', {
            height: normalisedPinnedBottomHeight,
            invisible: normalisedPinnedBottomHeight <= 0,
        });
        this.pinnedRowContainerRendererFeature.refresh();
    }

    public getPinnedRowContainerRendererFeature(): IPinnedRowContainerRendererFeature {
        return this.pinnedRowContainerRendererFeature;
    }

    public setStickyTopHeight(height: number = 0): void {
        if (this.stickyTopHeight === height) {
            return;
        }
        this.stickyTopHeight = height;
    }

    public setStickyBottomHeight(height: number = 0): void {
        if (this.stickyBottomHeight === height) {
            return;
        }
        this.comp.setStickyBottomHeight(`${height}px`);
        this.stickyBottomHeight = height;
        this.eventSvc.dispatchEvent({
            type: 'stickyBottomOffsetChanged',
            offset: height,
        });
    }

    private setStickyWidth(vScrollVisible: boolean) {
        if (!vScrollVisible) {
            this.comp.setStickyBottomWidth('100%');
        } else {
            const scrollbarWidth = this.getVerticalScrollbarWidth();
            this.comp.setStickyBottomWidth(`calc(100% - ${scrollbarWidth}px)`);
        }
    }

    public getHeaderRowsOffset(): number {
        const gridHeaderCtrl = this.ctrlsSvc.get('gridHeaderCtrl');
        const headerHeight = gridHeaderCtrl?.headerHeight ?? 0;
        const advancedFilterHeaderHeight = this.filterManager?.getHeaderHeight() ?? 0;
        return advancedFilterHeaderHeight + headerHeight;
    }

    public getTopPinnedRowsOffset(): number {
        return this.getHeaderRowsOffset() + this.topPinnedRowsHeight;
    }

    public getBodyViewportHeight(totalViewportHeight: number): number {
        const bodyHeight = totalViewportHeight - this.getTopPinnedRowsOffset() - this.bottomPinnedRowsHeight;
        return Math.max(0, bodyHeight);
    }

    public getVerticalScrollbarWidth(): number {
        const { scrollVisibleSvc } = this;
        if (!scrollVisibleSvc.verticalScrollShowing) {
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
