import { AgGroupComponent, Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ChartTranslationService } from "../../services/chartTranslationService";
import {
    MiniArea,
    MiniAreaColumnCombo,
    MiniBar,
    MiniBubble,
    MiniColumn,
    MiniColumnLineCombo,
    MiniCustomCombo,
    MiniDoughnut,
    MiniHistogram,
    MiniLine,
    MiniNormalizedArea,
    MiniNormalizedBar,
    MiniNormalizedColumn,
    MiniPie,
    MiniScatter,
    MiniStackedArea,
    MiniStackedBar,
    MiniStackedColumn,
} from "./miniCharts";

type ChartGroupsType =
      'barGroup'
    | 'columnGroup'
    | 'pieGroup'
    | 'lineGroup'
    | 'scatterGroup'
    | 'areaGroup'
    | 'histogramGroup'
    | 'combinationGroup';

type ChartGroups = {
    [key in ChartGroupsType]: any[];
};

export class MiniChartsContainer extends Component {

    static TEMPLATE = /* html */ `<div class="ag-chart-settings-mini-wrapper"></div>`;

    private readonly fills: string[];
    private readonly strokes: string[];
    private wrappers: { [key: string]: HTMLElement } = {};
    private chartController: ChartController;

    private chartGroups: ChartGroups = {
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
        combinationGroup:  [
            MiniColumnLineCombo,
            MiniAreaColumnCombo,
            MiniCustomCombo
        ]
    };

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(chartController: ChartController, fills: string[], strokes: string[]) {
        super(MiniChartsContainer.TEMPLATE);

        this.chartController = chartController;
        this.fills = fills;
        this.strokes = strokes;
    }

    @PostConstruct
    private init() {
        // hide MiniCustomCombo if no custom combo exists
        if (!this.chartController.customComboExists()) {
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(miniChart => miniChart !== MiniCustomCombo);
        }

        const eGui = this.getGui();

        Object.keys(this.chartGroups).forEach(group => {
            const chartGroup = this.chartGroups[group as ChartGroupsType];
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

    public updateSelectedMiniChart(): void {
        const selectedChartType = this.chartController.getChartType();
        for (const miniChartType in this.wrappers) {
            const miniChart = this.wrappers[miniChartType];
            const selected = miniChartType === selectedChartType;
            miniChart.classList.toggle('ag-selected', selected);
        }
    }
}
