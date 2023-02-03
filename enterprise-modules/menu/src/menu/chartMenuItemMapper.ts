import { Bean, BeanStub, ChartGroupsDef, ChartType, IChartService, MenuItemDef, ModuleNames, ModuleRegistry, Optional, _ } from '@ag-grid-community/core';

@Bean('chartMenuItemMapper')
export class ChartMenuItemMapper extends BeanStub {

    @Optional('chartService') private readonly chartService: IChartService;

    public getChartItems(key: ChartMenuOptionName): MenuItemDef | undefined {
        if (!this.chartService) {
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, `the Context Menu key "${key}"`);
            return undefined;
        }

        return this.getChartItemsWithChildren(key);
    }

    private getChartItemsWithChildren(menuItemOrString: ChartMenuOptionName) {

        let result: MenuItemDef | string | undefined;
        result = this.getChartItem(menuItemOrString as ChartMenuOptionName);

        // if no mapping, can happen when module is not loaded but user tries to use module anyway
        if (!result) {
            return undefined;
        }

        const resultDef = result as MenuItemDef;
        const { subMenu } = resultDef;

        if (subMenu && subMenu instanceof Array) {
            const subMenuItems = subMenu.map(s => this.getChartItemsWithChildren(s as ChartMenuOptionName)).filter(s => s !== undefined) as MenuItemDef[];
            if (subMenuItems.length == 0) {
                return undefined;
            }
            result.subMenu = subMenuItems;
        }
        return result;
    }

    private getChartItem(key: ChartMenuOptionName): MenuItemDef | undefined {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const chartGroupsDef = this.gridOptionsService.get('chartToolPanelsDef')?.settingsPanel?.chartGroupsDef;

        const getChartMenuItem = (localeKey: string, defaultText: string, chartType: ChartType) => {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: () => key.startsWith('pivot') ? this.chartService.createPivotChart({ chartType }) : this.chartService.createChartFromCurrentRange(chartType)
            };
        };

        let chartMenuItem: MenuItemDef;
        switch (key) {
            case 'pivotChart':
                chartMenuItem = {
                    name: localeTextFunc('pivotChart', 'Pivot Chart'),
                    subMenu: [
                        'pivotColumnChart',
                        'pivotBarChart',
                        'pivotPieChart',
                        'pivotLineChart',
                        'pivotXYChart',
                        'pivotAreaChart',
                        'pivotHistogramChart',
                        'pivotCombinationChart'
                    ],
                    icon: _.createIconNoSpan('chart', this.gridOptionsService, undefined),
                };
                break;
            case 'chartRange':
                chartMenuItem = {
                    name: localeTextFunc('chartRange', 'Chart Range'),
                    subMenu: [
                        'rangeColumnChart',
                        'rangeBarChart',
                        'rangePieChart',
                        'rangeLineChart',
                        'rangeXYChart',
                        'rangeAreaChart',
                        'rangeHistogramChart',
                        'rangeCombinationChart'
                    ],
                    icon: _.createIconNoSpan('chart', this.gridOptionsService, undefined),
                };
                break;
            // Column Sub Menus
            case 'pivotColumnChart':
                chartMenuItem = {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: ['pivotGroupedColumn', 'pivotStackedColumn', 'pivotNormalizedColumn']
                };
                break;
            case 'rangeColumnChart':
                chartMenuItem = {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: ['rangeGroupedColumn', 'rangeStackedColumn', 'rangeNormalizedColumn']
                };
                break;
            // Column Menu Items
            case 'pivotGroupedColumn':
            case 'rangeGroupedColumn':
                chartMenuItem = getChartMenuItem('groupedColumn', 'Grouped&lrm;', 'groupedColumn');
                break;
            case 'pivotStackedColumn':
            case 'rangeStackedColumn':
                chartMenuItem = getChartMenuItem('stackedColumn', 'Stacked&lrm;', 'stackedColumn');
                break;
            case 'pivotNormalizedColumn':
            case 'rangeNormalizedColumn':
                chartMenuItem = getChartMenuItem('normalizedColumn', '100% Stacked&lrm;', 'normalizedColumn');
                break;

            // Bar Sub Menus
            case 'pivotBarChart':
                chartMenuItem = {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: ['pivotGroupedBar', 'pivotStackedBar', 'pivotNormalizedBar']
                };
                break;
            case 'rangeBarChart':
                chartMenuItem = {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: ['rangeGroupedBar', 'rangeStackedBar', 'rangeNormalizedBar']
                };
                break;
            // Bar Menus
            case 'pivotGroupedBar':
            case 'rangeGroupedBar':
                chartMenuItem = getChartMenuItem('groupedBar', 'Grouped&lrm;', 'groupedBar');
                break;
            case 'pivotStackedBar':
            case 'rangeStackedBar':
                chartMenuItem = getChartMenuItem('stackedBar', 'Stacked&lrm;', 'stackedBar');
                break;
            case 'pivotNormalizedBar':
            case 'rangeNormalizedBar':
                chartMenuItem = getChartMenuItem('normalizedBar', '100% Stacked&lrm;', 'normalizedBar');
                break;

            // Pie Sub Menus
            case 'pivotPieChart':
                chartMenuItem = {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: ['pivotPie', 'pivotDoughnut']
                };
                break;
            case 'rangePieChart':
                chartMenuItem = {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: ['rangePie', 'rangeDoughnut']
                };
                break;
            //Pie menus
            case 'pivotPie':
            case 'rangePie':
                chartMenuItem = getChartMenuItem('pie', 'Pie&lrm;', 'pie');
                break;
            case 'pivotDoughnut':
            case 'rangeDoughnut':
                chartMenuItem = getChartMenuItem('doughnut', 'Doughnut&lrm;', 'doughnut');
                break;

            // Line Menus
            case 'pivotLineChart':
            case 'rangeLineChart':
                chartMenuItem = getChartMenuItem('line', 'Line&lrm;', 'line');
                break;

            // Scatter Sub Menus
            case 'pivotXYChart':
                chartMenuItem = {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: ['pivotScatter', 'pivotBubble']
                };
                break;
            case 'rangeXYChart':
                chartMenuItem = {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: ['rangeScatter', 'rangeBubble']
                };
                break;
            // Scatter menus
            case 'pivotScatter':
            case 'rangeScatter':
                chartMenuItem = getChartMenuItem('scatter', 'Scatter&lrm;', 'scatter');
                break;
            case 'pivotBubble':
            case 'rangeBubble':
                chartMenuItem = getChartMenuItem('bubble', 'Bubble&lrm;', 'bubble');
                break;

            // Area Sub Menus
            case 'pivotAreaChart':
                chartMenuItem = {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: ['pivotArea', 'pivotStackedArea', 'pivotNormalizedArea']
                };
                break;
            case 'rangeAreaChart':
                chartMenuItem = {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: ['rangeArea', 'rangeStackedArea', 'rangeNormalizedArea']
                };
                break;
            //Area menus
            case 'pivotArea':
            case 'rangeArea':
                chartMenuItem = getChartMenuItem('area', 'Area&lrm;', 'area');
                break;
            case 'pivotStackedArea':
            case 'rangeStackedArea':
                chartMenuItem = getChartMenuItem('stackedArea', 'Stacked&lrm;', 'stackedArea');
                break;
            case 'pivotNormalizedArea':
            case 'rangeNormalizedArea':
                chartMenuItem = getChartMenuItem('normalizedArea', '100% Stacked&lrm;', 'normalizedArea');
                break;

            // Histogram Menus
            case 'pivotHistogramChart':
            case 'rangeHistogramChart':
                chartMenuItem = getChartMenuItem('histogramChart', 'Histogram&lrm;', 'histogram');
                break;

            // Combo Sub Menus
            case 'pivotCombinationChart':
                chartMenuItem = {
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: ['pivotColumnLineCombo', 'pivotAreaColumnCombo']
                };
                break;
            case 'rangeCombinationChart':
                chartMenuItem = {
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: ['rangeColumnLineCombo', 'rangeAreaColumnCombo']
                };
                break;
            // Combo Menus
            case 'pivotColumnLineCombo':
            case 'rangeColumnLineCombo':
                chartMenuItem = getChartMenuItem('columnLineCombo', 'Column & Line&lrm;', 'columnLineCombo');
                break;
            case 'pivotAreaColumnCombo':
            case 'rangeAreaColumnCombo':
                chartMenuItem = getChartMenuItem('AreaColumnCombo', 'Area & Column&lrm;', 'areaColumnCombo');
                break;
            default:
                console.warn(`AG Grid: unknown menu item type ${key}`);
                return undefined;
        }

        return this.getMenuItemIfValid(chartGroupsDef, key, chartMenuItem);
    }

    getMenuItemIfValid(chartGroupsDef: ChartGroupsDef | undefined, key: string, menuItem: MenuItemDef): MenuItemDef | undefined {
        if (chartGroupsDef == undefined || menuItem.subMenu) {
            // If chartGroupsDef not provided every option is valid.
            // We do not filter items with subMenu directly but via their children
            return menuItem;
        }

        const validItems = getValidChartMenuItems(chartGroupsDef);
        return validItems.includes(key) ? menuItem : undefined;
    }
}

// If you add a leaf option to this type make sure to also update CHART_GROUPS_DEF_TO_MENU_ITEM 
export type ChartMenuOptionName =
    'pivotChart' | 'chartRange' |

    'pivotColumnChart' | 'pivotGroupedColumn' | 'pivotStackedColumn' | 'pivotNormalizedColumn' |
    'rangeColumnChart' | 'rangeGroupedColumn' | 'rangeStackedColumn' | 'rangeNormalizedColumn' |

    'pivotBarChart' | 'pivotGroupedBar' | 'pivotStackedBar' | 'pivotNormalizedBar' |
    'rangeBarChart' | 'rangeGroupedBar' | 'rangeStackedBar' | 'rangeNormalizedBar' |

    'pivotPieChart' | 'pivotPie' | 'pivotDoughnut' |
    'rangePieChart' | 'rangePie' | 'rangeDoughnut' |

    'pivotLineChart' | 'rangeLineChart' |

    'pivotXYChart' | 'pivotScatter' | 'pivotBubble' |
    'rangeXYChart' | 'rangeScatter' | 'rangeBubble' |

    'pivotAreaChart' | 'pivotArea' | 'pivotStackedArea' | 'pivotNormalizedArea' |
    'rangeAreaChart' | 'rangeArea' | 'rangeStackedArea' | 'rangeNormalizedArea' |

    'pivotHistogramChart' |
    'rangeHistogramChart' |

    'pivotCombinationChart' | 'pivotColumnLineCombo' | 'pivotAreaColumnCombo' |
    'rangeCombinationChart' | 'rangeColumnLineCombo' | 'rangeAreaColumnCombo';

type ChartDefToMenuItems = {
    [K in keyof ChartGroupsDef]-?: ChartGroupsDef[K] extends ((infer P)[] | undefined) ?
    [P] extends [ChartType] ?
    { [T in P]-?: ChartMenuOptionName[] }
    : never
    : never
}

const CHART_GROUPS_DEF_TO_MENU_ITEM: ChartDefToMenuItems = {
    columnGroup: {
        column: ['pivotGroupedColumn', 'rangeGroupedColumn'],
        stackedColumn: ['pivotStackedColumn', 'rangeStackedColumn'],
        normalizedColumn: ['pivotNormalizedColumn', 'rangeNormalizedColumn'],
    },
    barGroup: {
        bar: ['pivotGroupedBar', 'rangeGroupedBar'],
        stackedBar: ['pivotStackedBar', 'rangeStackedBar'],
        normalizedBar: ['pivotNormalizedBar', 'rangeNormalizedBar']
    },
    pieGroup: {
        pie: ['pivotPie', 'rangePie'],
        doughnut: ['pivotDoughnut', 'rangeDoughnut']
    },
    lineGroup: {
        line: ['pivotLineChart', 'rangeLineChart']
    },
    scatterGroup: {
        bubble: ['pivotBubble', 'rangeBubble'],
        scatter: ['pivotScatter', 'rangeScatter']
    },
    areaGroup: {
        area: ['pivotArea', 'rangeArea'],
        stackedArea: ['pivotStackedArea', 'rangeStackedArea'],
        normalizedArea: ['pivotNormalizedArea', 'rangeNormalizedArea']
    },
    histogramGroup: {
        histogram: ['pivotHistogramChart', 'rangeHistogramChart']
    },
    combinationGroup: {
        columnLineCombo: ['pivotColumnLineCombo', 'rangeColumnLineCombo'],
        areaColumnCombo: ['pivotAreaColumnCombo', 'rangeAreaColumnCombo'],
        customCombo: []
    }
};


/**
 * Get a list of the valid chart menu items based off the provided ChartGroupsDef
 */
export function getValidChartMenuItems(chartGroupsDef: ChartGroupsDef) {
    let valid: string[] = [];
    Object.keys(chartGroupsDef).forEach((group: keyof ChartGroupsDef) => {
        const charts = chartGroupsDef[group];
        const validOps = CHART_GROUPS_DEF_TO_MENU_ITEM[group];
        if (validOps) {
            charts?.forEach((chartType: ChartType) => {
                const options = (validOps as any)[chartType];
                if (options) {
                    valid = [...valid, ...options];
                } else {
                    _.doOnce(() => console.warn(`AG Grid - invalid chartType ${chartType} in chartGroupsDef.${group}`), `invalidChartMenu_${group}_${chartType}`);
                }
            })
        } else {
            _.doOnce(() => console.warn(`AG Grid - invalid group ${group} in chartGroupsDef.`), `invalidChartMenu_${group}`);
        }

    });
    return valid;
}