"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadowPanel = void 0;
const core_1 = require("@ag-grid-community/core");
const formatPanel_1 = require("../formatPanel");
class ShadowPanel extends core_1.Component {
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
                .setMaxValue(formatPanel_1.getMaxValue(currentValue, defaultMaxValue))
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
    core_1.RefSelector('shadowGroup')
], ShadowPanel.prototype, "shadowGroup", void 0);
__decorate([
    core_1.RefSelector('shadowColorPicker')
], ShadowPanel.prototype, "shadowColorPicker", void 0);
__decorate([
    core_1.RefSelector('shadowBlurSlider')
], ShadowPanel.prototype, "shadowBlurSlider", void 0);
__decorate([
    core_1.RefSelector('shadowXOffsetSlider')
], ShadowPanel.prototype, "shadowXOffsetSlider", void 0);
__decorate([
    core_1.RefSelector('shadowYOffsetSlider')
], ShadowPanel.prototype, "shadowYOffsetSlider", void 0);
__decorate([
    core_1.Autowired('chartTranslationService')
], ShadowPanel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], ShadowPanel.prototype, "init", null);
exports.ShadowPanel = ShadowPanel;
