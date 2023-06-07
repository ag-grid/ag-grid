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