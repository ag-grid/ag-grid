// ag-grid-enterprise v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var miniChartsContainer_1 = require("./miniChartsContainer");
var ChartSettingsPanel = /** @class */ (function (_super) {
    __extends(ChartSettingsPanel, _super);
    function ChartSettingsPanel(chartController) {
        var _this = _super.call(this, ChartSettingsPanel.TEMPLATE) || this;
        _this.miniCharts = [];
        _this.cardItems = [];
        _this.chartController = chartController;
        _this.activePalette = _this.chartController.getActivePalette();
        _this.palettes = _this.chartController.getPalettes();
        return _this;
    }
    ChartSettingsPanel.prototype.postConstruct = function () {
        var _this = this;
        this.palettes.forEach(function (palette, idx) {
            var miniChartsContainer = new miniChartsContainer_1.MiniChartsContainer(idx, _this.chartController);
            _this.getContext().wireBean(miniChartsContainer);
            _this.miniCharts.push(miniChartsContainer);
            _this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
            _this.addCardLink(idx);
        });
        this.ePrevBtn.insertAdjacentElement('afterbegin', ag_grid_community_1._.createIconNoSpan('smallLeft', this.gridOptionsWrapper));
        this.eNextBtn.insertAdjacentElement('afterbegin', ag_grid_community_1._.createIconNoSpan('smallRight', this.gridOptionsWrapper));
        this.addDestroyableEventListener(this.ePrevBtn, 'click', this.prev.bind(this));
        this.addDestroyableEventListener(this.eNextBtn, 'click', this.next.bind(this));
        this.setActivePalette(this.activePalette, 0);
    };
    ChartSettingsPanel.prototype.addCardLink = function (idx) {
        var _this = this;
        var link = document.createElement('div');
        ag_grid_community_1._.addCssClass(link, 'ag-nav-card-item');
        link.innerHTML = '\u25CF';
        this.addDestroyableEventListener(link, 'click', function () {
            if (idx === _this.activePalette || _this.isAnimating) {
                return;
            }
            _this.setActivePalette(idx, idx < _this.activePalette ? 1 : 2);
        });
        this.eCardSelector.appendChild(link);
        this.cardItems.push(link);
    };
    ChartSettingsPanel.prototype.getPrev = function () {
        var prev = this.activePalette - 1;
        if (prev < 0) {
            prev = this.palettes.length - 1;
        }
        return prev;
    };
    ChartSettingsPanel.prototype.prev = function () {
        if (this.isAnimating) {
            return;
        }
        var prev = this.getPrev();
        this.setActivePalette(prev, 1);
    };
    ChartSettingsPanel.prototype.getNext = function () {
        var next = this.activePalette + 1;
        if (next === this.palettes.length) {
            next = 0;
        }
        return next;
    };
    ChartSettingsPanel.prototype.next = function () {
        if (this.isAnimating) {
            return;
        }
        var next = this.getNext();
        this.setActivePalette(next, 2);
    };
    ChartSettingsPanel.prototype.setActivePalette = function (palette, animate) {
        var _this = this;
        ag_grid_community_1._.radioCssClass(this.cardItems[palette], 'ag-selected');
        if (!animate) {
            this.miniCharts.forEach(function (miniChart, idx) {
                ag_grid_community_1._.addOrRemoveCssClass(miniChart.getGui(), 'ag-hidden', idx !== palette);
            });
            this.miniCharts[this.activePalette].refreshSelected();
            this.activePalette = palette;
        }
        else {
            var currentPalette = this.miniCharts[this.activePalette];
            var currentGui_1 = currentPalette.getGui();
            var futurePalette = this.miniCharts[palette];
            var futureGui_1 = futurePalette.getGui();
            currentPalette.refreshSelected();
            futurePalette.refreshSelected();
            var multiplier = animate === 1 ? -1 : 1;
            var final_1 = futureGui_1.style.left = (ag_grid_community_1._.getAbsoluteWidth(this.getGui()) * multiplier) + "px";
            ag_grid_community_1._.removeCssClass(futureGui_1, 'ag-hidden');
            ag_grid_community_1._.addCssClass(currentGui_1, 'ag-animating');
            ag_grid_community_1._.addCssClass(futureGui_1, 'ag-animating');
            this.activePalette = palette;
            this.chartController.setChartWithPalette(this.chartController.getChartType(), this.activePalette);
            this.isAnimating = true;
            window.setTimeout(function () {
                currentGui_1.style.left = parseFloat(final_1) * -1 + "px";
                futureGui_1.style.left = '0px';
            }, 50);
            window.setTimeout(function () {
                _this.isAnimating = false;
                ag_grid_community_1._.removeCssClass(currentGui_1, 'ag-animating');
                ag_grid_community_1._.removeCssClass(futureGui_1, 'ag-animating');
                ag_grid_community_1._.addCssClass(currentGui_1, 'ag-hidden');
            }, 500);
        }
    };
    ChartSettingsPanel.TEMPLATE = "<div class=\"ag-chart-settings-wrapper\">\n            <div ref=\"eMiniChartsContainer\" class=\"ag-chart-settings-mini-charts-container\"></div>\n            <div class=\"ag-chart-settings-nav-bar\">\n                <div ref=\"ePrevBtn\" class=\"ag-chart-settings-prev-btn\">\n                    <button type=\"button\"></button>\n                </div>\n                <div ref=\"eCardSelector\" class=\"ag-nav-card-selector\"></div>\n                <div ref=\"eNextBtn\" class=\"ag-chart-settings-next-btn\">\n                    <button type=\"button\"></button>\n                </div>\n            </div>\n        </div>";
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], ChartSettingsPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eMiniChartsContainer'),
        __metadata("design:type", HTMLElement)
    ], ChartSettingsPanel.prototype, "eMiniChartsContainer", void 0);
    __decorate([
        ag_grid_community_1.RefSelector("eCardSelector"),
        __metadata("design:type", HTMLElement)
    ], ChartSettingsPanel.prototype, "eCardSelector", void 0);
    __decorate([
        ag_grid_community_1.RefSelector("ePrevBtn"),
        __metadata("design:type", HTMLElement)
    ], ChartSettingsPanel.prototype, "ePrevBtn", void 0);
    __decorate([
        ag_grid_community_1.RefSelector("eNextBtn"),
        __metadata("design:type", HTMLElement)
    ], ChartSettingsPanel.prototype, "eNextBtn", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ChartSettingsPanel.prototype, "postConstruct", null);
    return ChartSettingsPanel;
}(ag_grid_community_1.Component));
exports.ChartSettingsPanel = ChartSettingsPanel;
