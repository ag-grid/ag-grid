var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgGroupComponent, Autowired, Component, DEFAULT_CHART_GROUPS, PostConstruct } from "@ag-grid-community/core";
import { MiniArea, MiniAreaColumnCombo, MiniBar, MiniBoxPlot, MiniBubble, MiniColumn, MiniColumnLineCombo, MiniCustomCombo, MiniDonut, MiniHeatmap, MiniHistogram, MiniLine, MiniNightingale, MiniNormalizedArea, MiniNormalizedBar, MiniNormalizedColumn, MiniPie, MiniRadarArea, MiniRadarLine, MiniRadialBar, MiniRadialColumn, MiniRangeBar, MiniRangeArea, MiniWaterfall, MiniScatter, MiniStackedArea, MiniStackedBar, MiniStackedColumn, MiniSunburst, MiniTreemap, } from "./miniCharts/index.mjs"; // please leave this as is - we want it to be explicit for build reasons
const miniChartMapping = {
    columnGroup: {
        column: { range: true, pivot: true, enterprise: false, icon: MiniColumn },
        stackedColumn: { range: true, pivot: true, enterprise: false, icon: MiniStackedColumn },
        normalizedColumn: { range: true, pivot: true, enterprise: false, icon: MiniNormalizedColumn },
    },
    barGroup: {
        bar: { range: true, pivot: true, enterprise: false, icon: MiniBar },
        stackedBar: { range: true, pivot: true, enterprise: false, icon: MiniStackedBar },
        normalizedBar: { range: true, pivot: true, enterprise: false, icon: MiniNormalizedBar },
    },
    pieGroup: {
        pie: { range: true, pivot: true, enterprise: false, icon: MiniPie },
        donut: { range: true, pivot: true, enterprise: false, icon: MiniDonut },
        doughnut: { range: true, pivot: true, enterprise: false, icon: MiniDonut },
    },
    lineGroup: { line: { range: true, pivot: true, enterprise: false, icon: MiniLine } },
    scatterGroup: {
        scatter: { range: true, pivot: true, enterprise: false, icon: MiniScatter },
        bubble: { range: true, pivot: true, enterprise: false, icon: MiniBubble },
    },
    areaGroup: {
        area: { range: true, pivot: true, enterprise: false, icon: MiniArea },
        stackedArea: { range: true, pivot: true, enterprise: false, icon: MiniStackedArea },
        normalizedArea: { range: true, pivot: true, enterprise: false, icon: MiniNormalizedArea },
    },
    polarGroup: {
        radarLine: { range: true, pivot: false, enterprise: true, icon: MiniRadarLine },
        radarArea: { range: true, pivot: false, enterprise: true, icon: MiniRadarArea },
        nightingale: { range: true, pivot: false, enterprise: true, icon: MiniNightingale },
        radialColumn: { range: true, pivot: false, enterprise: true, icon: MiniRadialColumn },
        radialBar: { range: true, pivot: false, enterprise: true, icon: MiniRadialBar },
    },
    statisticalGroup: {
        boxPlot: { range: true, pivot: false, enterprise: true, icon: MiniBoxPlot },
        histogram: { range: true, pivot: false, enterprise: false, icon: MiniHistogram },
        rangeBar: { range: true, pivot: false, enterprise: true, icon: MiniRangeBar },
        rangeArea: { range: true, pivot: false, enterprise: true, icon: MiniRangeArea },
    },
    hierarchicalGroup: {
        treemap: { range: true, pivot: true, enterprise: true, icon: MiniTreemap },
        sunburst: { range: true, pivot: true, enterprise: true, icon: MiniSunburst },
    },
    specializedGroup: {
        heatmap: { range: true, pivot: false, enterprise: true, icon: MiniHeatmap },
        waterfall: { range: true, pivot: false, enterprise: true, icon: MiniWaterfall },
    },
    combinationGroup: {
        columnLineCombo: { range: true, pivot: true, enterprise: false, icon: MiniColumnLineCombo },
        areaColumnCombo: { range: true, pivot: true, enterprise: false, icon: MiniAreaColumnCombo },
        customCombo: { range: true, pivot: true, enterprise: false, icon: MiniCustomCombo },
    },
};
export class MiniChartsContainer extends Component {
    constructor(chartController, fills, strokes, themeTemplateParameters, isCustomTheme, chartGroups = DEFAULT_CHART_GROUPS) {
        super(MiniChartsContainer.TEMPLATE);
        this.wrappers = {};
        this.chartController = chartController;
        this.fills = fills;
        this.strokes = strokes;
        this.themeTemplateParameters = themeTemplateParameters;
        this.isCustomTheme = isCustomTheme;
        this.chartGroups = Object.assign({}, chartGroups);
    }
    init() {
        const eGui = this.getGui();
        const isEnterprise = this.chartController.isEnterprise();
        const isPivotChart = this.chartController.isPivotChart();
        const isRangeChart = !isPivotChart;
        // Determine the set of chart types that are specified by the chartGroupsDef config, filtering out any entries
        // that are invalid for the current chart configuration (pivot/range) and license type
        const displayedMenuGroups = Object.keys(this.chartGroups).map((group) => {
            var _a;
            const menuGroup = group in miniChartMapping
                ? miniChartMapping[group]
                : undefined;
            if (!menuGroup) {
                // User has specified an invalid chart group in the chartGroupsDef config
                _.warnOnce(`invalid chartGroupsDef config '${group}'`);
                return null;
            }
            // Determine the valid chart types within this group, based on the chartGroupsDef config
            const chartGroupValues = (_a = this.chartGroups[group]) !== null && _a !== void 0 ? _a : [];
            const menuItems = chartGroupValues.map((chartType) => {
                const menuItem = chartType in menuGroup
                    ? menuGroup[chartType]
                    : undefined;
                if (!menuItem) {
                    // User has specified an invalid chart type in the chartGroupsDef config
                    _.warnOnce(`invalid chartGroupsDef config '${group}.${chartType}'`);
                    return null;
                }
                if (!isEnterprise && menuItem.enterprise) {
                    return null; // skip enterprise charts if community
                }
                // Only show the chart if it is valid for the current chart configuration (pivot/range)
                if (isRangeChart && menuItem.range)
                    return menuItem;
                if (isPivotChart && menuItem.pivot)
                    return menuItem;
                return null;
            })
                .filter((menuItem) => menuItem != null);
            if (menuItems.length === 0)
                return null; // don't render empty chart groups
            return {
                label: this.chartTranslationService.translate(group),
                items: menuItems
            };
        })
            .filter((menuGroup) => menuGroup != null);
        // Render the filtered menu items
        for (const { label, items } of displayedMenuGroups) {
            const groupComponent = this.createBean(new AgGroupComponent({
                title: label,
                suppressEnabledCheckbox: true,
                enabled: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-settings',
                direction: 'horizontal',
            }));
            for (const menuItem of items) {
                const MiniClass = menuItem.icon;
                const miniWrapper = document.createElement('div');
                miniWrapper.classList.add('ag-chart-mini-thumbnail');
                const miniClassChartType = MiniClass.chartType;
                this.addManagedListener(miniWrapper, 'click', () => {
                    this.chartController.setChartType(miniClassChartType);
                    this.updateSelectedMiniChart();
                });
                this.wrappers[miniClassChartType] = miniWrapper;
                this.createBean(new MiniClass(miniWrapper, this.fills, this.strokes, this.themeTemplateParameters, this.isCustomTheme));
                groupComponent.addItem(miniWrapper);
            }
            eGui.appendChild(groupComponent.getGui());
        }
        // hide MiniCustomCombo if no custom combo exists
        if (!this.chartController.customComboExists() && this.chartGroups.combinationGroup) {
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(chartType => chartType !== 'customCombo');
        }
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
