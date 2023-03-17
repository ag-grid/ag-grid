"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundPanel = void 0;
const core_1 = require("@ag-grid-community/core");
class BackgroundPanel extends core_1.Component {
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
        this.setTemplate(BackgroundPanel.TEMPLATE, { chartBackgroundGroup: groupParams });
        this.initGroup();
        this.initColorPicker();
    }
    initGroup() {
        this.group
            .setTitle(this.chartTranslationService.translate('background'))
            .setEnabled(this.chartOptionsService.getChartOption('background.visible'))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(enabled => this.chartOptionsService.setChartOption('background.visible', enabled));
    }
    initColorPicker() {
        this.colorPicker
            .setLabel(this.chartTranslationService.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getChartOption('background.fill'))
            .onValueChange(newColor => this.chartOptionsService.setChartOption('background.fill', newColor));
    }
}
BackgroundPanel.TEMPLATE = `<div>
            <ag-group-component ref="chartBackgroundGroup">
                <ag-color-picker ref="colorPicker"></ag-color-picker>
            </ag-group-component>
        <div>`;
__decorate([
    core_1.RefSelector('chartBackgroundGroup')
], BackgroundPanel.prototype, "group", void 0);
__decorate([
    core_1.RefSelector('colorPicker')
], BackgroundPanel.prototype, "colorPicker", void 0);
__decorate([
    core_1.Autowired('chartTranslationService')
], BackgroundPanel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], BackgroundPanel.prototype, "init", null);
exports.BackgroundPanel = BackgroundPanel;
