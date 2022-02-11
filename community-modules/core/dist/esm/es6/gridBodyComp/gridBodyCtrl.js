/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
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
import { Constants } from "../constants/constants";
import { Events } from "../eventKeys";
import { GridBodyScrollFeature } from "./gridBodyScrollFeature";
import { getInnerWidth, isVerticalScrollShowing } from "../utils/dom";
import { RowDragFeature } from "./rowDragFeature";
import { getTabIndex } from "../utils/browser";
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
        this.angularApplyTriggered = false;
    }
    getScrollFeature() {
        return this.bodyScrollFeature;
    }
    getBodyViewportElement() {
        return this.eBodyViewport;
    }
    setComp(comp, eGridBody, eBodyViewport, eTop, eBottom) {
        this.comp = comp;
        this.eGridBody = eGridBody;
        this.eBodyViewport = eBodyViewport;
        this.eTop = eTop;
        this.eBottom = eBottom;
        this.setCellTextSelection(this.gridOptionsWrapper.isEnableCellTextSelect());
        this.createManagedBean(new LayoutFeature(this.comp));
        this.bodyScrollFeature = this.createManagedBean(new GridBodyScrollFeature(this.eBodyViewport));
        this.addRowDragListener();
        this.setupRowAnimationCssClass();
        this.ctrlsService.registerGridBodyCtrl(this);
        this.addEventListeners();
        this.addFocusListeners([eTop, eBodyViewport, eBottom]);
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
        this.setFloatingHeights();
        this.disableBrowserDragging();
        this.addStopEditingWhenGridLosesFocus();
        if (this.$scope) {
            this.addAngularApplyCheck();
        }
    }
    getComp() {
        return this.comp;
    }
    addEventListeners() {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.setFloatingHeights.bind(this));
    }
    addFocusListeners(elements) {
        elements.forEach(element => {
            this.addManagedListener(element, 'focusin', () => {
                element.classList.add('ag-has-focus');
            });
            this.addManagedListener(element, 'focusout', (e) => {
                if (!element.contains(e.relatedTarget)) {
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
        if (!this.gridOptionsWrapper.isStopEditingWhenCellsLoseFocus()) {
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
        const viewports = [this.eBodyViewport, this.eBottom, this.eTop];
        viewports.forEach(viewport => this.addManagedListener(viewport, 'focusout', focusOutListener));
    }
    updateRowCount() {
        const headerCount = this.headerNavigationService.getHeaderRowCount();
        const modelType = this.paginationProxy.getType();
        let rowCount = -1;
        if (modelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            rowCount = 0;
            this.paginationProxy.forEachNode(node => {
                if (!node.group) {
                    rowCount++;
                }
            });
        }
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
        const show = this.gridOptionsWrapper.isAlwaysShowVerticalScroll();
        const cssClass = show ? CSS_CLASS_FORCE_VERTICAL_SCROLL : null;
        this.comp.setAlwaysVerticalScrollClass(cssClass, show);
        return show || isVerticalScrollShowing(this.eBodyViewport);
    }
    setupRowAnimationCssClass() {
        const listener = () => {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            const animateRows = this.gridOptionsWrapper.isAnimateRows() && !this.rowContainerHeightService.isStretching();
            const animateRowsCssClass = animateRows ? RowAnimationCssClasses.ANIMATION_ON : RowAnimationCssClasses.ANIMATION_OFF;
            this.comp.setRowAnimationCssOnBodyViewport(animateRowsCssClass, animateRows);
        };
        listener();
        this.addManagedListener(this.eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, listener);
    }
    getGridBodyElement() {
        return this.eGridBody;
    }
    addBodyViewportListener() {
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        const listener = (mouseEvent) => {
            if (this.gridOptionsWrapper.isPreventDefaultOnContextMenu()) {
                mouseEvent.preventDefault();
            }
            const { target } = mouseEvent;
            if (target === this.eBodyViewport || target === this.ctrlsService.getCenterRowContainerCtrl().getViewportElement()) {
                // show it
                if (this.contextMenuFactory) {
                    this.contextMenuFactory.onContextMenu(mouseEvent, null, null, null, null, this.eGridBody);
                }
            }
        };
        this.addManagedListener(this.eBodyViewport, 'contextmenu', listener);
        this.addManagedListener(this.eBodyViewport, 'wheel', this.onWheel.bind(this));
    }
    onWheel(e) {
        if (!this.gridOptionsWrapper.isSuppressScrollWhenPopupsAreOpen()) {
            return;
        }
        if (this.popupService.hasAnchoredPopup()) {
            e.preventDefault();
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
    }
    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    sizeColumnsToFit(nextTimeout) {
        const removeScrollWidth = this.isVerticalScrollShowing();
        const scrollWidthToRemove = removeScrollWidth ? this.gridOptionsWrapper.getScrollbarWidth() : 0;
        const bodyViewportWidth = getInnerWidth(this.eBodyViewport);
        const availableWidth = bodyViewportWidth - scrollWidthToRemove;
        if (availableWidth > 0) {
            this.columnModel.sizeColumnsToFit(availableWidth, "sizeColumnsToFit");
            return;
        }
        if (nextTimeout === undefined) {
            window.setTimeout(() => {
                this.sizeColumnsToFit(100);
            }, 0);
        }
        else if (nextTimeout === 100) {
            window.setTimeout(() => {
                this.sizeColumnsToFit(500);
            }, 100);
        }
        else if (nextTimeout === 500) {
            window.setTimeout(() => {
                this.sizeColumnsToFit(-1);
            }, 500);
        }
        else {
            console.warn('AG Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                'zero width, maybe the grid is not visible yet on the screen?');
        }
    }
    // + rangeService
    addScrollEventListener(listener) {
        this.eBodyViewport.addEventListener('scroll', listener);
    }
    // + focusService
    removeScrollEventListener(listener) {
        this.eBodyViewport.removeEventListener('scroll', listener);
    }
    requestAngularApply() {
        if (this.angularApplyTriggered) {
            return;
        }
        this.angularApplyTriggered = true;
        window.setTimeout(() => {
            this.angularApplyTriggered = false;
            this.$scope.$apply();
        }, 0);
    }
    addAngularApplyCheck() {
        // these are the events we need to do an apply after - these are the ones that can end up
        // with columns added or removed
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, () => this.requestAngularApply());
        this.addManagedListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, () => this.requestAngularApply());
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
    Autowired('paginationProxy')
], GridBodyCtrl.prototype, "paginationProxy", void 0);
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
    Autowired('$scope')
], GridBodyCtrl.prototype, "$scope", void 0);
