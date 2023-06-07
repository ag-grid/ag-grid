var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgGroupComponent, Autowired, Component, DEFAULT_CHART_GROUPS, PostConstruct } from "@ag-grid-community/core";
import { MiniArea, MiniAreaColumnCombo, MiniBar, MiniBubble, MiniColumn, MiniColumnLineCombo, MiniCustomCombo, MiniDoughnut, MiniHistogram, MiniLine, MiniNormalizedArea, MiniNormalizedBar, MiniNormalizedColumn, MiniPie, MiniScatter, MiniStackedArea, MiniStackedBar, MiniStackedColumn, } from "./miniCharts";
const miniChartMapping = {
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
export class MiniChartsContainer extends Component {
    constructor(chartController, fills, strokes, chartGroups = DEFAULT_CHART_GROUPS) {
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
            const groupComponent = this.createBean(new AgGroupComponent({
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
                        _.doOnce(() => console.warn(`AG Grid - invalid chartGroupsDef config '${group}.${chartType}'`), `invalid_chartGroupsDef${chartType}_${group}`);
                    }
                    else {
                        _.doOnce(() => console.warn(`AG Grid - invalid chartGroupsDef config '${group}'`), `invalid_chartGroupsDef${group}`);
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
    Autowired('chartTranslationService')
], MiniChartsContainer.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], MiniChartsContainer.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUNoYXJ0c0NvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvc2V0dGluZ3MvbWluaUNoYXJ0c0NvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELGdCQUFnQixFQUNoQixTQUFTLEVBR1QsU0FBUyxFQUNULG9CQUFvQixFQUNwQixhQUFhLEVBQ2hCLE1BQU0seUJBQXlCLENBQUM7QUFHakMsT0FBTyxFQUNILFFBQVEsRUFDUixtQkFBbUIsRUFDbkIsT0FBTyxFQUNQLFVBQVUsRUFDVixVQUFVLEVBQ1YsbUJBQW1CLEVBQ25CLGVBQWUsRUFDZixZQUFZLEVBQ1osYUFBYSxFQUNiLFFBQVEsRUFDUixrQkFBa0IsRUFDbEIsaUJBQWlCLEVBQ2pCLG9CQUFvQixFQUNwQixPQUFPLEVBQ1AsV0FBVyxFQUNYLGVBQWUsRUFDZixjQUFjLEVBQ2QsaUJBQWlCLEdBQ3BCLE1BQU0sY0FBYyxDQUFDO0FBRXRCLE1BQU0sZ0JBQWdCLEdBQUc7SUFDckIsV0FBVyxFQUFFO1FBQ1QsTUFBTSxFQUFFLFVBQVU7UUFDbEIsYUFBYSxFQUFFLGlCQUFpQjtRQUNoQyxnQkFBZ0IsRUFBRSxvQkFBb0I7S0FDekM7SUFDRCxRQUFRLEVBQUU7UUFDTixHQUFHLEVBQUUsT0FBTztRQUNaLFVBQVUsRUFBRSxjQUFjO1FBQzFCLGFBQWEsRUFBRSxpQkFBaUI7S0FDbkM7SUFDRCxRQUFRLEVBQUU7UUFDTixHQUFHLEVBQUUsT0FBTztRQUNaLFFBQVEsRUFBRSxZQUFZO0tBQ3pCO0lBQ0QsU0FBUyxFQUFFO1FBQ1AsSUFBSSxFQUFFLFFBQVE7S0FDakI7SUFDRCxZQUFZLEVBQUU7UUFDVixPQUFPLEVBQUUsV0FBVztRQUNwQixNQUFNLEVBQUUsVUFBVTtLQUNyQjtJQUNELFNBQVMsRUFBRTtRQUNQLElBQUksRUFB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