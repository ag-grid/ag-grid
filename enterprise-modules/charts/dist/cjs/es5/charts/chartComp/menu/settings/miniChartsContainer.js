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
var miniCharts_1 = require("./miniCharts");
var MiniChartsContainer = /** @class */ (function (_super) {
    __extends(MiniChartsContainer, _super);
    function MiniChartsContainer(chartController, fills, strokes) {
        var _this = _super.call(this, MiniChartsContainer.TEMPLATE) || this;
        _this.wrappers = {};
        _this.chartGroups = {
            columnGroup: [
                miniCharts_1.MiniColumn,
                miniCharts_1.MiniStackedColumn,
                miniCharts_1.MiniNormalizedColumn
            ],
            barGroup: [
                miniCharts_1.MiniBar,
                miniCharts_1.MiniStackedBar,
                miniCharts_1.MiniNormalizedBar
            ],
            pieGroup: [
                miniCharts_1.MiniPie,
                miniCharts_1.MiniDoughnut
            ],
            lineGroup: [
                miniCharts_1.MiniLine
            ],
            scatterGroup: [
                miniCharts_1.MiniScatter,
                miniCharts_1.MiniBubble
            ],
            areaGroup: [
                miniCharts_1.MiniArea,
                miniCharts_1.MiniStackedArea,
                miniCharts_1.MiniNormalizedArea
            ],
            histogramGroup: [
                miniCharts_1.MiniHistogram
            ],
            combinationGroup: [
                miniCharts_1.MiniColumnLineCombo,
                miniCharts_1.MiniAreaColumnCombo,
                miniCharts_1.MiniCustomCombo
            ]
        };
        _this.chartController = chartController;
        _this.fills = fills;
        _this.strokes = strokes;
        return _this;
    }
    MiniChartsContainer.prototype.init = function () {
        var _this = this;
        // hide MiniCustomCombo if no custom combo exists
        if (!this.chartController.customComboExists()) {
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(function (miniChart) { return miniChart !== miniCharts_1.MiniCustomCombo; });
        }
        var eGui = this.getGui();
        Object.keys(this.chartGroups).forEach(function (group) {
            var chartGroup = _this.chartGroups[group];
            var groupComponent = _this.createBean(new core_1.AgGroupComponent({
                title: _this.chartTranslationService.translate(group),
                suppressEnabledCheckbox: true,
                enabled: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-settings',
                direction: 'horizontal'
            }));
            chartGroup.forEach(function (MiniClass) {
                var miniWrapper = document.createElement('div');
                miniWrapper.classList.add('ag-chart-mini-thumbnail');
                _this.addManagedListener(miniWrapper, 'click', function () {
                    _this.chartController.setChartType(MiniClass.chartType);
                    _this.updateSelectedMiniChart();
                });
                _this.wrappers[MiniClass.chartType] = miniWrapper;
                _this.createBean(new MiniClass(miniWrapper, _this.fills, _this.strokes));
                groupComponent.addItem(miniWrapper);
            });
            eGui.appendChild(groupComponent.getGui());
        });
        this.updateSelectedMiniChart();
    };
    MiniChartsContainer.prototype.updateSelectedMiniChart = function () {
        var selectedChartType = this.chartController.getChartType();
        for (var miniChartType in this.wrappers) {
            var miniChart = this.wrappers[miniChartType];
            var selected = miniChartType === selectedChartType;
            miniChart.classList.toggle('ag-selected', selected);
        }
    };
    MiniChartsContainer.TEMPLATE = "<div class=\"ag-chart-settings-mini-wrapper\"></div>";
    __decorate([
        core_1.Autowired('chartTranslationService')
    ], MiniChartsContainer.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], MiniChartsContainer.prototype, "init", null);
    return MiniChartsContainer;
}(core_1.Component));
exports.MiniChartsContainer = MiniChartsContainer;
