"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapsPanel = void 0;
const core_1 = require("@ag-grid-community/core");
class CapsPanel extends core_1.Component {
    constructor(chartOptionsService, getSelectedSeries) {
        super();
        this.chartOptionsService = chartOptionsService;
        this.getSelectedSeries = getSelectedSeries;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("cap"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(CapsPanel.TEMPLATE, { capsGroup: groupParams });
        this.initControls();
    }
    initControls() {
        const lengthRatio = this.chartOptionsService.getSeriesOption("cap.lengthRatio", this.getSelectedSeries());
        this.capLengthRatioSlider
            .setLabel(this.chartTranslationService.translate("capLengthRatio"))
            .setStep(0.05)
            .setMinValue(0)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(`${lengthRatio}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("cap.lengthRatio", newValue, this.getSelectedSeries()));
    }
}
CapsPanel.TEMPLATE = `<div>
            <ag-group-component ref="capsGroup">
                <ag-slider ref="capLengthRatioSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorate([
    (0, core_1.RefSelector)('capsGroup')
], CapsPanel.prototype, "capsGroup", void 0);
__decorate([
    (0, core_1.RefSelector)('capLengthRatioSlider')
], CapsPanel.prototype, "capLengthRatioSlider", void 0);
__decorate([
    (0, core_1.Autowired)('chartTranslationService')
], CapsPanel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], CapsPanel.prototype, "init", null);
exports.CapsPanel = CapsPanel;
