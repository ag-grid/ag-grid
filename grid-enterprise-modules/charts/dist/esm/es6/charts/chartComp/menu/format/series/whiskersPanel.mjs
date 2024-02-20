var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
export class WhiskersPanel extends Component {
    constructor(chartOptionsService, getSelectedSeries) {
        super();
        this.chartOptionsService = chartOptionsService;
        this.getSelectedSeries = getSelectedSeries;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("whisker"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(WhiskersPanel.TEMPLATE, { whiskersGroup: groupParams });
        this.initControls();
    }
    initControls() {
        const color = this.chartOptionsService.getSeriesOption("whisker.stroke", this.getSelectedSeries());
        this.whiskerColorPicker
            .setLabel(this.chartTranslationService.translate("color"))
            .setLabelWidth("flex")
            .setValue(color == null ? 'transparent' : `${color}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("whisker.stroke", newValue, this.getSelectedSeries()));
        const strokeWidth = this.chartOptionsService.getSeriesOption("whisker.strokeWidth", this.getSelectedSeries());
        this.whiskerThicknessSlider
            .setLabel(this.chartTranslationService.translate("strokeWidth"))
            .setMinValue(0)
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(`${strokeWidth}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("whisker.strokeWidth", newValue, this.getSelectedSeries()));
        const strokeOpacity = this.chartOptionsService.getSeriesOption("whisker.strokeOpacity", this.getSelectedSeries());
        this.whiskerOpacitySlider
            .setLabel(this.chartTranslationService.translate("strokeOpacity"))
            .setStep(0.05)
            .setMinValue(0)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(`${strokeOpacity}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("whisker.strokeOpacity", newValue, this.getSelectedSeries()));
        const lineDash = this.chartOptionsService.getSeriesOption("whisker.lineDash", this.getSelectedSeries());
        this.whiskerLineDashSlider
            .setLabel(this.chartTranslationService.translate("lineDash"))
            .setMinValue(0)
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .setValue(`${lineDash}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("whisker.lineDash", [newValue], this.getSelectedSeries()));
        const lineDashOffset = this.chartOptionsService.getSeriesOption("whisker.lineDashOffset", this.getSelectedSeries());
        this.whiskerLineDashOffsetSlider
            .setLabel(this.chartTranslationService.translate("lineDashOffset"))
            .setMinValue(0)
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .setValue(`${lineDashOffset}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("whisker.lineDashOffset", newValue, this.getSelectedSeries()));
    }
}
WhiskersPanel.TEMPLATE = `<div>
            <ag-group-component ref="whiskersGroup">
                <ag-color-picker ref="whiskerColorPicker"></ag-color-picker>
                <ag-slider ref="whiskerThicknessSlider"></ag-slider>
                <ag-slider ref="whiskerOpacitySlider"></ag-slider>
                <ag-slider ref="whiskerLineDashSlider"></ag-slider>
                <ag-slider ref="whiskerLineDashOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorate([
    RefSelector('whiskersGroup')
], WhiskersPanel.prototype, "whiskersGroup", void 0);
__decorate([
    RefSelector('whiskerColorPicker')
], WhiskersPanel.prototype, "whiskerColorPicker", void 0);
__decorate([
    RefSelector('whiskerThicknessSlider')
], WhiskersPanel.prototype, "whiskerThicknessSlider", void 0);
__decorate([
    RefSelector('whiskerOpacitySlider')
], WhiskersPanel.prototype, "whiskerOpacitySlider", void 0);
__decorate([
    RefSelector('whiskerLineDashSlider')
], WhiskersPanel.prototype, "whiskerLineDashSlider", void 0);
__decorate([
    RefSelector('whiskerLineDashOffsetSlider')
], WhiskersPanel.prototype, "whiskerLineDashOffsetSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], WhiskersPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], WhiskersPanel.prototype, "init", null);
