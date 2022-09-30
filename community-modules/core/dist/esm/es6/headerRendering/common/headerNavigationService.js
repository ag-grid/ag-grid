/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../../context/context";
import { ColumnGroup } from "../../entities/columnGroup";
import { last } from "../../utils/array";
import { HeaderRowType } from "../row/headerRowComp";
export var HeaderNavigationDirection;
(function (HeaderNavigationDirection) {
    HeaderNavigationDirection[HeaderNavigationDirection["UP"] = 0] = "UP";
    HeaderNavigationDirection[HeaderNavigationDirection["DOWN"] = 1] = "DOWN";
    HeaderNavigationDirection[HeaderNavigationDirection["LEFT"] = 2] = "LEFT";
    HeaderNavigationDirection[HeaderNavigationDirection["RIGHT"] = 3] = "RIGHT";
})(HeaderNavigationDirection || (HeaderNavigationDirection = {}));
let HeaderNavigationService = class HeaderNavigationService extends BeanStub {
    postConstruct() {
        this.ctrlsService.whenReady(p => {
            this.gridBodyCon = p.gridBodyCtrl;
        });
    }
    getHeaderRowCount() {
        const centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();
        return centerHeaderContainer ? centerHeaderContainer.getRowCount() : 0;
    }
    getHeaderRowType(rowIndex) {
        const centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();
        if (centerHeaderContainer) {
            return centerHeaderContainer.getRowType(rowIndex);
        }
    }
    /*
     * This method navigates grid header vertically
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    navigateVertically(direction, fromHeader, event) {
        if (!fromHeader) {
            fromHeader = this.focusService.getFocusedHeader();
        }
        if (!fromHeader) {
            return false;
        }
        const { headerRowIndex, column } = fromHeader;
        const rowLen = this.getHeaderRowCount();
        const isUp = direction === HeaderNavigationDirection.UP;
        let nextRow = isUp ? headerRowIndex - 1 : headerRowIndex + 1;
        let nextFocusColumn = null;
        let skipColumn = false;
        if (nextRow < 0) {
            nextRow = 0;
            nextFocusColumn = column;
            skipColumn = true;
        }
        if (nextRow >= rowLen) {
            nextRow = -1; // -1 indicates the focus should move to grid rows.
        }
        const currentRowType = this.getHeaderRowType(headerRowIndex);
        if (!skipColumn) {
            if (currentRowType === HeaderRowType.COLUMN_GROUP) {
                const currentColumn = column;
                nextFocusColumn = isUp ? column.getParent() : currentColumn.getDisplayedChildren()[0];
            }
            else if (currentRowType === HeaderRowType.FLOATING_FILTER) {
                nextFocusColumn = column;
            }
            else {
                const currentColumn = column;
                nextFocusColumn = isUp ? currentColumn.getParent() : currentColumn;
            }
            if (!nextFocusColumn) {
                return false;
            }
        }
        return this.focusService.focusHeaderPosition({
            headerPosition: { headerRowIndex: nextRow, column: nextFocusColumn },
            allowUserOverride: true,
            event
        });
    }
    /*
     * This method navigates grid header horizontally
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    navigateHorizontally(direction, fromTab = false, event) {
        const focusedHeader = this.focusService.getFocusedHeader();
        const isLeft = direction === HeaderNavigationDirection.LEFT;
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        let nextHeader;
        let normalisedDirection;
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
                fromTab,
                allowUserOverride: true,
                event
            });
        }
        return this.focusNextHeaderRow(focusedHeader, normalisedDirection, event);
    }
    focusNextHeaderRow(focusedHeader, direction, event) {
        const currentIndex = focusedHeader.headerRowIndex;
        let nextPosition = null;
        let nextRowIndex;
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
            direction,
            fromTab: true,
            allowUserOverride: true,
            event
        });
    }
    scrollToColumn(column, direction = 'After') {
        if (column.getPinned()) {
            return;
        }
        let columnToScrollTo;
        if (column instanceof ColumnGroup) {
            const columns = column.getDisplayedLeafColumns();
            columnToScrollTo = direction === 'Before' ? last(columns) : columns[0];
        }
        else {
            columnToScrollTo = column;
        }
        this.gridBodyCon.getScrollFeature().ensureColumnVisible(columnToScrollTo);
    }
};
__decorate([
    Autowired('focusService')
], HeaderNavigationService.prototype, "focusService", void 0);
__decorate([
    Autowired('headerPositionUtils')
], HeaderNavigationService.prototype, "headerPositionUtils", void 0);
__decorate([
    Autowired('animationFrameService')
], HeaderNavigationService.prototype, "animationFrameService", void 0);
__decorate([
    Autowired('ctrlsService')
], HeaderNavigationService.prototype, "ctrlsService", void 0);
__decorate([
    PostConstruct
], HeaderNavigationService.prototype, "postConstruct", null);
HeaderNavigationService = __decorate([
    Bean('headerNavigationService')
], HeaderNavigationService);
export { HeaderNavigationService };
