var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, Events, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { getMaxValue } from "../formatPanel";
export class PaddingPanel extends Component {
    constructor(chartOptionsService, chartController) {
        super();
        this.chartOptionsService = chartOptionsService;
        this.chartController = chartController;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(PaddingPanel.TEMPLATE, { chartPaddingGroup: groupParams });
        this.addManagedListener(this.eventService, Events.EVENT_CHART_OPTIONS_CHANGED, (e) => {
            this.updateTopPadding(e.chartOptions);
        });
        this.initGroup();
        this.initChartPaddingItems();
    }
    initGroup() {
        this.chartPaddingGroup
            .setTitle(this.chartTranslationService.translate("padding"))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
    }
    initChartPaddingItems() {
        const initInput = (property, input) => {
            const currentValue = this.chartOptionsService.getChartOption('padding.' + property);
            input.setLabel(this.chartTranslationService.translate(property))
                .setMaxValue(getMaxValue(currentValue, 200))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartOptionsService.setChartOption('padding.' + property, newValue));
        };
        initInput('top', this.paddingTopSlider);
        initInput('right', this.paddingRightSlider);
        initInput('bottom', this.paddingBottomSlider);
        initInput('left', this.paddingLeftSlider);
    }
    updateTopPadding(chartOptions) {
        var _a, _b;
        // keep 'top' padding in sync with chart as toggling chart title on / off change the 'top' padding
        const seriesType = this.chartController.getChartSeriesTypes()[0];
        const topPadding = (_b = (_a = chartOptions[seriesType]) === null || _a === void 0 ? void 0 : _a.padding) === null || _b === void 0 ? void 0 : _b.top;
        if (topPadding != null) {
            this.paddingTopSlider.setValue(topPadding);
        }
    }
}
PaddingPanel.TEMPLATE = `<div>
            <ag-group-component ref="chartPaddingGroup">
                <ag-slider ref="paddingTopSlider"></ag-slider>
                <ag-slider ref="paddingRightSlider"></ag-slider>
                <ag-slider ref="paddingBottomSlider"></ag-slider>
                <ag-slider ref="paddingLeftSlider"></ag-slider>
            </ag-group-component>
        <div>`;
__decorate([
    RefSelector('chartPaddingGroup')
], PaddingPanel.prototype, "chartPaddingGroup", void 0);
__decorate([
    RefSelector('paddingTopSlider')
], PaddingPanel.prototype, "paddingTopSlider", void 0);
__decorate([
    RefSelector('paddingRightSlider')
], PaddingPanel.prototype, "paddingRightSlider", void 0);
__decorate([
    RefSelector('paddingBottomSlider')
], PaddingPanel.prototype, "paddingBottomSlider", void 0);
__decorate([
    RefSelector('paddingLeftSlider')
], PaddingPanel.prototype, "paddingLeftSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], PaddingPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], PaddingPanel.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFkZGluZ1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvY2hhcnQvcGFkZGluZ1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFJSCxTQUFTLEVBQ1QsU0FBUyxFQUNULE1BQU0sRUFDTixhQUFhLEVBQ2IsV0FBVyxHQUNkLE1BQU0seUJBQXlCLENBQUM7QUFHakMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBSTdDLE1BQU0sT0FBTyxZQUFhLFNBQVEsU0FBUztJQW9CdkMsWUFBNkIsbUJBQXdDLEVBQW1CLGVBQWdDO1FBQ3BILEtBQUssRUFBRSxDQUFDO1FBRGlCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFBbUIsb0JBQWUsR0FBZixlQUFlLENBQWlCO0lBRXhILENBQUM7SUFHTyxJQUFJO1FBQ1IsTUFBTSxXQUFXLEdBQTJCO1lBQ3hDLGFBQWEsRUFBRSx5QkFBeUI7WUFDeEMsU0FBUyxFQUFFLFVBQVU7WUFDckIsc0JBQXNCLEVBQUUsSUFBSTtTQUMvQixDQUFDO1FBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUU1RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNqRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFTyxTQUFTO1FBQ2IsSUFBSSxDQUFDLGlCQUFpQjthQUNqQixRQUFRLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUMzRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7YUFDeEIsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVPLHFCQUFxQjtRQUN6QixNQUFNLFNBQVMsR0FBRyxDQUFDLFFBQXFDLEVBQUUsS0FBZSxFQUFFLEVBQUU7WUFDekUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBUyxVQUFVLEdBQUcsUUFBUSxDQUFDLENBQUM7WUFDNUYsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMzRCxXQUFXLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDM0MsUUFBUSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUM7aUJBQzNCLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztpQkFDckIsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxVQUFVLEdBQUcsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDN0csQ0FBQyxDQUFDO1FBRUYsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN4QyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzVDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDOUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRU8sZ0JBQWdCLENBQUMsWUFBaUI7O1FBQ3RDLGtHQUFrRztRQUNsRyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakUsTUFBTSxVQUFVLEdBQUcsTUFBQSxNQUFBLFlBQVksQ0FBQyxVQUFVLENBQUMsMENBQUUsT0FBTywwQ0FBRSxHQUFHLENBQUM7UUFDMUQsSUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDOUM7SUFDTCxDQUFDOztBQXJFYSxxQkFBUSxHQUNsQjs7Ozs7OztjQU9NLENBQUM7QUFFdUI7SUFBakMsV0FBVyxDQUFDLG1CQUFtQixDQUFDO3VEQUE2QztBQUM3QztJQUFoQyxXQUFXLENBQUMsa0JBQWtCLENBQUM7c0RBQW9DO0FBQ2pDO0lBQWxDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQzt3REFBc0M7QUFDcEM7SUFBbkMsV0FBVyxDQUFDLHFCQUFxQixDQUFDO3lEQUF1QztBQUN4QztJQUFqQyxXQUFXLENBQUMsbUJBQW1CLENBQUM7dURBQXFDO0FBRWhDO0lBQXJDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQzs2REFBMEQ7QUFPL0Y7SUFEQyxhQUFhO3dDQWViIn0=