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
const DefaultFormatPanelDef = {
    groups: [
        { type: 'chart' },
        { type: 'legend' },
        { type: 'series' },
        { type: 'axis' },
        { type: 'navigator' },
    ]
};
export class FormatPanel extends Component {
    constructor(chartController, chartOptionsService) {
        super(FormatPanel.TEMPLATE);
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.panels = [];
        this.isGroupPanelShownInSeries = (group, seriesType) => {
            const commonGroupPanels = ['chart', 'legend', 'series'];
            if (commonGroupPanels.includes(group)) {
                return true;
            }
            const cartesianOnlyGroupPanels = ['axis', 'navigator'];
            const cartesianSeries = ['bar', 'column', 'line', 'area', 'scatter', 'histogram', 'cartesian'];
            return !!(cartesianOnlyGroupPanels.includes(group) && cartesianSeries.includes(seriesType));
        };
    }
    init() {
        this.createPanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, () => this.createPanels(true));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, () => this.createPanels(false));
    }
    createPanels(reuse) {
        var _a;
        const chartType = this.chartController.getChartType();
        const isGrouping = this.chartController.isGrouping();
        const seriesType = getSeriesType(chartType);
        if (reuse && chartType === this.chartType && isGrouping === this.isGrouping) {
            // existing panels can be re-used
            return;
        }
        this.destroyPanels();
        (_a = this.getFormatPanelDef().groups) === null || _a === void 0 ? void 0 : _a.forEach((groupDef) => {
            const group = groupDef.type;
            // ensure the group should be displayed for the current series type
            if (!this.isGroupPanelShownInSeries(group, seriesType)) {
                return;
            }
            const opts = {
                chartController: this.chartController,
                chartOptionsService: this.chartOptionsService,
                isExpandedOnInit: groupDef.isOpen,
                seriesType
            };
            if (group === 'chart') {
                this.addComponent(new ChartPanel(opts));
            }
            else if (group === 'legend') {
                this.addComponent(new LegendPanel(opts));
            }
            else if (group === 'axis') {
                this.addComponent(new AxisPanel(opts));
            }
            else if (group === 'series') {
                this.addComponent(new SeriesPanel(opts));
            }
            else if (group === 'navigator') {
                this.addComponent(new NavigatorPanel(opts));
            }
            else {
                console.warn(`AG Grid: invalid charts format panel group name supplied: '${groupDef.type}'`);
            }
        });
        this.chartType = chartType;
        this.isGrouping = isGrouping;
    }
    getFormatPanelDef() {
        var _a;
        const userProvidedFormatPanelDef = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.formatPanel;
        return userProvidedFormatPanelDef ? userProvidedFormatPanelDef : DefaultFormatPanelDef;
    }
    addComponent(component) {
        this.createBean(component);
        this.panels.push(component);
        component.addCssClass('ag-chart-format-section');
        this.getGui().appendChild(component.getGui());
    }
    destroyPanels() {
        this.panels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }
    destroy() {
        this.destroyPanels();
        super.destroy();
    }
}
FormatPanel.TEMPLATE = `<div class="ag-chart-format-wrapper"></div>`;
__decorate([
    PostConstruct
], FormatPanel.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0UGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2Zvcm1hdC9mb3JtYXRQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUtELFNBQVMsRUFDVCxhQUFhLEVBQ2hCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVoRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFtQixhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQVM5RSxNQUFNLFVBQVUsV0FBVyxDQUFDLFlBQW9CLEVBQUUsZUFBdUI7SUFDckUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBRUQsTUFBTSxxQkFBcUIsR0FBcUI7SUFDNUMsTUFBTSxFQUFFO1FBQ0osRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO1FBQ2pCLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUNsQixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDbEIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO1FBQ2hCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtLQUN4QjtDQUNKLENBQUM7QUFFRixNQUFNLE9BQU8sV0FBWSxTQUFRLFNBQVM7SUFPdEMsWUFDcUIsZUFBZ0MsRUFD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