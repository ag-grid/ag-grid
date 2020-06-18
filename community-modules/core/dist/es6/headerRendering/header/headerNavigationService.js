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
import { Bean, Autowired } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { ColumnGroup } from "../../entities/columnGroup";
import { HeaderRowType } from "../headerRowComp";
import { _ } from "../../utils";
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
    HeaderNavigationService.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
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
    HeaderNavigationService.prototype.navigateVertically = function (direction, fromHeader) {
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
        if (nextRow < 0) {
            return false;
        }
        if (nextRow >= rowLen) {
            // focusGridView returns false when the grid has no cells rendered.
            return this.focusController.focusGridView();
        }
        var currentRowType = this.getHeaderRowType(headerRowIndex);
        var nextFocusColumn;
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
        this.focusController.focusHeaderPosition({
            headerRowIndex: nextRow,
            column: nextFocusColumn
        });
        return true;
    };
    /*
     * This method navigates grid header horizontally
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    HeaderNavigationService.prototype.navigateHorizontally = function (direction, fromTab) {
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
            this.focusController.focusHeaderPosition(nextHeader, normalisedDirection);
            return true;
        }
        if (!fromTab) {
            return true;
        }
        return this.focusNextHeaderRow(focusedHeader, normalisedDirection);
    };
    HeaderNavigationService.prototype.focusNextHeaderRow = function (focusedHeader, direction) {
        var currentIndex = focusedHeader.headerRowIndex;
        var nextPosition;
        var nextRowIndex;
        if (direction === 'Before') {
            if (currentIndex === 0) {
                return false;
            }
            nextRowIndex = currentIndex - 1;
            nextPosition = this.headerPositionUtils.findColAtEdgeForHeaderRow(nextRowIndex, 'end');
        }
        else {
            nextRowIndex = currentIndex + 1;
            nextPosition = this.headerPositionUtils.findColAtEdgeForHeaderRow(nextRowIndex, 'start');
        }
        if (nextPosition) {
            if (nextPosition.headerRowIndex === -1) {
                return this.focusController.focusGridView(nextPosition.column);
            }
            return this.focusController.focusHeaderPosition(nextPosition, direction);
        }
        return false;
    };
    HeaderNavigationService.prototype.scrollToColumn = function (column, direction) {
        if (direction === void 0) { direction = 'After'; }
        if (column.getPinned()) {
            return;
        }
        var columnToScrollTo;
        if (column instanceof ColumnGroup) {
            var columns = column.getDisplayedLeafColumns();
            columnToScrollTo = direction === 'Before' ? _.last(columns) : columns[0];
        }
        else {
            columnToScrollTo = column;
        }
        this.gridPanel.ensureColumnVisible(columnToScrollTo);
        // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
        // floating cell, the scrolls get out of sync
        this.gridPanel.horizontallyScrollHeaderCenterAndFloatingCenter();
        // need to flush frames, to make sure the correct cells are rendered
        this.animationFrameService.flushAllFrames();
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], HeaderNavigationService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('focusController')
    ], HeaderNavigationService.prototype, "focusController", void 0);
    __decorate([
        Autowired('headerPositionUtils')
    ], HeaderNavigationService.prototype, "headerPositionUtils", void 0);
    __decorate([
        Autowired('animationFrameService')
    ], HeaderNavigationService.prototype, "animationFrameService", void 0);
    HeaderNavigationService = __decorate([
        Bean('headerNavigationService')
    ], HeaderNavigationService);
    return HeaderNavigationService;
}(BeanStub));
export { HeaderNavigationService };
