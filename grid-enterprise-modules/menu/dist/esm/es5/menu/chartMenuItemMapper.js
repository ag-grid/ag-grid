var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { Bean, BeanStub, ModuleNames, ModuleRegistry, Optional, _ } from '@ag-grid-community/core';
var ChartMenuItemMapper = /** @class */ (function (_super) {
    __extends(ChartMenuItemMapper, _super);
    function ChartMenuItemMapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChartMenuItemMapper_1 = ChartMenuItemMapper;
    ChartMenuItemMapper.prototype.getChartItems = function (key) {
        var _a, _b;
        if (!this.chartService) {
            ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, "the Context Menu key \"".concat(key, "\""), this.context.getGridId());
            return undefined;
        }
        var builder = key === 'pivotChart'
            ? new PivotMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService)
            : new RangeMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService);
        var isEnterprise = this.chartService.isEnterprise();
        var topLevelMenuItem = builder.getMenuItem();
        if (topLevelMenuItem && topLevelMenuItem.subMenu && !isEnterprise) {
            // Filter out enterprise-only menu items if 'Community Integrated'
            var filterEnterpriseItems_1 = function (m) {
                var _a;
                return (__assign(__assign({}, m), { subMenu: (_a = m.subMenu) === null || _a === void 0 ? void 0 : _a.filter(function (menu) { return !menu._enterprise; }).map(function (menu) { return filterEnterpriseItems_1(menu); }) }));
            };
            topLevelMenuItem = filterEnterpriseItems_1(topLevelMenuItem);
        }
        var chartGroupsDef = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.settingsPanel) === null || _b === void 0 ? void 0 : _b.chartGroupsDef;
        if (chartGroupsDef) {
            topLevelMenuItem = ChartMenuItemMapper_1.filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, builder.getConfigLookup());
        }
        return this.cleanInternals(topLevelMenuItem);
    };
    // Remove our internal _key and _enterprise properties so this does not leak out of the class on the menu items.
    ChartMenuItemMapper.prototype.cleanInternals = function (menuItem) {
        if (!menuItem) {
            return menuItem;
        }
        var removeKeys = function (m) {
            var _a;
            m === null || m === void 0 ? true : delete m._key;
            m === null || m === void 0 ? true : delete m._enterprise;
            (_a = m === null || m === void 0 ? void 0 : m.subMenu) === null || _a === void 0 ? void 0 : _a.forEach(function (s) { return removeKeys(s); });
            return m;
        };
        return removeKeys(menuItem);
    };
    ChartMenuItemMapper.buildLookup = function (menuItem) {
        var itemLookup = {};
        var addItem = function (item) {
            itemLookup[item._key] = item;
            if (item.subMenu) {
                item.subMenu.forEach(function (s) { return addItem(s); });
            }
        };
        addItem(menuItem);
        return itemLookup;
    };
    /**
     * Make the MenuItem match the charts provided and their ordering on the ChartGroupsDef config object as provided by the user.
     */
    ChartMenuItemMapper.filterAndOrderChartMenu = function (topLevelMenuItem, chartGroupsDef, configLookup) {
        var _a;
        var menuItemLookup = this.buildLookup(topLevelMenuItem);
        var orderedAndFiltered = __assign(__assign({}, topLevelMenuItem), { subMenu: [] });
        Object.entries(chartGroupsDef).forEach(function (_a) {
            var _b, _c;
            var _d = __read(_a, 2), group = _d[0], chartTypes = _d[1];
            var chartConfigGroup = configLookup[group];
            // Skip any context panels that are not enabled for the current chart type
            if (chartConfigGroup === null)
                return;
            if (chartConfigGroup == undefined) {
                _.warnOnce("invalid chartGroupsDef config '".concat(group, "'"));
                return undefined;
            }
            var menuItem = menuItemLookup[chartConfigGroup._key];
            if (menuItem) {
                if (menuItem.subMenu) {
                    var subMenus = chartTypes.map(function (chartType) {
                        var itemKey = chartConfigGroup[chartType];
                        if (itemKey == undefined) {
                            _.warnOnce("invalid chartGroupsDef config '".concat(group, ".").concat(chartType, "'"));
                            return undefined;
                        }
                        return menuItemLookup[itemKey];
                    }).filter(function (s) { return s !== undefined; });
                    if (subMenus.length > 0) {
                        menuItem.subMenu = subMenus;
                        (_b = orderedAndFiltered.subMenu) === null || _b === void 0 ? void 0 : _b.push(menuItem);
                    }
                }
                else {
                    // Handles line case which is not actually a sub subMenu
                    (_c = orderedAndFiltered.subMenu) === null || _c === void 0 ? void 0 : _c.push(menuItem);
                }
            }
        });
        if (((_a = orderedAndFiltered.subMenu) === null || _a === void 0 ? void 0 : _a.length) == 0) {
            return undefined;
        }
        return orderedAndFiltered;
    };
    var ChartMenuItemMapper_1;
    __decorate([
        Optional('chartService')
    ], ChartMenuItemMapper.prototype, "chartService", void 0);
    ChartMenuItemMapper = ChartMenuItemMapper_1 = __decorate([
        Bean('chartMenuItemMapper')
    ], ChartMenuItemMapper);
    return ChartMenuItemMapper;
}(BeanStub));
export { ChartMenuItemMapper };
var PivotMenuItemMapper = /** @class */ (function () {
    function PivotMenuItemMapper(gridOptionsService, chartService, localeService) {
        this.gridOptionsService = gridOptionsService;
        this.chartService = chartService;
        this.localeService = localeService;
    }
    PivotMenuItemMapper.prototype.getMenuItem = function () {
        var _this = this;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var getMenuItem = function (localeKey, defaultText, chartType, key, enterprise) {
            if (enterprise === void 0) { enterprise = false; }
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createPivotChart({ chartType: chartType }); },
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
            icon: _.createIconNoSpan('chart', this.gridOptionsService, undefined),
        };
    };
    PivotMenuItemMapper.prototype.getConfigLookup = function () {
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
    };
    return PivotMenuItemMapper;
}());
var RangeMenuItemMapper = /** @class */ (function () {
    function RangeMenuItemMapper(gridOptionsService, chartService, localeService) {
        this.gridOptionsService = gridOptionsService;
        this.chartService = chartService;
        this.localeService = localeService;
    }
    RangeMenuItemMapper.prototype.getMenuItem = function () {
        var _this = this;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var getMenuItem = function (localeKey, defaultText, chartType, key, enterprise) {
            if (enterprise === void 0) { enterprise = false; }
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createChartFromCurrentRange(chartType); },
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
            icon: _.createIconNoSpan('chart', this.gridOptionsService, undefined),
        };
    };
    RangeMenuItemMapper.prototype.getConfigLookup = function () {
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
    };
    return RangeMenuItemMapper;
}());
