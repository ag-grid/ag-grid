/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { BeanStub } from "../../context/beanStub";
import { escapeString } from "../../utils/string";
import { exists } from "../../utils/generic";
import { TooltipFeature } from "../../widgets/tooltipFeature";
import { getValueUsingField } from "../../utils/object";
var CellTooltipFeature = /** @class */ (function (_super) {
    __extends(CellTooltipFeature, _super);
    function CellTooltipFeature(ctrl, beans) {
        var _this = _super.call(this) || this;
        _this.cellCtrl = ctrl;
        _this.beans = beans;
        _this.column = ctrl.getColumn();
        _this.rowNode = ctrl.getRowNode();
        return _this;
    }
    CellTooltipFeature.prototype.setComp = function (comp) {
        this.cellComp = comp;
        this.setupTooltip();
    };
    CellTooltipFeature.prototype.setupTooltip = function () {
        this.browserTooltips = this.beans.gridOptionsWrapper.isEnableBrowserTooltips();
        this.updateTooltipText();
        if (this.browserTooltips) {
            this.cellComp.setTitle(this.tooltipSanatised != null ? this.tooltipSanatised : undefined);
        }
        else {
            this.createTooltipFeatureIfNeeded();
        }
    };
    CellTooltipFeature.prototype.updateTooltipText = function () {
        this.tooltip = this.getToolTip();
        this.tooltipSanatised = escapeString(this.tooltip);
    };
    CellTooltipFeature.prototype.createTooltipFeatureIfNeeded = function () {
        var _this = this;
        if (this.genericTooltipFeature != null) {
            return;
        }
        var parent = {
            getTooltipParams: function () { return _this.getTooltipParams(); },
            getGui: function () { return _this.cellCtrl.getGui(); }
        };
        this.genericTooltipFeature = this.createManagedBean(new TooltipFeature(parent), this.beans.context);
    };
    CellTooltipFeature.prototype.refreshToolTip = function () {
        this.updateTooltipText();
        if (this.browserTooltips) {
            this.cellComp.setTitle(this.tooltipSanatised != null ? this.tooltipSanatised : undefined);
        }
    };
    CellTooltipFeature.prototype.getToolTip = function () {
        var colDef = this.column.getColDef();
        var data = this.rowNode.data;
        if (colDef.tooltipField && exists(data)) {
            return getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
        }
        var valueGetter = colDef.tooltipValueGetter;
        if (valueGetter) {
            return valueGetter(__assign(__assign({ api: this.beans.gridOptionsWrapper.getApi(), columnApi: this.beans.gridOptionsWrapper.getColumnApi(), context: this.beans.gridOptionsWrapper.getContext() }, this.getTooltipParams()), { value: this.cellCtrl.getValue() }));
        }
        return null;
    };
    CellTooltipFeature.prototype.getTooltipParams = function () {
        return {
            location: 'cell',
            colDef: this.column.getColDef(),
            column: this.column,
            rowIndex: this.cellCtrl.getCellPosition().rowIndex,
            node: this.rowNode,
            data: this.rowNode.data,
            value: this.getTooltipText(),
            valueFormatted: this.cellCtrl.getValueFormatted(),
        };
    };
    CellTooltipFeature.prototype.getTooltipText = function () {
        return this.tooltip;
    };
    // overriding to make public, as we don't dispose this bean via context
    CellTooltipFeature.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return CellTooltipFeature;
}(BeanStub));
export { CellTooltipFeature };
