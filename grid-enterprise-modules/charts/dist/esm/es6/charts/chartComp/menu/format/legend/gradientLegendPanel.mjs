var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { FontPanel } from "../fontPanel.mjs";
import { getMaxValue } from "../formatPanel.mjs";
export class GradientLegendPanel extends Component {
    constructor({ chartOptionsService, isExpandedOnInit = false }) {
        super();
        this.activePanels = [];
        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(GradientLegendPanel.TEMPLATE, { legendGroup: groupParams });
        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendGradient();
        this.initLegendSpacing();
        this.initLabelPanel();
    }
    initLegendGroup() {
        this.legendGroup
            .setTitle(this.chartTranslationService.translate("legend"))
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartOptionsService.getChartOption("gradientLegend.enabled") || false)
            .toggleGroupExpand(this.isExpandedOnInit)
            .onEnableChange(enabled => {
            this.chartOptionsService.setChartOption("gradientLegend.enabled", enabled);
            this.legendGroup.toggleGroupExpand(true);
        });
    }
    initLegendPosition() {
        const positions = ['top', 'right', 'bottom', 'left'];
        this.legendPositionSelect
            .setLabel(this.chartTranslationService.translate("position"))
            .setLabelWidth("flex")
            .setInputWidth('flex')
            .addOptions(positions.map(position => ({
            value: position,
            text: this.chartTranslationService.translate(position)
        })))
            .setValue(this.chartOptionsService.getChartOption("gradientLegend.position"))
            .onValueChange(newValue => this.chartOptionsService.setChartOption("gradientLegend.position", newValue));
    }
    initLegendGradient() {
        this.gradientReverseCheckbox
            .setLabel(this.chartTranslationService.translate("reverseDirection"))
            .setLabelWidth("flex")
            .setValue(this.chartOptionsService.getChartOption("gradientLegend.reverseOrder"))
            .onValueChange(newValue => this.chartOptionsService.setChartOption("gradientLegend.reverseOrder", newValue));
        const initSlider = (expression, labelKey, input, defaultMaxValue) => {
            var _a;
            const currentValue = (_a = this.chartOptionsService.getChartOption(expression)) !== null && _a !== void 0 ? _a : 0;
            input.setLabel(this.chartTranslationService.translate(labelKey))
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => {
                this.chartOptionsService.setChartOption(expression, newValue);
            });
        };
        initSlider("gradientLegend.gradient.thickness", "thickness", this.gradientThicknessSlider, 40);
        initSlider("gradientLegend.gradient.preferredLength", "preferredLength", this.gradientPreferredLengthSlider, 300);
    }
    initLegendSpacing() {
        const currentValue = this.chartOptionsService.getChartOption("gradientLegend.spacing");
        this.legendSpacingSlider
            .setLabel(this.chartTranslationService.translate("spacing"))
            .setMaxValue(getMaxValue(currentValue, 200))
            .setValue(`${currentValue}`)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.chartOptionsService.setChartOption("gradientLegend.spacing", newValue));
    }
    initLabelPanel() {
        const chartProxy = this.chartOptionsService;
        const initialFont = {
            family: chartProxy.getChartOption("gradientLegend.scale.label.fontFamily"),
            style: chartProxy.getChartOption("gradientLegend.scale.label.fontStyle"),
            weight: chartProxy.getChartOption("gradientLegend.scale.label.fontWeight"),
            size: chartProxy.getChartOption("gradientLegend.scale.label.fontSize"),
            color: chartProxy.getChartOption("gradientLegend.scale.label.color")
        };
        const setFont = (font) => {
            const proxy = this.chartOptionsService;
            if (font.family) {
                proxy.setChartOption("gradientLegend.scale.label.fontFamily", font.family);
            }
            if (font.weight) {
                proxy.setChartOption("gradientLegend.scale.label.fontWeight", font.weight);
            }
            if (font.style) {
                proxy.setChartOption("gradientLegend.scale.label.fontStyle", font.style);
            }
            if (font.size) {
                proxy.setChartOption("gradientLegend.scale.label.fontSize", font.size);
            }
            if (font.color) {
                proxy.setChartOption("gradientLegend.scale.label.color", font.color);
            }
        };
        const params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        const fontPanelComp = this.createBean(new FontPanel(params));
        this.legendGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);
    }
    destroyActivePanels() {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }
    destroy() {
        this.destroyActivePanels();
        super.destroy();
    }
}
GradientLegendPanel.TEMPLATE = `<div>
            <ag-group-component ref="legendGroup">
                <ag-select ref="legendPositionSelect"></ag-select>
                <ag-checkbox ref="gradientReverseCheckbox"></ag-checkbox>
                <ag-slider ref="gradientThicknessSlider"></ag-slider>
                <ag-slider ref="gradientPreferredLengthSlider"></ag-slider>
                <ag-slider ref="legendSpacingSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorate([
    RefSelector('legendGroup')
], GradientLegendPanel.prototype, "legendGroup", void 0);
__decorate([
    RefSelector('gradientReverseCheckbox')
], GradientLegendPanel.prototype, "gradientReverseCheckbox", void 0);
__decorate([
    RefSelector('legendPositionSelect')
], GradientLegendPanel.prototype, "legendPositionSelect", void 0);
__decorate([
    RefSelector('gradientThicknessSlider')
], GradientLegendPanel.prototype, "gradientThicknessSlider", void 0);
__decorate([
    RefSelector('gradientPreferredLengthSlider')
], GradientLegendPanel.prototype, "gradientPreferredLengthSlider", void 0);
__decorate([
    RefSelector('legendSpacingSlider')
], GradientLegendPanel.prototype, "legendSpacingSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], GradientLegendPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], GradientLegendPanel.prototype, "init", null);
