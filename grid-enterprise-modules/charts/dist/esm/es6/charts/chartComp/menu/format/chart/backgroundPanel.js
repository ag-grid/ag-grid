var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
export class BackgroundPanel extends Component {
    constructor(chartOptionsService) {
        super();
        this.chartOptionsService = chartOptionsService;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(BackgroundPanel.TEMPLATE, { chartBackgroundGroup: groupParams });
        this.initGroup();
        this.initColorPicker();
    }
    initGroup() {
        this.group
            .setTitle(this.chartTranslationService.translate('background'))
            .setEnabled(this.chartOptionsService.getChartOption('background.visible'))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(enabled => this.chartOptionsService.setChartOption('background.visible', enabled));
    }
    initColorPicker() {
        this.colorPicker
            .setLabel(this.chartTranslationService.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getChartOption('background.fill'))
            .onValueChange(newColor => this.chartOptionsService.setChartOption('background.fill', newColor));
    }
}
BackgroundPanel.TEMPLATE = `<div>
            <ag-group-component ref="chartBackgroundGroup">
                <ag-color-picker ref="colorPicker"></ag-color-picker>
            </ag-group-component>
        <div>`;
__decorate([
    RefSelector('chartBackgroundGroup')
], BackgroundPanel.prototype, "group", void 0);
__decorate([
    RefSelector('colorPicker')
], BackgroundPanel.prototype, "colorPicker", void 0);
__decorate([
    Autowired('chartTranslationService')
], BackgroundPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], BackgroundPanel.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvY2hhcnQvYmFja2dyb3VuZFBhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFHSCxTQUFTLEVBQ1QsU0FBUyxFQUNULGFBQWEsRUFDYixXQUFXLEVBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQUtqQyxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxTQUFTO0lBYTFDLFlBQTZCLG1CQUF3QztRQUNqRSxLQUFLLEVBQUUsQ0FBQztRQURpQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO0lBRXJFLENBQUM7SUFHTyxJQUFJO1FBQ1IsTUFBTSxXQUFXLEdBQTJCO1lBQ3hDLGFBQWEsRUFBRSx5QkFBeUI7WUFDeEMsU0FBUyxFQUFFLFVBQVU7WUFDckIsc0JBQXNCLEVBQUUsSUFBSTtTQUMvQixDQUFDO1FBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLEVBQUMsb0JBQW9CLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQztRQUVoRixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFTyxTQUFTO1FBQ2IsSUFBSSxDQUFDLEtBQUs7YUFDTCxRQUFRLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM5RCxVQUFVLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQ3pFLGtCQUFrQixDQUFDLElBQUksQ0FBQzthQUN4QixtQkFBbUIsQ0FBQyxLQUFLLENBQUM7YUFDMUIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzNHLENBQUM7SUFFTyxlQUFlO1FBQ25CLElBQUksQ0FBQyxXQUFXO2FBQ1gsUUFBUSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDekQsYUFBYSxDQUFDLE1BQU0sQ0FBQzthQUNyQixhQUFhLENBQUMsRUFBRSxDQUFDO2FBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDcEUsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pHLENBQUM7O0FBN0NhLHdCQUFRLEdBQ2xCOzs7O2NBSU0sQ0FBQztBQUUwQjtJQUFwQyxXQUFXLENBQUMsc0JBQXNCLENBQUM7OENBQWlDO0FBQ3pDO0lBQTNCLFdBQVcsQ0FBQyxhQUFhLENBQUM7b0RBQW9DO0FBRXpCO0lBQXJDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQztnRUFBMEQ7QUFPL0Y7SUFEQyxhQUFhOzJDQVdiIn0=