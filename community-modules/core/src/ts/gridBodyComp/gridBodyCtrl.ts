import { BeanStub } from "../context/beanStub";
import { Autowired, Optional } from "../context/context";
import { LayoutFeature, LayoutView } from "../styling/layoutFeature";
import { Events } from "../eventKeys";
import { RowContainerHeightService } from "../rendering/rowContainerHeightService";
import { CtrlsService } from "../ctrlsService";
import { ColumnModel, ISizeColumnsToFitParams } from "../columns/columnModel";
import { ScrollVisibleService } from "./scrollVisibleService";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { GridBodyScrollFeature } from "./gridBodyScrollFeature";
import { getInnerWidth, isElementChildOfClass, isVerticalScrollShowing } from "../utils/dom";
import { HeaderNavigationService } from "../headerRendering/common/headerNavigationService";
import { RowDragFeature } from "./rowDragFeature";
import { DragAndDropService } from "../dragAndDrop/dragAndDropService";
import { PinnedRowModel } from "../pinnedRowModel/pinnedRowModel";
import { getTabIndex, isInvisibleScrollbar, isIOSUserAgent } from "../utils/browser";
import { RowRenderer } from "../rendering/rowRenderer";
import { PopupService } from "../widgets/popupService";
import { MouseEventService } from "./mouseEventService";
import { IRowModel } from "../interfaces/iRowModel";
import { TouchListener, LongTapEvent } from "../widgets/touchListener";

export enum RowAnimationCssClasses {
    ANIMATION_ON = 'ag-row-animation',
    ANIMATION_OFF = 'ag-row-no-animation'
}

export const CSS_CLASS_CELL_SELECTABLE = 'ag-selectable';
export const CSS_CLASS_FORCE_VERTICAL_SCROLL = 'ag-force-vertical-scroll';
export const CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';

export interface IGridBodyComp extends LayoutView {
    setColumnMovingCss(cssClass: string | null, on: boolean): void;
    setCellSelectableCss(cssClass: string | null, on: boolean): void;
    setTopHeight(height: number): void;
    setTopDisplay(display: string): void;
    setBottomHeight(height: number): void;
    setBottomDisplay(display: string): void;
    setStickyTopHeight(height: string): void;
    setStickyTopTop(offsetTop: string): void;
    setStickyTopWidth(width: string): void;
    setColumnCount(count: number): void;
    setRowCount(count: number): void;
    setRowAnimationCssOnBodyViewport(cssClass: string, animate: boolean): void;
    setAlwaysVerticalScrollClass(cssClass: string | null, on: boolean): void;
    setPinnedTopBottomOverflowY(overflow: string): void;
    registerBodyViewportResizeListener(listener: (() => void)): void;
    setBodyViewportWidth(width: string): void;
}

export class GridBodyCtrl extends BeanStub {

    @Autowired('rowContainerHeightService') private rowContainerHeightService: RowContainerHeightService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Autowired('headerNavigationService') private headerNavigationService: HeaderNavigationService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('popupService') public popupService: PopupService;
    @Autowired('mouseEventService') public mouseEventService: MouseEventService;
    @Autowired('rowModel') public rowModel: IRowModel;

    private comp: IGridBodyComp;
    private eGridBody: HTMLElement;
    private eBodyViewport: HTMLElement;
    private eTop: HTMLElement;
    private eBottom: HTMLElement;
    private eStickyTop: HTMLElement;
    private stickyTopHeight: number = 0;

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
        eStickyTop: HTMLElement
    ): void {
        this.comp = comp;
        this.eGridBody = eGridBody;
        this.eBodyViewport = eBodyViewport;
        this.eTop = eTop;
        this.eBottom = eBottom;
        this.eStickyTop = eStickyTop;

        this.setCellTextSelection(this.gridOptionsService.is('enableCellTextSelection'));

        this.createManagedBean(new LayoutFeature(this.comp));
        this.bodyScrollFeature = this.createManagedBean(new GridBodyScrollFeature(this.eBodyViewport));
        this.addRowDragListener();

        this.setupRowAnimationCssClass();

        this.addEventListeners();
        this.addFocusListeners([eTop, eBodyViewport, eBottom, eStickyTop]);
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
        this.setFloatingHeights();
        this.disableBrowserDragging();
        this.addStopEditingWhenGridLosesFocus();

        this.ctrlsService.registerGridBodyCtrl(this);
    }

    public getComp(): IGridBodyComp {
        return this.comp;
    }

    private addEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_HEADER_HEIGHT_CHANGED, this.onHeaderHeightChanged.bind(this));
    }

    private addFocusListeners(elements: HTMLElement[]): void {
        elements.forEach(element => {
            this.addManagedListener(element, 'focusin', (e: FocusEvent) => {
                const { target } = e;
                // element being focused is nested?
                const isFocusedElementNested = isElementChildOfClass(target as HTMLElement, 'ag-root', element);

                element.classList.toggle('ag-has-focus', !isFocusedElementNested);
            });

            this.addManagedListener(element, 'focusout', (e: FocusEvent) => {
                const { target, relatedTarget } = e;
                const gridContainRelatedTarget = element.contains(relatedTarget as HTMLElement);
                const isNestedRelatedTarget = isElementChildOfClass(relatedTarget as HTMLElement, 'ag-root', element);
                const isNestedTarget = isElementChildOfClass(target as HTMLElement, 'ag-root', element);

                // element losing focus belongs to a nested grid,
                // it should not be handled here.
                if (isNestedTarget) { return; }

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
        this.comp.setColumnMovingCss(moving ? CSS_CLASS_COLUMN_MOVING : null, moving);
    }

    public setCellTextSelection(selectable: boolean = false): void {
        const cssClass = selectable ? CSS_CLASS_CELL_SELECTABLE : null;
        this.comp.setCellSelectableCss(cssClass, selectable);
    }

    private onScrollVisibilityChanged(): void {
        const visible = this.scrollVisibleService.isVerticalScrollShowing();
        this.setVerticalScrollPaddingVisible(visible);
        this.setStickyTopWidth(visible);

        const scrollbarWidth = visible ? (this.gridOptionsService.getScrollbarWidth() || 0) : 0;
        const pad = isInvisibleScrollbar() ? 16 : 0;
        const width = `calc(100% + ${scrollbarWidth + pad}px)`;
        this.comp.setBodyViewportWidth(width);
    }

    private onGridColumnsChanged(): void {
        const columns = this.columnModel.getAllGridColumns();
        this.comp.setColumnCount(columns ? columns.length : 0);
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
        if (!this.gridOptionsService.is('stopEditingWhenCellsLoseFocus')) { return; }

        const focusOutListener = (event: FocusEvent): void => {
            // this is the element the focus is moving to
            const elementWithFocus = event.relatedTarget as HTMLElement;

            if (getTabIndex(elementWithFocus) === null) {
                this.rowRenderer.stopEditing();
                return;
            }

            let clickInsideGrid =
                // see if click came from inside the viewports
                viewports.some(viewport => viewport.contains(elementWithFocus))
                // and also that it's not from a detail grid
                && this.mouseEventService.isElementInThisGrid(elementWithFocus);

            if (!clickInsideGrid) {
                const popupService = this.popupService;

                clickInsideGrid =
                    popupService.getActivePopups().some(popup => popup.contains(elementWithFocus)) ||
                    popupService.isElementWithinCustomPopup(elementWithFocus);
            }

            if (!clickInsideGrid) {
                this.rowRenderer.stopEditing();
            }
        };

        const viewports = [this.eBodyViewport, this.eBottom, this.eTop, this.eStickyTop];

        viewports.forEach(viewport => this.addManagedListener(viewport, 'focusout', focusOutListener));
    }

    public updateRowCount(): void {
        const headerCount = this.headerNavigationService.getHeaderRowCount();

        const rowCount = this.rowModel.isLastRowIndexKnown() ? this.rowModel.getRowCount() : -1;
        const total = rowCount === -1 ? -1 : (headerCount + rowCount);

        this.comp.setRowCount(total);
    }

    public registerBodyViewportResizeListener(listener: (() => void)): void {
        this.comp.registerBodyViewportResizeListener(listener);
    }

    public setVerticalScrollPaddingVisible(visible: boolean): void {
        const overflowY = visible ? 'scroll' : 'hidden';
        this.comp.setPinnedTopBottomOverflowY(overflowY);
    }

    public isVerticalScrollShowing(): boolean {
        const show = this.gridOptionsService.is('alwaysShowVerticalScroll');
        const cssClass = show ? CSS_CLASS_FORCE_VERTICAL_SCROLL : null;
        const allowVerticalScroll = this.gridOptionsService.isDomLayout('normal');
        this.comp.setAlwaysVerticalScrollClass(cssClass, show);
        return show || (allowVerticalScroll && isVerticalScrollShowing(this.eBodyViewport));
    }

    private setupRowAnimationCssClass(): void {
        const listener = () => {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            const animateRows = this.gridOptionsService.isAnimateRows() && !this.rowContainerHeightService.isStretching();
            const animateRowsCssClass = animateRows ? RowAnimationCssClasses.ANIMATION_ON : RowAnimationCssClasses.ANIMATION_OFF;
            this.comp.setRowAnimationCssOnBodyViewport(animateRowsCssClass, animateRows);
        };

        listener();

        this.addManagedListener(this.eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, listener);
        this.addManagedPropertyListener('animateRows', listener);
    }

    public getGridBodyElement(): HTMLElement {
        return this.eGridBody;
    }

    private addBodyViewportListener(): void {
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        const listener = (mouseEvent?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent) => {
            if (!mouseEvent && !touchEvent) { return; }

            if (this.gridOptionsService.is('preventDefaultOnContextMenu')) {
                const event = (mouseEvent || touchEvent)!;
                event.preventDefault();
            }

            const { target } = (mouseEvent || touch)!;

            if (target === this.eBodyViewport || target === this.ctrlsService.getCenterRowContainerCtrl().getViewportElement()) {
                // show it
                if (this.contextMenuFactory) {
                    if (mouseEvent) {
                        this.contextMenuFactory.onContextMenu(mouseEvent, null, null, null, null, this.eGridBody);
                    } else if (touchEvent) {
                        this.contextMenuFactory.onContextMenu(null, touchEvent, null, null, null, this.eGridBody);
                    }
                }
            }
        };

        this.addManagedListener(this.eBodyViewport, 'contextmenu', listener);
        this.mockContextMenuForIPad(listener);
        this.addManagedListener(this.eBodyViewport, 'wheel', this.onBodyViewportWheel.bind(this));
        this.addManagedListener(this.eStickyTop, 'wheel', this.onStickyTopWheel.bind(this));
    }

    private mockContextMenuForIPad(listener: (mouseListener?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent) => void): void {
        // we do NOT want this when not in iPad
        if (!isIOSUserAgent()) { return; }

        const touchListener = new TouchListener(this.eBodyViewport);
        const longTapListener = (event: LongTapEvent) => {
            listener(undefined, event.touchStart, event.touchEvent);
        };

        this.addManagedListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(() => touchListener.destroy());
    }

    private onBodyViewportWheel(e: WheelEvent): void {
        if (!this.gridOptionsService.is('suppressScrollWhenPopupsAreOpen')) { return; }

        if (this.popupService.hasAnchoredPopup()) {
            e.preventDefault();
        }
    }

    private onStickyTopWheel(e: WheelEvent): void {
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

    private onPinnedRowDataChanged(): void {
        this.setFloatingHeights();
    }

    private setFloatingHeights(): void {
        const { pinnedRowModel } = this;

        let floatingTopHeight = pinnedRowModel.getPinnedTopTotalHeight();

        if (floatingTopHeight) {
            // adding 1px for cell bottom border
            floatingTopHeight += 1;
        }

        let floatingBottomHeight = pinnedRowModel.getPinnedBottomTotalHeight();

        if (floatingBottomHeight) {
            // adding 1px for cell bottom border
            floatingBottomHeight += 1;
        }

        this.comp.setTopHeight(floatingTopHeight);
        this.comp.setBottomHeight(floatingBottomHeight);

        this.comp.setTopDisplay(floatingTopHeight ? 'inherit' : 'none');
        this.comp.setBottomDisplay(floatingBottomHeight ? 'inherit' : 'none');
        this.setStickyTopOffsetTop();
    }

    public setStickyTopHeight(height: number = 0): void {
        // console.log('setting sticky top height ' + height);
        this.comp.setStickyTopHeight(`${height}px`);
        this.stickyTopHeight = height;
    }

    public getStickyTopHeight(): number {
        return this.stickyTopHeight;
    }

    private setStickyTopWidth(vScrollVisible: boolean) {
        if (!vScrollVisible) {
            this.comp.setStickyTopWidth('100%');
        } else {
            const scrollbarWidth = this.gridOptionsService.getScrollbarWidth();
            this.comp.setStickyTopWidth(`calc(100% - ${scrollbarWidth}px)`);
        }
    }

    private onHeaderHeightChanged(): void {
        this.setStickyTopOffsetTop();
    }

    private setStickyTopOffsetTop(): void {
        const headerCtrl = this.ctrlsService.getGridHeaderCtrl();
        const headerHeight = headerCtrl.getHeaderHeight();
        const pinnedTopHeight = this.pinnedRowModel.getPinnedTopTotalHeight();

        let height = 0;

        if (headerHeight > 0) { height += headerHeight + 1; }
        if (pinnedTopHeight > 0) { height += pinnedTopHeight + 1; }

        this.comp.setStickyTopTop(`${height}px`);
    }

    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    public sizeColumnsToFit(
        params?: ISizeColumnsToFitParams,
        nextTimeout?: number,
    ) {
        const removeScrollWidth = this.isVerticalScrollShowing();
        const scrollWidthToRemove = removeScrollWidth ? this.gridOptionsService.getScrollbarWidth() : 0;
        // bodyViewportWidth should be calculated from eGridBody, not eBodyViewport
        // because we change the width of the bodyViewport to hide the real browser scrollbar
        const bodyViewportWidth = getInnerWidth(this.eGridBody);
        const availableWidth = bodyViewportWidth - scrollWidthToRemove;

        if (availableWidth > 0) {
            this.columnModel.sizeColumnsToFit(availableWidth, "sizeColumnsToFit", false, params);
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
            console.warn('AG Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                'zero width, maybe the grid is not visible yet on the screen?');
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
