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
const index_1 = require("./miniCharts/index"); // please leave this as is - we want it to be explicit for build reasons
const miniChartMapping = {
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
                    core_1._.warnOnce(`invalid chartGroupsDef config '${group}${miniChartMapping[group] ? `.${chartType}` : ''}'`);
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
    (0, core_1.Autowired)('chartTranslationService')
], MiniChartsContainer.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], MiniChartsContainer.prototype, "init", null);
exports.MiniChartsContainer = MiniChartsContainer;
