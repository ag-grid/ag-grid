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
Object.defineProperty(exports, "__esModule", { value: true });
var beanStub_1 = require("../context/beanStub");
var customTooltipFeature_1 = require("./customTooltipFeature");
var TooltipFeature = /** @class */ (function (_super) {
    __extends(TooltipFeature, _super);
    function TooltipFeature(ctrl, beans) {
        var _this = _super.call(this) || this;
        _this.ctrl = ctrl;
        _this.beans = beans;
        return _this;
    }
    TooltipFeature.prototype.setComp = function (comp) {
        this.comp = comp;
        this.setupTooltip();
    };
    TooltipFeature.prototype.setupTooltip = function () {
        this.browserTooltips = this.beans.gridOptionsWrapper.isEnableBrowserTooltips();
        this.updateTooltipText();
        if (this.browserTooltips) {
            this.comp.setTitle(this.tooltip != null ? this.tooltip : undefined);
        }
        else {
            this.createTooltipFeatureIfNeeded();
        }
    };
    TooltipFeature.prototype.updateTooltipText = function () {
        this.tooltip = this.ctrl.getTooltipValue();
    };
    TooltipFeature.prototype.createTooltipFeatureIfNeeded = function () {
        var _this = this;
        if (this.genericTooltipFeature != null) {
            return;
        }
        var parent = {
            getTooltipParams: function () { return _this.getTooltipParams(); },
            getGui: function () { return _this.ctrl.getGui(); }
        };
        this.genericTooltipFeature = this.createManagedBean(new customTooltipFeature_1.CustomTooltipFeature(parent), this.beans.context);
    };
    TooltipFeature.prototype.refreshToolTip = function () {
        this.updateTooltipText();
        if (this.browserTooltips) {
            this.comp.setTitle(this.tooltip != null ? this.tooltip : undefined);
        }
    };
    TooltipFeature.prototype.getTooltipParams = function () {
        var ctrl = this.ctrl;
        var column = ctrl.getColumn ? ctrl.getColumn() : undefined;
        var colDef = ctrl.getColDef ? ctrl.getColDef() : undefined;
        var rowNode = ctrl.getRowNode ? ctrl.getRowNode() : undefined;
        return {
            location: ctrl.getLocation(),
            colDef: colDef,
            column: column,
            rowIndex: ctrl.getRowIndex ? ctrl.getRowIndex() : undefined,
            node: rowNode,
            data: rowNode ? rowNode.data : undefined,
            value: this.getTooltipText(),
            valueFormatted: ctrl.getValueFormatted ? ctrl.getValueFormatted() : undefined,
        };
    };
    TooltipFeature.prototype.getTooltipText = function () {
        return this.tooltip;
    };
    // overriding to make public, as we don't dispose this bean via context
    TooltipFeature.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return TooltipFeature;
}(beanStub_1.BeanStub));
exports.TooltipFeature = TooltipFeature;
