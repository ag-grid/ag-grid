var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
export class ConnectorLinePanel extends Component {
    constructor(chartOptionsService, getSelectedSeries) {
        super();
        this.chartOptionsService = chartOptionsService;
        this.getSelectedSeries = getSelectedSeries;
    }
    init() {
        const lineGroupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("connectorLine"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(ConnectorLinePanel.TEMPLATE, { lineGroup: lineGroupParams });
        this.initConnectorLineControls();
    }
    initConnectorLineControls() {
        this.initColorPicker(this.lineColorPicker, "color", "line.stroke");
        this.initSlider(this.lineStrokeWidthSlider, "strokeWidth", 0, 10, 45, "line.strokeWidth");
        this.initSlider(this.lineDashSlider, "lineDash", 0, 30, 45, "line.lineDash", 1, true);
        this.initSlider(this.lineOpacitySlider, "strokeOpacity", 0, 1, 45, "line.strokeOpacity", 0.05, false);
    }
    initColorPicker(colorPicker, labelKey, seriesOptionKey) {
        const color = this.chartOptionsService.getSeriesOption(seriesOptionKey, this.getSelectedSeries());
        colorPicker
            .setLabel(this.chartTranslationService.translate(labelKey))
            .setLabelWidth("flex")
            .setValue(color == null ? 'transparent' : `${color}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption(seriesOptionKey, newValue, this.getSelectedSeries()));
    }
    initSlider(slider, labelKey, minValue, maxValue, textFieldWidth, seriesOptionKey, step = 1, isArray = false) {
        const value = this.chartOptionsService.getSeriesOption(seriesOptionKey, this.getSelectedSeries());
        slider
            .setLabel(this.chartTranslationService.translate(labelKey))
            .setMinValue(minValue)
            .setMaxValue(maxValue)
            .setTextFieldWidth(textFieldWidth)
            .setValue(`${value}`)
            .setStep(step)
            .onValueChange(newValue => {
            const value = isArray ? [newValue] : newValue;
            this.chartOptionsService.setSeriesOption(seriesOptionKey, value, this.getSelectedSeries());
        });
    }
}
ConnectorLinePanel.TEMPLATE = `<div>
            <ag-group-component ref="lineGroup">
                <ag-color-picker ref="lineColorPicker"></ag-color-picker>
                <ag-slider ref="lineStrokeWidthSlider"></ag-slider>
                <ag-slider ref="lineOpacitySlider"></ag-slider>
                <ag-slider ref="lineDashSlider"></ag-slider>                
            </ag-group-component>
        </div>`;
__decorate([
    RefSelector('lineColorPicker')
], ConnectorLinePanel.prototype, "lineColorPicker", void 0);
__decorate([
    RefSelector('lineStrokeWidthSlider')
], ConnectorLinePanel.prototype, "lineStrokeWidthSlider", void 0);
__decorate([
    RefSelector('lineOpacitySlider')
], ConnectorLinePanel.prototype, "lineOpacitySlider", void 0);
__decorate([
    RefSelector('lineDashSlider')
], ConnectorLinePanel.prototype, "lineDashSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], ConnectorLinePanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], ConnectorLinePanel.prototype, "init", null);
