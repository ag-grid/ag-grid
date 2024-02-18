var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { BeanStub } from "../context/beanStub";
import { CustomTooltipFeature } from "./customTooltipFeature";
var TooltipFeature = /** @class */ (function (_super) {
    __extends(TooltipFeature, _super);
    function TooltipFeature(ctrl, beans) {
        var _this = _super.call(this) || this;
        _this.ctrl = ctrl;
        _this.beans = beans;
        return _this;
    }
    TooltipFeature.prototype.setComp = function (eGui) {
        this.eGui = eGui;
        this.setupTooltip();
    };
    TooltipFeature.prototype.setBrowserTooltip = function (tooltip) {
        var name = 'title';
        if (tooltip != null && tooltip != '') {
            this.eGui.setAttribute(name, tooltip);
        }
        else {
            this.eGui.removeAttribute(name);
        }
    };
    TooltipFeature.prototype.setupTooltip = function () {
        this.browserTooltips = this.beans.gridOptionsService.get('enableBrowserTooltips');
        this.updateTooltipText();
        if (this.browserTooltips) {
            this.setBrowserTooltip(this.tooltip);
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
        var _a, _b, _c, _d;
        if (this.genericTooltipFeature != null) {
            return;
        }
        var parent = {
            getTooltipParams: function () { return _this.getTooltipParams(); },
            getGui: function () { return _this.ctrl.getGui(); }
        };
        this.genericTooltipFeature = this.createManagedBean(new CustomTooltipFeature(parent, (_b = (_a = this.ctrl).getTooltipShowDelayOverride) === null || _b === void 0 ? void 0 : _b.call(_a), (_d = (_c = this.ctrl).getTooltipHideDelayOverride) === null || _d === void 0 ? void 0 : _d.call(_c)), this.beans.context);
    };
    TooltipFeature.prototype.refreshToolTip = function () {
        this.updateTooltipText();
        if (this.browserTooltips) {
            this.setBrowserTooltip(this.tooltip);
        }
    };
    TooltipFeature.prototype.getTooltipParams = function () {
        var _this = this;
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
            hideTooltipCallback: function () { return _this.genericTooltipFeature.hideTooltip(true); }
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
}(BeanStub));
export { TooltipFeature };
