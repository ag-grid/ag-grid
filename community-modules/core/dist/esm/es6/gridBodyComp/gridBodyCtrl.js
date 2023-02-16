/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../context/beanStub";
import { Autowired, Optional } from "../context/context";
import { LayoutFeature } from "../styling/layoutFeature";
import { Events } from "../eventKeys";
import { GridBodyScrollFeature } from "./gridBodyScrollFeature";
import { getInnerWidth, isElementChildOfClass, isVerticalScrollShowing } from "../utils/dom";
import { RowDragFeature } from "./rowDragFeature";
import { getTabIndex, isInvisibleScrollbar, isIOSUserAgent } from "../utils/browser";
import { TouchListener } from "../widgets/touchListener";
export var RowAnimationCssClasses;
(function (RowAnimationCssClasses) {
    RowAnimationCssClasses["ANIMATION_ON"] = "ag-row-animation";
    RowAnimationCssClasses["ANIMATION_OFF"] = "ag-row-no-animation";
})(RowAnimationCssClasses || (RowAnimationCssClasses = {}));
export const CSS_CLASS_CELL_SELECTABLE = 'ag-selectable';
export const CSS_CLASS_FORCE_VERTICAL_SCROLL = 'ag-force-vertical-scroll';
export const CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';
export class GridBodyCtrl extends BeanStub {
    constructor() {
        super(...arguments);
        this.stickyTopHeight = 0;
    }
    getScrollFeature() {
        return this.bodyScrollFeature;
    }
    getBodyViewportElement() {
        return this.eBodyViewport;
    }
    setComp(comp, eGridBody, eBodyViewport, eTop, eBottom, eStickyTop) {
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
    getComp() {
        return this.comp;
    }
    addEventListeners() {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_HEADER_HEIGHT_CHANGED, this.onHeaderHeightChanged.bind(this));
    }
    addFocusListeners(elements) {
        elements.forEach(element => {
            this.addManagedListener(element, 'focusin', (e) => {
                const { target } = e;
                // element being focused is nested?
                const isFocusedElementNested = isElementChildOfClass(target, 'ag-root', element);
                element.classList.toggle('ag-has-focus', !isFocusedElementNested);
            });
            this.addManagedListener(element, 'focusout', (e) => {
                const { target, relatedTarget } = e;
                const gridContainRelatedTarget = element.contains(relatedTarget);
                const isNestedRelatedTarget = isElementChildOfClass(relatedTarget, 'ag-root', element);
                const isNestedTarget = isElementChildOfClass(target, 'ag-root', element);
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
    setColumnMovingCss(moving) {
        this.comp.setColumnMovingCss(moving ? CSS_CLASS_COLUMN_MOVING : null, moving);
    }
    setCellTextSelection(selectable = false) {
        const cssClass = selectable ? CSS_CLASS_CELL_SELECTABLE : null;
        this.comp.setCellSelectableCss(cssClass, selectable);
    }
    onScrollVisibilityChanged() {
        const visible = this.scrollVisibleService.isVerticalScrollShowing();
        this.setVerticalScrollPaddingVisible(visible);
        this.setStickyTopWidth(visible);
        const scrollbarWidth = visible ? (this.gridOptionsService.getScrollbarWidth() || 0) : 0;
        const pad = isInvisibleScrollbar() ? 16 : 0;
        const width = `calc(100% + ${scrollbarWidth + pad}px)`;
        this.comp.setBodyViewportWidth(width);
    }
    onGridColumnsChanged() {
        const columns = this.columnModel.getAllGridColumns();
        this.comp.setColumnCount(columns ? columns.length : 0);
    }
    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
    disableBrowserDragging() {
        this.addManagedListener(this.eGridBody, 'dragstart', (event) => {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
    }
    addStopEditingWhenGridLosesFocus() {
        if (!this.gridOptionsService.is('stopEditingWhenCellsLoseFocus')) {
            return;
        }
        const focusOutListener = (event) => {
            // this is the element the focus is moving to
            const elementWithFocus = event.relatedTarget;
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
    updateRowCount() {
        const headerCount = this.headerNavigationService.getHeaderRowCount();
        const rowCount = this.rowModel.isLastRowIndexKnown() ? this.rowModel.getRowCount() : -1;
        const total = rowCount === -1 ? -1 : (headerCount + rowCount);
        this.comp.setRowCount(total);
    }
    registerBodyViewportResizeListener(listener) {
        this.comp.registerBodyViewportResizeListener(listener);
    }
    setVerticalScrollPaddingVisible(visible) {
        const overflowY = visible ? 'scroll' : 'hidden';
        this.comp.setPinnedTopBottomOverflowY(overflowY);
    }
    isVerticalScrollShowing() {
        const show = this.gridOptionsService.is('alwaysShowVerticalScroll');
        const cssClass = show ? CSS_CLASS_FORCE_VERTICAL_SCROLL : null;
        const allowVerticalScroll = this.gridOptionsService.isDomLayout('normal');
        this.comp.setAlwaysVerticalScrollClass(cssClass, show);
        return show || (allowVerticalScroll && isVerticalScrollShowing(this.eBodyViewport));
    }
    setupRowAnimationCssClass() {
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
    getGridBodyElement() {
        return this.eGridBody;
    }
    addBodyViewportListener() {
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        const listener = (mouseEvent, touch, touchEvent) => {
            if (!mouseEvent && !touchEvent) {
                return;
            }
            if (this.gridOptionsService.is('preventDefaultOnContextMenu')) {
                const event = (mouseEvent || touchEvent);
                event.preventDefault();
            }
            const { target } = (mouseEvent || touch);
            if (target === this.eBodyViewport || target === this.ctrlsService.getCenterRowContainerCtrl().getViewportElement()) {
                // show it
                if (this.contextMenuFactory) {
                    if (mouseEvent) {
                        this.contextMenuFactory.onContextMenu(mouseEvent, null, null, null, null, this.eGridBody);
                    }
                    else if (touchEvent) {
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
    mockContextMenuForIPad(listener) {
        // we do NOT want this when not in iPad
        if (!isIOSUserAgent()) {
            return;
        }
        const touchListener = new TouchListener(this.eBodyViewport);
        const longTapListener = (event) => {
            listener(undefined, event.touchStart, event.touchEvent);
        };
        this.addManagedListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(() => touchListener.destroy());
    }
    onBodyViewportWheel(e) {
        if (!this.gridOptionsService.is('suppressScrollWhenPopupsAreOpen')) {
            return;
        }
        if (this.popupService.hasAnchoredPopup()) {
            e.preventDefault();
        }
    }
    onStickyTopWheel(e) {
        e.preventDefault();
        if (e.offsetY) {
            this.scrollVertically(e.deltaY);
        }
    }
    getGui() {
        return this.eGridBody;
    }
    // called by rowDragFeature
    scrollVertically(pixels) {
        const oldScrollPosition = this.eBodyViewport.scrollTop;
        this.bodyScrollFeature.setVerticalScrollPosition(oldScrollPosition + pixels);
        return this.eBodyViewport.scrollTop - oldScrollPosition;
    }
    addRowDragListener() {
        this.rowDragFeature = this.createManagedBean(new RowDragFeature(this.eBodyViewport));
        this.dragAndDropService.addDropTarget(this.rowDragFeature);
    }
    getRowDragFeature() {
        return this.rowDragFeature;
    }
    onPinnedRowDataChanged() {
        this.setFloatingHeights();
    }
    setFloatingHeights() {
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
    setStickyTopHeight(height = 0) {
        // console.log('setting sticky top height ' + height);
        this.comp.setStickyTopHeight(`${height}px`);
        this.stickyTopHeight = height;
    }
    getStickyTopHeight() {
        return this.stickyTopHeight;
    }
    setStickyTopWidth(vScrollVisible) {
        if (!vScrollVisible) {
            this.comp.setStickyTopWidth('100%');
        }
        else {
            const scrollbarWidth = this.gridOptionsService.getScrollbarWidth();
            this.comp.setStickyTopWidth(`calc(100% - ${scrollbarWidth}px)`);
        }
    }
    onHeaderHeightChanged() {
        this.setStickyTopOffsetTop();
    }
    setStickyTopOffsetTop() {
        const headerCtrl = this.ctrlsService.getGridHeaderCtrl();
        const headerHeight = headerCtrl.getHeaderHeight();
        const pinnedTopHeight = this.pinnedRowModel.getPinnedTopTotalHeight();
        let height = 0;
        if (headerHeight > 0) {
            height += headerHeight + 1;
        }
        if (pinnedTopHeight > 0) {
            height += pinnedTopHeight + 1;
        }
        this.comp.setStickyTopTop(`${height}px`);
    }
    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    sizeColumnsToFit(params, nextTimeout) {
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
        }
        else if (nextTimeout === 100) {
            window.setTimeout(() => {
                this.sizeColumnsToFit(params, 500);
            }, 100);
        }
        else if (nextTimeout === 500) {
            window.setTimeout(() => {
                this.sizeColumnsToFit(params, -1);
            }, 500);
        }
        else {
            console.warn('AG Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                'zero width, maybe the grid is not visible yet on the screen?');
        }
    }
    // + rangeService
    addScrollEventListener(listener) {
        this.eBodyViewport.addEventListener('scroll', listener, { passive: true });
    }
    // + focusService
    removeScrollEventListener(listener) {
        this.eBodyViewport.removeEventListener('scroll', listener);
    }
}
__decorate([
    Autowired('rowContainerHeightService')
], GridBodyCtrl.prototype, "rowContainerHeightService", void 0);
__decorate([
    Autowired('ctrlsService')
], GridBodyCtrl.prototype, "ctrlsService", void 0);
__decorate([
    Autowired('columnModel')
], GridBodyCtrl.prototype, "columnModel", void 0);
__decorate([
    Autowired('scrollVisibleService')
], GridBodyCtrl.prototype, "scrollVisibleService", void 0);
__decorate([
    Optional('contextMenuFactory')
], GridBodyCtrl.prototype, "contextMenuFactory", void 0);
__decorate([
    Autowired('headerNavigationService')
], GridBodyCtrl.prototype, "headerNavigationService", void 0);
__decorate([
    Autowired('dragAndDropService')
], GridBodyCtrl.prototype, "dragAndDropService", void 0);
__decorate([
    Autowired('pinnedRowModel')
], GridBodyCtrl.prototype, "pinnedRowModel", void 0);
__decorate([
    Autowired('rowRenderer')
], GridBodyCtrl.prototype, "rowRenderer", void 0);
__decorate([
    Autowired('popupService')
], GridBodyCtrl.prototype, "popupService", void 0);
__decorate([
    Autowired('mouseEventService')
], GridBodyCtrl.prototype, "mouseEventService", void 0);
__decorate([
    Autowired('rowModel')
], GridBodyCtrl.prototype, "rowModel", void 0);
