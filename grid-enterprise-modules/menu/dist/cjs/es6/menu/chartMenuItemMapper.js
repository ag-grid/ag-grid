"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ChartMenuItemMapper_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartMenuItemMapper = void 0;
const core_1 = require("@ag-grid-community/core");
let ChartMenuItemMapper = ChartMenuItemMapper_1 = class ChartMenuItemMapper extends core_1.BeanStub {
    getChartItems(key) {
        var _a, _b;
        if (!this.chartService) {
            core_1.ModuleRegistry.__assertRegistered(core_1.ModuleNames.GridChartsModule, `the Context Menu key "${key}"`, this.context.getGridId());
            return undefined;
        }
        const builder = key === 'pivotChart'
            ? new PivotMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService)
            : new RangeMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService);
        const isEnterprise = this.chartService.isEnterprise();
        let topLevelMenuItem = builder.getMenuItem();
        if (topLevelMenuItem && topLevelMenuItem.subMenu && !isEnterprise) {
            // Filter out enterprise-only menu items if 'Community Integrated'
            const filterEnterpriseItems = (m) => {
                var _a;
                return (Object.assign(Object.assign({}, m), { subMenu: (_a = m.subMenu) === null || _a === void 0 ? void 0 : _a.filter((menu) => !menu._enterprise).map((menu) => filterEnterpriseItems(menu)) }));
            };
            topLevelMenuItem = filterEnterpriseItems(topLevelMenuItem);
        }
        const chartGroupsDef = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.settingsPanel) === null || _b === void 0 ? void 0 : _b.chartGroupsDef;
        if (chartGroupsDef) {
            topLevelMenuItem = ChartMenuItemMapper_1.filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, builder.getConfigLookup());
        }
        return this.cleanInternals(topLevelMenuItem);
    }
    // Remove our internal _key and _enterprise properties so this does not leak out of the class on the menu items.
    cleanInternals(menuItem) {
        if (!menuItem) {
            return menuItem;
        }
        const removeKeys = (m) => {
            var _a;
            m === null || m === void 0 ? true : delete m._key;
            m === null || m === void 0 ? true : delete m._enterprise;
            (_a = m === null || m === void 0 ? void 0 : m.subMenu) === null || _a === void 0 ? void 0 : _a.forEach(s => removeKeys(s));
            return m;
        };
        return removeKeys(menuItem);
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
            // Skip any context panels that are not enabled for the current chart type
            if (chartConfigGroup === null)
                return;
            if (chartConfigGroup == undefined) {
                core_1._.warnOnce(`invalid chartGroupsDef config '${group}'`);
                return undefined;
            }
            const menuItem = menuItemLookup[chartConfigGroup._key];
            if (menuItem) {
                if (menuItem.subMenu) {
                    const subMenus = chartTypes.map(chartType => {
                        const itemKey = chartConfigGroup[chartType];
                        if (itemKey == undefined) {
                            core_1._.warnOnce(`invalid chartGroupsDef config '${group}.${chartType}'`);
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
    (0, core_1.Optional)('chartService')
], ChartMenuItemMapper.prototype, "chartService", void 0);
ChartMenuItemMapper = ChartMenuItemMapper_1 = __decorate([
    (0, core_1.Bean)('chartMenuItemMapper')
], ChartMenuItemMapper);
exports.ChartMenuItemMapper = ChartMenuItemMapper;
class PivotMenuItemMapper {
    constructor(gridOptionsService, chartService, localeService) {
        this.gridOptionsService = gridOptionsService;
        this.chartService = chartService;
        this.localeService = localeService;
    }
    getMenuItem() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const getMenuItem = (localeKey, defaultText, chartType, key, enterprise = false) => {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: () => this.chartService.createPivotChart({ chartType }),
                _key: key,
                _enterprise: enterprise
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
                        getMenuItem('donut', 'Donut&lrm;', 'donut', 'pivotDonut')
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
                {
                    _key: 'pivotStatisticalChart',
                    _enterprise: false,
                    name: localeTextFunc('statisticalChart', 'Statistical'),
                    subMenu: [
                        getMenuItem('histogramChart', 'Histogram&lrm;', 'histogram', 'pivotHistogram', false),
                    ],
                },
                {
                    _key: 'pivotHierarchicalChart',
                    _enterprise: true,
                    name: localeTextFunc('hierarchicalChart', 'Hierarchical'),
                    subMenu: [
                        getMenuItem('treemapChart', 'Treemap&lrm;', 'treemap', 'pivotTreemap', true),
                        getMenuItem('sunburstChart', 'Sunburst&lrm;', 'sunburst', 'pivotSunburst', true),
                    ],
                },
                {
                    _key: 'pivotCombinationChart',
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: [
                        getMenuItem('columnLineCombo', 'Column & Line&lrm;', 'columnLineCombo', 'pivotColumnLineCombo'),
                        getMenuItem('AreaColumnCombo', 'Area & Column&lrm;', 'areaColumnCombo', 'pivotAreaColumnCombo')
                    ]
                }
            ],
            icon: core_1._.createIconNoSpan('chart', this.gridOptionsService, undefined),
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
                donut: 'pivotDonut',
                doughnut: 'pivotDonut',
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
            combinationGroup: {
                _key: 'pivotCombinationChart',
                columnLineCombo: 'pivotColumnLineCombo',
                areaColumnCombo: 'pivotAreaColumnCombo',
                customCombo: null, // Not currently supported
            },
            hierarchicalGroup: {
                _key: 'pivotHierarchicalChart',
                treemap: 'pivotTreemap',
                sunburst: 'pivotSunburst',
            },
            statisticalGroup: {
                _key: 'pivotStatisticalChart',
                histogram: 'pivotHistogram',
                // Some statistical charts do not currently support pivot mode
                rangeBar: null,
                rangeArea: null,
                boxPlot: null,
            },
            // Polar charts do not support pivot mode
            polarGroup: null,
            // Specialized charts do not currently support pivot mode
            specializedGroup: null,
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
        const getMenuItem = (localeKey, defaultText, chartType, key, enterprise = false) => {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: () => this.chartService.createChartFromCurrentRange(chartType),
                _key: key,
                _enterprise: enterprise
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
                        getMenuItem('donut', 'Donut&lrm;', 'donut', 'rangeDonut')
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
                {
                    name: localeTextFunc('polarChart', 'Polar'),
                    subMenu: [
                        getMenuItem('radarLine', 'Radar Line&lrm;', 'radarLine', 'rangeRadarLine'),
                        getMenuItem('radarArea', 'Radar Area&lrm;', 'radarArea', 'rangeRadarArea'),
                        getMenuItem('nightingale', 'Nightingale&lrm;', 'nightingale', 'rangeNightingale'),
                        getMenuItem('radialColumn', 'Radial Column&lrm;', 'radialColumn', 'rangeRadialColumn'),
                        getMenuItem('radialBar', 'Radial Bar&lrm;', 'radialBar', 'rangeRadialBar'),
                    ],
                    _key: 'rangePolarChart',
                    _enterprise: true,
                },
                {
                    name: localeTextFunc('statisticalChart', 'Statistical'),
                    subMenu: [
                        getMenuItem('boxPlot', 'Box Plot&lrm;', 'boxPlot', 'rangeBoxPlot', true),
                        getMenuItem('histogramChart', 'Histogram&lrm;', 'histogram', 'rangeHistogram', false),
                        getMenuItem('rangeBar', 'Range Bar&lrm;', 'rangeBar', 'rangeRangeBar', true),
                        getMenuItem('rangeArea', 'Range Area&lrm;', 'rangeArea', 'rangeRangeArea', true),
                    ],
                    _key: 'rangeStatisticalChart',
                    _enterprise: false, // histogram chart is available in both community and enterprise distributions
                },
                {
                    name: localeTextFunc('hierarchicalChart', 'Hierarchical'),
                    subMenu: [
                        getMenuItem('treemap', 'Treemap&lrm;', 'treemap', 'rangeTreemap'),
                        getMenuItem('sunburst', 'Sunburst&lrm;', 'sunburst', 'rangeSunburst'),
                    ],
                    _key: 'rangeHierarchicalChart',
                    _enterprise: true,
                },
                {
                    name: localeTextFunc('specializedChart', 'Specialized'),
                    subMenu: [
                        getMenuItem('heatmap', 'Heatmap&lrm;', 'heatmap', 'rangeHeatmap'),
                        getMenuItem('waterfall', 'Waterfall&lrm;', 'waterfall', 'rangeWaterfall'),
                    ],
                    _key: 'rangeSpecializedChart',
                    _enterprise: true,
                },
                {
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: [
                        getMenuItem('columnLineCombo', 'Column & Line&lrm;', 'columnLineCombo', 'rangeColumnLineCombo'),
                        getMenuItem('AreaColumnCombo', 'Area & Column&lrm;', 'areaColumnCombo', 'rangeAreaColumnCombo')
                    ],
                    _key: 'rangeCombinationChart'
                }
            ],
            icon: core_1._.createIconNoSpan('chart', this.gridOptionsService, undefined),
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
                donut: 'rangeDonut',
                doughnut: 'rangeDonut',
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
            polarGroup: {
                _key: 'rangePolarChart',
                radarLine: 'rangeRadarLine',
                radarArea: 'rangeRadarArea',
                nightingale: 'rangeNightingale',
                radialColumn: 'rangeRadialColumn',
                radialBar: 'rangeRadialBar',
            },
            statisticalGroup: {
                _key: 'rangeStatisticalChart',
                boxPlot: 'rangeBoxPlot',
                histogram: 'rangeHistogram',
                rangeBar: 'rangeRangeBar',
                rangeArea: 'rangeRangeArea',
            },
            hierarchicalGroup: {
                _key: 'rangeHierarchicalChart',
                treemap: 'rangeTreemap',
                sunburst: 'rangeSunburst',
            },
            specializedGroup: {
                _key: 'rangeSpecializedChart',
                heatmap: 'rangeHeatmap',
                waterfall: 'rangeWaterfall',
            },
            combinationGroup: {
                _key: 'rangeCombinationChart',
                columnLineCombo: 'rangeColumnLineCombo',
                areaColumnCombo: 'rangeAreaColumnCombo',
                customCombo: null // Not currently supported
            }
        };
    }
}
