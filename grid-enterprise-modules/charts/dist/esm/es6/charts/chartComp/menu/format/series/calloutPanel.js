var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { getMaxValue } from "../formatPanel";
export class CalloutPanel extends Component {
    constructor(chartOptionsService, getSelectedSeries) {
        super();
        this.chartOptionsService = chartOptionsService;
        this.getSelectedSeries = getSelectedSeries;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical'
        };
        this.setTemplate(CalloutPanel.TEMPLATE, { calloutGroup: groupParams });
        this.initCalloutOptions();
    }
    initCalloutOptions() {
        this.calloutGroup
            .setTitle(this.chartTranslationService.translate("callout"))
            .setEnabled(true)
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
        const initInput = (expression, input, labelKey, defaultMaxValue) => {
            const currentValue = this.chartOptionsService.getSeriesOption(expression, this.getSelectedSeries());
            input.setLabel(this.chartTranslationService.translate(labelKey))
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption(expression, newValue, this.getSelectedSeries()));
        };
        initInput('calloutLine.length', this.calloutLengthSlider, 'length', 40);
        initInput('calloutLine.strokeWidth', this.calloutStrokeWidthSlider, 'strokeWidth', 10);
        initInput('calloutLabel.offset', this.labelOffsetSlider, 'offset', 30);
    }
}
CalloutPanel.TEMPLATE = `<div>
            <ag-group-component ref="calloutGroup">
                <ag-slider ref="calloutLengthSlider"></ag-slider>
                <ag-slider ref="calloutStrokeWidthSlider"></ag-slider>
                <ag-slider ref="labelOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorate([
    RefSelector('calloutGroup')
], CalloutPanel.prototype, "calloutGroup", void 0);
__decorate([
    RefSelector('calloutLengthSlider')
], CalloutPanel.prototype, "calloutLengthSlider", void 0);
__decorate([
    RefSelector('calloutStrokeWidthSlider')
], CalloutPanel.prototype, "calloutStrokeWidthSlider", void 0);
__decorate([
    RefSelector('labelOffsetSlider')
], CalloutPanel.prototype, "labelOffsetSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], CalloutPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], CalloutPanel.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbG91dFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvc2VyaWVzL2NhbGxvdXRQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBSUgsU0FBUyxFQUNULFNBQVMsRUFDVCxhQUFhLEVBQ2IsV0FBVyxFQUNkLE1BQU0seUJBQXlCLENBQUM7QUFHakMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRzdDLE1BQU0sT0FBTyxZQUFhLFNBQVEsU0FBUztJQWtCdkMsWUFBNkIsbUJBQXdDLEVBQ2pELGlCQUF3QztRQUN4RCxLQUFLLEVBQUUsQ0FBQztRQUZpQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ2pELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBdUI7SUFFNUQsQ0FBQztJQUdPLElBQUk7UUFDUixNQUFNLFdBQVcsR0FBMkI7WUFDeEMsYUFBYSxFQUFFLHlCQUF5QjtZQUN4QyxTQUFTLEVBQUUsVUFBVTtTQUN4QixDQUFDO1FBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQUMsWUFBWSxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVPLGtCQUFrQjtRQUN0QixJQUFJLENBQUMsWUFBWTthQUNaLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzNELFVBQVUsQ0FBQyxJQUFJLENBQUM7YUFDaEIsa0JBQWtCLENBQUMsSUFBSSxDQUFDO2FBQ3hCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9CLE1BQU0sU0FBUyxHQUFHLENBQUMsVUFBa0IsRUFBRSxLQUFlLEVBQUUsUUFBZ0IsRUFBRSxlQUF1QixFQUFFLEVBQUU7WUFDakcsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBUyxVQUFVLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUM1RyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzNELFdBQVcsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2lCQUN2RCxRQUFRLENBQUMsR0FBRyxZQUFZLEVBQUUsQ0FBQztpQkFDM0IsaUJBQWlCLENBQUMsRUFBRSxDQUFDO2lCQUNyQixhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdILENBQUMsQ0FBQztRQUVGLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLFNBQVMsQ0FBQyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZGLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzNFLENBQUM7O0FBbERhLHFCQUFRLEdBQ2xCOzs7Ozs7ZUFNTyxDQUFDO0FBRWlCO0lBQTVCLFdBQVcsQ0FBQyxjQUFjLENBQUM7a0RBQXdDO0FBQ2hDO0lBQW5DLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQzt5REFBdUM7QUFDakM7SUFBeEMsV0FBVyxDQUFDLDBCQUEwQixDQUFDOzhEQUE0QztBQUNsRDtJQUFqQyxXQUFXLENBQUMsbUJBQW1CLENBQUM7dURBQXFDO0FBRWhDO0lBQXJDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQzs2REFBMEQ7QUFRL0Y7SUFEQyxhQUFhO3dDQVFiIn0=