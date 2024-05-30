import type { ColumnModel } from '../columns/columnModel';
import type { ColumnSizeService, ISizeColumnsToFitParams } from '../columns/columnSizeService';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { DragAndDropService } from '../dragAndDrop/dragAndDropService';
import type { Environment } from '../environment';
import { Events } from '../eventKeys';
import type { FilterManager } from '../filter/filterManager';
import type { HeaderNavigationService } from '../headerRendering/common/headerNavigationService';
import type { IRowModel } from '../interfaces/iRowModel';
import type { AnimationFrameService } from '../misc/animationFrameService';
import type { EventShowContextMenuParams, MenuService } from '../misc/menuService';
import type { PinnedRowModel } from '../pinnedRowModel/pinnedRowModel';
import type { RowContainerHeightService } from '../rendering/rowContainerHeightService';
import type { RowRenderer } from '../rendering/rowRenderer';
import type { LayoutView } from '../styling/layoutFeature';
import { LayoutFeature } from '../styling/layoutFeature';
import { _getTabIndex, _isIOSUserAgent, _isInvisibleScrollbar } from '../utils/browser';
import { _getInnerWidth, _isElementChildOfClass, _isVerticalScrollShowing } from '../utils/dom';
import type { PopupService } from '../widgets/popupService';
import type { LongTapEvent } from '../widgets/touchListener';
import { TouchListener } from '../widgets/touchListener';
import { GridBodyScrollFeature } from './gridBodyScrollFeature';
import type { MouseEventService } from './mouseEventService';
import { RowDragFeature } from './rowDragFeature';
import type { ScrollVisibleService } from './scrollVisibleService';

export enum RowAnimationCssClasses {
    ANIMATION_ON = 'ag-row-animation',
    ANIMATION_OFF = 'ag-row-no-animation',
}

export const CSS_CLASS_FORCE_VERTICAL_SCROLL = 'ag-force-vertical-scroll';

const CSS_CLASS_CELL_SELECTABLE = 'ag-selectable';
const CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';

export interface IGridBodyComp extends LayoutView {
    setColumnMovingCss(cssClass: string, on: boolean): void;
    setCellSelectableCss(cssClass: string | null, on: boolean): void;
    setTopHeight(height: number): void;
    setTopDisplay(display: string): void;
    setBottomHeight(height: number): void;
    setBottomDisplay(display: string): void;
    setStickyTopHeight(height: string): void;
    setStickyTopTop(offsetTop: string): void;
    setStickyTopWidth(width: string): void;
    setStickyBottomHeight(height: string): void;
    setStickyBottomBottom(offsetBottom: string): void;
    setStickyBottomWidth(width: string): void;
    setColumnCount(count: number): void;
    setRowCount(count: number): void;
    setRowAnimationCssOnBodyViewport(cssClass: string, animate: boolean): void;
    setAlwaysVerticalScrollClass(cssClass: string | null, on: boolean): void;
    setPinnedTopBottomOverflowY(overflow: 'scroll' | 'hidden'): void;
    registerBodyViewportResizeListener(listener: () => void): void;
    setBodyViewportWidth(width: string): void;
}

export class GridBodyCtrl extends BeanStub {
    private animationFrameService: AnimationFrameService;
    private rowContainerHeightService: RowContainerHeightService;
    private ctrlsService: CtrlsService;
    private columnModel: ColumnModel;
    private columnSizeService: ColumnSizeService;
    private scrollVisibleService: ScrollVisibleService;
    private menuService: MenuService;
    private headerNavigationService: HeaderNavigationService;
    private dragAndDropService: DragAndDropService;
    private pinnedRowModel: PinnedRowModel;
    private rowRenderer: RowRenderer;
    private popupService: PopupService;
    private mouseEventService: MouseEventService;
    private rowModel: IRowModel;
    private filterManager?: FilterManager;
    private environment: Environment;

    public wireBeans(beans: BeanCollection): void {
        this.animationFrameService = beans.animationFrameService;
        this.rowContainerHeightService = beans.rowContainerHeightService;
        this.ctrlsService = beans.ctrlsService;
        this.columnModel = beans.columnModel;
        this.columnSizeService = beans.columnSizeService;
        this.scrollVisibleService = beans.scrollVisibleService;
        this.menuService = beans.menuService;
        this.headerNavigationService = beans.headerNavigationService;
        this.dragAndDropService = beans.dragAndDropService;
        this.pinnedRowModel = beans.pinnedRowModel;
        this.rowRenderer = beans.rowRenderer;
        this.popupService = beans.popupService;
        this.mouseEventService = beans.mouseEventService;
        this.rowModel = beans.rowModel;
        this.filterManager = beans.filterManager;
        this.environment = beans.environment;
    }

    private comp: IGridBodyComp;
    private eGridBody: HTMLElement;
    private eBodyViewport: HTMLElement;
    private eTop: HTMLElement;
    private eBottom: HTMLElement;
    private eStickyTop: HTMLElement;
    private stickyTopHeight: number = 0;
    private eStickyBottom: HTMLElement;
    private stickyBottomHeight: number = 0;

    private bodyScrollFeature: GridBodyScrollFeature;
    private rowDragFeature: RowDragFeature;

    public getScrollFeature(): GridBodyScrollFeature {
        return this.bodyScrollFeature;
    }

    public getBodyViewportElement(): HTMLElement {
        return this.eBodyViewport;
    }

    public setComp(
        comp: IGridBodyComp,
        eGridBody: HTMLElement,
        eBodyViewport: HTMLElement,
        eTop: HTMLElement,
        eBottom: HTMLElement,
        eStickyTop: HTMLElement,
        eStickyBottom: HTMLElement
    ): void {
        this.comp = comp;
        this.eGridBody = eGridBody;
        this.eBodyViewport = eBodyViewport;
        this.eTop = eTop;
        this.eBottom = eBottom;
        this.eStickyTop = eStickyTop;
        this.eStickyBottom = eStickyBottom;

        this.setCellTextSelection(this.gos.get('enableCellTextSelection'));
        this.addManagedPropertyListener('enableCellTextSelection', (props) =>
            this.setCellTextSelection(props.currentValue)
        );

        this.createManagedBean(new LayoutFeature(this.comp));
        this.bodyScrollFeature = this.createManagedBean(new GridBodyScrollFeature(this.eBodyViewport));
        this.addRowDragListener();

        this.setupRowAnimationCssClass();

        this.addEventListeners();
        this.addFocusListeners([eTop, eBodyViewport, eBottom, eStickyTop, eStickyBottom]);
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
        this.setFloatingHeights();
        this.disableBrowserDragging();
        this.addStopEditingWhenGridLosesFocus();

        this.filterManager?.setupAdvancedFilterHeaderComp(eTop);

        this.ctrlsService.register('gridBodyCtrl', this);
    }

    public getComp(): IGridBodyComp {
        return this.comp;
    }

    private addEventListeners(): void {
        this.addManagedListener(
            this.eventService,
            Events.EVENT_GRID_COLUMNS_CHANGED,
            this.onGridColumnsChanged.bind(this)
        );
        this.addManagedListener(
            this.eventService,
            Events.EVENT_SCROLL_VISIBILITY_CHANGED,
            this.onScrollVisibilityChanged.bind(this)
        );
        this.addManagedListener(
            this.eventService,
            Events.EVENT_PINNED_ROW_DATA_CHANGED,
            this.setFloatingHeights.bind(this)
        );
        this.addManagedListener(
            this.eventService,
            Events.EVENT_PINNED_HEIGHT_CHANGED,
            this.setFloatingHeights.bind(this)
        );
        this.addManagedListener(
            this.eventService,
            Events.EVENT_HEADER_HEIGHT_CHANGED,
            this.onHeaderHeightChanged.bind(this)
        );
    }

    private addFocusListeners(elements: HTMLElement[]): void {
        elements.forEach((element) => {
            this.addManagedListener(element, 'focusin', (e: FocusEvent) => {
                const { target } = e;
                // element being focused is nested?
                const isFocusedElementNested = _isElementChildOfClass(target as HTMLElement, 'ag-root', element);

                element.classList.toggle('ag-has-focus', !isFocusedElementNested);
            });

            this.addManagedListener(element, 'focusout', (e: FocusEvent) => {
                const { target, relatedTarget } = e;
                const gridContainRelatedTarget = element.contains(relatedTarget as HTMLElement);
                const isNestedRelatedTarget = _isElementChildOfClass(relatedTarget as HTMLElement, 'ag-root', element);
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
            });
        });
    }

    // used by ColumnAnimationService
    public setColumnMovingCss(moving: boolean): void {
        this.comp.setColumnMovingCss(CSS_CLASS_COLUMN_MOVING, moving);
    }

    public setCellTextSelection(selectable: boolean = false): void {
        this.comp.setCellSelectableCss(CSS_CLASS_CELL_SELECTABLE, selectable);
    }

    private onScrollVisibilityChanged(): void {
        const visible = this.scrollVisibleService.isVerticalScrollShowing();
        this.setVerticalScrollPaddingVisible(visible);
        this.setStickyWidth(visible);
        this.setStickyBottomOffsetBottom();

        const scrollbarWidth = visible ? this.gos.getScrollbarWidth() || 0 : 0;
        const pad = _isInvisibleScrollbar() ? 16 : 0;
        const width = `calc(100% + ${scrollbarWidth + pad}px)`;

        this.animationFrameService.requestAnimationFrame(() => this.comp.setBodyViewportWidth(width));
    }

    private onGridColumnsChanged(): void {
        const columns = this.columnModel.getCols();
        this.comp.setColumnCount(columns.length);
    }

    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
    private disableBrowserDragging(): void {
        this.addManagedListener(this.eGridBody, 'dragstart', (event: MouseEvent) => {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
    }

    private addStopEditingWhenGridLosesFocus(): void {
        if (!this.gos.get('stopEditingWhenCellsLoseFocus')) {
            return;
        }

        const focusOutListener = (event: FocusEvent): void => {
            // this is the element the focus is moving to
            const elementWithFocus = event.relatedTarget as HTMLElement;

            if (_getTabIndex(elementWithFocus) === null) {
                this.rowRenderer.stopEditing();
                return;
            }

            let clickInsideGrid =
                // see if click came from inside the viewports
                viewports.some((viewport) => viewport.contains(elementWithFocus)) &&
                // and also that it's not from a detail grid
                this.mouseEventService.isElementInThisGrid(elementWithFocus);

            if (!clickInsideGrid) {
                const popupService = this.popupService;

                clickInsideGrid =
                    popupService.getActivePopups().some((popup) => popup.contains(elementWithFocus)) ||
                    popupService.isElementWithinCustomPopup(elementWithFocus);
            }

            if (!clickInsideGrid) {
                this.rowRenderer.stopEditing();
            }
        };

        const viewports = [this.eBodyViewport, this.eBottom, this.eTop, this.eStickyTop, this.eStickyBottom];

        viewports.forEach((viewport) => this.addManagedListener(viewport, 'focusout', focusOutListener));
    }

    public updateRowCount(): void {
        const headerCount =
            this.headerNavigationService.getHeaderRowCount() + (this.filterManager?.getHeaderRowCount() ?? 0);

        const rowCount = this.rowModel.isLastRowIndexKnown() ? this.rowModel.getRowCount() : -1;
        const total = rowCount === -1 ? -1 : headerCount + rowCount;

        this.comp.setRowCount(total);
    }

    public registerBodyViewportResizeListener(listener: () => void): void {
        this.comp.registerBodyViewportResizeListener(listener);
    }

    public setVerticalScrollPaddingVisible(visible: boolean): void {
        const overflowY = visible ? 'scroll' : 'hidden';
        this.comp.setPinnedTopBottomOverflowY(overflowY);
    }

    public isVerticalScrollShowing(): boolean {
        const show = this.gos.get('alwaysShowVerticalScroll');
        const cssClass = show ? CSS_CLASS_FORCE_VERTICAL_SCROLL : null;
        const allowVerticalScroll = this.gos.isDomLayout('normal');
        this.comp.setAlwaysVerticalScrollClass(cssClass, show);
        return show || (allowVerticalScroll && _isVerticalScrollShowing(this.eBodyViewport));
    }

    private setupRowAnimationCssClass(): void {
        let initialSizeMeasurementComplete = this.environment.hasMeasuredSizes();

        const updateAnimationClass = () => {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            const animateRows =
                initialSizeMeasurementComplete &&
                this.gos.isAnimateRows() &&
                !this.rowContainerHeightService.isStretching();
            const animateRowsCssClass = animateRows
                ? RowAnimationCssClasses.ANIMATION_ON
                : RowAnimationCssClasses.ANIMATION_OFF;
            this.comp.setRowAnimationCssOnBodyViewport(animateRowsCssClass, animateRows);
        };

        updateAnimationClass();

        this.addManagedListener(this.eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, updateAnimationClass);
        this.addManagedPropertyListener('animateRows', updateAnimationClass);

        this.addManagedListener(this.eventService, Events.EVENT_GRID_STYLES_CHANGED, () => {
            if (!initialSizeMeasurementComplete && this.environment.hasMeasuredSizes()) {
                initialSizeMeasurementComplete = true;
                updateAnimationClass();
            }
        });
    }

    public getGridBodyElement(): HTMLElement {
        return this.eGridBody;
    }

    private addBodyViewportListener(): void {
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        const listener = this.onBodyViewportContextMenu.bind(this);
        this.addManagedListener(this.eBodyViewport, 'contextmenu', listener);
        this.mockContextMenuForIPad(listener);

        this.addManagedListener(this.eBodyViewport, 'wheel', this.onBodyViewportWheel.bind(this));
        this.addManagedListener(this.eStickyTop, 'wheel', this.onStickyWheel.bind(this));
        this.addManagedListener(this.eStickyBottom, 'wheel', this.onStickyWheel.bind(this));

        // allow mouseWheel on the Full Width Container to Scroll the Viewport
        this.addFullWidthContainerWheelListener();
    }

    private addFullWidthContainerWheelListener(): void {
        const fullWidthContainer = this.eBodyViewport.querySelector('.ag-full-width-container');
        const eCenterColsViewport = this.eBodyViewport.querySelector('.ag-center-cols-viewport');

        if (fullWidthContainer && eCenterColsViewport) {
            this.addManagedListener(fullWidthContainer, 'wheel', (e: WheelEvent) =>
                this.onFullWidthContainerWheel(e, eCenterColsViewport)
            );
        }
    }

    private onFullWidthContainerWheel(e: WheelEvent, eCenterColsViewport: Element): void {
        if (!e.deltaX || Math.abs(e.deltaY) > Math.abs(e.deltaX) || !this.mouseEventService.isEventFromThisGrid(e)) {
            return;
        }

        e.preventDefault();
        eCenterColsViewport.scrollBy({ left: e.deltaX });
    }

    private onBodyViewportContextMenu(mouseEvent?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent): void {
        if (!mouseEvent && !touchEvent) {
            return;
        }

        if (this.gos.get('preventDefaultOnContextMenu')) {
            const event = (mouseEvent || touchEvent)!;
            event.preventDefault();
        }

        const { target } = (mouseEvent || touch)!;

        if (target === this.eBodyViewport || target === this.ctrlsService.get('center').getViewportElement()) {
            // show it
            this.menuService.showContextMenu({
                mouseEvent,
                touchEvent,
                value: null,
                anchorToElement: this.eGridBody,
            } as EventShowContextMenuParams);
        }
    }

    private mockContextMenuForIPad(
        listener: (mouseListener?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent) => void
    ): void {
        // we do NOT want this when not in iPad
        if (!_isIOSUserAgent()) {
            return;
        }

        const touchListener = new TouchListener(this.eBodyViewport);
        const longTapListener = (event: LongTapEvent) => {
            listener(undefined, event.touchStart, event.touchEvent);
        };

        this.addManagedListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(() => touchListener.destroy());
    }

    private onBodyViewportWheel(e: WheelEvent): void {
        if (!this.gos.get('suppressScrollWhenPopupsAreOpen')) {
            return;
        }

        if (this.popupService.hasAnchoredPopup()) {
            e.preventDefault();
        }
    }

    private onStickyWheel(e: WheelEvent): void {
        e.preventDefault();

        if (e.offsetY) {
            this.scrollVertically(e.deltaY);
        }
    }

    public getGui(): HTMLElement {
        return this.eGridBody;
    }

    // called by rowDragFeature
    public scrollVertically(pixels: number): number {
        const oldScrollPosition = this.eBodyViewport.scrollTop;

        this.bodyScrollFeature.setVerticalScrollPosition(oldScrollPosition + pixels);
        return this.eBodyViewport.scrollTop - oldScrollPosition;
    }

    private addRowDragListener(): void {
        this.rowDragFeature = this.createManagedBean(new RowDragFeature(this.eBodyViewport));
        this.dragAndDropService.addDropTarget(this.rowDragFeature);
    }

    public getRowDragFeature(): RowDragFeature {
        return this.rowDragFeature;
    }

    private setFloatingHeights(): void {
        const { pinnedRowModel } = this;

        const floatingTopHeight = pinnedRowModel.getPinnedTopTotalHeight();
        const floatingBottomHeight = pinnedRowModel.getPinnedBottomTotalHeight();
        this.comp.setTopHeight(floatingTopHeight);
        this.comp.setBottomHeight(floatingBottomHeight);
        this.comp.setTopDisplay(floatingTopHeight ? 'inherit' : 'none');
        this.comp.setBottomDisplay(floatingBottomHeight ? 'inherit' : 'none');
        this.setStickyTopOffsetTop();
        this.setStickyBottomOffsetBottom();
    }

    public setStickyTopHeight(height: number = 0): void {
        // console.log('setting sticky top height ' + height);
        this.comp.setStickyTopHeight(`${height}px`);
        this.stickyTopHeight = height;
    }

    public getStickyTopHeight(): number {
        return this.stickyTopHeight;
    }

    public setStickyBottomHeight(height: number = 0): void {
        this.comp.setStickyBottomHeight(`${height}px`);
        this.stickyBottomHeight = height;
    }

    public getStickyBottomHeight(): number {
        return this.stickyBottomHeight;
    }

    private setStickyWidth(vScrollVisible: boolean) {
        if (!vScrollVisible) {
            this.comp.setStickyTopWidth('100%');
            this.comp.setStickyBottomWidth('100%');
        } else {
            const scrollbarWidth = this.gos.getScrollbarWidth();
            this.comp.setStickyTopWidth(`calc(100% - ${scrollbarWidth}px)`);
            this.comp.setStickyBottomWidth(`calc(100% - ${scrollbarWidth}px)`);
        }
    }

    private onHeaderHeightChanged(): void {
        this.setStickyTopOffsetTop();
    }

    private setStickyTopOffsetTop(): void {
        const headerCtrl = this.ctrlsService.get('gridHeaderCtrl');
        const headerHeight = headerCtrl.getHeaderHeight() + (this.filterManager?.getHeaderHeight() ?? 0);
        const pinnedTopHeight = this.pinnedRowModel.getPinnedTopTotalHeight();

        let height = 0;

        if (headerHeight > 0) {
            height += headerHeight;
        }
        if (pinnedTopHeight > 0) {
            height += pinnedTopHeight;
        }
        if (height > 0) {
            height += 1;
        }

        this.comp.setStickyTopTop(`${height}px`);
    }

    private setStickyBottomOffsetBottom(): void {
        const pinnedBottomHeight = this.pinnedRowModel.getPinnedBottomTotalHeight();
        const hScrollShowing = this.scrollVisibleService.isHorizontalScrollShowing();
        const scrollbarWidth = hScrollShowing ? this.gos.getScrollbarWidth() || 0 : 0;
        const height = pinnedBottomHeight + scrollbarWidth;

        this.comp.setStickyBottomBottom(`${height}px`);
    }

    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    public sizeColumnsToFit(params?: ISizeColumnsToFitParams, nextTimeout?: number) {
        const removeScrollWidth = this.isVerticalScrollShowing();
        const scrollWidthToRemove = removeScrollWidth ? this.gos.getScrollbarWidth() : 0;
        // bodyViewportWidth should be calculated from eGridBody, not eBodyViewport
        // because we change the width of the bodyViewport to hide the real browser scrollbar
        const bodyViewportWidth = _getInnerWidth(this.eGridBody);
        const availableWidth = bodyViewportWidth - scrollWidthToRemove;

        if (availableWidth > 0) {
            this.columnSizeService.sizeColumnsToFit(availableWidth, 'sizeColumnsToFit', false, params);
            return;
        }

        if (nextTimeout === undefined) {
            window.setTimeout(() => {
                this.sizeColumnsToFit(params, 100);
            }, 0);
        } else if (nextTimeout === 100) {
            window.setTimeout(() => {
                this.sizeColumnsToFit(params, 500);
            }, 100);
        } else if (nextTimeout === 500) {
            window.setTimeout(() => {
                this.sizeColumnsToFit(params, -1);
            }, 500);
        } else {
            console.warn(
                'AG Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                    'zero width, maybe the grid is not visible yet on the screen?'
            );
        }
    }

    // + rangeService
    public addScrollEventListener(listener: () => void): void {
        this.eBodyViewport.addEventListener('scroll', listener, { passive: true });
    }

    // + focusService
    public removeScrollEventListener(listener: () => void): void {
        this.eBodyViewport.removeEventListener('scroll', listener);
    }
}
