/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
var column_1 = require("../../entities/column");
var beanStub_1 = require("../../context/beanStub");
var constants_1 = require("../../constants/constants");
var context_1 = require("../../context/context");
var aria_1 = require("../../utils/aria");
var array_1 = require("../../utils/array");
var generic_1 = require("../../utils/generic");
var eventKeys_1 = require("../../eventKeys");
var SetLeftFeature = /** @class */ (function (_super) {
    __extends(SetLeftFeature, _super);
    function SetLeftFeature(columnOrGroup, eCell, beans, colsSpanning) {
        var _this = _super.call(this) || this;
        _this.columnOrGroup = columnOrGroup;
        _this.eCell = eCell;
        _this.ariaEl = _this.eCell.querySelector('[role=columnheader]') || _this.eCell;
        _this.colsSpanning = colsSpanning;
        _this.beans = beans;
        _this.printLayout = beans.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_PRINT;
        return _this;
    }
    SetLeftFeature.prototype.setColsSpanning = function (colsSpanning) {
        this.colsSpanning = colsSpanning;
        this.onLeftChanged();
    };
    SetLeftFeature.prototype.getColumnOrGroup = function () {
        if (this.beans.gridOptionsWrapper.isEnableRtl() && this.colsSpanning) {
            return array_1.last(this.colsSpanning);
        }
        return this.columnOrGroup;
    };
    SetLeftFeature.prototype.postConstruct = function () {
        this.addManagedListener(this.columnOrGroup, column_1.Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.setLeftFirstTime();
        // when in print layout, the left position is also dependent on the width of the pinned sections.
        // so additionally update left if any column width changes.
        if (this.printLayout) {
            this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onLeftChanged.bind(this));
        }
    };
    SetLeftFeature.prototype.setLeftFirstTime = function () {
        var suppressMoveAnimation = this.beans.gridOptionsWrapper.isSuppressColumnMoveAnimation();
        var oldLeftExists = generic_1.exists(this.columnOrGroup.getOldLeft());
        var animateColumnMove = this.beans.columnAnimationService.isActive() && oldLeftExists && !suppressMoveAnimation;
        if (animateColumnMove) {
            this.animateInLeft();
        }
        else {
            this.onLeftChanged();
        }
    };
    SetLeftFeature.prototype.animateInLeft = function () {
        var _this = this;
        var colOrGroup = this.getColumnOrGroup();
        var left = colOrGroup.getLeft();
        var oldLeft = colOrGroup.getOldLeft();
        var oldActualLeft = this.modifyLeftForPrintLayout(colOrGroup, oldLeft);
        var actualLeft = this.modifyLeftForPrintLayout(colOrGroup, left);
        this.setLeft(oldActualLeft);
        // we must keep track of the left we want to set to, as this would otherwise lead to a race
        // condition, if the user changed the left value many times in one VM turn, then we want to make
        // make sure the actualLeft we set in the timeout below (in the next VM turn) is the correct left
        // position. eg if user changes column position twice, then setLeft() below executes twice in next
        // VM turn, but only one (the correct one) should get applied.
        this.actualLeft = actualLeft;
        this.beans.columnAnimationService.executeNextVMTurn(function () {
            // test this left value is the latest one to be applied, and if not, do nothing
            if (_this.actualLeft === actualLeft) {
                _this.setLeft(actualLeft);
            }
        });
    };
    SetLeftFeature.prototype.onLeftChanged = function () {
        var colOrGroup = this.getColumnOrGroup();
        var left = colOrGroup.getLeft();
        this.actualLeft = this.modifyLeftForPrintLayout(colOrGroup, left);
        this.setLeft(this.actualLeft);
    };
    SetLeftFeature.prototype.modifyLeftForPrintLayout = function (colOrGroup, leftPosition) {
        if (!this.printLayout) {
            return leftPosition;
        }
        if (colOrGroup.getPinned() === constants_1.Constants.PINNED_LEFT) {
            return leftPosition;
        }
        var leftWidth = this.beans.columnController.getDisplayedColumnsLeftWidth();
        if (colOrGroup.getPinned() === constants_1.Constants.PINNED_RIGHT) {
            var bodyWidth = this.beans.columnController.getBodyContainerWidth();
            return leftWidth + bodyWidth + leftPosition;
        }
        // is in body
        return leftWidth + leftPosition;
    };
    SetLeftFeature.prototype.setLeft = function (value) {
        // if the value is null, then that means the column is no longer
        // displayed. there is logic in the rendering to fade these columns
        // out, so we don't try and change their left positions.
        if (generic_1.exists(value)) {
            this.eCell.style.left = value + "px";
        }
        var indexColumn;
        if (this.columnOrGroup instanceof column_1.Column) {
            indexColumn = this.columnOrGroup;
        }
        else {
            var columnGroup = this.columnOrGroup;
            var children = columnGroup.getLeafColumns();
            if (!children.length) {
                return;
            }
            if (children.length > 1) {
                aria_1.setAriaColSpan(this.ariaEl, children.length);
            }
            indexColumn = children[0];
        }
        var index = this.beans.columnController.getAriaColumnIndex(indexColumn);
        aria_1.setAriaColIndex(this.ariaEl, index);
    };
    __decorate([
        context_1.PostConstruct
    ], SetLeftFeature.prototype, "postConstruct", null);
    return SetLeftFeature;
}(beanStub_1.BeanStub));
exports.SetLeftFeature = SetLeftFeature;

//# sourceMappingURL=setLeftFeature.js.map
