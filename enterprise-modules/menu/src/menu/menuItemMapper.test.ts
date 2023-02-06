import { ChartGroupsDef, MenuItemDef, ModuleRegistry } from "@ag-grid-community/core";
import { describe, expect, it, fit, xit } from '@jest/globals';
import { ChartMenuItemMapper } from "./chartMenuItemMapper";
import { MenuItemMapper } from './menuItemMapper';

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

    const menuItemMapper = new MenuItemMapper();
    (menuItemMapper as any).localeService = { getLocaleTextFunc: () => (d) => d }

    it('Test selection of options', () => {
        const mixedCharts: ChartGroupsDef = { scatterGroup: ['scatter'], lineGroup: ['line'], barGroup: ['bar', 'normalizedBar'] };
        (menuItemMapper as any).gridOptionsService = {
            is: () => true,
        }

        const chartMenuItemMapper = new ChartMenuItemMapper();
        (chartMenuItemMapper as any).gridOptionsService = {
            get: () => ({ settingsPanel: { chartGroupsDef: mixedCharts } })            
        };
        (chartMenuItemMapper as any).localeService = {
            getLocaleTextFunc: () => (s) => s
        };
        (chartMenuItemMapper as any).chartService = {};
        (menuItemMapper as any).chartMenuItemMapper = chartMenuItemMapper;
        const pivotChart = menuItemMapper.mapWithStockItems(['expandAll', { name: 'top' }, { name: 'custom', subMenu: [{ name: 'sub' }] }, 'pivotChart'], null);

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
                ]
            }];

        expect(cleanMenuItems(pivotChart)).toEqual(expectedPivot);

    });
})