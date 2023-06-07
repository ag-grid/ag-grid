var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { getMaxValue } from "../formatPanel";
export class ShadowPanel extends Component {
    constructor(chartOptionsService, getSelectedSeries) {
        super();
        this.chartOptionsService = chartOptionsService;
        this.getSelectedSeries = getSelectedSeries;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(ShadowPanel.TEMPLATE, { shadowGroup: groupParams });
        this.shadowBlurSlider.setTextFieldWidth(45);
        this.shadowXOffsetSlider.setTextFieldWidth(45);
        this.shadowYOffsetSlider.setTextFieldWidth(45);
        this.initSeriesShadow();
    }
    initSeriesShadow() {
        this.shadowGroup
            .setTitle(this.chartTranslationService.translate("shadow"))
            .setEnabled(this.chartOptionsService.getSeriesOption("shadow.enabled", this.getSelectedSeries()))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(newValue => this.chartOptionsService.setSeriesOption("shadow.enabled", newValue, this.getSelectedSeries()));
        this.shadowColorPicker
            .setLabel(this.chartTranslationService.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("shadow.color", this.getSelectedSeries()))
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("shadow.color", newValue, this.getSelectedSeries()));
        const initInput = (input, property, minValue, defaultMaxValue) => {
            const currentValue = this.chartOptionsService.getSeriesOption(`shadow.${property}`, this.getSelectedSeries());
            input.setLabel(this.chartTranslationService.translate(property))
                .setMinValue(minValue)
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`shadow.${property}`, newValue, this.getSelectedSeries()));
        };
        initInput(this.shadowBlurSlider, "blur", 0, 20);
        initInput(this.shadowXOffsetSlider, "xOffset", -10, 10);
        initInput(this.shadowYOffsetSlider, "yOffset", -10, 10);
    }
}
ShadowPanel.TEMPLATE = `<div>
            <ag-group-component ref="shadowGroup">
                <ag-color-picker ref="shadowColorPicker"></ag-color-picker>
                <ag-slider ref="shadowBlurSlider"></ag-slider>
                <ag-slider ref="shadowXOffsetSlider"></ag-slider>
                <ag-slider ref="shadowYOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorate([
    RefSelector('shadowGroup')
], ShadowPanel.prototype, "shadowGroup", void 0);
__decorate([
    RefSelector('shadowColorPicker')
], ShadowPanel.prototype, "shadowColorPicker", void 0);
__decorate([
    RefSelector('shadowBlurSlider')
], ShadowPanel.prototype, "shadowBlurSlider", void 0);
__decorate([
    RefSelector('shadowXOffsetSlider')
], ShadowPanel.prototype, "shadowXOffsetSlider", void 0);
__decorate([
    RefSelector('shadowYOffsetSlider')
], ShadowPanel.prototype, "shadowYOffsetSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], ShadowPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], ShadowPanel.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93UGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2Zvcm1hdC9zZXJpZXMvc2hhZG93UGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUlILFNBQVMsRUFDVCxTQUFTLEVBQ1QsYUFBYSxFQUNiLFdBQVcsR0FDZCxNQUFNLHlCQUF5QixDQUFDO0FBR2pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUk3QyxNQUFNLE9BQU8sV0FBWSxTQUFRLFNBQVM7SUFvQnRDLFlBQTZCLG1CQUF3QyxFQUNqRCxpQkFBd0M7UUFDeEQsS0FBSyxFQUFFLENBQUM7UUFGaUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUNqRCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQXVCO0lBRTVELENBQUM7SUFHTyxJQUFJO1FBQ1IsTUFBTSxXQUFXLEdBQTJCO1lBQ3hDLGFBQWEsRUFBRSx5QkFBeUI7WUFDeEMsU0FBUyxFQUFFLFVBQVU7WUFDckIsc0JBQXNCLEVBQUUsSUFBSTtTQUMvQixDQUFDO1FBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFFbkUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFL0MsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVPLGdCQUFnQjtRQUNwQixJQUFJLENBQUMsV0FBVzthQUNYLFFBQVEsQ0FBQyxJQUFJ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