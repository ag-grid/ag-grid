"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const miniCharts_1 = require("./miniCharts");
class MiniChartsContainer extends core_1.Component {
    constructor(chartController, fills, strokes) {
        super(MiniChartsContainer.TEMPLATE);
        this.wrappers = {};
        this.chartGroups = {
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
        this.chartController = chartController;
        this.fills = fills;
        this.strokes = strokes;
    }
    init() {
        // hide MiniCustomCombo if no custom combo exists
        if (!this.chartController.customComboExists()) {
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(miniChart => miniChart !== miniCharts_1.MiniCustomCombo);
        }
        const eGui = this.getGui();
        Object.keys(this.chartGroups).forEach(group => {
            const chartGroup = this.chartGroups[group];
            const groupComponent = this.createBean(new core_1.AgGroupComponent({
                title: this.chartTranslationService.translate(group),
                suppressEnabledCheckbox: true,
                enabled: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-settings',
                direction: 'horizontal'
            }));
            chartGroup.forEach(MiniClass => {
                const miniWrapper = document.createElement('div');
                miniWrapper.classList.add('ag-chart-mini-thumbnail');
                this.addManagedListener(miniWrapper, 'click', () => {
                    this.chartController.setChartType(MiniClass.chartType);
                    this.updateSelectedMiniChart();
                });
                this.wrappers[MiniClass.chartType] = miniWrapper;
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
