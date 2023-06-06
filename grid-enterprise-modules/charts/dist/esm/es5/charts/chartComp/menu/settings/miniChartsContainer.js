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
import { _, AgGroupComponent, Autowired, Component, DEFAULT_CHART_GROUPS, PostConstruct } from "@ag-grid-community/core";
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
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(function (chartType) { return chartType !== 'customCombo'; });
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
                var _a;
                var MiniClass = (_a = miniChartMapping[group]) === null || _a === void 0 ? void 0 : _a[chartType];
                if (!MiniClass) {
                    if (miniChartMapping[group]) {
                        _.doOnce(function () { return console.warn("AG Grid - invalid chartGroupsDef config '" + group + "." + chartType + "'"); }, "invalid_chartGroupsDef" + chartType + "_" + group);
                    }
                    else {
                        _.doOnce(function () { return console.warn("AG Grid - invalid chartGroupsDef config '" + group + "'"); }, "invalid_chartGroupsDef" + group);
                    }
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
        Autowired('chartTranslationService')
    ], MiniChartsContainer.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], MiniChartsContainer.prototype, "init", null);
    return MiniChartsContainer;
}(Component));
export { MiniChartsContainer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUNoYXJ0c0NvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvc2V0dGluZ3MvbWluaUNoYXJ0c0NvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsZ0JBQWdCLEVBQ2hCLFNBQVMsRUFHVCxTQUFTLEVBQ1Qsb0JBQW9CLEVBQ3BCLGFBQWEsRUFDaEIsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxPQUFPLEVBQ0gsUUFBUSxFQUNSLG1CQUFtQixFQUNuQixPQUFPLEVBQ1AsVUFBVSxFQUNWLFVBQVUsRUFDVixtQkFBbUIsRUFDbkIsZUFBZSxFQUNmLFlBQVksRUFDWixhQUFhLEVBQ2IsUUFBUSxFQUNSLGtCQUFrQixFQUNsQixpQkFBaUIsRUFDakIsb0JBQW9CLEVBQ3BCLE9BQU8sRUFDUCxXQUFXLEVBQ1gsZUFBZSxFQUNmLGNBQWMsRUFDZCxpQkFBaUIsR0FDcEIsTUFBTSxjQUFjLENBQUM7QUFFdEIsSUFBTSxnQkFBZ0IsR0FBRztJQUNyQixXQUFXLEVBQUU7UUFDVCxNQUFNLEVBQUUsVUFBVTtRQUNsQixhQUFhLEVBQUUsaUJBQWlCO1FBQ2hDLGdCQUFnQixFQUFFLG9CQUFvQjtLQUN6QztJQUNELFFBQVEsRUFBRTtRQUNOLEdBQUcsRUFBRSxPQUFPO1FBQ1osVUFBVSxFQUFFLGNBQWM7UUFDMUIsYUFBYSxFQUFFLGlCQUFpQjtLQUNuQztJQUNELFFBQVEsRUFBRTtRQUNOLEdBQUcsRUFBRSxPQUFPO1FBQ1osUUFBUSxFQUFFLFlBQVk7S0FDekI7SUFDRCxTQUFTLEVBQUU7UUFDUCxJQUFJLEVBQUUsUUFBUTtLQUNqQjtJQUNELFlBQVksRUFBRTtRQUNWLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLE1BQU0sRUFBRSxVQUFVO0tBQ3JCO0lB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