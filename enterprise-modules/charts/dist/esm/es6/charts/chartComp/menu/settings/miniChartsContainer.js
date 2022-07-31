var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AgGroupComponent, Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { MiniArea, MiniAreaColumnCombo, MiniBar, MiniBubble, MiniColumn, MiniColumnLineCombo, MiniCustomCombo, MiniDoughnut, MiniHistogram, MiniLine, MiniNormalizedArea, MiniNormalizedBar, MiniNormalizedColumn, MiniPie, MiniScatter, MiniStackedArea, MiniStackedBar, MiniStackedColumn, } from "./miniCharts";
export class MiniChartsContainer extends Component {
    constructor(chartController, fills, strokes) {
        super(MiniChartsContainer.TEMPLATE);
        this.wrappers = {};
        this.chartGroups = {
            columnGroup: [
                MiniColumn,
                MiniStackedColumn,
                MiniNormalizedColumn
            ],
            barGroup: [
                MiniBar,
                MiniStackedBar,
                MiniNormalizedBar
            ],
            pieGroup: [
                MiniPie,
                MiniDoughnut
            ],
            lineGroup: [
                MiniLine
            ],
            scatterGroup: [
                MiniScatter,
                MiniBubble
            ],
            areaGroup: [
                MiniArea,
                MiniStackedArea,
                MiniNormalizedArea
            ],
            histogramGroup: [
                MiniHistogram
            ],
            combinationGroup: [
                MiniColumnLineCombo,
                MiniAreaColumnCombo,
                MiniCustomCombo
            ]
        };
        this.chartController = chartController;
        this.fills = fills;
        this.strokes = strokes;
    }
    init() {
        // hide MiniCustomCombo if no custom combo exists
        if (!this.chartController.customComboExists()) {
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(miniChart => miniChart !== MiniCustomCombo);
        }
        const eGui = this.getGui();
        Object.keys(this.chartGroups).forEach(group => {
            const chartGroup = this.chartGroups[group];
            const groupComponent = this.createBean(new AgGroupComponent({
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
    Autowired('chartTranslationService')
], MiniChartsContainer.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], MiniChartsContainer.prototype, "init", null);
