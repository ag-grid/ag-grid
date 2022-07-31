"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var fontPanel_1 = require("../fontPanel");
var TitlePanel = /** @class */ (function (_super) {
    __extends(TitlePanel, _super);
    function TitlePanel(chartOptionsService) {
        var _this = _super.call(this, TitlePanel.TEMPLATE) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.activePanels = [];
        return _this;
    }
    TitlePanel.prototype.init = function () {
        this.initFontPanel();
        this.titlePlaceholder = this.chartTranslationService.translate('titlePlaceholder');
    };
    TitlePanel.prototype.hasTitle = function () {
        var title = this.getOption('title');
        return title && title.enabled && title.text && title.text.length > 0;
    };
    TitlePanel.prototype.initFontPanel = function () {
        var _this = this;
        var hasTitle = this.hasTitle;
        var setFont = function (font) {
            if (font.family) {
                _this.setOption('title.fontFamily', font.family);
            }
            if (font.weight) {
                _this.setOption('title.fontWeight', font.weight);
            }
            if (font.style) {
                _this.setOption('title.fontStyle', font.style);
            }
            if (font.size) {
                _this.setOption('title.fontSize', font.size);
            }
            if (font.color) {
                _this.setOption('title.color', font.color);
            }
        };
        var initialFont = {
            family: this.getOption('title.fontFamily'),
            style: this.getOption('title.fontStyle'),
            weight: this.getOption('title.fontWeight'),
            size: this.getOption('title.fontSize'),
            color: this.getOption('title.color')
        };
        if (!hasTitle) {
            setFont(initialFont);
        }
        var fontPanelParams = {
            name: this.chartTranslationService.translate('title'),
            enabled: this.hasTitle(),
            suppressEnabledCheckbox: false,
            initialFont: initialFont,
            setFont: setFont,
            setEnabled: function (enabled) {
                _this.setOption('title.enabled', enabled);
                var currentTitleText = _this.getOption('title.text');
                if (enabled && currentTitleText === 'Title') {
                    _this.setOption('title.text', _this.titlePlaceholder);
                }
            }
        };
        var fontPanelComp = this.createBean(new fontPanel_1.FontPanel(fontPanelParams));
        this.getGui().appendChild(fontPanelComp.getGui());
        this.activePanels.push(fontPanelComp);
        // edits to the title can disable it, so keep the checkbox in sync:
        this.addManagedListener(this.eventService, 'chartTitleEdit', function () {
            fontPanelComp.setEnabled(_this.hasTitle());
        });
    };
    TitlePanel.prototype.getOption = function (expression) {
        return this.chartOptionsService.getChartOption(expression);
    };
    TitlePanel.prototype.setOption = function (property, value) {
        this.chartOptionsService.setChartOption(property, value);
    };
    TitlePanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            core_1._.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    TitlePanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    TitlePanel.TEMPLATE = "<div></div>";
    __decorate([
        core_1.Autowired('chartTranslationService')
    ], TitlePanel.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], TitlePanel.prototype, "init", null);
    return TitlePanel;
}(core_1.Component));
exports.default = TitlePanel;
