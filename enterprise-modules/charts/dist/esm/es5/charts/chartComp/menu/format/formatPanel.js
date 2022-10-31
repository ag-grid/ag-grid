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
import { _, Component, PostConstruct } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { LegendPanel } from "./legend/legendPanel";
import { AxisPanel } from "./axis/axisPanel";
import { NavigatorPanel } from "./navigator/navigatorPanel";
import { ChartPanel } from "./chart/chartPanel";
import { SeriesPanel } from "./series/seriesPanel";
import { getSeriesType } from "../../utils/seriesTypeMapper";
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
            var commonGroupPanels = ['chart', 'legend', 'series'];
            if (commonGroupPanels.includes(group)) {
                return true;
            }
            var cartesianOnlyGroupPanels = ['axis', 'navigator'];
            var cartesianSeries = ['bar', 'column', 'line', 'area', 'scatter', 'histogram', 'cartesian'];
            return !!(cartesianOnlyGroupPanels.includes(group) && cartesianSeries.includes(seriesType));
        };
        return _this;
    }
    FormatPanel.prototype.init = function () {
        this.createPanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.createPanels.bind(this));
    };
    FormatPanel.prototype.createPanels = function () {
        var _this = this;
        var _a;
        var chartType = this.chartController.getChartType();
        var isGrouping = this.chartController.isGrouping();
        var seriesType = getSeriesType(chartType);
        if (chartType === this.chartType && isGrouping === this.isGrouping) {
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
                _this.addComponent(new LegendPanel(opts));
            }
            else if (group === 'axis') {
                _this.addComponent(new AxisPanel(opts));
            }
            else if (group === 'series') {
                _this.addComponent(new SeriesPanel(opts));
            }
            else if (group === 'navigator') {
                _this.addComponent(new NavigatorPanel(opts));
            }
            else {
                console.warn("AG Grid: invalid charts format panel group name supplied: '" + groupDef.type + "'");
            }
        });
        this.chartType = chartType;
        this.isGrouping = isGrouping;
    };
    FormatPanel.prototype.getFormatPanelDef = function () {
        var _a;
        var userProvidedFormatPanelDef = (_a = this.gridOptionsWrapper.getChartToolPanelsDef()) === null || _a === void 0 ? void 0 : _a.formatPanel;
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
