"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
exports.MiniChartsContainer = void 0;
var core_1 = require("@ag-grid-community/core");
var index_1 = require("./miniCharts/index"); // please leave this as is - we want it to be explicit for build reasons
var miniChartMapping = {
    columnGroup: {
        column: index_1.MiniColumn,
        stackedColumn: index_1.MiniStackedColumn,
        normalizedColumn: index_1.MiniNormalizedColumn
    },
    barGroup: {
        bar: index_1.MiniBar,
        stackedBar: index_1.MiniStackedBar,
        normalizedBar: index_1.MiniNormalizedBar
    },
    pieGroup: {
        pie: index_1.MiniPie,
        doughnut: index_1.MiniDoughnut
    },
    lineGroup: {
        line: index_1.MiniLine
    },
    scatterGroup: {
        scatter: index_1.MiniScatter,
        bubble: index_1.MiniBubble
    },
    areaGroup: {
        area: index_1.MiniArea,
        stackedArea: index_1.MiniStackedArea,
        normalizedArea: index_1.MiniNormalizedArea
    },
    histogramGroup: {
        histogram: index_1.MiniHistogram
    },
    combinationGroup: {
        columnLineCombo: index_1.MiniColumnLineCombo,
        areaColumnCombo: index_1.MiniAreaColumnCombo,
        customCombo: index_1.MiniCustomCombo
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
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(function (chartType) { return chartType !== 'customCombo'; });
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
                var _a;
                var MiniClass = (_a = miniChartMapping[group]) === null || _a === void 0 ? void 0 : _a[chartType];
                if (!MiniClass) {
                    core_1._.warnOnce("invalid chartGroupsDef config '".concat(group).concat(miniChartMapping[group] ? ".".concat(chartType) : '', "'"));
                    return;
                }
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
        (0, core_1.Autowired)('chartTranslationService')
    ], MiniChartsContainer.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], MiniChartsContainer.prototype, "init", null);
    return MiniChartsContainer;
}(core_1.Component));
exports.MiniChartsContainer = MiniChartsContainer;
