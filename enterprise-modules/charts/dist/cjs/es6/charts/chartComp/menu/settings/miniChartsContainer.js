"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniChartsContainer = void 0;
const core_1 = require("@ag-grid-community/core");
const miniCharts_1 = require("./miniCharts");
const miniChartMapping = {
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
class MiniChartsContainer extends core_1.Component {
    constructor(chartController, fills, strokes, chartGroups = core_1.DEFAULT_CHART_GROUPS) {
        super(MiniChartsContainer.TEMPLATE);
        this.wrappers = {};
        this.chartController = chartController;
        this.fills = fills;
        this.strokes = strokes;
        this.chartGroups = Object.assign({}, chartGroups);
    }
    init() {
        // hide MiniCustomCombo if no custom combo exists
        if (!this.chartController.customComboExists() && this.chartGroups.combinationGroup) {
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(chartType => chartType !== 'customCombo');
        }
        const eGui = this.getGui();
        Object.keys(this.chartGroups).forEach((group) => {
            const chartGroupValues = this.chartGroups[group];
            const groupComponent = this.createBean(new core_1.AgGroupComponent({
                title: this.chartTranslationService.translate(group),
                suppressEnabledCheckbox: true,
                enabled: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-settings',
                direction: 'horizontal'
            }));
            chartGroupValues.forEach((chartType) => {
                var _a;
                const MiniClass = (_a = miniChartMapping[group]) === null || _a === void 0 ? void 0 : _a[chartType];
                if (!MiniClass) {
                    if (miniChartMapping[group]) {
                        core_1._.doOnce(() => console.warn(`AG Grid - invalid chartGroupsDef config '${group}.${chartType}'`), `invalid_chartGroupsDef${chartType}_${group}`);
                    }
                    else {
                        core_1._.doOnce(() => console.warn(`AG Grid - invalid chartGroupsDef config '${group}'`), `invalid_chartGroupsDef${group}`);
                    }
                    return;
                }
                const miniWrapper = document.createElement('div');
                miniWrapper.classList.add('ag-chart-mini-thumbnail');
                const miniClassChartType = MiniClass.chartType;
                this.addManagedListener(miniWrapper, 'click', () => {
                    this.chartController.setChartType(miniClassChartType);
                    this.updateSelectedMiniChart();
                });
                this.wrappers[miniClassChartType] = miniWrapper;
                this.createBean(new MiniClass(miniWrapper, this.fills, this.strokes));
                groupComponent.addItem(miniWrapper);
            });
            eGui.appendChild(groupComponent.getGui());
        });
        this.updateSelectedMiniChart();
    }
    updateSelectedMiniChart() {
        const selectedChartType = this.chartController.getChartType();
        for (const miniChartType in this.wrappers) {
            const miniChart = this.wrappers[miniChartType];
            const selected = miniChartType === selectedChartType;
            miniChart.classList.toggle('ag-selected', selected);
        }
    }
}
MiniChartsContainer.TEMPLATE = `<div class="ag-chart-settings-mini-wrapper"></div>`;
__decorate([
    core_1.Autowired('chartTranslationService')
], MiniChartsContainer.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], MiniChartsContainer.prototype, "init", null);
exports.MiniChartsContainer = MiniChartsContainer;
