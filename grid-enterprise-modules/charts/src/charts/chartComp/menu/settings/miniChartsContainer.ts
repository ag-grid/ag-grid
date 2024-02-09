
import {
    _,
    AgGroupComponent,
    Autowired,
    ChartGroupsDef,
    ChartType,
    Component,
    DEFAULT_CHART_GROUPS,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ChartTranslationService } from "../../services/chartTranslationService";
import {
    MiniArea,
    MiniAreaColumnCombo,
    MiniBar,
    MiniBoxPlot,
    MiniBubble,
    MiniColumn,
    MiniColumnLineCombo,
    MiniCustomCombo,
    MiniDoughnut,
    MiniHeatmap,
    MiniHistogram,
    MiniLine,
    MiniNightingale,
    MiniNormalizedArea,
    MiniNormalizedBar,
    MiniNormalizedColumn,
    MiniPie,
    MiniRadarArea,
    MiniRadarLine,
    MiniRadialBar,
    MiniRadialColumn,
    MiniRangeBar,
    MiniRangeArea,
    MiniWaterfall,
    MiniScatter,
    MiniStackedArea,
    MiniStackedBar,
    MiniStackedColumn,
    MiniSunburst,
    MiniTreemap,
} from "./miniCharts/index"; // please leave this as is - we want it to be explicit for build reasons

// import {enterprise} from "../../../../main";

export type ThemeTemplateParameters = {
    extensions: Map<any, any>;
    properties: Map<any, any>;
}

const miniChartMapping = {
    columnGroup: {
        enterprise: false,
        chartTypes: {column: MiniColumn, stackedColumn: MiniStackedColumn, normalizedColumn: MiniNormalizedColumn}
    },
    barGroup: {
        enterprise: false,
        chartTypes: {bar: MiniBar, stackedBar: MiniStackedBar, normalizedBar: MiniNormalizedBar}
    },
    pieGroup: {enterprise: false, chartTypes: {pie: MiniPie, doughnut: MiniDoughnut}},
    lineGroup: {enterprise: false, chartTypes: {line: MiniLine}},
    scatterGroup: {enterprise: false, chartTypes: {scatter: MiniScatter, bubble: MiniBubble}},
    areaGroup: {
        enterprise: false,
        chartTypes: {area: MiniArea, stackedArea: MiniStackedArea, normalizedArea: MiniNormalizedArea}
    },
    polarGroup: {
        enterprise: true,
        chartTypes: {radarLine: MiniRadarLine, radarArea: MiniRadarArea, nightingale: MiniNightingale, radialColumn: MiniRadialColumn, radialBar: MiniRadialBar}
    },
    statisticalGroup: {
        enterprise: true,
        chartTypes: {boxPlot: MiniBoxPlot, histogram: MiniHistogram, rangeBar: MiniRangeBar, rangeArea: MiniRangeArea}
    },
    hierarchicalGroup: {
        enterprise: true,
        chartTypes: {treemap: MiniTreemap, sunburst: MiniSunburst}
    },
    specializedGroup: {
        enterprise: true,
        chartTypes: {heatmap: MiniHeatmap, waterfall: MiniWaterfall}
    },
    combinationGroup: {
        enterprise: false,
        chartTypes: {
            columnLineCombo: MiniColumnLineCombo,
            areaColumnCombo: MiniAreaColumnCombo,
            customCombo: MiniCustomCombo
        }
    }
};

export class MiniChartsContainer extends Component {

    static TEMPLATE = /* html */ `<div class="ag-chart-settings-mini-wrapper"></div>`;

    private readonly fills: string[];
    private readonly strokes: string[];
    private readonly themeTemplateParameters: ThemeTemplateParameters;
    private readonly isCustomTheme: boolean;
    private wrappers: { [key: string]: HTMLElement } = {};
    private chartController: ChartController;

    private chartGroups: ChartGroupsDef;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(chartController: ChartController, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters, isCustomTheme: boolean, chartGroups: ChartGroupsDef = DEFAULT_CHART_GROUPS) {
        super(MiniChartsContainer.TEMPLATE);

        this.chartController = chartController;
        this.fills = fills;
        this.strokes = strokes;
        this.themeTemplateParameters = themeTemplateParameters;
        this.isCustomTheme = isCustomTheme;
        this.chartGroups = {...chartGroups};
    }

    @PostConstruct
    private init() {
        const eGui = this.getGui();
        const isEnterprise = this.chartController.isEnterprise();
        Object.keys(this.chartGroups).forEach((group: keyof ChartGroupsDef) => {
            if (!isEnterprise && miniChartMapping[group]?.enterprise) {
                return; // skip enterprise groups if community
            }

            const chartGroupValues = this.chartGroups[group];
            const groupComponent = this.createBean(new AgGroupComponent({
                title: this.chartTranslationService.translate(group),
                suppressEnabledCheckbox: true,
                enabled: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-settings',
                direction: 'horizontal'
            }));

            chartGroupValues!.forEach((chartType: keyof ChartGroupsDef[typeof group]) => {
                const MiniClass = miniChartMapping[group]?.chartTypes[chartType] as any;
                if (!MiniClass) {
                    _.warnOnce(`invalid chartGroupsDef config '${group}.${chartType}'`);
                    return;
                }

                const miniWrapper = document.createElement('div');
                miniWrapper.classList.add('ag-chart-mini-thumbnail');

                const miniClassChartType: ChartType = MiniClass.chartType;
                this.addManagedListener(miniWrapper, 'click', () => {
                    this.chartController.setChartType(miniClassChartType);
                    this.updateSelectedMiniChart();
                });

                this.wrappers[miniClassChartType] = miniWrapper;

                this.createBean(new MiniClass(miniWrapper, this.fills, this.strokes, this.themeTemplateParameters, this.isCustomTheme));
                groupComponent.addItem(miniWrapper);
            });

            eGui.appendChild(groupComponent.getGui());
        });

        // hide MiniCustomCombo if no custom combo exists
        if (!this.chartController.customComboExists() && this.chartGroups.combinationGroup) {
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(chartType => chartType !== 'customCombo');
        }

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
