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
var miniChartsContainer_1 = require("./miniChartsContainer");
var chartController_1 = require("../../chartController");
var ChartSettingsPanel = /** @class */ (function (_super) {
    __extends(ChartSettingsPanel, _super);
    function ChartSettingsPanel(chartController) {
        var _this = _super.call(this, ChartSettingsPanel.TEMPLATE) || this;
        _this.miniCharts = [];
        _this.cardItems = [];
        _this.activePaletteIndex = 0;
        _this.palettes = [];
        _this.themes = [];
        _this.chartController = chartController;
        return _this;
    }
    ChartSettingsPanel.prototype.postConstruct = function () {
        var _this = this;
        this.resetPalettes();
        this.ePrevBtn.insertAdjacentElement('afterbegin', core_1._.createIconNoSpan('previous', this.gridOptionsWrapper));
        this.eNextBtn.insertAdjacentElement('afterbegin', core_1._.createIconNoSpan('next', this.gridOptionsWrapper));
        this.addManagedListener(this.ePrevBtn, 'click', function () { return _this.setActivePalette(_this.getPrev(), 'left'); });
        this.addManagedListener(this.eNextBtn, 'click', function () { return _this.setActivePalette(_this.getNext(), 'right'); });
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_UPDATED, this.resetPalettes.bind(this));
    };
    ChartSettingsPanel.prototype.resetPalettes = function () {
        var _this = this;
        var palettes = this.chartController.getPalettes();
        if (core_1._.shallowCompare(palettes, this.palettes)) {
            return;
        }
        this.palettes = palettes;
        this.themes = this.chartController.getThemes();
        this.activePaletteIndex = core_1._.findIndex(this.themes, function (name) { return name === _this.chartController.getThemeName(); });
        this.cardItems = [];
        core_1._.clearElement(this.eCardSelector);
        this.destroyMiniCharts();
        this.palettes.forEach(function (palette, index) {
            var isActivePalette = _this.activePaletteIndex === index;
            var fills = palette.fills, strokes = palette.strokes;
            var miniChartsContainer = _this.createBean(new miniChartsContainer_1.MiniChartsContainer(_this.chartController, fills, strokes));
            _this.miniCharts.push(miniChartsContainer);
            _this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
            _this.addCardLink(index);
            if (isActivePalette) {
                miniChartsContainer.refreshSelected();
            }
            else {
                core_1._.addCssClass(miniChartsContainer.getGui(), 'ag-hidden');
            }
        });
        core_1._.addOrRemoveCssClass(this.eNavBar, 'ag-hidden', this.palettes.length <= 1);
        core_1._.radioCssClass(this.cardItems[this.activePaletteIndex], 'ag-selected', 'ag-not-selected');
    };
    ChartSettingsPanel.prototype.addCardLink = function (index) {
        var _this = this;
        var link = document.createElement('div');
        core_1._.addCssClass(link, 'ag-chart-settings-card-item');
        this.addManagedListener(link, 'click', function () {
            var activePaletteIndex = _this.activePaletteIndex;
            _this.setActivePalette(index, index < activePaletteIndex ? 'left' : 'right');
        });
        this.eCardSelector.appendChild(link);
        this.cardItems.push(link);
    };
    ChartSettingsPanel.prototype.getPrev = function () {
        var prev = this.activePaletteIndex - 1;
        if (prev < 0) {
            prev = this.palettes.length - 1;
        }
        return prev;
    };
    ChartSettingsPanel.prototype.prev = function () {
        ;
    };
    ChartSettingsPanel.prototype.getNext = function () {
        var next = this.activePaletteIndex + 1;
        if (next >= this.palettes.length) {
            next = 0;
        }
        return next;
    };
    ChartSettingsPanel.prototype.setActivePalette = function (index, animationDirection) {
        var _this = this;
        if (this.isAnimating || this.activePaletteIndex === index) {
            return;
        }
        core_1._.radioCssClass(this.cardItems[index], 'ag-selected', 'ag-not-selected');
        var currentPalette = this.miniCharts[this.activePaletteIndex];
        var currentGui = currentPalette.getGui();
        var futurePalette = this.miniCharts[index];
        var nextGui = futurePalette.getGui();
        currentPalette.refreshSelected();
        futurePalette.refreshSelected();
        var multiplier = animationDirection === 'left' ? -1 : 1;
        var final = nextGui.style.left = (core_1._.getAbsoluteWidth(this.getGui()) * multiplier) + "px";
        var animatingClass = 'ag-animating';
        core_1._.removeCssClass(nextGui, 'ag-hidden');
        core_1._.addCssClass(currentGui, animatingClass);
        core_1._.addCssClass(nextGui, animatingClass);
        this.activePaletteIndex = index;
        this.chartController.setChartThemeName(this.themes[index]);
        this.isAnimating = true;
        window.setTimeout(function () {
            currentGui.style.left = -parseFloat(final) + "px";
            nextGui.style.left = '0px';
        }, 0);
        window.setTimeout(function () {
            _this.isAnimating = false;
            core_1._.removeCssClass(currentGui, animatingClass);
            core_1._.removeCssClass(nextGui, animatingClass);
            core_1._.addCssClass(currentGui, 'ag-hidden');
        }, 300);
    };
    ChartSettingsPanel.prototype.destroyMiniCharts = function () {
        core_1._.clearElement(this.eMiniChartsContainer);
        this.miniCharts = this.destroyBeans(this.miniCharts);
    };
    ChartSettingsPanel.prototype.destroy = function () {
        this.destroyMiniCharts();
        _super.prototype.destroy.call(this);
    };
    ChartSettingsPanel.TEMPLATE = "<div class=\"ag-chart-settings-wrapper\">\n            <div ref=\"eMiniChartsContainer\" class=\"ag-chart-settings-mini-charts-container\"></div>\n            <div ref=\"eNavBar\" class=\"ag-chart-settings-nav-bar\">\n                <div ref=\"ePrevBtn\" class=\"ag-chart-settings-prev\">\n                    <button type=\"button\" class=\"ag-chart-settings-prev-button\"></button>\n                </div>\n                <div ref=\"eCardSelector\" class=\"ag-chart-settings-card-selector\"></div>\n                <div ref=\"eNextBtn\" class=\"ag-chart-settings-next\">\n                    <button type=\"button\" class=\"ag-chart-settings-next-button\"></button>\n                </div>\n            </div>\n        </div>";
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], ChartSettingsPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.RefSelector('eMiniChartsContainer')
    ], ChartSettingsPanel.prototype, "eMiniChartsContainer", void 0);
    __decorate([
        core_1.RefSelector('eNavBar')
    ], ChartSettingsPanel.prototype, "eNavBar", void 0);
    __decorate([
        core_1.RefSelector('eCardSelector')
    ], ChartSettingsPanel.prototype, "eCardSelector", void 0);
    __decorate([
        core_1.RefSelector('ePrevBtn')
    ], ChartSettingsPanel.prototype, "ePrevBtn", void 0);
    __decorate([
        core_1.RefSelector('eNextBtn')
    ], ChartSettingsPanel.prototype, "eNextBtn", void 0);
    __decorate([
        core_1.PostConstruct
    ], ChartSettingsPanel.prototype, "postConstruct", null);
    return ChartSettingsPanel;
}(core_1.Component));
exports.ChartSettingsPanel = ChartSettingsPanel;
//# sourceMappingURL=chartSettingsPanel.js.map