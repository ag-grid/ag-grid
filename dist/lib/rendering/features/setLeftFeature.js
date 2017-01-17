/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v7.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("../../utils");
var column_1 = require("../../entities/column");
var beanStub_1 = require("../../context/beanStub");
var SetLeftFeature = (function (_super) {
    __extends(SetLeftFeature, _super);
    function SetLeftFeature(columnOrGroup, eCell) {
        _super.call(this);
        this.columnOrGroup = columnOrGroup;
        this.eCell = eCell;
        this.init();
    }
    SetLeftFeature.prototype.init = function () {
        this.addDestroyableEventListener(this.columnOrGroup, column_1.Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.onLeftChanged();
    };
    SetLeftFeature.prototype.onLeftChanged = function () {
        var newLeft = this.columnOrGroup.getLeft();
        if (utils_1.Utils.exists(newLeft)) {
            this.eCell.style.left = this.columnOrGroup.getLeft() + 'px';
        }
        else {
            this.eCell.style.left = '';
        }
    };
    return SetLeftFeature;
}(beanStub_1.BeanStub));
exports.SetLeftFeature = SetLeftFeature;
