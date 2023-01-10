var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
import { _, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { MiniChartsContainer } from "./miniChartsContainer";
import { ChartController } from "../../chartController";
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
        this.ePrevBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('previous', this.gridOptionsService));
        this.eNextBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('next', this.gridOptionsService));
        this.addManagedListener(this.ePrevBtn, 'click', function () { return _this.setActivePalette(_this.getPrev(), 'left'); });
        this.addManagedListener(this.eNextBtn, 'click', function () { return _this.setActivePalette(_this.getNext(), 'right'); });
        // change the selected chart when a combo chart is modified via the data panel, i.e. the custom combo should be selected
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_TYPE_CHANGED, function () { return _this.resetPalettes(true); });
        this.scrollSelectedIntoView();
    };
    ChartSettingsPanel.prototype.scrollSelectedIntoView = function () {
        var _this = this;
        // the panel is not immediately visible due to the slide animation, so we add a
        // setTimeout to wait until the panel animation is over and is able to scroll
        setTimeout(function () {
            var currentPallet = _this.miniCharts.find(function (pallet) { return !pallet.getGui().classList.contains('ag-hidden'); });
            var currentChart = currentPallet.getGui().querySelector('.ag-selected');
            if (currentChart) {
                currentChart.scrollIntoView({ block: 'nearest' });
            }
        }, 250);
    };
    ChartSettingsPanel.prototype.resetPalettes = function (forceReset) {
        var _this = this;
        var _a, _b;
        var palettes = this.chartController.getPalettes();
        var chartGroups = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.settingsPanel) === null || _b === void 0 ? void 0 : _b.chartGroupsDef;
        if ((_.shallowCompare(palettes, this.palettes) && !forceReset) || this.isAnimating) {
            return;
        }
        this.palettes = palettes;
        this.themes = this.chartController.getThemes();
        this.activePaletteIndex = this.themes.findIndex(function (name) { return name === _this.chartController.getChartThemeName(); });
        this.cardItems = [];
        _.clearElement(this.eCardSelector);
        this.destroyMiniCharts();
        this.palettes.forEach(function (palette, index) {
            var isActivePalette = _this.activePaletteIndex === index;
            var fills = palette.fills, strokes = palette.strokes;
            var miniChartsContainer = _this.createBean(new MiniChartsContainer(_this.chartController, fills, strokes, chartGroups));
            _this.miniCharts.push(miniChartsContainer);
            _this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
            _this.addCardLink(index);
            if (isActivePalette) {
                miniChartsContainer.updateSelectedMiniChart();
            }
            else {
                miniChartsContainer.setDisplayed(false);
            }
        });
        _.setDisplayed(this.eNavBar, this.palettes.length > 1);
        _.radioCssClass(this.cardItems[this.activePaletteIndex], 'ag-selected', 'ag-not-selected');
    };
    ChartSettingsPanel.prototype.addCardLink = function (index) {
        var _this = this;
        var link = document.createElement('div');
        link.classList.add('ag-chart-settings-card-item');
        this.addManagedListener(link, 'click', function () {
            _this.setActivePalette(index, index < _this.activePaletteIndex ? 'left' : 'right');
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
        _.radioCssClass(this.cardItems[index], 'ag-selected', 'ag-not-selected');
        var currentPalette = this.miniCharts[this.activePaletteIndex];
        var currentGui = currentPalette.getGui();
        var futurePalette = this.miniCharts[index];
        var nextGui = futurePalette.getGui();
        currentPalette.updateSelectedMiniChart();
        futurePalette.updateSelectedMiniChart();
        var multiplier = animationDirection === 'left' ? -1 : 1;
        var final = nextGui.style.left = (_.getAbsoluteWidth(this.getGui()) * multiplier) + "px";
        this.activePaletteIndex = index;
        this.isAnimating = true;
        var animatingClass = 'ag-animating';
        futurePalette.setDisplayed(true);
        currentPalette.addCssClass(animatingClass);
        futurePalette.addCssClass(animatingClass);
        this.chartController.setChartThemeName(this.themes[index]);
        window.setTimeout(function () {
            currentGui.style.left = -parseFloat(final) + "px";
            nextGui.style.left = '0px';
        }, 0);
        window.setTimeout(function () {
            _this.isAnimating = false;
            currentPalette.removeCssClass(animatingClass);
            futurePalette.removeCssClass(animatingClass);
            currentPalette.setDisplayed(false);
        }, 300);
    };
    ChartSettingsPanel.prototype.destroyMiniCharts = function () {
        _.clearElement(this.eMiniChartsContainer);
        this.miniCharts = this.destroyBeans(this.miniCharts);
    };
    ChartSettingsPanel.prototype.destroy = function () {
        this.destroyMiniCharts();
        _super.prototype.destroy.call(this);
    };
    ChartSettingsPanel.TEMPLATE = "<div class=\"ag-chart-settings-wrapper\">\n            <div ref=\"eMiniChartsContainer\" class=\"ag-chart-settings-mini-charts-container ag-scrollable-container\"></div>\n            <div ref=\"eNavBar\" class=\"ag-chart-settings-nav-bar\">\n                <div ref=\"ePrevBtn\" class=\"ag-chart-settings-prev\">\n                    <button type=\"button\" class=\"ag-chart-settings-prev-button\"></button>\n                </div>\n                <div ref=\"eCardSelector\" class=\"ag-chart-settings-card-selector\"></div>\n                <div ref=\"eNextBtn\" class=\"ag-chart-settings-next\">\n                    <button type=\"button\" class=\"ag-chart-settings-next-button\"></button>\n                </div>\n            </div>\n        </div>";
    __decorate([
        Autowired('resizeObserverService')
    ], ChartSettingsPanel.prototype, "resizeObserverService", void 0);
    __decorate([
        RefSelector('eMiniChartsContainer')
    ], ChartSettingsPanel.prototype, "eMiniChartsContainer", void 0);
    __decorate([
        RefSelector('eNavBar')
    ], ChartSettingsPanel.prototype, "eNavBar", void 0);
    __decorate([
        RefSelector('eCardSelector')
    ], ChartSettingsPanel.prototype, "eCardSelector", void 0);
    __decorate([
        RefSelector('ePrevBtn')
    ], ChartSettingsPanel.prototype, "ePrevBtn", void 0);
    __decorate([
        RefSelector('eNextBtn')
    ], ChartSettingsPanel.prototype, "eNextBtn", void 0);
    __decorate([
        PostConstruct
    ], ChartSettingsPanel.prototype, "postConstruct", null);
    return ChartSettingsPanel;
}(Component));
export { ChartSettingsPanel };
