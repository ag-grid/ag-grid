import { ChartGroupsDef, DEFAULT_CHART_GROUPS, MenuItemDef } from "@ag-grid-community/core";
import { describe, xdescribe, expect, it, xit, fit } from '@jest/globals';
import { ChartMenuItemMapper, } from './chartMenuItemMapper';
describe('isValidChartType', () => {

    const cleanMenuItems = (menuItems: (MenuItemDef | string)[] | undefined) => {
        return menuItems?.map(cleanMenuItem)
    }
    const cleanMenuItem = (menuItem: MenuItemDef | string) => {
        if (typeof menuItem === 'string') {
            return menuItem;
        }
        let clean: MenuItemDef = { name: menuItem.name };
        if (menuItem.subMenu && menuItem.subMenu.length > 0) {
            clean.subMenu = cleanMenuItems(menuItem.subMenu)
        }
        return clean;
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

    it('Ensure internals do not leak', () => {
        const chartMenuItemMapper = getChartMenuMapper(undefined);
        const pivotChart = chartMenuItemMapper.getChartItems('pivotChart');
        expect((pivotChart)).toBeDefined();
        expect(pivotChart.key).toBeUndefined();
        expect(pivotChart.subMenu[0].key).toBeUndefined();
    });

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
        const pivotChartItems = chartMenuItemMapper.getChartItems('pivotChart').subMenu;
        const rangeChartItems = chartMenuItemMapper.getChartItems('chartRange').subMenu;

        const expected = [
            {
                name: "xyChart",
                subMenu: [
                    { name: "scatter", }
                    ],
                },
                {
                    name: "line",
                },
                {
                    name: "barChart",
                    subMenu: [
                        { name: "groupedBar", },
                        { name: "normalizedBar", },
                    ],
                },
                {
                    name: 'combinationChart',
                    subMenu: [
                        { name: 'AreaColumnCombo' }
                    ]
                }
        ];

        expect(cleanMenuItems(pivotChartItems)).toEqual(expected);
        expect(cleanMenuItems(rangeChartItems)).toEqual(expected);

    });

    describe('No filtering', () => {
        const expected = [
            {
                name: "columnChart",
                subMenu: [{ name: "groupedColumn" }, { name: "stackedColumn" }, { name: "normalizedColumn" }],
            },
            {
                name: "barChart",
                subMenu: [{ name: "groupedBar" }, { name: "stackedBar" }, { name: "normalizedBar" }]
            },
            {
                name: "pieChart",
                subMenu: [{ name: "pie" }, { name: "doughnut" }]
            },
            {
                name: "line",
            },
            {
                name: "xyChart",
                subMenu: [{ name: "scatter" }, { name: "bubble" }]
            },
            {
                name: "areaChart",
                subMenu: [{ name: "area" }, { name: "stackedArea" }, { name: "normalizedArea" }]
            },
            {
                name: "histogramChart",
            },
            {
                name: "combinationChart",
                subMenu: [{ name: "columnLineCombo" }, { name: "AreaColumnCombo" }]
            }
        ];

        it(`should pass with default`, () => {
            const chartMenuItemMapper = getChartMenuMapper(DEFAULT_CHART_GROUPS);
            const rangeItems = chartMenuItemMapper.getChartItems('chartRange').subMenu;
            const pivotItems = chartMenuItemMapper.getChartItems('pivotRange').subMenu;

            expect(cleanMenuItems(rangeItems)).toEqual(expected);
            expect(cleanMenuItems(pivotItems)).toEqual(expected);
        });

        it(`should pass with undefined`, () => {
            const chartMenuItemMapper = getChartMenuMapper(undefined);
            const rangeItems = chartMenuItemMapper.getChartItems('chartRange').subMenu;
            const pivotItems = chartMenuItemMapper.getChartItems('pivotRange').subMenu;

            expect(cleanMenuItems(rangeItems)).toEqual(expected);
            expect(cleanMenuItems(pivotItems)).toEqual(expected);
        });
    })
})