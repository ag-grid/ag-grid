var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { getMaxValue } from "../formatPanel";
export class AxisTicksPanel extends Component {
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
        this.setTemplate(AxisTicksPanel.TEMPLATE, { axisTicksGroup: groupParams });
        this.initAxisTicks();
    }
    initAxisTicks() {
        this.axisTicksGroup
            .setTitle(this.chartTranslationService.translate("ticks"))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
        this.axisTicksColorPicker
            .setLabel(this.chartTranslationService.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getAxisProperty("tick.color"))
            .onValueChange(newColor => this.chartOptionsService.setAxisProperty("tick.color", newColor));
        const initInput = (expression, input, label, defaultMaxValue) => {
            const currentValue = this.chartOptionsService.getAxisProperty(expression);
            input.setLabel(label)
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartOptionsService.setAxisProperty(expression, newValue));
        };
        initInput("tick.width", this.axisTicksWidthSlider, this.chartTranslationService.translate("width"), 10);
        initInput("tick.size", this.axisTicksSizeSlider, this.chartTranslationService.translate("length"), 30);
    }
}
AxisTicksPanel.TEMPLATE = `<div>
            <ag-group-component ref="axisTicksGroup">
                <ag-color-picker ref="axisTicksColorPicker"></ag-color-picker>
                <ag-slider ref="axisTicksWidthSlider"></ag-slider>
                <ag-slider ref="axisTicksSizeSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorate([
    RefSelector('axisTicksGroup')
], AxisTicksPanel.prototype, "axisTicksGroup", void 0);
__decorate([
    RefSelector('axisTicksColorPicker')
], AxisTicksPanel.prototype, "axisTicksColorPicker", void 0);
__decorate([
    RefSelector('axisTicksWidthSlider')
], AxisTicksPanel.prototype, "axisTicksWidthSlider", void 0);
__decorate([
    RefSelector('axisTicksSizeSlider')
], AxisTicksPanel.prototype, "axisTicksSizeSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], AxisTicksPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], AxisTicksPanel.prototype, "init", null);
