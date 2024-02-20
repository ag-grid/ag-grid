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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Component, PostConstruct } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { LegendPanel } from "./legend/legendPanel";
import { CartesianAxisPanel } from "./axis/cartesianAxisPanel";
import { PolarAxisPanel } from "./axis/polarAxisPanel";
import { NavigatorPanel } from "./navigator/navigatorPanel";
import { ChartPanel } from "./chart/chartPanel";
import { SeriesPanel } from "./series/seriesPanel";
import { getSeriesType, hasGradientLegend, isPolar } from "../../utils/seriesTypeMapper";
import { GradientLegendPanel } from './legend/gradientLegendPanel';
export function getMaxValue(currentValue, defaultMaxValue) {
    return Math.max(currentValue, defaultMaxValue);
}
var DefaultFormatPanelDef = {
    groups: [
        { type: 'chart' },
        { type: 'legend' },
        { type: 'series' },
        { type: 'axis' },
        { type: 'navigator' },
    ]
};
var FormatPanel = /** @class */ (function (_super) {
    __extends(FormatPanel, _super);
    function FormatPanel(chartController, chartOptionsService) {
        var _this = _super.call(this, FormatPanel.TEMPLATE) || this;
        _this.chartController = chartController;
        _this.chartOptionsService = chartOptionsService;
        _this.panels = [];
        _this.isGroupPanelShownInSeries = function (group, seriesType) {
            // Determine whether the given panel group is shown depending on the active series type
            var _a, _b;
            // These panel groups are always shown regardless of series type
            var commonGroupPanels = ['chart', 'legend', 'series'];
            if (commonGroupPanels.includes(group)) {
                return true;
            }
            // These panel groups depend on the selected series type
            var extendedGroupPanels = {
                'bar': ['axis', 'navigator'],
                'column': ['axis', 'navigator'],
                'line': ['axis', 'navigator'],
                'area': ['axis', 'navigator'],
                'scatter': ['axis', 'navigator'],
                'bubble': ['axis', 'navigator'],
                'histogram': ['axis', 'navigator'],
                'cartesian': ['axis', 'navigator'],
                'radial-column': ['axis'],
                'radial-bar': ['axis'],
                'radar-line': ['axis'],
                'radar-area': ['axis'],
                'nightingale': ['axis'],
                'range-bar': ['axis', 'navigator'],
                'range-area': ['axis', 'navigator'],
                'treemap': [],
                'sunburst': [],
                'heatmap': ['axis'],
                'waterfall': ['axis', 'navigator'],
                'box-plot': ['axis', 'navigator'],
            };
            return (_b = (_a = extendedGroupPanels[seriesType]) === null || _a === void 0 ? void 0 : _a.includes(group)) !== null && _b !== void 0 ? _b : false;
        };
        return _this;
    }
    FormatPanel.prototype.init = function () {
        var _this = this;
        this.createPanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, function () { return _this.createPanels(true); });
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, function () { return _this.createPanels(false); });
    };
    FormatPanel.prototype.createPanels = function (reuse) {
        var _this = this;
        var _a;
        var chartType = this.chartController.getChartType();
        var isGrouping = this.chartController.isGrouping();
        var seriesType = getSeriesType(chartType);
        if (reuse && chartType === this.chartType && isGrouping === this.isGrouping) {
            // existing panels can be re-used
            return;
        }
        this.destroyPanels();
        (_a = this.getFormatPanelDef().groups) === null || _a === void 0 ? void 0 : _a.forEach(function (groupDef) {
            var group = groupDef.type;
            // ensure the group should be displayed for the current series type
            if (!_this.isGroupPanelShownInSeries(group, seriesType)) {
                return;
            }
            var opts = {
                chartController: _this.chartController,
                chartOptionsService: _this.chartOptionsService,
                isExpandedOnInit: groupDef.isOpen,
                seriesType: seriesType
            };
            if (group === 'chart') {
                _this.addComponent(new ChartPanel(opts));
            }
            else if (group === 'legend') {
                // Some chart types require non-standard legend options, so choose the appropriate panel
                var panel = hasGradientLegend(chartType) ? new GradientLegendPanel(opts) : new LegendPanel(opts);
                _this.addComponent(panel);
            }
            else if (group === 'axis') {
                // Polar charts have different axis options from cartesian charts, so choose the appropriate panel
                var panel = isPolar(chartType) ? new PolarAxisPanel(opts) : new CartesianAxisPanel(opts);
                _this.addComponent(panel);
            }
            else if (group === 'series') {
                _this.addComponent(new SeriesPanel(opts));
            }
            else if (group === 'navigator') {
                _this.addComponent(new NavigatorPanel(opts));
            }
            else {
                console.warn("AG Grid: invalid charts format panel group name supplied: '".concat(groupDef.type, "'"));
            }
        });
        this.chartType = chartType;
        this.isGrouping = isGrouping;
    };
    FormatPanel.prototype.getFormatPanelDef = function () {
        var _a;
        var userProvidedFormatPanelDef = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.formatPanel;
        return userProvidedFormatPanelDef ? userProvidedFormatPanelDef : DefaultFormatPanelDef;
    };
    FormatPanel.prototype.addComponent = function (component) {
        this.createBean(component);
        this.panels.push(component);
        component.addCssClass('ag-chart-format-section');
        this.getGui().appendChild(component.getGui());
    };
    FormatPanel.prototype.destroyPanels = function () {
        var _this = this;
        this.panels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
        this.panels = [];
    };
    FormatPanel.prototype.destroy = function () {
        this.destroyPanels();
        _super.prototype.destroy.call(this);
    };
    FormatPanel.TEMPLATE = "<div class=\"ag-chart-format-wrapper\"></div>";
    __decorate([
        PostConstruct
    ], FormatPanel.prototype, "init", null);
    return FormatPanel;
}(Component));
export { FormatPanel };
