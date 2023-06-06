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
        var _this = this;
        this.createPanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.createPanels.bind(this));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, function () { return _this.createPanels(true); });
    };
    FormatPanel.prototype.createPanels = function (recreate) {
        var _this = this;
        var _a;
        var chartType = this.chartController.getChartType();
        var isGrouping = this.chartController.isGrouping();
        var seriesType = getSeriesType(chartType);
        if (!recreate && (chartType === this.chartType && isGrouping === this.isGrouping)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0UGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2Zvcm1hdC9mb3JtYXRQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUtELFNBQVMsRUFDVCxhQUFhLEVBQ2hCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVoRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFtQixhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQVM5RSxNQUFNLFVBQVUsV0FBVyxDQUFDLFlBQW9CLEVBQUUsZUFBdUI7SUFDckUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBRUQsSUFBTSxxQkFBcUIsR0FBcUI7SUFDNUMsTUFBTSxFQUFFO1FBQ0osRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO1FBQ2pCLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUNsQixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDbEIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO1FBQ2hCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtLQUN4QjtDQUNKLENBQUM7QUFFRjtJQUFpQywrQkFBUztJQU90QyxxQkFDcUIsZUFBZ0Ms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