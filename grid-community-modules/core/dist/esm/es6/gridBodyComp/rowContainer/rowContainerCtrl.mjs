var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../context/beanStub.mjs";
import { Autowired, PostConstruct } from "../../context/context.mjs";
import { Events } from "../../eventKeys.mjs";
import { RowContainerEventsFeature } from "./rowContainerEventsFeature.mjs";
import { getInnerWidth, getScrollLeft, isHorizontalScrollShowing, isVisible, setScrollLeft } from "../../utils/dom.mjs";
import { ViewportSizeFeature } from "../viewportSizeFeature.mjs";
import { convertToMap } from "../../utils/map.mjs";
import { SetPinnedLeftWidthFeature } from "./setPinnedLeftWidthFeature.mjs";
import { SetPinnedRightWidthFeature } from "./setPinnedRightWidthFeature.mjs";
import { SetHeightFeature } from "./setHeightFeature.mjs";
import { DragListenerFeature } from "./dragListenerFeature.mjs";
import { CenterWidthFeature } from "../centerWidthFeature.mjs";
export var RowContainerName;
(function (RowContainerName) {
    RowContainerName["LEFT"] = "left";
    RowContainerName["RIGHT"] = "right";
    RowContainerName["CENTER"] = "center";
    RowContainerName["FULL_WIDTH"] = "fullWidth";
    RowContainerName["TOP_LEFT"] = "topLeft";
    RowContainerName["TOP_RIGHT"] = "topRight";
    RowContainerName["TOP_CENTER"] = "topCenter";
    RowContainerName["TOP_FULL_WIDTH"] = "topFullWidth";
    RowContainerName["STICKY_TOP_LEFT"] = "stickyTopLeft";
    RowContainerName["STICKY_TOP_RIGHT"] = "stickyTopRight";
    RowContainerName["STICKY_TOP_CENTER"] = "stickyTopCenter";
    RowContainerName["STICKY_TOP_FULL_WIDTH"] = "stickyTopFullWidth";
    RowContainerName["BOTTOM_LEFT"] = "bottomLeft";
    RowContainerName["BOTTOM_RIGHT"] = "bottomRight";
    RowContainerName["BOTTOM_CENTER"] = "bottomCenter";
    RowContainerName["BOTTOM_FULL_WIDTH"] = "bottomFullWidth";
})(RowContainerName || (RowContainerName = {}));
export var RowContainerType;
(function (RowContainerType) {
    RowContainerType["LEFT"] = "left";
    RowContainerType["RIGHT"] = "right";
    RowContainerType["CENTER"] = "center";
    RowContainerType["FULL_WIDTH"] = "fullWidth";
})(RowContainerType || (RowContainerType = {}));
export function getRowContainerTypeForName(name) {
    switch (name) {
        case RowContainerName.CENTER:
        case RowContainerName.TOP_CENTER:
        case RowContainerName.STICKY_TOP_CENTER:
        case RowContainerName.BOTTOM_CENTER:
            return RowContainerType.CENTER;
        case RowContainerName.LEFT:
        case RowContainerName.TOP_LEFT:
        case RowContainerName.STICKY_TOP_LEFT:
        case RowContainerName.BOTTOM_LEFT:
            return RowContainerType.LEFT;
        case RowContainerName.RIGHT:
        case RowContainerName.TOP_RIGHT:
        case RowContainerName.STICKY_TOP_RIGHT:
        case RowContainerName.BOTTOM_RIGHT:
            return RowContainerType.RIGHT;
        case RowContainerName.FULL_WIDTH:
        case RowContainerName.TOP_FULL_WIDTH:
        case RowContainerName.STICKY_TOP_FULL_WIDTH:
        case RowContainerName.BOTTOM_FULL_WIDTH:
            return RowContainerType.FULL_WIDTH;
        default:
            throw Error('Invalid Row Container Type');
    }
}
const ContainerCssClasses = convertToMap([
    [RowContainerName.CENTER, 'ag-center-cols-container'],
    [RowContainerName.LEFT, 'ag-pinned-left-cols-container'],
    [RowContainerName.RIGHT, 'ag-pinned-right-cols-container'],
    [RowContainerName.FULL_WIDTH, 'ag-full-width-container'],
    [RowContainerName.TOP_CENTER, 'ag-floating-top-container'],
    [RowContainerName.TOP_LEFT, 'ag-pinned-left-floating-top'],
    [RowContainerName.TOP_RIGHT, 'ag-pinned-right-floating-top'],
    [RowContainerName.TOP_FULL_WIDTH, 'ag-floating-top-full-width-container'],
    [RowContainerName.STICKY_TOP_CENTER, 'ag-sticky-top-container'],
    [RowContainerName.STICKY_TOP_LEFT, 'ag-pinned-left-sticky-top'],
    [RowContainerName.STICKY_TOP_RIGHT, 'ag-pinned-right-sticky-top'],
    [RowContainerName.STICKY_TOP_FULL_WIDTH, 'ag-sticky-top-full-width-container'],
    [RowContainerName.BOTTOM_CENTER, 'ag-floating-bottom-container'],
    [RowContainerName.BOTTOM_LEFT, 'ag-pinned-left-floating-bottom'],
    [RowContainerName.BOTTOM_RIGHT, 'ag-pinned-right-floating-bottom'],
    [RowContainerName.BOTTOM_FULL_WIDTH, 'ag-floating-bottom-full-width-container'],
]);
const ViewportCssClasses = convertToMap([
    [RowContainerName.CENTER, 'ag-center-cols-viewport'],
    [RowContainerName.TOP_CENTER, 'ag-floating-top-viewport'],
    [RowContainerName.STICKY_TOP_CENTER, 'ag-sticky-top-viewport'],
    [RowContainerName.BOTTOM_CENTER, 'ag-floating-bottom-viewport'],
]);
export class RowContainerCtrl extends BeanStub {
    constructor(name) {
        super();
        this.visible = true;
        // Maintaining a constant reference enables optimization in React.
        this.EMPTY_CTRLS = [];
        this.name = name;
        this.isFullWithContainer =
            this.name === RowContainerName.TOP_FULL_WIDTH
                || this.name === RowContainerName.STICKY_TOP_FULL_WIDTH
                || this.name === RowContainerName.BOTTOM_FULL_WIDTH
                || this.name === RowContainerName.FULL_WIDTH;
    }
    static getRowContainerCssClasses(name) {
        const containerClass = ContainerCssClasses.get(name);
        const viewportClass = ViewportCssClasses.get(name);
        return { container: containerClass, viewport: viewportClass };
    }
    static getPinned(name) {
        switch (name) {
            case RowContainerName.BOTTOM_LEFT:
            case RowContainerName.TOP_LEFT:
            case RowContainerName.STICKY_TOP_LEFT:
            case RowContainerName.LEFT:
                return 'left';
            case RowContainerName.BOTTOM_RIGHT:
            case RowContainerName.TOP_RIGHT:
            case RowContainerName.STICKY_TOP_RIGHT:
            case RowContainerName.RIGHT:
                return 'right';
            default:
                return null;
        }
    }
    postConstruct() {
        this.enableRtl = this.gridOptionsService.get('enableRtl');
        this.forContainers([RowContainerName.CENTER], () => this.viewportSizeFeature = this.createManagedBean(new ViewportSizeFeature(this)));
    }
    registerWithCtrlsService() {
        switch (this.name) {
            case RowContainerName.CENTER:
                this.ctrlsService.registerCenterRowContainerCtrl(this);
                break;
            case RowContainerName.LEFT:
                this.ctrlsService.registerLeftRowContainerCtrl(this);
                break;
            case RowContainerName.RIGHT:
                this.ctrlsService.registerRightRowContainerCtrl(this);
                break;
            case RowContainerName.TOP_CENTER:
                this.ctrlsService.registerTopCenterRowContainerCtrl(this);
                break;
            case RowContainerName.TOP_LEFT:
                this.ctrlsService.registerTopLeftRowContainerCon(this);
                break;
            case RowContainerName.TOP_RIGHT:
                this.ctrlsService.registerTopRightRowContainerCtrl(this);
                break;
            case RowContainerName.STICKY_TOP_CENTER:
                this.ctrlsService.registerStickyTopCenterRowContainerCtrl(this);
                break;
            case RowContainerName.STICKY_TOP_LEFT:
                this.ctrlsService.registerStickyTopLeftRowContainerCon(this);
                break;
            case RowContainerName.STICKY_TOP_RIGHT:
                this.ctrlsService.registerStickyTopRightRowContainerCtrl(this);
                break;
            case RowContainerName.BOTTOM_CENTER:
                this.ctrlsService.registerBottomCenterRowContainerCtrl(this);
                break;
            case RowContainerName.BOTTOM_LEFT:
                this.ctrlsService.registerBottomLeftRowContainerCtrl(this);
                break;
            case RowContainerName.BOTTOM_RIGHT:
                this.ctrlsService.registerBottomRightRowContainerCtrl(this);
                break;
        }
    }
    forContainers(names, callback) {
        if (names.indexOf(this.name) >= 0) {
            callback();
        }
    }
    getContainerElement() {
        return this.eContainer;
    }
    getViewportSizeFeature() {
        return this.viewportSizeFeature;
    }
    setComp(view, eContainer, eViewport) {
        this.comp = view;
        this.eContainer = eContainer;
        this.eViewport = eViewport;
        this.createManagedBean(new RowContainerEventsFeature(this.eContainer));
        this.addPreventScrollWhileDragging();
        this.listenOnDomOrder();
        this.stopHScrollOnPinnedRows();
        const allTopNoFW = [RowContainerName.TOP_CENTER, RowContainerName.TOP_LEFT, RowContainerName.TOP_RIGHT];
        const allStickyTopNoFW = [RowContainerName.STICKY_TOP_CENTER, RowContainerName.STICKY_TOP_LEFT, RowContainerName.STICKY_TOP_RIGHT];
        const allBottomNoFW = [RowContainerName.BOTTOM_CENTER, RowContainerName.BOTTOM_LEFT, RowContainerName.BOTTOM_RIGHT];
        const allMiddleNoFW = [RowContainerName.CENTER, RowContainerName.LEFT, RowContainerName.RIGHT];
        const allNoFW = [...allTopNoFW, ...allBottomNoFW, ...allMiddleNoFW, ...allStickyTopNoFW];
        const allMiddle = [RowContainerName.CENTER, RowContainerName.LEFT, RowContainerName.RIGHT, RowContainerName.FULL_WIDTH];
        const allCenter = [RowContainerName.CENTER, RowContainerName.TOP_CENTER, RowContainerName.STICKY_TOP_CENTER, RowContainerName.BOTTOM_CENTER];
        const allLeft = [RowContainerName.LEFT, RowContainerName.BOTTOM_LEFT, RowContainerName.TOP_LEFT, RowContainerName.STICKY_TOP_LEFT];
        const allRight = [RowContainerName.RIGHT, RowContainerName.BOTTOM_RIGHT, RowContainerName.TOP_RIGHT, RowContainerName.STICKY_TOP_RIGHT];
        this.forContainers(allLeft, () => {
            this.pinnedWidthFeature = this.createManagedBean(new SetPinnedLeftWidthFeature(this.eContainer));
            this.addManagedListener(this.eventService, Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, () => this.onPinnedWidthChanged());
        });
        this.forContainers(allRight, () => {
            this.pinnedWidthFeature = this.createManagedBean(new SetPinnedRightWidthFeature(this.eContainer));
            this.addManagedListener(this.eventService, Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, () => this.onPinnedWidthChanged());
        });
        this.forContainers(allMiddle, () => this.createManagedBean(new SetHeightFeature(this.eContainer, this.name === RowContainerName.CENTER ? eViewport : undefined)));
        this.forContainers(allNoFW, () => this.createManagedBean(new DragListenerFeature(this.eContainer)));
        this.forContainers(allCenter, () => this.createManagedBean(new CenterWidthFeature(width => this.comp.setContainerWidth(`${width}px`))));
        this.addListeners();
        this.registerWithCtrlsService();
    }
    addListeners() {
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, () => this.onDisplayedColumnsChanged());
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, () => this.onDisplayedColumnsWidthChanged());
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_ROWS_CHANGED, (params) => this.onDisplayedRowsChanged(params.afterScroll));
        this.onDisplayedColumnsChanged();
        this.onDisplayedColumnsWidthChanged();
        this.onDisplayedRowsChanged();
    }
    listenOnDomOrder() {
        // sticky section must show rows in set order
        const allStickyContainers = [RowContainerName.STICKY_TOP_CENTER, RowContainerName.STICKY_TOP_LEFT, RowContainerName.STICKY_TOP_RIGHT, RowContainerName.STICKY_TOP_FULL_WIDTH];
        const isStickContainer = allStickyContainers.indexOf(this.name) >= 0;
        if (isStickContainer) {
            this.comp.setDomOrder(true);
            return;
        }
        const listener = () => {
            const isEnsureDomOrder = this.gridOptionsService.get('ensureDomOrder');
            const isPrintLayout = this.gridOptionsService.isDomLayout('print');
            this.comp.setDomOrder(isEnsureDomOrder || isPrintLayout);
        };
        this.addManagedPropertyListener('domLayout', listener);
        listener();
    }
    // when editing a pinned row, if the cell is half outside the scrollable area, the browser can
    // scroll the column into view. we do not want this, the pinned sections should never scroll.
    // so we listen to scrolls on these containers and reset the scroll if we find one.
    stopHScrollOnPinnedRows() {
        this.forContainers([RowContainerName.TOP_CENTER, RowContainerName.STICKY_TOP_CENTER, RowContainerName.BOTTOM_CENTER], () => {
            const resetScrollLeft = () => this.eViewport.scrollLeft = 0;
            this.addManagedListener(this.eViewport, 'scroll', resetScrollLeft);
        });
    }
    onDisplayedColumnsChanged() {
        this.forContainers([RowContainerName.CENTER], () => this.onHorizontalViewportChanged());
    }
    onDisplayedColumnsWidthChanged() {
        this.forContainers([RowContainerName.CENTER], () => this.onHorizontalViewportChanged());
    }
    // this methods prevents the grid views from being scrolled while the dragService is being used
    // eg. the view should not scroll up and down while dragging rows using the rowDragComp.
    addPreventScrollWhileDragging() {
        const preventScroll = (e) => {
            if (this.dragService.isDragging()) {
                if (e.cancelable) {
                    e.preventDefault();
                }
            }
        };
        this.eContainer.addEventListener('touchmove', preventScroll, { passive: false });
        this.addDestroyFunc(() => this.eContainer.removeEventListener('touchmove', preventScroll));
    }
    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged
    onHorizontalViewportChanged(afterScroll = false) {
        const scrollWidth = this.getCenterWidth();
        const scrollPosition = this.getCenterViewportScrollLeft();
        this.columnModel.setViewportPosition(scrollWidth, scrollPosition, afterScroll);
    }
    getCenterWidth() {
        return getInnerWidth(this.eViewport);
    }
    getCenterViewportScrollLeft() {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return getScrollLeft(this.eViewport, this.enableRtl);
    }
    registerViewportResizeListener(listener) {
        const unsubscribeFromResize = this.resizeObserverService.observeResize(this.eViewport, listener);
        this.addDestroyFunc(() => unsubscribeFromResize());
    }
    isViewportVisible() {
        return isVisible(this.eViewport);
    }
    getViewportScrollLeft() {
        return getScrollLeft(this.eViewport, this.enableRtl);
    }
    isHorizontalScrollShowing() {
        const isAlwaysShowHorizontalScroll = this.gridOptionsService.get('alwaysShowHorizontalScroll');
        return isAlwaysShowHorizontalScroll || isHorizontalScrollShowing(this.eViewport);
    }
    getViewportElement() {
        return this.eViewport;
    }
    setContainerTranslateX(amount) {
        this.eContainer.style.transform = `translateX(${amount}px)`;
    }
    getHScrollPosition() {
        const res = {
            left: this.eViewport.scrollLeft,
            right: this.eViewport.scrollLeft + this.eViewport.offsetWidth
        };
        return res;
    }
    setCenterViewportScrollLeft(value) {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        setScrollLeft(this.eViewport, value, this.enableRtl);
    }
    isContainerVisible() {
        const pinned = RowContainerCtrl.getPinned(this.name);
        return !pinned || (!!this.pinnedWidthFeature && this.pinnedWidthFeature.getWidth() > 0);
    }
    onPinnedWidthChanged() {
        const visible = this.isContainerVisible();
        if (this.visible != visible) {
            this.visible = visible;
            this.onDisplayedRowsChanged();
        }
    }
    onDisplayedRowsChanged(useFlushSync = false) {
        if (this.visible) {
            const printLayout = this.gridOptionsService.isDomLayout('print');
            const embedFullWidthRows = this.gridOptionsService.get('embedFullWidthRows');
            const embedFW = embedFullWidthRows || printLayout;
            // this just justifies if the ctrl is in the correct place, this will be fed with zombie rows by the
            // row renderer, so should not block them as they still need to animate -  the row renderer
            // will clean these up when they finish animating
            const doesRowMatch = (rowCtrl) => {
                const fullWidthRow = rowCtrl.isFullWidth();
                const match = this.isFullWithContainer ?
                    !embedFW && fullWidthRow
                    : embedFW || !fullWidthRow;
                return match;
            };
            // this list contains either all pinned top, center or pinned bottom rows
            // this filters out rows not for this container, eg if it's a full with row, but we are not full with container
            const rowsThisContainer = this.getRowCtrls().filter(doesRowMatch);
            this.comp.setRowCtrls(rowsThisContainer, useFlushSync);
        }
        else {
            this.comp.setRowCtrls(this.EMPTY_CTRLS, false);
        }
    }
    getRowCtrls() {
        switch (this.name) {
            case RowContainerName.TOP_CENTER:
            case RowContainerName.TOP_LEFT:
            case RowContainerName.TOP_RIGHT:
            case RowContainerName.TOP_FULL_WIDTH:
                return this.rowRenderer.getTopRowCtrls();
            case RowContainerName.STICKY_TOP_CENTER:
            case RowContainerName.STICKY_TOP_LEFT:
            case RowContainerName.STICKY_TOP_RIGHT:
            case RowContainerName.STICKY_TOP_FULL_WIDTH:
                return this.rowRenderer.getStickyTopRowCtrls();
            case RowContainerName.BOTTOM_CENTER:
            case RowContainerName.BOTTOM_LEFT:
            case RowContainerName.BOTTOM_RIGHT:
            case RowContainerName.BOTTOM_FULL_WIDTH:
                return this.rowRenderer.getBottomRowCtrls();
            default:
                return this.rowRenderer.getCentreRowCtrls();
        }
    }
}
__decorate([
    Autowired('scrollVisibleService')
], RowContainerCtrl.prototype, "scrollVisibleService", void 0);
__decorate([
    Autowired('dragService')
], RowContainerCtrl.prototype, "dragService", void 0);
__decorate([
    Autowired('ctrlsService')
], RowContainerCtrl.prototype, "ctrlsService", void 0);
__decorate([
    Autowired('columnModel')
], RowContainerCtrl.prototype, "columnModel", void 0);
__decorate([
    Autowired('resizeObserverService')
], RowContainerCtrl.prototype, "resizeObserverService", void 0);
__decorate([
    Autowired('animationFrameService')
], RowContainerCtrl.prototype, "animationFrameService", void 0);
__decorate([
    Autowired('rowRenderer')
], RowContainerCtrl.prototype, "rowRenderer", void 0);
__decorate([
    PostConstruct
], RowContainerCtrl.prototype, "postConstruct", null);
