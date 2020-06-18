/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
import { Autowired, PostConstruct, PreDestroy } from '../context/context';
import { Events } from '../events';
import { HeaderRowComp, HeaderRowType } from './headerRowComp';
import { BodyDropTarget } from './bodyDropTarget';
import { Constants } from '../constants';
import { setFixedWidth, clearElement } from '../utils/dom';
import { BeanStub } from "../context/beanStub";
var HeaderContainer = /** @class */ (function (_super) {
    __extends(HeaderContainer, _super);
    function HeaderContainer(eContainer, eViewport, pinned) {
        var _this = _super.call(this) || this;
        _this.headerRowComps = [];
        _this.eContainer = eContainer;
        _this.pinned = pinned;
        _this.eViewport = eViewport;
        return _this;
    }
    HeaderContainer.prototype.forEachHeaderElement = function (callback) {
        this.headerRowComps.forEach(function (headerRowComp) { return headerRowComp.forEachHeaderElement(callback); });
    };
    HeaderContainer.prototype.init = function () {
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnValueChanged.bind(this)),
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this)),
            this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this)),
            this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this)),
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this)),
            this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
    };
    // if row group changes, that means we may need to add aggFuncs to the column headers,
    // if the grid goes from no aggregation (ie no grouping) to grouping
    HeaderContainer.prototype.onColumnRowGroupChanged = function () {
        this.onGridColumnsChanged();
    };
    // if the agg func of a column changes, then we may need to update the agg func in columns header
    HeaderContainer.prototype.onColumnValueChanged = function () {
        this.onGridColumnsChanged();
    };
    HeaderContainer.prototype.onColumnResized = function () {
        this.setWidthOfPinnedContainer();
    };
    HeaderContainer.prototype.onDisplayedColumnsChanged = function () {
        this.setWidthOfPinnedContainer();
    };
    HeaderContainer.prototype.onScrollVisibilityChanged = function () {
        this.setWidthOfPinnedContainer();
    };
    HeaderContainer.prototype.setWidthOfPinnedContainer = function () {
        var pinningLeft = this.pinned === Constants.PINNED_LEFT;
        var pinningRight = this.pinned === Constants.PINNED_RIGHT;
        var controller = this.columnController;
        var isRtl = this.gridOptionsWrapper.isEnableRtl();
        if (pinningLeft || pinningRight) {
            // size to fit all columns
            var width = controller[pinningLeft ? 'getPinnedLeftContainerWidth' : 'getPinnedRightContainerWidth']();
            // if there is a scroll showing (and taking up space, so Windows, and not iOS)
            // in the body, then we add extra space to keep header aligned with the body,
            // as body width fits the cols and the scrollbar
            var addPaddingForScrollbar = this.scrollVisibleService.isVerticalScrollShowing() && ((isRtl && pinningLeft) || (!isRtl && pinningRight));
            if (addPaddingForScrollbar) {
                width += this.scrollWidth;
            }
            setFixedWidth(this.eContainer, width);
        }
    };
    HeaderContainer.prototype.getRowComps = function () {
        return this.headerRowComps;
    };
    // grid cols have changed - this also means the number of rows in the header can have
    // changed. so we remove all the old rows and insert new ones for a complete refresh
    HeaderContainer.prototype.onGridColumnsChanged = function () {
        this.removeAndCreateAllRowComps();
    };
    HeaderContainer.prototype.removeAndCreateAllRowComps = function () {
        this.removeHeaderRowComps();
        this.createHeaderRowComps();
    };
    // we expose this for gridOptions.api.refreshHeader() to call
    HeaderContainer.prototype.refresh = function () {
        this.removeAndCreateAllRowComps();
    };
    HeaderContainer.prototype.setupDragAndDrop = function (gridComp) {
        var dropContainer = this.eViewport ? this.eViewport : this.eContainer;
        var bodyDropTarget = new BodyDropTarget(this.pinned, dropContainer);
        this.createManagedBean(bodyDropTarget);
        bodyDropTarget.registerGridComp(gridComp);
    };
    HeaderContainer.prototype.removeHeaderRowComps = function () {
        var _this = this;
        this.headerRowComps.forEach(function (headerRowComp) { return _this.destroyBean(headerRowComp); });
        this.headerRowComps.length = 0;
        clearElement(this.eContainer);
    };
    HeaderContainer.prototype.createHeaderRowComps = function () {
        // if we are displaying header groups, then we have many rows here.
        // go through each row of the header, one by one.
        var rowCount = this.columnController.getHeaderRowCount();
        for (var dept = 0; dept < rowCount; dept++) {
            var groupRow = dept !== (rowCount - 1);
            var type = groupRow ? HeaderRowType.COLUMN_GROUP : HeaderRowType.COLUMN;
            var headerRowComp = new HeaderRowComp(dept, type, this.pinned, this.dropTarget);
            this.createBean(headerRowComp);
            this.headerRowComps.push(headerRowComp);
            headerRowComp.setRowIndex(this.headerRowComps.length - 1);
            this.eContainer.appendChild(headerRowComp.getGui());
        }
        if (!this.columnController.isPivotMode() && this.columnController.hasFloatingFilters()) {
            var headerRowComp = new HeaderRowComp(rowCount, HeaderRowType.FLOATING_FILTER, this.pinned, this.dropTarget);
            this.createBean(headerRowComp);
            this.headerRowComps.push(headerRowComp);
            headerRowComp.setRowIndex(this.headerRowComps.length - 1);
            this.eContainer.appendChild(headerRowComp.getGui());
        }
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], HeaderContainer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnController')
    ], HeaderContainer.prototype, "columnController", void 0);
    __decorate([
        Autowired('scrollVisibleService')
    ], HeaderContainer.prototype, "scrollVisibleService", void 0);
    __decorate([
        PostConstruct
    ], HeaderContainer.prototype, "init", null);
    __decorate([
        PreDestroy
    ], HeaderContainer.prototype, "removeHeaderRowComps", null);
    return HeaderContainer;
}(BeanStub));
export { HeaderContainer };
