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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var miniCharts_1 = require("./miniCharts");
var miniChartMapping = {
    columnGroup: {
        column: miniCharts_1.MiniColumn,
        stackedColumn: miniCharts_1.MiniStackedColumn,
        normalizedColumn: miniCharts_1.MiniNormalizedColumn
    },
    barGroup: {
        bar: miniCharts_1.MiniBar,
        stackedBar: miniCharts_1.MiniStackedBar,
        normalizedBar: miniCharts_1.MiniNormalizedBar
    },
    pieGroup: {
        pie: miniCharts_1.MiniPie,
        doughnut: miniCharts_1.MiniDoughnut
    },
    lineGroup: {
        line: miniCharts_1.MiniLine
    },
    scatterGroup: {
        scatter: miniCharts_1.MiniScatter,
        bubble: miniCharts_1.MiniBubble
    },
    areaGroup: {
        area: miniCharts_1.MiniArea,
        stackedArea: miniCharts_1.MiniStackedArea,
        normalizedArea: miniCharts_1.MiniNormalizedArea
    },
    histogramGroup: {
        histogram: miniCharts_1.MiniHistogram
    },
    combinationGroup: {
        columnLineCombo: miniCharts_1.MiniColumnLineCombo,
        areaColumnCombo: miniCharts_1.MiniAreaColumnCombo,
        customCombo: miniCharts_1.MiniCustomCombo
    }
};
var MiniChartsContainer = /** @class */ (function (_super) {
    __extends(MiniChartsContainer, _super);
    function MiniChartsContainer(chartController, fills, strokes, chartGroups) {
        if (chartGroups === void 0) { chartGroups = core_1.DEFAULT_CHART_GROUPS; }
        var _this = _super.call(this, MiniChartsContainer.TEMPLATE) || this;
        _this.wrappers = {};
        _this.chartController = chartController;
        _this.fills = fills;
        _this.strokes = strokes;
        _this.chartGroups = __assign({}, chartGroups);
        return _this;
    }
    MiniChartsContainer.prototype.init = function () {
        var _this = this;
        // hide MiniCustomCombo if no custom combo exists
        if (!this.chartController.customComboExists() && this.chartGroups.combinationGroup) {
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(function (chartType) { return chartType !== core_1.CHART_TYPE_KEYS.combinationGroup.customCombo; });
        }
        var eGui = this.getGui();
        Object.keys(this.chartGroups).forEach(function (group) {
            var chartGroupValues = _this.chartGroups[group];
            var groupComponent = _this.createBean(new core_1.AgGroupComponent({
                title: _this.chartTranslationService.translate(group),
                suppressEnabledCheckbox: true,
                enabled: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-settings',
                direction: 'horizontal'
            }));
            chartGroupValues.forEach(function (chartType) {
                var MiniClass = miniChartMapping[group][chartType];
                var miniWrapper = document.createElement('div');
                miniWrapper.classList.add('ag-chart-mini-thumbnail');
                var miniClassChartType = MiniClass.chartType;
                _this.addManagedListener(miniWrapper, 'click', function () {
                    _this.chartController.setChartType(miniClassChartType);
                    _this.updateSelectedMiniChart();
                });
                _this.wrappers[miniClassChartType] = miniWrapper;
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
