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
