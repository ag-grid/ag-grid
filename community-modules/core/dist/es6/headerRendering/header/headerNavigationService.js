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
import { Bean, Autowired, PostConstruct } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { ColumnGroup } from "../../entities/columnGroup";
import { HeaderRowType } from "../headerRowComp";
import { last } from "../../utils/array";
export var HeaderNavigationDirection;
(function (HeaderNavigationDirection) {
    HeaderNavigationDirection[HeaderNavigationDirection["UP"] = 0] = "UP";
    HeaderNavigationDirection[HeaderNavigationDirection["DOWN"] = 1] = "DOWN";
    HeaderNavigationDirection[HeaderNavigationDirection["LEFT"] = 2] = "LEFT";
    HeaderNavigationDirection[HeaderNavigationDirection["RIGHT"] = 3] = "RIGHT";
})(HeaderNavigationDirection || (HeaderNavigationDirection = {}));
var HeaderNavigationService = /** @class */ (function (_super) {
    __extends(HeaderNavigationService, _super);
    function HeaderNavigationService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HeaderNavigationService.prototype.postConstruct = function () {
        var _this = this;
        this.controllersService.whenReady(function (p) {
            _this.gridBodyCon = p.gridBodyCon;
        });
    };
    HeaderNavigationService.prototype.registerHeaderRoot = function (headerRoot) {
        this.headerRoot = headerRoot;
    };
    HeaderNavigationService.prototype.getHeaderRowCount = function () {
        var headerContainers = this.headerRoot.getHeaderContainers();
        return headerContainers.size === 0 ? 0 : this.getHeaderContainer().getRowComps().length;
    };
    HeaderNavigationService.prototype.getHeaderRowType = function (idx) {
        if (this.getHeaderRowCount()) {
            return this.getHeaderContainer().getRowComps()[idx].getType();
        }
    };
    HeaderNavigationService.prototype.getHeaderContainer = function (position) {
        if (position === void 0) { position = 'center'; }
        if (position === null) {
            position = 'center';
        }
        return this.headerRoot.getHeaderContainers().get(position);
    };
    /*
     * This method navigates grid header vertically
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    HeaderNavigationService.prototype.navigateVertically = function (direction, fromHeader, event) {
        if (!fromHeader) {
            fromHeader = this.focusController.getFocusedHeader();
        }
        if (!fromHeader) {
            return false;
        }
        var headerRowIndex = fromHeader.headerRowIndex, column = fromHeader.column;
        var rowLen = this.getHeaderRowCount();
        var isUp = direction === HeaderNavigationDirection.UP;
        var nextRow = isUp ? headerRowIndex - 1 : headerRowIndex + 1;
        var nextFocusColumn = null;
        var skipColumn = false;
        if (nextRow < 0) {
            nextRow = 0;
            nextFocusColumn = column;
            skipColumn = true;
        }
        if (nextRow >= rowLen) {
            nextRow = -1; // -1 indicates the focus should move to grid rows.
        }
        var currentRowType = this.getHeaderRowType(headerRowIndex);
        if (!skipColumn) {
            if (currentRowType === HeaderRowType.COLUMN_GROUP) {
                var currentColumn = column;
                nextFocusColumn = isUp ? column.getParent() : currentColumn.getDisplayedChildren()[0];
            }
            else if (currentRowType === HeaderRowType.FLOATING_FILTER) {
                nextFocusColumn = column;
            }
            else {
                var currentColumn = column;
                nextFocusColumn = isUp ? currentColumn.getParent() : currentColumn;
            }
            if (!nextFocusColumn) {
                return false;
            }
        }
        return this.focusController.focusHeaderPosition({ headerRowIndex: nextRow, column: nextFocusColumn }, undefined, false, true, event);
    };
    /*
     * This method navigates grid header horizontally
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    HeaderNavigationService.prototype.navigateHorizontally = function (direction, fromTab, event) {
        if (fromTab === void 0) { fromTab = false; }
        var focusedHeader = this.focusController.getFocusedHeader();
        var isLeft = direction === HeaderNavigationDirection.LEFT;
        var isRtl = this.gridOptionsWrapper.isEnableRtl();
        var nextHeader;
        var normalisedDirection;
        // either navigating to the left or isRtl (cannot be both)
        if (isLeft !== isRtl) {
            normalisedDirection = 'Before';
            nextHeader = this.headerPositionUtils.findHeader(focusedHeader, normalisedDirection);
        }
        else {
            normalisedDirection = 'After';
            nextHeader = this.headerPositionUtils.findHeader(focusedHeader, normalisedDirection);
        }
        if (nextHeader) {
            return this.focusController.focusHeaderPosition(nextHeader, normalisedDirection, fromTab, true, event);
        }
        if (!fromTab) {
            return true;
        }
        return this.focusNextHeaderRow(focusedHeader, normalisedDirection, event);
    };
    HeaderNavigationService.prototype.focusNextHeaderRow = function (focusedHeader, direction, event) {
        var currentIndex = focusedHeader.headerRowIndex;
        var nextPosition = null;
        var nextRowIndex;
        if (direction === 'Before') {
            if (currentIndex > 0) {
                nextRowIndex = currentIndex - 1;
                nextPosition = this.headerPositionUtils.findColAtEdgeForHeaderRow(nextRowIndex, 'end');
            }
        }
        else {
            nextRowIndex = currentIndex + 1;
            nextPosition = this.headerPositionUtils.findColAtEdgeForHeaderRow(nextRowIndex, 'start');
        }
        return this.focusController.focusHeaderPosition(nextPosition, direction, true, true, event);
    };
    HeaderNavigationService.prototype.scrollToColumn = function (column, direction) {
        if (direction === void 0) { direction = 'After'; }
        if (column.getPinned()) {
            return;
        }
        var columnToScrollTo;
        if (column instanceof ColumnGroup) {
            var columns = column.getDisplayedLeafColumns();
            columnToScrollTo = direction === 'Before' ? last(columns) : columns[0];
        }
        else {
            columnToScrollTo = column;
        }
        this.gridBodyCon.getScrollFeature().ensureColumnVisible(columnToScrollTo);
        // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
        // floating cell, the scrolls get out of sync
        this.gridBodyCon.getScrollFeature().horizontallyScrollHeaderCenterAndFloatingCenter();
        // need to flush frames, to make sure the correct cells are rendered
        this.animationFrameService.flushAllFrames();
    };
    __decorate([
        Autowired('focusController')
    ], HeaderNavigationService.prototype, "focusController", void 0);
    __decorate([
        Autowired('headerPositionUtils')
    ], HeaderNavigationService.prototype, "headerPositionUtils", void 0);
    __decorate([
        Autowired('animationFrameService')
    ], HeaderNavigationService.prototype, "animationFrameService", void 0);
    __decorate([
        Autowired('controllersService')
    ], HeaderNavigationService.prototype, "controllersService", void 0);
    __decorate([
        PostConstruct
    ], HeaderNavigationService.prototype, "postConstruct", null);
    HeaderNavigationService = __decorate([
        Bean('headerNavigationService')
    ], HeaderNavigationService);
    return HeaderNavigationService;
}(BeanStub));
export { HeaderNavigationService };
