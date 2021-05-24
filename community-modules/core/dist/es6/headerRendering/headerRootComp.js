/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { Autowired } from '../context/context';
import { HeaderContainer } from './headerContainer';
import { Events } from '../events';
import { RefSelector } from '../widgets/componentAnnotations';
import { Constants } from '../constants/constants';
import { addOrRemoveCssClass, setDisplayed } from '../utils/dom';
import { ManagedFocusComponent } from '../widgets/managedFocusComponent';
import { HeaderNavigationDirection } from './header/headerNavigationService';
import { exists } from '../utils/generic';
import { KeyName } from '../constants/keyName';
import { CenterWidthFeature } from "../gridBodyComp/centerWidthFeature";
var HeaderRootComp = /** @class */ (function (_super) {
    __extends(HeaderRootComp, _super);
    function HeaderRootComp() {
        var _this = _super.call(this, HeaderRootComp.TEMPLATE) || this;
        _this.headerContainers = new Map();
        return _this;
    }
    HeaderRootComp.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        this.gridApi.registerHeaderRootComp(this);
        this.autoWidthCalculator.registerHeaderRootComp(this);
        this.registerHeaderContainer(new HeaderContainer(this.eHeaderContainer, this.eHeaderViewport, null), 'center');
        this.registerHeaderContainer(new HeaderContainer(this.ePinnedLeftHeader, null, Constants.PINNED_LEFT), 'left');
        this.registerHeaderContainer(new HeaderContainer(this.ePinnedRightHeader, null, Constants.PINNED_RIGHT), 'right');
        this.headerContainers.forEach(function (container) { return _this.createManagedBean(container); });
        this.headerNavigationService.registerHeaderRoot(this);
        // shotgun way to get labels to change, eg from sum(amount) to avg(amount)
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));
        // for setting ag-pivot-on / ag-pivot-off CSS classes
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, this.onPinnedLeftWidthChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, this.onPinnedRightWidthChanged.bind(this));
        this.onPivotModeChanged();
        this.addPreventHeaderScroll();
        this.createManagedBean(new CenterWidthFeature(function (width) { return _this.eHeaderContainer.style.width = width + "px"; }));
        if (this.columnController.isReady()) {
            this.refreshHeader();
        }
        this.setupHeaderHeight();
        this.controllersService.registerHeaderRootComp(this);
    };
    HeaderRootComp.prototype.setupHeaderHeight = function () {
        var listener = this.setHeaderHeight.bind(this);
        listener();
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, listener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, listener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, listener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, listener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, listener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
    };
    HeaderRootComp.prototype.registerHeaderContainer = function (headerContainer, type) {
        this.headerContainers.set(type, headerContainer);
    };
    HeaderRootComp.prototype.onTabKeyDown = function (e) {
        var isRtl = this.gridOptionsWrapper.isEnableRtl();
        var direction = e.shiftKey !== isRtl
            ? HeaderNavigationDirection.LEFT
            : HeaderNavigationDirection.RIGHT;
        if (this.headerNavigationService.navigateHorizontally(direction, true, e) ||
            this.focusController.focusNextGridCoreContainer(e.shiftKey)) {
            e.preventDefault();
        }
    };
    HeaderRootComp.prototype.handleKeyDown = function (e) {
        var direction = null;
        switch (e.key) {
            case KeyName.LEFT:
                direction = HeaderNavigationDirection.LEFT;
            case KeyName.RIGHT:
                if (!exists(direction)) {
                    direction = HeaderNavigationDirection.RIGHT;
                }
                this.headerNavigationService.navigateHorizontally(direction, false, e);
                break;
            case KeyName.UP:
                direction = HeaderNavigationDirection.UP;
            case KeyName.DOWN:
                if (!exists(direction)) {
                    direction = HeaderNavigationDirection.DOWN;
                }
                if (this.headerNavigationService.navigateVertically(direction, null, e)) {
                    e.preventDefault();
                }
                break;
            default:
                return;
        }
    };
    HeaderRootComp.prototype.onFocusOut = function (e) {
        var relatedTarget = e.relatedTarget;
        var eGui = this.getGui();
        if (!relatedTarget && eGui.contains(document.activeElement)) {
            return;
        }
        if (!eGui.contains(relatedTarget)) {
            this.focusController.clearFocusedHeader();
        }
    };
    HeaderRootComp.prototype.onDomLayoutChanged = function () {
        var newValue = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        if (this.printLayout !== newValue) {
            this.printLayout = newValue;
            this.refreshHeader();
        }
    };
    HeaderRootComp.prototype.setHorizontalScroll = function (offset) {
        this.eHeaderContainer.style.transform = "translateX(" + offset + "px)";
    };
    HeaderRootComp.prototype.forEachHeaderElement = function (callback) {
        this.headerContainers.forEach(function (childContainer) { return childContainer.forEachHeaderElement(callback); });
    };
    HeaderRootComp.prototype.refreshHeader = function () {
        this.headerContainers.forEach(function (container) { return container.refresh(); });
    };
    HeaderRootComp.prototype.onPivotModeChanged = function () {
        var pivotMode = this.columnController.isPivotMode();
        addOrRemoveCssClass(this.getGui(), 'ag-pivot-on', pivotMode);
        addOrRemoveCssClass(this.getGui(), 'ag-pivot-off', !pivotMode);
    };
    HeaderRootComp.prototype.setHeaderHeight = function () {
        var _a = this, columnController = _a.columnController, gridOptionsWrapper = _a.gridOptionsWrapper;
        var numberOfFloating = 0;
        var headerRowCount = columnController.getHeaderRowCount();
        var totalHeaderHeight;
        var groupHeight;
        var headerHeight;
        if (columnController.isPivotMode()) {
            groupHeight = gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = gridOptionsWrapper.getPivotHeaderHeight();
        }
        else {
            var hasFloatingFilters = columnController.hasFloatingFilters();
            if (hasFloatingFilters) {
                headerRowCount++;
                numberOfFloating = 1;
            }
            groupHeight = gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = gridOptionsWrapper.getHeaderHeight();
        }
        var numberOfNonGroups = 1 + numberOfFloating;
        var numberOfGroups = headerRowCount - numberOfNonGroups;
        totalHeaderHeight = numberOfFloating * gridOptionsWrapper.getFloatingFiltersHeight();
        totalHeaderHeight += numberOfGroups * groupHeight;
        totalHeaderHeight += headerHeight;
        // one extra pixel is needed here to account for the
        // height of the border
        var px = totalHeaderHeight + 1 + "px";
        this.getGui().style.height = px;
        this.getGui().style.minHeight = px;
    };
    // if the user is in floating filter and hits tab a few times, the header can
    // end up scrolling to show items off the screen, leaving the grid and header
    // and the grid columns no longer in sync.
    HeaderRootComp.prototype.addPreventHeaderScroll = function () {
        var _this = this;
        this.addManagedListener(this.eHeaderViewport, 'scroll', function () {
            // if the header scrolls, the header will be out of sync. so we reset the
            // header scroll, and then scroll the body, which will in turn set the offset
            // on the header, giving the impression that the header scrolled as expected.
            var scrollLeft = _this.eHeaderViewport.scrollLeft;
            if (scrollLeft !== 0) {
                var gridBodyCon = _this.controllersService.getGridBodyController();
                gridBodyCon.getScrollFeature().scrollHorizontally(scrollLeft);
                _this.eHeaderViewport.scrollLeft = 0;
            }
        });
    };
    HeaderRootComp.prototype.getHeaderContainers = function () {
        return this.headerContainers;
    };
    HeaderRootComp.prototype.onPinnedLeftWidthChanged = function () {
        var displayed = this.pinnedWidthService.getPinnedLeftWidth() > 0;
        setDisplayed(this.ePinnedLeftHeader, displayed);
    };
    HeaderRootComp.prototype.onPinnedRightWidthChanged = function () {
        var displayed = this.pinnedWidthService.getPinnedRightWidth() > 0;
        setDisplayed(this.ePinnedRightHeader, displayed);
    };
    HeaderRootComp.TEMPLATE = "<div class=\"ag-header\" role=\"presentation\">\n            <div class=\"ag-pinned-left-header\" ref=\"ePinnedLeftHeader\" role=\"presentation\"></div>\n            <div class=\"ag-header-viewport\" ref=\"eHeaderViewport\" role=\"presentation\">\n                <div class=\"ag-header-container\" ref=\"eHeaderContainer\" role=\"rowgroup\"></div>\n            </div>\n            <div class=\"ag-pinned-right-header\" ref=\"ePinnedRightHeader\" role=\"presentation\"></div>\n        </div>";
    __decorate([
        RefSelector('ePinnedLeftHeader')
    ], HeaderRootComp.prototype, "ePinnedLeftHeader", void 0);
    __decorate([
        RefSelector('ePinnedRightHeader')
    ], HeaderRootComp.prototype, "ePinnedRightHeader", void 0);
    __decorate([
        RefSelector('eHeaderContainer')
    ], HeaderRootComp.prototype, "eHeaderContainer", void 0);
    __decorate([
        RefSelector('eHeaderViewport')
    ], HeaderRootComp.prototype, "eHeaderViewport", void 0);
    __decorate([
        Autowired('columnController')
    ], HeaderRootComp.prototype, "columnController", void 0);
    __decorate([
        Autowired('gridApi')
    ], HeaderRootComp.prototype, "gridApi", void 0);
    __decorate([
        Autowired('autoWidthCalculator')
    ], HeaderRootComp.prototype, "autoWidthCalculator", void 0);
    __decorate([
        Autowired('headerNavigationService')
    ], HeaderRootComp.prototype, "headerNavigationService", void 0);
    __decorate([
        Autowired('pinnedWidthService')
    ], HeaderRootComp.prototype, "pinnedWidthService", void 0);
    __decorate([
        Autowired('controllersService')
    ], HeaderRootComp.prototype, "controllersService", void 0);
    return HeaderRootComp;
}(ManagedFocusComponent));
export { HeaderRootComp };
