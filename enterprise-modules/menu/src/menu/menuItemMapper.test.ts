import { ChartGroupsDef, DEFAULT_CHART_GROUPS, MenuItemDef, ModuleRegistry } from "@ag-grid-community/core";
import { describe, expect, it, fit } from '@jest/globals';
import { ChartMenuOptionName } from './chartMenuMapper';
import { MenuItemMapper } from './menuItemMapper';
describe('isValidChartType', () => {

    const cleanMenuItems = (menuItems: (MenuItemDef | string)[] | undefined) => {
        return menuItems?.map(cleanMenuItem)
    }
    const cleanMenuItem = (menuItem: MenuItemDef | string) => {
        if (typeof menuItem === 'string') {
            return menuItem;
        }
        return { name: menuItem.name, subMenu: cleanMenuItems(menuItem.subMenu) };
    }

    const menuItemMapper = new MenuItemMapper();
    (menuItemMapper as any).localeService = { getLocaleTextFunc: () => (d) => d }

    it('Dont include parent menu item if all children not valid', () => {
        (menuItemMapper as any).gridOptionsService = {
            is: () => true,
            get: () => ({ settingsPanel: { chartGroupsDef: { combinationGroup: ['areaColumnCombo'] } } })
        }
        const pivotChart = menuItemMapper.mapWithStockItems(['pivotChart'], null);
        expect(pivotChart).toEqual([])
    });

    it('Include if one valid subMenu', () => {
        const scatterOnly: ChartGroupsDef = { scatterGroup: ['scatter'] };
        const pivotChart = (menuItemMapper as any).getChartItems('pivotChart', scatterOnly);
        const pivotXYChart = (menuItemMapper as any).getChartItems('pivotXYChart', scatterOnly);
        const pivotScatter = (menuItemMapper as any).getChartItems('pivotScatter', scatterOnly);
        const pivotBubble = (menuItemMapper as any).getChartItems('pivotBubble', scatterOnly);
        expect(pivotChart).toBeDefined();
        expect(pivotXYChart).toBeDefined();
        expect(pivotScatter).toBeDefined();
        expect(pivotBubble).toBeNull();
    });

    it('Test selection of options', () => {
        const mixedCharts: ChartGroupsDef = { scatterGroup: ['scatter'], lineGroup: ['line'], barGroup: ['bar', 'normalizedBar'], combinationGroup: ['areaColumnCombo'] };
        (menuItemMapper as any).gridOptionsService = {
            is: () => true,
            get: () => ({ settingsPanel: { chartGroupsDef: mixedCharts } })
        }
        const pivotChart = (menuItemMapper).mapWithStockItems(['expandAll', { name: 'top' }, { name: 'custom', subMenu: [{ name: 'sub' }] }, 'pivotChart'], null);
        const rangeChart = (menuItemMapper).mapWithStockItems(['chartRange'], null);


        const expectedPivot = [
            { name: 'expandAll' },
            { name: "top", },
            {
                name: "custom",
                subMenu: [{ name: "sub" }]
            },
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
                ]
            }];
        // Range chart supports combination charts but pivot does not
        const expectedRange = [
            {
                ...expectedPivot[3], name: 'chartRange', subMenu: [...(expectedPivot[3].subMenu as any), {
                    name: 'combinationChart',
                    subMenu: [
                        { name: 'AreaColumnCombo' }
                    ]
                }]
            }]

        expect(cleanMenuItems(pivotChart)).toEqual(expectedPivot);
        expect(cleanMenuItems(rangeChart)).toEqual(expectedRange);

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
                const menuItem = (menuItemMapper as any).getChartItems(subMenu, DEFAULT_CHART_GROUPS);
                expect(menuItem).toBeDefined()
            })

            it(`should pass with undefined ${subMenu}`, () => {
                const menuItem = (menuItemMapper as any).getChartItems(subMenu, undefined);
                expect(menuItem).toBeDefined()
            })
        })
})