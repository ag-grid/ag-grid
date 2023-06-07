var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ChartMenuItemMapper_1;
import { Bean, BeanStub, ModuleNames, ModuleRegistry, Optional, _ } from '@ag-grid-community/core';
let ChartMenuItemMapper = ChartMenuItemMapper_1 = class ChartMenuItemMapper extends BeanStub {
    getChartItems(key) {
        var _a, _b;
        if (!this.chartService) {
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, `the Context Menu key "${key}"`, this.context.getGridId());
            return undefined;
        }
        const builder = key === 'pivotChart'
            ? new PivotMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService)
            : new RangeMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService);
        let topLevelMenuItem = builder.getMenuItem();
        const chartGroupsDef = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.settingsPanel) === null || _b === void 0 ? void 0 : _b.chartGroupsDef;
        if (chartGroupsDef) {
            // Apply filtering and ordering if chartGroupsDef provided
            topLevelMenuItem = ChartMenuItemMapper_1.filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, builder.getConfigLookup());
        }
        return this.cleanInternals(topLevelMenuItem);
    }
    // Remove our internal _key properties so this does not leak out of the class on the menu items.
    cleanInternals(menuItem) {
        if (!menuItem) {
            return menuItem;
        }
        const removeKey = (m) => {
            var _a;
            m === null || m === void 0 ? true : delete m._key;
            (_a = m === null || m === void 0 ? void 0 : m.subMenu) === null || _a === void 0 ? void 0 : _a.forEach(s => removeKey(s));
            return m;
        };
        return removeKey(menuItem);
    }
    static buildLookup(menuItem) {
        let itemLookup = {};
        const addItem = (item) => {
            itemLookup[item._key] = item;
            if (item.subMenu) {
                item.subMenu.forEach(s => addItem(s));
            }
        };
        addItem(menuItem);
        return itemLookup;
    }
    /**
     * Make the MenuItem match the charts provided and their ordering on the ChartGroupsDef config object as provided by the user.
     */
    static filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, configLookup) {
        var _a;
        const menuItemLookup = this.buildLookup(topLevelMenuItem);
        let orderedAndFiltered = Object.assign(Object.assign({}, topLevelMenuItem), { subMenu: [] });
        Object.entries(chartGroupsDef).forEach(([group, chartTypes]) => {
            var _a, _b;
            const chartConfigGroup = configLookup[group];
            if (chartConfigGroup == undefined) {
                _.doOnce(() => console.warn(`AG Grid - invalid chartGroupsDef config '${group}'`), `invalid_chartGroupsDef${group}`);
                return undefined;
            }
            const menuItem = menuItemLookup[chartConfigGroup._key];
            if (menuItem) {
                if (menuItem.subMenu) {
                    const subMenus = chartTypes.map(chartType => {
                        const itemKey = chartConfigGroup[chartType];
                        if (itemKey == undefined) {
                            _.doOnce(() => console.warn(`AG Grid - invalid chartGroupsDef config '${group}.${chartType}'`), `invalid_chartGroupsDef${chartType}_${group}`);
                            return undefined;
                        }
                        return menuItemLookup[itemKey];
                    }).filter(s => s !== undefined);
                    if (subMenus.length > 0) {
                        menuItem.subMenu = subMenus;
                        (_a = orderedAndFiltered.subMenu) === null || _a === void 0 ? void 0 : _a.push(menuItem);
                    }
                }
                else {
                    // Handles line case which is not actually a sub subMenu
                    (_b = orderedAndFiltered.subMenu) === null || _b === void 0 ? void 0 : _b.push(menuItem);
                }
            }
        });
        if (((_a = orderedAndFiltered.subMenu) === null || _a === void 0 ? void 0 : _a.length) == 0) {
            return undefined;
        }
        return orderedAndFiltered;
    }
};
__decorate([
    Optional('chartService')
], ChartMenuItemMapper.prototype, "chartService", void 0);
ChartMenuItemMapper = ChartMenuItemMapper_1 = __decorate([
    Bean('chartMenuItemMapper')
], ChartMenuItemMapper);
export { ChartMenuItemMapper };
class PivotMenuItemMapper {
    constructor(gridOptionsService, chartService, localeService) {
        this.gridOptionsService = gridOptionsService;
        this.chartService = chartService;
        this.localeService = localeService;
    }
    getMenuItem() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const getMenuItem = (localeKey, defaultText, chartType, key) => {
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
                    subMenu: [
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
        };
    }
    getConfigLookup() {
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
                customCombo: '' // Not currently supported but needs a value to separate from a missing value
            }
        };
    }
}
class RangeMenuItemMapper {
    constructor(gridOptionsService, chartService, localeService) {
        this.gridOptionsService = gridOptionsService;
        this.chartService = chartService;
        this.localeService = localeService;
    }
    getMenuItem() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const getMenuItem = (localeKey, defaultText, chartType, key) => {
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
                    subMenu: [
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
        };
    }
    getConfigLookup() {
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
                customCombo: '' // Not currently supported but needs a value to separate from a missing value
            }
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRNZW51SXRlbU1hcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tZW51L2NoYXJ0TWVudUl0ZW1NYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUE0RixXQUFXLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUc3TCxJQUFhLG1CQUFtQiwyQkFBaEMsTUFBYSxtQkFBb0IsU0FBUSxRQUFRO0lBSXRDLGFBQWEsQ0FBQyxHQUFnQzs7UUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDcEIsY0FBYyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSx5QkFBeUIsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ3pILE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBRUQsTUFBTSxPQUFPLEdBQUcsR0FBRyxLQUFLLFlBQVk7WUFDaEMsQ0FBQyxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUN6RixDQUFDLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFOUYsSUFBSSxnQkFBZ0IsR0FBbUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTdFLE1BQU0sY0FBYyxHQUFHLE1BQUEsTUFBQSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLDBDQUFFLGFBQWEsMENBQUUsY0FBYyxDQUFDO1FBQ3hHLElBQUksY0FBYyxFQUFFO1lBQ2hCLDBEQUEw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