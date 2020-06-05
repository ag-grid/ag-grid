import { _, AgGroupComponent, Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ChartTranslator } from "../../chartTranslator";
import {
    MiniArea,
    MiniBar,
    MiniBubble,
    MiniColumn,
    MiniDoughnut,
    MiniLine,
    MiniNormalizedArea,
    MiniNormalizedBar,
    MiniNormalizedColumn,
    MiniPie,
    MiniScatter,
    MiniStackedArea,
    MiniStackedBar,
    MiniStackedColumn,
    MiniHistogram
} from "./miniCharts";

type ChartGroupsType = 'barGroup' | 'columnGroup' | 'pieGroup' | 'lineGroup' | 'scatterGroup' | 'areaGroup' | 'histogramGroup';

type ChartGroups = {
    [key in ChartGroupsType]: any[];
};

export class MiniChartsContainer extends Component {

    static TEMPLATE = /* html */ `<div class="ag-chart-settings-mini-wrapper"></div>`;

    private readonly fills: string[];
    private readonly strokes: string[];
    private wrappers: { [key: string]: HTMLElement } = {};
    private chartController: ChartController;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    constructor(chartController: ChartController, fills: string[], strokes: string[]) {
        super(MiniChartsContainer.TEMPLATE);

        this.chartController = chartController;
        this.fills = fills;
        this.strokes = strokes;
    }

    @PostConstruct
    private init() {
        const chartGroups: ChartGroups = {
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
            ]
        };

        const eGui = this.getGui();

        Object.keys(chartGroups).forEach(group => {
            const chartGroup = chartGroups[group as ChartGroupsType];
            const groupComponent = this.createBean(new AgGroupComponent({
                title: this.chartTranslator.translate(group),
                suppressEnabledCheckbox: true,
                enabled: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-settings',
                direction: 'horizontal'
            }));

            chartGroup.forEach(MiniClass => {
                const miniWrapper = document.createElement('div');
                _.addCssClass(miniWrapper, 'ag-chart-mini-thumbnail');

                this.addManagedListener(miniWrapper, 'click', () => {
                    this.chartController.setChartType(MiniClass.chartType);
                    this.refreshSelected();
                });

                this.wrappers[MiniClass.chartType] = miniWrapper;

                this.createBean(new MiniClass(miniWrapper, this.fills, this.strokes));
                groupComponent.addItem(miniWrapper);
            });

            eGui.appendChild(groupComponent.getGui());
        });

        this.refreshSelected();
    }

    public refreshSelected() {
        const type = this.chartController.getChartType();

        for (const wrapper in this.wrappers) {
            _.addOrRemoveCssClass(this.wrappers[wrapper], 'ag-selected', wrapper === type);
        }
    }
}
