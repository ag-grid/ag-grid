import { Bean, BeanStub, ChartGroupsDef, ChartType, GridOptionsService, IChartService, LocaleService, MenuItemDef, ModuleNames, ModuleRegistry, Optional, _ } from '@ag-grid-community/core';

@Bean('chartMenuItemMapper')
export class ChartMenuItemMapper extends BeanStub {

    @Optional('chartService') private readonly chartService: IChartService;

    public getChartItems(key: 'pivotChart' | 'chartRange'): MenuItemDef | undefined {
        if (!this.chartService) {
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, `the Context Menu key "${key}"`);
            return undefined;
        }

        const builder = key === 'pivotChart'
            ? new PivotMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService)
            : new RangeMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService);

        let topLevelMenuItem: MenuItemDefWithKey | undefined = builder.getMenuItem();

        const chartGroupsDef = this.gridOptionsService.get('chartToolPanelsDef')?.settingsPanel?.chartGroupsDef;
        if (chartGroupsDef) {
            // Apply filtering and ordering if chartGroupsDef provided
            topLevelMenuItem = ChartMenuItemMapper.filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, builder.getConfigLookup());
        }
        return this.cleanInternals(topLevelMenuItem);
    }

    // Remove our internal _key properties so this does not leak out of the class on the menu items.
    private cleanInternals(menuItem: MenuItemDefWithKey | undefined): MenuItemDef | undefined {
        if (!menuItem) {
            return menuItem;
        }
        const removeKey = (m: MenuItemDefWithKey | undefined) => {
            delete m?._key;
            m?.subMenu?.forEach(s => removeKey(s));
            return m;
        }
        return removeKey(menuItem);
    }

    private static buildLookup<T extends MenuItemDefWithKey<any>>(menuItem: T) {
        let itemLookup: Record<any, T> = {} as any;
        const addItem = (item: T) => {
            itemLookup[item._key] = item;
            if (item.subMenu) {
                item.subMenu.map(s => addItem(s as T))
            }
        }
        addItem(menuItem);
        return itemLookup;
    }

    /**
     * Make the MenuItem match the charts provided and their ordering on the ChartGroupsDef config object as provided by the user.
     */
    private static filterAndOrderChartMenu<TKeys extends string>(topLevelMenuItem: MenuItemDefWithKey<TKeys>, chartGroupsDef: ChartGroupsDef, configLookup: ChartDefToMenuItems<TKeys>): MenuItemDefWithKey<TKeys> | undefined {

        const menuItemLookup = this.buildLookup(topLevelMenuItem)
        let orderedAndFiltered: MenuItemDefWithKey = { ...topLevelMenuItem, subMenu: [] };

        Object.entries(chartGroupsDef).map(([group, chartTypes]: [keyof ChartGroupsDef, ChartType[]]) => {

            const chartConfigGroup = configLookup[group];
            if (chartConfigGroup == undefined) {
                _.doOnce(() => console.warn(`AG Grid - invalid chartGroupsDef config '${group}'`), `invalid_chartGroupsDef${group}`);
                return undefined;
            }

            const menuItem = menuItemLookup[chartConfigGroup._key];
            if (menuItem) {
                if (menuItem.subMenu) {
                    const subMenus = chartTypes.map(chartType => {
                        const itemKey = (chartConfigGroup as any)[chartType];
                        if (itemKey == undefined) {                            
                            _.doOnce(() => console.warn(`AG Grid - invalid chartGroupsDef config '${group}.${chartType}'`), `invalid_chartGroupsDef${chartType}_${group}`);
                            return undefined;
                        }
                        return menuItemLookup[itemKey];
                    }).filter(s => s !== undefined) as MenuItemDefWithKey[];

                    if (subMenus.length > 0) {
                        menuItem.subMenu = subMenus;
                        orderedAndFiltered.subMenu?.push(menuItem);
                    }
                } else {
                    // Handles line case which is not actually a sub subMenu
                    orderedAndFiltered.subMenu?.push(menuItem);
                }
            }
        })
        if (orderedAndFiltered.subMenu?.length == 0) {
            return undefined;
        }
        return orderedAndFiltered;
    }
}


interface MenuItemBuilder<MenuItemKeys extends string> {
    getMenuItem(): MenuItemDefWithKey<MenuItemKeys>;
    getConfigLookup(): ChartDefToMenuItems<MenuItemKeys>
}

/** Utility type to keep chart menu item lookups in sync with ChartGroupsDef */
type ChartDefToMenuItems<MenuItemKeys extends string> = {
    [K in keyof ChartGroupsDef]-?: ChartGroupsDef[K] extends ((infer P)[] | undefined) ?
    [P] extends [ChartType] ?
    { [T in P]-?: MenuItemKeys } & { _key: MenuItemKeys }
    : never
    : never
}


interface MenuItemDefWithKey<MenuItemKey extends string = any> extends MenuItemDef {
    _key: MenuItemKey;
    subMenu?: MenuItemDefWithKey<MenuItemKey>[]
}

export type PivotMenuOptionName =
    'pivotChart' |
    'pivotColumnChart' | 'pivotGroupedColumn' | 'pivotStackedColumn' | 'pivotNormalizedColumn' |
    'pivotBarChart' | 'pivotGroupedBar' | 'pivotStackedBar' | 'pivotNormalizedBar' |
    'pivotPieChart' | 'pivotPie' | 'pivotDoughnut' |
    'pivotLineChart' |
    'pivotXYChart' | 'pivotScatter' | 'pivotBubble' |
    'pivotAreaChart' | 'pivotArea' | 'pivotStackedArea' | 'pivotNormalizedArea' |
    'pivotHistogramChart' |
    'pivotCombinationChart' | 'pivotColumnLineCombo' | 'pivotAreaColumnCombo';

class PivotMenuItemMapper implements MenuItemBuilder<PivotMenuOptionName>{

    constructor(private gridOptionsService: GridOptionsService, private chartService: IChartService, private localeService: LocaleService) { }

    getMenuItem(): MenuItemDefWithKey<PivotMenuOptionName> {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const getMenuItem = (localeKey: string, defaultText: string, chartType: ChartType, key: PivotMenuOptionName) => {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: () => this.chartService.createPivotChart({ chartType }),
                _key: key
            };
        };
        return {
            name: localeTextFunc('pivotChart', 'Pivot Chart'),
            _key: 'pivotChart',
            subMenu: [
                {
                    _key: 'pivotColumnChart',
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: [
                        getMenuItem('groupedColumn', 'Grouped&lrm;', 'groupedColumn', 'pivotGroupedColumn'),
                        getMenuItem('stackedColumn', 'Stacked&lrm;', 'stackedColumn', 'pivotStackedColumn'),
                        getMenuItem('normalizedColumn', '100% Stacked&lrm;', 'normalizedColumn', 'pivotNormalizedColumn')
                    ]
                },
                {
                    _key: 'pivotBarChart',
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: [
                        getMenuItem('groupedBar', 'Grouped&lrm;', 'groupedBar', 'pivotGroupedBar'),
                        getMenuItem('stackedBar', 'Stacked&lrm;', 'stackedBar', 'pivotStackedBar'),
                        getMenuItem('normalizedBar', '100% Stacked&lrm;', 'normalizedBar', 'pivotNormalizedBar')
                    ]
                },
                {
                    _key: 'pivotPieChart',
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: [
                        getMenuItem('pie', 'Pie&lrm;', 'pie', 'pivotPie'),
                        getMenuItem('doughnut', 'Doughnut&lrm;', 'doughnut', 'pivotDoughnut')
                    ]
                },
                getMenuItem('line', 'Line&lrm;', 'line', 'pivotLineChart'),
                {
                    _key: 'pivotXYChart',
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: [
                        getMenuItem('scatter', 'Scatter&lrm;', 'scatter', 'pivotScatter'),
                        getMenuItem('bubble', 'Bubble&lrm;', 'bubble', 'pivotBubble')
                    ]
                },
                {
                    _key: 'pivotAreaChart',
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu:
                        [
                            getMenuItem('area', 'Area&lrm;', 'area', 'pivotArea'),
                            getMenuItem('stackedArea', 'Stacked&lrm;', 'stackedArea', 'pivotStackedArea'),
                            getMenuItem('normalizedArea', '100% Stacked&lrm;', 'normalizedArea', 'pivotNormalizedArea')
                        ]
                },
                getMenuItem('histogramChart', 'Histogram&lrm;', 'histogram', 'pivotHistogramChart'),
                {
                    _key: 'pivotCombinationChart',
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: [
                        getMenuItem('columnLineCombo', 'Column & Line&lrm;', 'columnLineCombo', 'pivotColumnLineCombo'),
                        getMenuItem('AreaColumnCombo', 'Area & Column&lrm;', 'areaColumnCombo', 'pivotAreaColumnCombo')
                    ]
                }
            ],
            icon: _.createIconNoSpan('chart', this.gridOptionsService, undefined),
        }
    }

    getConfigLookup(): ChartDefToMenuItems<PivotMenuOptionName> {
        return {
            columnGroup: {
                _key: 'pivotColumnChart',
                column: 'pivotGroupedColumn',
                stackedColumn: 'pivotStackedColumn',
                normalizedColumn: 'pivotNormalizedColumn',
            },
            barGroup: {
                _key: 'pivotBarChart',
                bar: 'pivotGroupedBar',
                stackedBar: 'pivotStackedBar',
                normalizedBar: 'pivotNormalizedBar',
            },
            pieGroup: {
                _key: 'pivotPieChart',
                pie: 'pivotPie',
                doughnut: 'pivotDoughnut',
            },
            lineGroup: {
                _key: 'pivotLineChart',
                line: 'pivotLineChart',
            },
            scatterGroup: {
                _key: 'pivotXYChart',
                bubble: 'pivotBubble',
                scatter: 'pivotScatter',
            },
            areaGroup: {
                _key: 'pivotAreaChart',
                area: 'pivotArea',
                stackedArea: 'pivotStackedArea',
                normalizedArea: 'pivotNormalizedArea',
            },
            histogramGroup: {
                _key: 'pivotHistogramChart',
                histogram: 'pivotHistogramChart',
            },
            combinationGroup: {
                _key: 'pivotCombinationChart',
                columnLineCombo: 'pivotColumnLineCombo',
                areaColumnCombo: 'pivotAreaColumnCombo',
                customCombo: '' as any // Not currently supported but needs a value to separate from a missing value
            }
        }
    }

}

export type RangeMenuOptionName =
    'chartRange' |
    'rangeColumnChart' | 'rangeGroupedColumn' | 'rangeStackedColumn' | 'rangeNormalizedColumn' |
    'rangeBarChart' | 'rangeGroupedBar' | 'rangeStackedBar' | 'rangeNormalizedBar' |
    'rangePieChart' | 'rangePie' | 'rangeDoughnut' |
    'rangeLineChart' |
    'rangeXYChart' | 'rangeScatter' | 'rangeBubble' |
    'rangeAreaChart' | 'rangeArea' | 'rangeStackedArea' | 'rangeNormalizedArea' |
    'rangeHistogramChart' |
    'rangeCombinationChart' | 'rangeColumnLineCombo' | 'rangeAreaColumnCombo';

class RangeMenuItemMapper implements MenuItemBuilder<RangeMenuOptionName> {

    constructor(private gridOptionsService: GridOptionsService, private chartService: IChartService, private localeService: LocaleService) { }

    getMenuItem(): MenuItemDefWithKey<RangeMenuOptionName> {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const getMenuItem = (localeKey: string, defaultText: string, chartType: ChartType, key: RangeMenuOptionName) => {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: () => this.chartService.createChartFromCurrentRange(chartType),
                _key: key
            };
        };

        return {
            name: localeTextFunc('chartRange', 'Chart Range'),
            _key: 'chartRange',
            subMenu: [
                {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: [
                        getMenuItem('groupedColumn', 'Grouped&lrm;', 'groupedColumn', 'rangeGroupedColumn'),
                        getMenuItem('stackedColumn', 'Stacked&lrm;', 'stackedColumn', 'rangeStackedColumn'),
                        getMenuItem('normalizedColumn', '100% Stacked&lrm;', 'normalizedColumn', 'rangeNormalizedColumn')
                    ],
                    _key: 'rangeColumnChart'
                },
                {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: [
                        getMenuItem('groupedBar', 'Grouped&lrm;', 'groupedBar', 'rangeGroupedBar'),
                        getMenuItem('stackedBar', 'Stacked&lrm;', 'stackedBar', 'rangeStackedBar'),
                        getMenuItem('normalizedBar', '100% Stacked&lrm;', 'normalizedBar', 'rangeNormalizedBar')
                    ],
                    _key: 'rangeBarChart'
                },
                {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: [
                        getMenuItem('pie', 'Pie&lrm;', 'pie', 'rangePie'),
                        getMenuItem('doughnut', 'Doughnut&lrm;', 'doughnut', 'rangeDoughnut')
                    ],
                    _key: 'rangePieChart'
                },
                getMenuItem('line', 'Line&lrm;', 'line', 'rangeLineChart'),
                {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: [
                        getMenuItem('scatter', 'Scatter&lrm;', 'scatter', 'rangeScatter'),
                        getMenuItem('bubble', 'Bubble&lrm;', 'bubble', 'rangeBubble')
                    ],
                    _key: 'rangeXYChart'
                },
                {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu:
                        [
                            getMenuItem('area', 'Area&lrm;', 'area', 'rangeArea'),
                            getMenuItem('stackedArea', 'Stacked&lrm;', 'stackedArea', 'rangeStackedArea'),
                            getMenuItem('normalizedArea', '100% Stacked&lrm;', 'normalizedArea', 'rangeNormalizedArea')
                        ],
                    _key: 'rangeAreaChart'
                },
                getMenuItem('histogramChart', 'Histogram&lrm;', 'histogram', 'rangeHistogramChart'),
                {
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: [
                        getMenuItem('columnLineCombo', 'Column & Line&lrm;', 'columnLineCombo', 'rangeColumnLineCombo'),
                        getMenuItem('AreaColumnCombo', 'Area & Column&lrm;', 'areaColumnCombo', 'rangeAreaColumnCombo')
                    ],
                    _key: 'rangeCombinationChart'
                }
            ],
            icon: _.createIconNoSpan('chart', this.gridOptionsService, undefined),
        }
    }

    getConfigLookup(): ChartDefToMenuItems<RangeMenuOptionName> {
        return {
            columnGroup: {
                _key: 'rangeColumnChart',
                column: 'rangeGroupedColumn',
                stackedColumn: 'rangeStackedColumn',
                normalizedColumn: 'rangeNormalizedColumn',
            },
            barGroup: {
                _key: 'rangeBarChart',
                bar: 'rangeGroupedBar',
                stackedBar: 'rangeStackedBar',
                normalizedBar: 'rangeNormalizedBar',
            },
            pieGroup: {
                _key: 'rangePieChart',
                pie: 'rangePie',
                doughnut: 'rangeDoughnut',
            },
            lineGroup: {
                _key: 'rangeLineChart',
                line: 'rangeLineChart',
            },
            scatterGroup: {
                _key: 'rangeXYChart',
                bubble: 'rangeBubble',
                scatter: 'rangeScatter',
            },
            areaGroup: {
                _key: 'rangeAreaChart',
                area: 'rangeArea',
                stackedArea: 'rangeStackedArea',
                normalizedArea: 'rangeNormalizedArea',
            },
            histogramGroup: {
                _key: 'rangeHistogramChart',
                histogram: 'rangeHistogramChart',
            },
            combinationGroup: {
                _key: 'rangeCombinationChart',
                columnLineCombo: 'rangeColumnLineCombo',
                areaColumnCombo: 'rangeAreaColumnCombo',
                customCombo: '' as any // Not currently supported but needs a value to separate from a missing value
            }
        }
    }
}