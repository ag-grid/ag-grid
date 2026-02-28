import { _isElementChildOfClass, _requestAnimationFrame } from '../agStack/utils/dom';
import { _isEventFromThisInstance } from '../agStack/utils/event';
import type { ColumnModel } from '../columns/columnModel';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { RowResizeEndedEvent, RowResizeStartedEvent } from '../events';
import type { FilterManager } from '../filter/filterManager';
import { _isAnimateRows, _isDomLayout } from '../gridOptionsUtils';
import type { IColsService } from '../interfaces/iColsService';
import type { IPinnedRowModel } from '../interfaces/iPinnedRowModel';
import type { LayoutView } from '../styling/layoutFeature';
import { LayoutFeature } from '../styling/layoutFeature';
import type { PopupService } from '../widgets/popupService';
import { GridBodyScrollFeature } from './gridBodyScrollFeature';
import { _getRowContainerClass } from './rowContainer/rowContainerCtrl';
import type { ScrollVisibleService } from './scrollVisibleService';
import { _shouldShowVerticalScroll } from './scrollbarVisibilityHelper';

export type RowAnimationCssClasses = 'ag-row-animation' | 'ag-row-no-animation';

export const CSS_CLASS_FORCE_VERTICAL_SCROLL = 'ag-force-vertical-scroll';

const CSS_CLASS_CELL_SELECTABLE = 'ag-selectable';
const CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';

export interface IGridBodyComp extends LayoutView {
    setColumnMovingCss(cssClass: string, on: boolean): void;
    setCellSelectableCss(cssClass: string | null, on: boolean): void;
    setTopHeight(height: number): void;
    setTopInvisible(invisible: boolean): void;
    setBottomHeight(height: number): void;
    setBottomInvisible(invisible: boolean): void;
    setStickyBottomHeight(height: string): void;
    setStickyBottomBottom(offsetBottom: string): void;
    setStickyBottomWidth(width: string): void;
    setColumnCount(count: number): void;
    setRowCount(count: number): void;
    setRowAnimationCssOnBodyViewport(cssClass: RowAnimationCssClasses, animate: boolean): void;
    setAlwaysVerticalScrollClass(cssClass: string | null, on: boolean): void;
    registerBodyViewportResizeListener(listener: () => void): void;
    setBodyViewportWidth(width: string): void;
    setGridScrollableAreaWidth(width: string): void;
    setGridRootRole(role: 'grid' | 'treegrid'): void;
}

export class GridBodyCtrl extends BeanStub {
    private ctrlsSvc: CtrlsService;
    private colModel: ColumnModel;
    private scrollVisibleSvc: ScrollVisibleService;
    private rowGroupColsSvc?: IColsService;
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
    private eTop: HTMLElement;
    private eBottom: HTMLElement;

    private eFullWidthContainer: HTMLElement;
    private topPinnedRowsHeight = 0;
    private bottomPinnedRowsHeight = 0;

    public stickyTopHeight: number = 0;
    public stickyBottomHeight: number = 0;

    public scrollFeature: GridBodyScrollFeature;

    public setComp(
        comp: IGridBodyComp,
        eGridBody: HTMLElement,
        eGridViewport: HTMLElement,
        eTop: HTMLElement,
        eBottom: HTMLElement
    ): void {
        this.comp = comp;
        this.eGridBody = eGridBody;
        this.eGridViewport = eGridViewport;
        this.eTop = eTop;
        this.eBottom = eBottom;

        this.eFullWidthContainer = eGridViewport.querySelector(
            `.${_getRowContainerClass('scrollingFullWidth')}`
        ) as HTMLElement;

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
        this.updateScrollingClasses();

        this.filterManager?.setupAdvFilterHeaderComp(eTop);

        this.ctrlsSvc.register('gridBodyCtrl', this);
    }

    private addEventListeners(): void {
        const setPinnedRowsHeights = this.setPinnedRowsHeights.bind(this);
        const setGridRootRole = this.setGridRootRole.bind(this);
        const toggleRowResizeStyle = this.toggleRowResizeStyles.bind(this);

        this.addManagedEventListeners({
            gridColumnsChanged: this.onGridColumnsChanged.bind(this),
            displayedColumnsWidthChanged: this.updateScrollableAreaWidth.bind(this),
            leftPinnedWidthChanged: this.updateScrollableAreaWidth.bind(this),
            rightPinnedWidthChanged: this.updateScrollableAreaWidth.bind(this),
            scrollVisibilityChanged: this.onScrollVisibilityChanged.bind(this),
            scrollGapChanged: this.updateScrollingClasses.bind(this),
            pinnedRowDataChanged: setPinnedRowsHeights,
            pinnedHeightChanged: setPinnedRowsHeights,
            pinnedRowsChanged: setPinnedRowsHeights,
            columnRowGroupChanged: setGridRootRole,
            columnPivotChanged: setGridRootRole,
            rowResizeStarted: toggleRowResizeStyle,
            rowResizeEnded: toggleRowResizeStyle,
        });

        this.addManagedPropertyListener('treeData', setGridRootRole);
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
        this.setStickyBottomOffsetBottom();
        this.updateScrollableAreaWidth();
        _requestAnimationFrame(this.beans, () => this.comp.setBodyViewportWidth('100%'));

        this.updateScrollingClasses();
    }

    private updateScrollableAreaWidth(): void {
        const { visibleCols } = this.beans;
        const width =
            visibleCols.bodyWidth +
            visibleCols.getLeftStickyColumnContainerWidth() +
            visibleCols.getRightStickyColumnContainerWidth() +
            this.getVerticalScrollbarWidth();
        this.comp.setGridScrollableAreaWidth(`${Math.max(width, 1)}px`);
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

    public registerBodyViewportResizeListener(listener: () => void): void {
        this.comp.registerBodyViewportResizeListener(listener);
    }

    public isVerticalScrollShowing(): boolean {
        const { gos, comp, ctrlsSvc } = this;
        const show = gos.get('alwaysShowVerticalScroll');

        const cssClass = show ? CSS_CLASS_FORCE_VERTICAL_SCROLL : null;
        const allowVerticalScroll = _isDomLayout(gos, 'normal');

        comp.setAlwaysVerticalScrollClass(cssClass, show);
        const horizontalScrollElement = ctrlsSvc.get('scrollingCenter')?.eViewport;
        const hScrollEl = ctrlsSvc.get('fakeHScrollComp')?.getGui();
        const vScrollEl = ctrlsSvc.get('fakeVScrollComp')?.getGui();

        return (
            show ||
            (allowVerticalScroll &&
                _shouldShowVerticalScroll(this.eGridViewport, horizontalScrollElement, undefined, vScrollEl, hScrollEl))
        );
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
        const {
            pinnedRowModel,
            beans: { environment },
        } = this;

        const pinnedTopHeight = pinnedRowModel?.getPinnedTopTotalHeight();
        const pinnedBottomHeight = pinnedRowModel?.getPinnedBottomTotalHeight();

        // We need to account for the row border and the pinned row borders.
        // The pinned rows container has box-sizing: border-box, so its border is
        // part of its total height. Therefore we add it on to the total pinned row heights.
        // However, we don't want a double border on the final row of the pinned container,
        // we instead want the pinned row border to "replace" the row border. As such, we
        // subtract the row border width from the pinned border width to arrive at the final
        // additional height to add to the container.
        const pinnedBorderWidth = environment.getPinnedRowBorderWidth();
        const rowBorderWidth = environment.getRowBorderWidth();
        const additionalHeight = pinnedBorderWidth - rowBorderWidth;

        // We only add the border-related adjustment if there's actually pinned rows visible
        const normalisedPinnedTopHeight = !pinnedTopHeight ? 0 : additionalHeight + pinnedTopHeight;
        const normalisedPinnedBottomHeight = !pinnedBottomHeight ? 0 : additionalHeight + pinnedBottomHeight;
        this.topPinnedRowsHeight = normalisedPinnedTopHeight;
        this.bottomPinnedRowsHeight = normalisedPinnedBottomHeight;

        this.comp.setTopHeight(normalisedPinnedTopHeight);
        this.comp.setBottomHeight(normalisedPinnedBottomHeight);
        this.comp.setTopInvisible(normalisedPinnedTopHeight <= 0);
        this.comp.setBottomInvisible(normalisedPinnedBottomHeight <= 0);
        this.setStickyBottomOffsetBottom();
    }

    public setStickyTopHeight(height: number = 0): void {
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
        const headerBorder = headerHeight > 0 ? this.beans.environment.getHeaderRowBorderWidth() : 0;
        return headerHeight + headerBorder;
    }

    public getTopPinnedRowsOffset(): number {
        return this.getHeaderRowsOffset() + this.topPinnedRowsHeight;
    }

    public getBodyViewportHeight(totalViewportHeight: number): number {
        const bodyHeight = totalViewportHeight - this.getTopPinnedRowsOffset() - this.bottomPinnedRowsHeight;
        return Math.max(0, bodyHeight);
    }

    public getVerticalScrollbarWidth(): number {
        if (!this.scrollVisibleSvc.verticalScrollShowing) {
            return 0;
        }

        const fakeVScrollComp = this.ctrlsSvc.get('fakeVScrollComp');
        const fakeScrollbarWidth = fakeVScrollComp?.getGui().offsetWidth ?? 0;
        if (fakeScrollbarWidth > 0) {
            return fakeScrollbarWidth;
        }

        const scrollbarWidth = this.scrollVisibleSvc.getScrollbarWidth() || 0;
        return scrollbarWidth > 0 ? scrollbarWidth : 16;
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
        return scrollbarWidth > 0 ? scrollbarWidth : 16;
    }

    private setStickyBottomOffsetBottom(): void {
        this.comp.setStickyBottomBottom('0px');
    }
}
