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
import { CHART_TYPE_KEYS, AgGroupComponent, Autowired, Component, PostConstruct, DEFAULT_CHART_GROUPS } from "@ag-grid-community/core";
import { MiniArea, MiniAreaColumnCombo, MiniBar, MiniBubble, MiniColumn, MiniColumnLineCombo, MiniCustomCombo, MiniDoughnut, MiniHistogram, MiniLine, MiniNormalizedArea, MiniNormalizedBar, MiniNormalizedColumn, MiniPie, MiniScatter, MiniStackedArea, MiniStackedBar, MiniStackedColumn, } from "./miniCharts";
var miniChartMapping = {
    columnGroup: {
        column: MiniColumn,
        stackedColumn: MiniStackedColumn,
        normalizedColumn: MiniNormalizedColumn
    },
    barGroup: {
        bar: MiniBar,
        stackedBar: MiniStackedBar,
        normalizedBar: MiniNormalizedBar
    },
    pieGroup: {
        pie: MiniPie,
        doughnut: MiniDoughnut
    },
    lineGroup: {
        line: MiniLine
    },
    scatterGroup: {
        scatter: MiniScatter,
        bubble: MiniBubble
    },
    areaGroup: {
        area: MiniArea,
        stackedArea: MiniStackedArea,
        normalizedArea: MiniNormalizedArea
    },
    histogramGroup: {
        histogram: MiniHistogram
    },
    combinationGroup: {
        columnLineCombo: MiniColumnLineCombo,
        areaColumnCombo: MiniAreaColumnCombo,
        customCombo: MiniCustomCombo
    }
};
var MiniChartsContainer = /** @class */ (function (_super) {
    __extends(MiniChartsContainer, _super);
    function MiniChartsContainer(chartController, fills, strokes, chartGroups) {
        if (chartGroups === void 0) { chartGroups = DEFAULT_CHART_GROUPS; }
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
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(function (chartType) { return chartType !== CHART_TYPE_KEYS.combinationGroup.customCombo; });
        }
        var eGui = this.getGui();
        Object.keys(this.chartGroups).forEach(function (group) {
            var chartGroupValues = _this.chartGroups[group];
            var groupComponent = _this.createBean(new AgGroupComponent({
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
        Autowired('chartTranslationService')
    ], MiniChartsContainer.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], MiniChartsContainer.prototype, "init", null);
    return MiniChartsContainer;
}(Component));
export { MiniChartsContainer };
