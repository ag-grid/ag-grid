var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
import { _, Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
var NavigatorPanel = /** @class */ (function (_super) {
    __extends(NavigatorPanel, _super);
    function NavigatorPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        return _this;
    }
    NavigatorPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(NavigatorPanel.TEMPLATE, { navigatorGroup: groupParams });
        this.initNavigator();
    };
    NavigatorPanel.prototype.initNavigator = function () {
        var _this = this;
        var chartTranslator = this.chartTranslator;
        this.navigatorGroup
            .setTitle(chartTranslator.translate("navigator"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(false)
            .setEnabled(this.getChartProxy().getChartOption("navigator.enabled") || false)
            .onEnableChange(function (enabled) {
            _this.getChartProxy().setChartOption("navigator.enabled", enabled);
            _this.navigatorGroup.toggleGroupExpand(true);
        });
        this.navigatorHeightSlider
            .setLabel(chartTranslator.translate("height"))
            .setMinValue(10)
            .setMaxValue(60)
            .setTextFieldWidth(45)
            .setValue(String(this.getChartProxy().getChartOption("navigator.height") || "30"))
            .onValueChange(function (height) { return _this.getChartProxy().setChartOption("navigator.height", height); });
    };
    NavigatorPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    NavigatorPanel.prototype.getChartProxy = function () {
        return this.chartController.getChartProxy();
    };
    NavigatorPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    NavigatorPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"navigatorGroup\">\n                <ag-slider ref=\"navigatorHeightSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('navigatorGroup')
    ], NavigatorPanel.prototype, "navigatorGroup", void 0);
    __decorate([
        RefSelector('navigatorHeightSlider')
    ], NavigatorPanel.prototype, "navigatorHeightSlider", void 0);
    __decorate([
        Autowired('chartTranslator')
    ], NavigatorPanel.prototype, "chartTranslator", void 0);
    __decorate([
        PostConstruct
    ], NavigatorPanel.prototype, "init", null);
    return NavigatorPanel;
}(Component));
export { NavigatorPanel };
