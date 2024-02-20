var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgSlider, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { initFontPanelParams } from "./fontPanelParams";
import { FontPanel } from "../fontPanel";
var SeriesItemsPanel = /** @class */ (function (_super) {
    __extends(SeriesItemsPanel, _super);
    function SeriesItemsPanel(chartOptionsService, getSelectedSeries) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.getSelectedSeries = getSelectedSeries;
        _this.activePanels = [];
        return _this;
    }
    SeriesItemsPanel.prototype.init = function () {
        var seriesItemsGroupParams = {
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
    };
    SeriesItemsPanel.prototype.initSeriesItems = function () {
        var _this = this;
        var selectOptions = [
            { value: 'positive', text: this.chartTranslationService.translate('seriesItemPositive') },
            { value: 'negative', text: this.chartTranslationService.translate('seriesItemNegative') },
        ];
        var seriesItemChangedCallback = function (newValue) {
            _this.destroyActivePanels();
            _this.initSeriesControls(newValue);
        };
        this.seriesItemSelect
            .setLabel(this.chartTranslationService.translate('seriesItemType'))
            .setLabelAlignment("left")
            .setLabelWidth('flex')
            .setInputWidth('flex')
            .addOptions(selectOptions)
            .setValue('positive')
            .onValueChange(seriesItemChangedCallback);
    };
    SeriesItemsPanel.prototype.initSeriesControls = function (itemType) {
        if (itemType === void 0) { itemType = 'positive'; }
        this.initSlider("strokeWidth", 0, 10, 45, "item.".concat(itemType, ".strokeWidth"));
        this.initSlider("lineDash", 0, 30, 45, "item.".concat(itemType, ".lineDash"), 1, true);
        this.initSlider("strokeOpacity", 0, 1, 45, "item.".concat(itemType, ".strokeOpacity"), 0.05, false);
        this.initSlider("fillOpacity", 0, 1, 45, "item.".concat(itemType, ".fillOpacity"), 0.05, false);
        this.initItemLabels(itemType);
    };
    SeriesItemsPanel.prototype.initSlider = function (labelKey, minValue, maxValue, textFieldWidth, seriesOptionKey, step, isArray) {
        var _this = this;
        if (step === void 0) { step = 1; }
        if (isArray === void 0) { isArray = false; }
        var itemSlider = this.seriesItemsGroup.createManagedBean(new AgSlider());
        var value = this.chartOptionsService.getSeriesOption(seriesOptionKey, this.getSelectedSeries());
        var sliderChangedCallback = function (newValue) {
            var value = isArray ? [newValue] : newValue;
            _this.chartOptionsService.setSeriesOption(seriesOptionKey, value, _this.getSelectedSeries());
        };
        itemSlider
            .setLabel(this.chartTranslationService.translate(labelKey))
            .setMinValue(minValue)
            .setMaxValue(maxValue)
            .setTextFieldWidth(textFieldWidth)
            .setValue("".concat(value))
            .setStep(step)
            .onValueChange(sliderChangedCallback);
        this.seriesItemsGroup.addItem(itemSlider);
        this.activePanels.push(itemSlider);
    };
    SeriesItemsPanel.prototype.initItemLabels = function (itemType) {
        var _this = this;
        var sectorParams = initFontPanelParams({
            labelName: this.chartTranslationService.translate('seriesItemLabels'),
            chartOptionsService: this.chartOptionsService,
            getSelectedSeries: function () { return _this.getSelectedSeries(); },
            seriesOptionLabelProperty: "item.".concat(itemType, ".label")
        });
        var labelPanelComp = this.createBean(new FontPanel(sectorParams));
        this.seriesItemsGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
    };
    SeriesItemsPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    SeriesItemsPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    SeriesItemsPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"seriesItemsGroup\">\n                <ag-select ref=\"seriesItemSelect\"></ag-select>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('seriesItemsGroup')
    ], SeriesItemsPanel.prototype, "seriesItemsGroup", void 0);
    __decorate([
        RefSelector('seriesItemSelect')
    ], SeriesItemsPanel.prototype, "seriesItemSelect", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], SeriesItemsPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], SeriesItemsPanel.prototype, "init", null);
    return SeriesItemsPanel;
}(Component));
export { SeriesItemsPanel };
