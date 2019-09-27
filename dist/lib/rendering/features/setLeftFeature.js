/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
Object.defineProperty(exports, "__esModule", { value: true });
var column_1 = require("../../entities/column");
var beanStub_1 = require("../../context/beanStub");
var constants_1 = require("../../constants");
var utils_1 = require("../../utils");
var SetLeftFeature = /** @class */ (function (_super) {
    __extends(SetLeftFeature, _super);
    function SetLeftFeature(columnOrGroup, eCell, beans, colsSpanning) {
        var _this = _super.call(this) || this;
        _this.columnOrGroup = columnOrGroup;
        _this.eCell = eCell;
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
            return utils_1._.last(this.colsSpanning);
        }
        else {
            return this.columnOrGroup;
        }
    };
    SetLeftFeature.prototype.init = function () {
        this.addDestroyableEventListener(this.columnOrGroup, column_1.Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.setLeftFirstTime();
    };
    SetLeftFeature.prototype.setLeftFirstTime = function () {
        var suppressMoveAnimation = this.beans.gridOptionsWrapper.isSuppressColumnMoveAnimation();
        var oldLeftExists = utils_1._.exists(this.columnOrGroup.getOldLeft());
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
        var left = this.getColumnOrGroup().getLeft();
        var oldLeft = this.getColumnOrGroup().getOldLeft();
        this.setLeft(oldLeft);
        // we must keep track of the left we want to set to, as this would otherwise lead to a race
        // condition, if the user changed the left value many times in one VM turn, then we want to make
        // make sure the actualLeft we set in the timeout below (in the next VM turn) is the correct left
        // position. eg if user changes column position twice, then setLeft() below executes twice in next
        // VM turn, but only one (the correct one) should get applied.
        this.actualLeft = left;
        this.beans.columnAnimationService.executeNextVMTurn(function () {
            // test this left value is the latest one to be applied, and if not, do nothing
            if (_this.actualLeft === left) {
                _this.setLeft(left);
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
        if (colOrGroup.getPinned() === column_1.Column.PINNED_LEFT) {
            return leftPosition;
        }
        else if (colOrGroup.getPinned() === column_1.Column.PINNED_RIGHT) {
            var leftWidth = this.beans.columnController.getPinnedLeftContainerWidth();
            var bodyWidth = this.beans.columnController.getBodyContainerWidth();
            return leftWidth + bodyWidth + leftPosition;
        }
        else {
            // is in body
            var leftWidth = this.beans.columnController.getPinnedLeftContainerWidth();
            return leftWidth + leftPosition;
        }
    };
    SetLeftFeature.prototype.setLeft = function (value) {
        // if the value is null, then that means the column is no longer
        // displayed. there is logic in the rendering to fade these columns
        // out, so we don't try and change their left positions.
        if (utils_1._.exists(value)) {
            this.eCell.style.left = value + "px";
        }
    };
    return SetLeftFeature;
}(beanStub_1.BeanStub));
exports.SetLeftFeature = SetLeftFeature;
