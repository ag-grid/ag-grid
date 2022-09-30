/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var columnGroup_1 = require("../../entities/columnGroup");
var array_1 = require("../../utils/array");
var headerRowComp_1 = require("../row/headerRowComp");
var HeaderNavigationDirection;
(function (HeaderNavigationDirection) {
    HeaderNavigationDirection[HeaderNavigationDirection["UP"] = 0] = "UP";
    HeaderNavigationDirection[HeaderNavigationDirection["DOWN"] = 1] = "DOWN";
    HeaderNavigationDirection[HeaderNavigationDirection["LEFT"] = 2] = "LEFT";
    HeaderNavigationDirection[HeaderNavigationDirection["RIGHT"] = 3] = "RIGHT";
})(HeaderNavigationDirection = exports.HeaderNavigationDirection || (exports.HeaderNavigationDirection = {}));
var HeaderNavigationService = /** @class */ (function (_super) {
    __extends(HeaderNavigationService, _super);
    function HeaderNavigationService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HeaderNavigationService.prototype.postConstruct = function () {
        var _this = this;
        this.ctrlsService.whenReady(function (p) {
            _this.gridBodyCon = p.gridBodyCtrl;
        });
    };
    HeaderNavigationService.prototype.getHeaderRowCount = function () {
        var centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();
        return centerHeaderContainer ? centerHeaderContainer.getRowCount() : 0;
    };
    HeaderNavigationService.prototype.getHeaderRowType = function (rowIndex) {
        var centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();
        if (centerHeaderContainer) {
            return centerHeaderContainer.getRowType(rowIndex);
        }
    };
    /*
     * This method navigates grid header vertically
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    HeaderNavigationService.prototype.navigateVertically = function (direction, fromHeader, event) {
        if (!fromHeader) {
            fromHeader = this.focusService.getFocusedHeader();
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
            if (currentRowType === headerRowComp_1.HeaderRowType.COLUMN_GROUP) {
                var currentColumn = column;
                nextFocusColumn = isUp ? column.getParent() : currentColumn.getDisplayedChildren()[0];
            }
            else if (currentRowType === headerRowComp_1.HeaderRowType.FLOATING_FILTER) {
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
        return this.focusService.focusHeaderPosition({
            headerPosition: { headerRowIndex: nextRow, column: nextFocusColumn },
            allowUserOverride: true,
            event: event
        });
    };
    /*
     * This method navigates grid header horizontally
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    HeaderNavigationService.prototype.navigateHorizontally = function (direction, fromTab, event) {
        if (fromTab === void 0) { fromTab = false; }
        var focusedHeader = this.focusService.getFocusedHeader();
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
        if (nextHeader || !fromTab) {
            return this.focusService.focusHeaderPosition({
                headerPosition: nextHeader,
                direction: normalisedDirection,
                fromTab: fromTab,
                allowUserOverride: true,
                event: event
            });
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
        return this.focusService.focusHeaderPosition({
            headerPosition: nextPosition,
            direction: direction,
            fromTab: true,
            allowUserOverride: true,
            event: event
        });
    };
    HeaderNavigationService.prototype.scrollToColumn = function (column, direction) {
        if (direction === void 0) { direction = 'After'; }
        if (column.getPinned()) {
            return;
        }
        var columnToScrollTo;
        if (column instanceof columnGroup_1.ColumnGroup) {
            var columns = column.getDisplayedLeafColumns();
            columnToScrollTo = direction === 'Before' ? array_1.last(columns) : columns[0];
        }
        else {
            columnToScrollTo = column;
        }
        this.gridBodyCon.getScrollFeature().ensureColumnVisible(columnToScrollTo);
    };
    __decorate([
        context_1.Autowired('focusService')
    ], HeaderNavigationService.prototype, "focusService", void 0);
    __decorate([
        context_1.Autowired('headerPositionUtils')
    ], HeaderNavigationService.prototype, "headerPositionUtils", void 0);
    __decorate([
        context_1.Autowired('animationFrameService')
    ], HeaderNavigationService.prototype, "animationFrameService", void 0);
    __decorate([
        context_1.Autowired('ctrlsService')
    ], HeaderNavigationService.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.PostConstruct
    ], HeaderNavigationService.prototype, "postConstruct", null);
    HeaderNavigationService = __decorate([
        context_1.Bean('headerNavigationService')
    ], HeaderNavigationService);
    return HeaderNavigationService;
}(beanStub_1.BeanStub));
exports.HeaderNavigationService = HeaderNavigationService;
