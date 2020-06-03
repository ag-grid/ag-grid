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
import { _, Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { FontPanel } from "../fontPanel";
var TitlePanel = /** @class */ (function (_super) {
    __extends(TitlePanel, _super);
    function TitlePanel(chartController) {
        var _this = _super.call(this, TitlePanel.TEMPLATE) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        return _this;
    }
    TitlePanel.prototype.init = function () {
        this.initFontPanel();
    };
    TitlePanel.prototype.hasTitle = function () {
        var chartProxy = this.chartController.getChartProxy();
        var title = chartProxy.getChartOption('title');
        var text = title && title.text ? title.text : '';
        return _.exists(text);
    };
    TitlePanel.prototype.initFontPanel = function () {
        var _this = this;
        var chartProxy = this.chartController.getChartProxy();
        var hasTitle = this.hasTitle;
        var setFont = function (font) {
            var chartProxy = _this.chartController.getChartProxy();
            if (font.family) {
                chartProxy.setTitleOption('fontFamily', font.family);
            }
            if (font.weight) {
                chartProxy.setTitleOption('fontWeight', font.weight);
            }
            if (font.style) {
                chartProxy.setTitleOption('fontStyle', font.style);
            }
            if (font.size) {
                chartProxy.setTitleOption('fontSize', font.size);
            }
            if (font.color) {
                chartProxy.setTitleOption('color', font.color);
            }
        };
        var initialFont = {
            family: hasTitle ? chartProxy.getChartOption('title.fontFamily') : 'Verdana, sans-serif',
            style: hasTitle ? chartProxy.getChartOption('title.fontStyle') : undefined,
            weight: hasTitle ? chartProxy.getChartOption('title.fontWeight') : undefined,
            size: hasTitle ? chartProxy.getChartOption('title.fontSize') : 22,
            color: hasTitle ? chartProxy.getChartOption('title.color') : 'black'
        };
        if (!hasTitle) {
            setFont(initialFont);
        }
        var fontPanelParams = {
            name: this.chartTranslator.translate('title'),
            enabled: this.hasTitle(),
            suppressEnabledCheckbox: false,
            initialFont: initialFont,
            setFont: setFont,
            setEnabled: function (enabled) {
                var chartProxy = _this.chartController.getChartProxy();
                if (enabled) {
                    var newTitle = _this.disabledTitle || _this.chartTranslator.translate('titlePlaceholder');
                    chartProxy.setTitleOption('text', newTitle);
                    _this.disabledTitle = '';
                }
                else {
                    _this.disabledTitle = _this.chartController.getChartProxy().getTitleOption('text');
                    chartProxy.setTitleOption('text', '');
                }
            }
        };
        var fontPanelComp = this.createBean(new FontPanel(fontPanelParams));
        this.getGui().appendChild(fontPanelComp.getGui());
        this.activePanels.push(fontPanelComp);
        // edits to the title can disable it, so keep the checkbox in sync:
        this.addManagedListener(this.eventService, 'chartTitleEdit', function () {
            fontPanelComp.setEnabled(_this.hasTitle());
        });
    };
    TitlePanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    TitlePanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    TitlePanel.TEMPLATE = "<div></div>";
    __decorate([
        Autowired('chartTranslator')
    ], TitlePanel.prototype, "chartTranslator", void 0);
    __decorate([
        PostConstruct
    ], TitlePanel.prototype, "init", null);
    return TitlePanel;
}(Component));
export default TitlePanel;
