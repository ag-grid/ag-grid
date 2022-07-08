"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const formatPanel_1 = require("../formatPanel");
class NavigatorPanel extends core_1.Component {
    constructor(chartOptionsService) {
        super();
        this.chartOptionsService = chartOptionsService;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(NavigatorPanel.TEMPLATE, { navigatorGroup: groupParams });
        this.initNavigator();
    }
    initNavigator() {
        const { chartTranslationService } = this;
        this.navigatorGroup
            .setTitle(chartTranslationService.translate("navigator"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartOptionsService.getChartOption("navigator.enabled") || false)
            .onEnableChange(enabled => {
            this.chartOptionsService.setChartOption("navigator.enabled", enabled);
            this.navigatorGroup.toggleGroupExpand(true);
        });
        const currentValue = this.chartOptionsService.getChartOption("navigator.height");
        this.navigatorHeightSlider
            .setLabel(chartTranslationService.translate("height"))
            .setMinValue(10)
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 60))
            .setTextFieldWidth(45)
            .setValue(`${currentValue || 30}`)
            .onValueChange(height => this.chartOptionsService.setChartOption("navigator.height", height));
    }
    destroy() {
        super.destroy();
    }
}
NavigatorPanel.TEMPLATE = `<div>
            <ag-group-component ref="navigatorGroup">
                <ag-slider ref="navigatorHeightSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorate([
    core_1.RefSelector('navigatorGroup')
], NavigatorPanel.prototype, "navigatorGroup", void 0);
__decorate([
    core_1.RefSelector('navigatorHeightSlider')
], NavigatorPanel.prototype, "navigatorHeightSlider", void 0);
__decorate([
    core_1.Autowired('chartTranslationService')
], NavigatorPanel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], NavigatorPanel.prototype, "init", null);
exports.NavigatorPanel = NavigatorPanel;
