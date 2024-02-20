"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeriesItemsPanel = void 0;
const core_1 = require("@ag-grid-community/core");
const fontPanelParams_1 = require("./fontPanelParams");
const fontPanel_1 = require("../fontPanel");
class SeriesItemsPanel extends core_1.Component {
    constructor(chartOptionsService, getSelectedSeries) {
        super();
        this.chartOptionsService = chartOptionsService;
        this.getSelectedSeries = getSelectedSeries;
        this.activePanels = [];
    }
    init() {
        const seriesItemsGroupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('seriesItems'),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(SeriesItemsPanel.TEMPLATE, { seriesItemsGroup: seriesItemsGroupParams });
        this.initSeriesItems();
        this.initSeriesControls();
    }
    initSeriesItems() {
        const selectOptions = [
            { value: 'positive', text: this.chartTranslationService.translate('seriesItemPositive') },
            { value: 'negative', text: this.chartTranslationService.translate('seriesItemNegative') },
        ];
        const seriesItemChangedCallback = (newValue) => {
            this.destroyActivePanels();
            this.initSeriesControls(newValue);
        };
        this.seriesItemSelect
            .setLabel(this.chartTranslationService.translate('seriesItemType'))
            .setLabelAlignment("left")
            .setLabelWidth('flex')
            .setInputWidth('flex')
            .addOptions(selectOptions)
            .setValue('positive')
            .onValueChange(seriesItemChangedCallback);
    }
    initSeriesControls(itemType = 'positive') {
        this.initSlider("strokeWidth", 0, 10, 45, `item.${itemType}.strokeWidth`);
        this.initSlider("lineDash", 0, 30, 45, `item.${itemType}.lineDash`, 1, true);
        this.initSlider("strokeOpacity", 0, 1, 45, `item.${itemType}.strokeOpacity`, 0.05, false);
        this.initSlider("fillOpacity", 0, 1, 45, `item.${itemType}.fillOpacity`, 0.05, false);
        this.initItemLabels(itemType);
    }
    initSlider(labelKey, minValue, maxValue, textFieldWidth, seriesOptionKey, step = 1, isArray = false) {
        const itemSlider = this.seriesItemsGroup.createManagedBean(new core_1.AgSlider());
        const value = this.chartOptionsService.getSeriesOption(seriesOptionKey, this.getSelectedSeries());
        const sliderChangedCallback = (newValue) => {
            const value = isArray ? [newValue] : newValue;
            this.chartOptionsService.setSeriesOption(seriesOptionKey, value, this.getSelectedSeries());
        };
        itemSlider
            .setLabel(this.chartTranslationService.translate(labelKey))
            .setMinValue(minValue)
            .setMaxValue(maxValue)
            .setTextFieldWidth(textFieldWidth)
            .setValue(`${value}`)
            .setStep(step)
            .onValueChange(sliderChangedCallback);
        this.seriesItemsGroup.addItem(itemSlider);
        this.activePanels.push(itemSlider);
    }
    initItemLabels(itemType) {
        const sectorParams = (0, fontPanelParams_1.initFontPanelParams)({
            labelName: this.chartTranslationService.translate('seriesItemLabels'),
            chartOptionsService: this.chartOptionsService,
            getSelectedSeries: () => this.getSelectedSeries(),
            seriesOptionLabelProperty: `item.${itemType}.label`
        });
        const labelPanelComp = this.createBean(new fontPanel_1.FontPanel(sectorParams));
        this.seriesItemsGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
    }
    destroyActivePanels() {
        this.activePanels.forEach(panel => {
            core_1._.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }
    destroy() {
        this.destroyActivePanels();
        super.destroy();
    }
}
SeriesItemsPanel.TEMPLATE = `<div>
            <ag-group-component ref="seriesItemsGroup">
                <ag-select ref="seriesItemSelect"></ag-select>
            </ag-group-component>
        </div>`;
__decorate([
    (0, core_1.RefSelector)('seriesItemsGroup')
], SeriesItemsPanel.prototype, "seriesItemsGroup", void 0);
__decorate([
    (0, core_1.RefSelector)('seriesItemSelect')
], SeriesItemsPanel.prototype, "seriesItemSelect", void 0);
__decorate([
    (0, core_1.Autowired)('chartTranslationService')
], SeriesItemsPanel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], SeriesItemsPanel.prototype, "init", null);
exports.SeriesItemsPanel = SeriesItemsPanel;
