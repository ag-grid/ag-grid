var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, "the Context Menu key \"" + key + "\"");
            return undefined;
        }
        var builder = key === 'pivotChart'
            ? new PivotMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService)
            : new RangeMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService);
        var topLevelMenuItem = builder.getMenuItem();
        var chartGroupsDef = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.settingsPanel) === null || _b === void 0 ? void 0 : _b.chartGroupsDef;
        if (chartGroupsDef) {
            // Apply filtering and ordering if chartGroupsDef provided
            topLevelMenuItem = ChartMenuItemMapper_1.filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, builder.getConfigLookup());
        }
        return this.cleanInternals(topLevelMenuItem);
    };
    // Remove our internal _key properties so this does not leak out of the class on the menu items.
    ChartMenuItemMapper.prototype.cleanInternals = function (menuItem) {
        if (!menuItem) {
            return menuItem;
        }
        var removeKey = function (m) {
            var _a;
            m === null || m === void 0 ? true : delete m._key;
            (_a = m === null || m === void 0 ? void 0 : m.subMenu) === null || _a === void 0 ? void 0 : _a.forEach(function (s) { return removeKey(s); });
            return m;
        };
        return removeKey(menuItem);
    };
    ChartMenuItemMapper.buildLookup = function (menuItem) {
        var itemLookup = {};
        var addItem = function (item) {
            itemLookup[item._key] = item;
            if (item.subMenu) {
                item.subMenu.map(function (s) { return addItem(s); });
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
        Object.entries(chartGroupsDef).map(function (_a) {
            var _b, _c;
            var _d = __read(_a, 2), group = _d[0], chartTypes = _d[1];
            var chartConfigGroup = configLookup[group];
            if (chartConfigGroup == undefined) {
                _.doOnce(function () { return console.warn("AG Grid - invalid chartGroupsDef config '" + group + "'"); }, "invalid_chartGroupsDef" + group);
                return undefined;
            }
            var menuItem = menuItemLookup[chartConfigGroup._key];
            if (menuItem) {
                if (menuItem.subMenu) {
                    var subMenus = chartTypes.map(function (chartType) {
                        var itemKey = chartConfigGroup[chartType];
                        if (itemKey == undefined) {
                            _.doOnce(function () { return console.warn("AG Grid - invalid chartGroupsDef config '" + group + "." + chartType + "'"); }, "invalid_chartGroupsDef" + chartType + "_" + group);
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
        var getMenuItem = function (localeKey, defaultText, chartType, key) {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createPivotChart({ chartType: chartType }); },
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
        var getMenuItem = function (localeKey, defaultText, chartType, key) {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createChartFromCurrentRange(chartType); },
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
    };
    return RangeMenuItemMapper;
}());
