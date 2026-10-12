import type { AgColorType } from 'ag-charts-types';
import { _setAriaLabel } from 'ag-stack';

import type { BeanCollection, ChartGroupsDef, ChartType } from 'ag-grid-community';
import { Component, KeyCode, _createElement } from 'ag-grid-community';

import { AgGroupComponent } from '../../../../agStack/agGroupComponent';
import type { GroupComponent } from '../../../../widgets/gridEnterpriseWidgetTypes';
import type { ChartController } from '../../chartController';
import type { ChartTranslationService } from '../../services/chartTranslationService';
import { getFullChartNameTranslationKey } from '../../utils/seriesTypeMapper';
import { toSolidColors } from './miniChartSolidColors';
import { createMiniChartSvg } from './miniCharts/svg/miniChartSvg';
import { getMiniChartSvgTemplate } from './miniCharts/svg/miniChartSvgGeometry';

type MiniChartMenuMapping = {
    [K in keyof ChartGroupsDef]-?: MiniChartMenuGroup<K>;
};

type MiniChartMenuGroup<K extends keyof ChartGroupsDef> = {
    [T in NonNullable<ChartGroupsDef[K]>[number]]: MiniChartMenuItem;
};

interface MiniChartMenuItem {
    range: boolean;
    pivot: boolean;
    enterprise: boolean;
    chartType: ChartType;
}

const miniChartMapping: MiniChartMenuMapping = {
    columnGroup: {
        column: { range: true, pivot: true, enterprise: false, chartType: 'groupedColumn' },
        stackedColumn: { range: true, pivot: true, enterprise: false, chartType: 'stackedColumn' },
        normalizedColumn: { range: true, pivot: true, enterprise: false, chartType: 'normalizedColumn' },
    },
    barGroup: {
        bar: { range: true, pivot: true, enterprise: false, chartType: 'groupedBar' },
        stackedBar: { range: true, pivot: true, enterprise: false, chartType: 'stackedBar' },
        normalizedBar: { range: true, pivot: true, enterprise: false, chartType: 'normalizedBar' },
    },
    pieGroup: {
        pie: { range: true, pivot: true, enterprise: false, chartType: 'pie' },
        donut: { range: true, pivot: true, enterprise: false, chartType: 'donut' },
        doughnut: { range: true, pivot: true, enterprise: false, chartType: 'donut' },
    },
    lineGroup: {
        line: { range: true, pivot: true, enterprise: false, chartType: 'line' },
        stackedLine: { range: true, pivot: true, enterprise: false, chartType: 'stackedLine' },
        normalizedLine: { range: true, pivot: true, enterprise: false, chartType: 'normalizedLine' },
    },
    scatterGroup: {
        scatter: { range: true, pivot: true, enterprise: false, chartType: 'scatter' },
        bubble: { range: true, pivot: true, enterprise: false, chartType: 'bubble' },
    },
    areaGroup: {
        area: { range: true, pivot: true, enterprise: false, chartType: 'area' },
        stackedArea: { range: true, pivot: true, enterprise: false, chartType: 'stackedArea' },
        normalizedArea: { range: true, pivot: true, enterprise: false, chartType: 'normalizedArea' },
    },
    polarGroup: {
        radarLine: { range: true, pivot: false, enterprise: true, chartType: 'radarLine' },
        radarArea: { range: true, pivot: false, enterprise: true, chartType: 'radarArea' },
        nightingale: { range: true, pivot: false, enterprise: true, chartType: 'nightingale' },
        radialColumn: { range: true, pivot: false, enterprise: true, chartType: 'radialColumn' },
        radialBar: { range: true, pivot: false, enterprise: true, chartType: 'radialBar' },
    },
    statisticalGroup: {
        boxPlot: { range: true, pivot: false, enterprise: true, chartType: 'boxPlot' },
        histogram: { range: true, pivot: false, enterprise: false, chartType: 'histogram' },
        rangeBar: { range: true, pivot: false, enterprise: true, chartType: 'rangeBar' },
        rangeArea: { range: true, pivot: false, enterprise: true, chartType: 'rangeArea' },
    },
    hierarchicalGroup: {
        treemap: { range: true, pivot: true, enterprise: true, chartType: 'treemap' },
        sunburst: { range: true, pivot: true, enterprise: true, chartType: 'sunburst' },
    },
    specializedGroup: {
        heatmap: { range: true, pivot: false, enterprise: true, chartType: 'heatmap' },
        waterfall: { range: true, pivot: false, enterprise: true, chartType: 'waterfall' },
    },
    combinationGroup: {
        columnLineCombo: { range: true, pivot: true, enterprise: false, chartType: 'columnLineCombo' },
        areaColumnCombo: { range: true, pivot: true, enterprise: false, chartType: 'areaColumnCombo' },
        customCombo: { range: true, pivot: true, enterprise: false, chartType: 'customCombo' },
    },
    funnelGroup: {
        funnel: { range: true, pivot: false, enterprise: true, chartType: 'funnel' },
        coneFunnel: { range: true, pivot: false, enterprise: true, chartType: 'coneFunnel' },
        pyramid: { range: true, pivot: false, enterprise: true, chartType: 'pyramid' },
    },
};

const DEFAULT_CHART_GROUPS: ChartGroupsDef = {
    columnGroup: ['column', 'stackedColumn', 'normalizedColumn'],
    barGroup: ['bar', 'stackedBar', 'normalizedBar'],
    pieGroup: ['pie', 'donut'],
    lineGroup: ['line', 'stackedLine', 'normalizedLine'],
    areaGroup: ['area', 'stackedArea', 'normalizedArea'],
    scatterGroup: ['scatter', 'bubble'],
    polarGroup: ['radarLine', 'radarArea', 'nightingale', 'radialColumn', 'radialBar'],
    statisticalGroup: ['boxPlot', 'histogram', 'rangeBar', 'rangeArea'],
    hierarchicalGroup: ['treemap', 'sunburst'],
    specializedGroup: ['heatmap', 'waterfall'],
    funnelGroup: ['funnel', 'coneFunnel', 'pyramid'],
    combinationGroup: ['columnLineCombo', 'areaColumnCombo', 'customCombo'],
};

export class MiniChartsContainer extends Component {
    private chartTranslation: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslation = beans.chartTranslation as ChartTranslationService;
    }

    private readonly fills: AgColorType[];
    private readonly strokes: string[];
    private readonly isCustomTheme: boolean;
    private readonly wrappers: Map<ChartType, HTMLElement> = new Map();
    private readonly chartController: ChartController;

    private readonly chartGroups: ChartGroupsDef;

    constructor(
        chartController: ChartController,
        fills: AgColorType[],
        strokes: string[],
        isCustomTheme: boolean,
        chartGroups: ChartGroupsDef = DEFAULT_CHART_GROUPS
    ) {
        super(/* html */ `<div class="ag-chart-settings-mini-wrapper"></div>`);

        this.chartController = chartController;
        this.fills = fills;
        this.strokes = strokes;
        this.isCustomTheme = isCustomTheme;
        this.chartGroups = { ...chartGroups };
    }

    public postConstruct() {
        // hide MiniCustomCombo if no custom combo exists
        if (!this.chartController.customComboExists() && this.chartGroups.combinationGroup) {
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(
                (chartType) => chartType !== 'customCombo'
            );
        }

        const eGui = this.getGui();
        const isEnterprise = this.chartController.isEnterprise();
        const isPivotChart = this.chartController.isPivotChart();
        const isRangeChart = !isPivotChart;
        const solidFills = toSolidColors(this.fills);
        const solidStrokes = toSolidColors(this.strokes);

        // Determine the set of chart types that are specified by the chartGroupsDef config, filtering out any entries
        // that are invalid for the current chart configuration (pivot/range) and license type
        const displayedMenuGroups = Object.keys(this.chartGroups)
            .map((group: keyof ChartGroupsDef) => {
                const menuGroup = group in miniChartMapping ? miniChartMapping[group] : undefined;
                if (!menuGroup) {
                    // User has specified an invalid chart group in the chartGroupsDef config
                    this.beans.log.warn(148, { group });
                    return null;
                }

                // Determine the valid chart types within this group, based on the chartGroupsDef config
                const chartGroupValues = this.chartGroups[group] ?? [];
                const menuItems = chartGroupValues
                    .map((chartType) => {
                        const menuItem =
                            chartType in menuGroup
                                ? (menuGroup as Record<typeof chartType, MiniChartMenuItem>)[chartType]
                                : undefined;

                        if (!menuItem) {
                            // User has specified an invalid chart type in the chartGroupsDef config
                            this.beans.log.warn(149, { group, chartType });
                            return null;
                        }

                        if (!isEnterprise && menuItem.enterprise) {
                            return null; // skip enterprise charts if community
                        }
                        // Only show the chart if it is valid for the current chart configuration (pivot/range)
                        if (isRangeChart && menuItem.range) {
                            return menuItem;
                        }
                        if (isPivotChart && menuItem.pivot) {
                            return menuItem;
                        }
                        return null;
                    })
                    .filter((menuItem): menuItem is NonNullable<typeof menuItem> => menuItem != null);

                if (menuItems.length === 0) {
                    return null;
                } // don't render empty chart groups

                return {
                    label: this.chartTranslation.translate(group),
                    items: menuItems,
                };
            })
            .filter((menuGroup): menuGroup is NonNullable<typeof menuGroup> => menuGroup != null);

        // Render the filtered menu items
        for (const { label, items } of displayedMenuGroups) {
            const groupComponent: GroupComponent = this.createBean(
                new AgGroupComponent({
                    title: label,
                    suppressEnabledCheckbox: true,
                    enabled: true,
                    suppressOpenCloseIcons: true,
                    cssIdentifier: 'charts-settings',
                    direction: 'horizontal',
                    suppressKeyboardNavigation: true,
                })
            );

            for (const menuItem of items) {
                const { chartType } = menuItem;
                const miniWrapper = _createElement({
                    tag: 'div',
                    cls: 'ag-chart-mini-thumbnail',
                    role: 'button',
                    attrs: { tabindex: '0' },
                });

                const listener = () => {
                    this.chartController.setChartType(chartType);
                    this.updateSelectedMiniChart();
                };
                this.addManagedListeners(miniWrapper, {
                    click: listener,
                    keydown: (event) => {
                        if (event.key == KeyCode.ENTER || event.key === KeyCode.SPACE) {
                            event.preventDefault();
                            listener();
                        }
                    },
                });

                this.wrappers.set(chartType, miniWrapper);

                const template = getMiniChartSvgTemplate(chartType, this.isCustomTheme, solidFills);
                if (template) {
                    createMiniChartSvg(
                        miniWrapper,
                        template,
                        solidFills,
                        solidStrokes,
                        this.chartTranslation.translate(template.tooltip)
                    );
                }
                groupComponent.addItem(miniWrapper);
            }

            eGui.appendChild(groupComponent.getGui());
        }

        this.updateSelectedMiniChart();
    }

    public updateSelectedMiniChart(): void {
        const selectedChartType = this.chartController.getChartType();
        this.wrappers.forEach((miniChart, miniChartType) => {
            const selected = miniChartType === selectedChartType;
            miniChart.classList.toggle('ag-selected', selected);

            const chartName = this.chartTranslation.translate(getFullChartNameTranslationKey(miniChartType));
            const ariaLabel = selected
                ? `${chartName}. ${this.chartTranslation.translate('ariaChartSelected')}`
                : chartName;
            _setAriaLabel(miniChart, ariaLabel);
        });
    }

    public override destroy(): void {
        this.wrappers.clear();
        super.destroy();
    }
}
