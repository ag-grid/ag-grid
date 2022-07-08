var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { getMaxValue } from "../formatPanel";
export class NavigatorPanel extends Component {
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
            .setMaxValue(getMaxValue(currentValue, 60))
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
    RefSelector('navigatorGroup')
], NavigatorPanel.prototype, "navigatorGroup", void 0);
__decorate([
    RefSelector('navigatorHeightSlider')
], NavigatorPanel.prototype, "navigatorHeightSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], NavigatorPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], NavigatorPanel.prototype, "init", null);
