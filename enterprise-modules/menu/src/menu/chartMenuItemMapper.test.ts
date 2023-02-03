import { ChartGroupsDef, DEFAULT_CHART_GROUPS, MenuItemDef } from "@ag-grid-community/core";
import { describe, xdescribe, expect, it, fit } from '@jest/globals';
import { ChartMenuItemMapper, ChartMenuOptionName } from './chartMenuItemMapper';
describe('isValidChartType', () => {

    const cleanMenuItems = (menuItems: (MenuItemDef | string)[] | undefined) => {
        return menuItems?.map(cleanMenuItem)
    }
    const cleanMenuItem = (menuItem: MenuItemDef | string | undefined) => {
        if (typeof menuItem === 'string') {
            return menuItem;
        }
        if (menuItem == undefined) {
            return undefined;
        }
        return { name: menuItem.name, subMenu: cleanMenuItems(menuItem.subMenu) };
    }

    function getChartMenuMapper(defs: ChartGroupsDef | undefined) {
        const chartMenuItemMapper = new ChartMenuItemMapper() as any;
        chartMenuItemMapper.localeService = { getLocaleTextFunc: () => (d) => d };
        chartMenuItemMapper.chartService = {}
        chartMenuItemMapper.gridOptionsService = {
            get: () => ({ settingsPanel: { chartGroupsDef: defs } })
        }
        return chartMenuItemMapper;
    }


    it('Dont include parent menu item if all children not valid', () => {
        const chartMenuItemMapper = getChartMenuMapper({ combinationGroup: ['customCombo'] });
        const pivotChart = chartMenuItemMapper.getChartItems('pivotChart');
        expect((pivotChart)).toBeUndefined()
    });

    it('Include if one valid subMenu', () => {
        const chartMenuItemMapper = getChartMenuMapper({ scatterGroup: ['scatter'] });
        const pivotChart = chartMenuItemMapper.getChartItems('pivotChart');
        expect(cleanMenuItem(pivotChart)).toEqual(
            {
                name: "pivotChart",
                subMenu: [
                    {
                        name: "xyChart",
                        subMenu: [
                            {
                                name: "scatter",
                            },
                        ],
                    },
                ],
            }
        );

    });

    it('Test selection of options', () => {
        const mixedCharts: ChartGroupsDef = { scatterGroup: ['scatter'], lineGroup: ['line'], barGroup: ['bar', 'normalizedBar'], combinationGroup: ['areaColumnCombo'] };
        const chartMenuItemMapper = getChartMenuMapper(mixedCharts);
        const pivotChart = chartMenuItemMapper.getChartItems('pivotChart');
        const rangeChart = chartMenuItemMapper.getChartItems('chartRange');


        const expectedPivot =
        {
            name: 'pivotChart',
            subMenu: [
                {
                    name: "barChart",
                    subMenu: [
                        { name: "groupedBar", },
                        { name: "normalizedBar", },
                    ],
                },
                {
                    name: "line",
                },
                {
                    name: "xyChart",
                    subMenu: [
                        { name: "scatter", }
                    ],
                },
                {
                    name: 'combinationChart',
                    subMenu: [
                        { name: 'AreaColumnCombo' }
                    ]
                }
            ]
        };
        // Range chart supports combination charts but pivot does not
        const expectedRange =
        {
            ...expectedPivot, name: 'chartRange',
        }

        expect(cleanMenuItem(pivotChart)).toEqual(expectedPivot);
        expect(cleanMenuItem(rangeChart)).toEqual(expectedRange);

    });

    (['pivotChart',
        'chartRange',
        'pivotColumnChart',
        'pivotGroupedColumn',
        'pivotStackedColumn',
        'pivotNormalizedColumn',
        'rangeColumnChart',
        'rangeGroupedColumn',
        'rangeStackedColumn',
        'rangeNormalizedColumn',
        'pivotBarChart',
        'pivotGroupedBar',
        'pivotStackedBar',
        'pivotNormalizedBar',
        'rangeBarChart',
        'rangeGroupedBar',
        'rangeStackedBar',
        'rangeNormalizedBar',
        'pivotPieChart',
        'pivotPie',
        'pivotDoughnut',
        'rangePieChart',
        'rangePie',
        'rangeDoughnut',
        'pivotLineChart',
        'rangeLineChart',
        'pivotXYChart',
        'pivotScatter',
        'pivotBubble',
        'rangeXYChart',
        'rangeScatter',
        'rangeBubble',
        'pivotAreaChart',
        'pivotArea',
        'pivotStackedArea',
        'pivotNormalizedArea',
        'rangeAreaChart',
        'rangeArea',
        'rangeStackedArea',
        'rangeNormalizedArea',
        'rangeHistogramChart',
        'rangeColumnLineCombo',
        'rangeAreaColumnCombo',
        'rangeCombinationChart'] as ChartMenuOptionName[]).forEach(subMenu => {

            it(`should pass with default ${subMenu}`, () => {
                const chartMenuItemMapper = getChartMenuMapper(DEFAULT_CHART_GROUPS);
                const menuItem = chartMenuItemMapper.getChartItems(subMenu);
                expect(menuItem).toBeDefined();
            })

            it(`should pass with undefined ${subMenu}`, () => {
                const chartMenuItemMapper = getChartMenuMapper(undefined);
                const menuItem = chartMenuItemMapper.getChartItems(subMenu);
                expect(menuItem).toBeDefined();
            })
        })
})