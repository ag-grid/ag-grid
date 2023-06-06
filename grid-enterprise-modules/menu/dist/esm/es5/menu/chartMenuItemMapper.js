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
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, "the Context Menu key \"" + key + "\"", this.context.getGridId());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRNZW51SXRlbU1hcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tZW51L2NoYXJ0TWVudUl0ZW1NYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQTRGLFdBQVcsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRzdMO0lBQXlDLHVDQUFRO0lBQWpEOztJQTRGQSxDQUFDOzRCQTVGWSxtQkFBbUI7SUFJckIsMkNBQWEsR0FBcEIsVUFBcUIsR0FBZ0M7O1FBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3BCLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsNEJBQXlCLEdBQUcsT0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUN6SCxPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUVELElBQU0sT0FBTyxHQUFHLEdBQUcsS0FBSyxZQUFZO1lBQ2hDLENBQUMsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDekYsQ0FBQyxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRTlGLElBQUksZ0JBQWdCLEdBQW1DLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU3RSxJQUFNLGNBQWMsR0FBRyxNQUFBLE1BQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQywwQ0FBRSxhQUFhLDBDQUFFLGNBQWMsQ0FBQztRQUN4RyxJQUFJLGNBQWMsRUFBRTtZQUNoQiwwREFBMEQ7WUFDMUQsZ0JBQWdCLEdBQUcscUJBQW1CLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO1NBQy9IO1FBQ0QsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELGdHQUFnRztJQUN4Riw0Q0FBYyxHQUF0QixVQUF1QixRQUF3QztRQUMzRCxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsT0FBTyxRQUFRLENBQUM7U0FDbkI7UUFDRCxJQUFNLFNBQVMsR0FBRyxVQUFDLENBQWlDOztZQUN6QyxDQUFDLGFBQUQsQ0FBQyw0QkFBRCxDQUFDLENBQUUsSUFBSSxDQUFDO1lBQ2YsTUFBQSxDQUFDLGFBQUQsQ0FBQyx1QkFBRCxDQUFDLENBQUUsT0FBTywwQ0FBRSxPQUFPLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQVosQ0FBWSxDQUFDLENBQUM7WUFDdkMsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDLENBQUE7UUFDRCxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRWMsK0JBQVcsR0FBMUIsVUFBOEQsUUFBVztRQUNyRSxJQUFJLFVBQVUsR0FBbUIsRUFBUyxDQUFDO1FBQzNDLElBQU0sT0FBTyxHQUFHLFVBQUMsSUFBTztZQUNwQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztZQUM3QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxPQUFPLENBQUMsQ0FBTSxDQUFDLEVBQWYsQ0FBZSxDQUFDLENBQUE7YUFDN0M7UUFDTCxDQUFDLENBQUE7UUFDRCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEIsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ1ksMkNBQXVCLEdBQXRDLFVBQTZELGdCQUEyQyxFQUFFLGNBQThCLEVBQUUsWUFBd0M7O1FBRTlLLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUN6RCxJQUFJLGtCQUFrQix5QkFBNEIsZ0JBQWdCLEtBQUUsT0FBTyxFQUFFLEVBQUUsR0FBRSxDQUFDO1FBRWxGLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBd0Q7O2dCQUF4RCxLQUFBLGFBQXdELEVBQXZELEtBQUssUUFBQSxFQUFFLFVBQVUsUUFBQTtZQUV0RCxJQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QyxJQUFJLGdCQUFnQixJQUFJLFNBQVMsRUFBRTtnQkFDL0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLElBQUksQ0FBQyw4Q0FBNEMsS0FBSyxNQUFHLENBQUMsRUFBbEUsQ0FBa0UsRUFBRSwyQkFBeUIsS0FBTyxDQUFDLENBQUM7Z0JBQ3JILE9BQU8sU0FBUyxDQUFDO2FBQ3BCO1lBRUQsSUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZELElBQUksUUFBUSxFQUFFO2dCQUNWLElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRTtvQkFDbEIsSUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFBLFNBQVM7d0JBQ3JDLElBQU0sT0FBTyxHQUFJLGdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNyRCxJQUFJLE9BQU8sSUFBSSxTQUFTLEVBQUU7NEJBQ3RCLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBTSxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsOENBQTRDLEtBQUssU0FBSSxTQUFTLE1BQUcsQ0FBQyxFQUEvRSxDQUErRSxFQUFFLDJCQUF5QixTQUFTLFNBQUksS0FBTyxDQUFDLENBQUM7NEJBQy9JLE9BQU8sU0FBUyxDQUFDO3lCQUNwQjt3QkFDRCxPQUFPLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDbkMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxLQUFLLFNBQVMsRUFBZixDQUFlLENBQXlCLENBQUM7b0JBRXhELElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ3JCLFFBQVEsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO3dCQUM1QixNQUFBLGtCQUFrQixDQUFDLE9BQU8sMENBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUM5QztpQkFDSjtxQkFBTTtvQkFDSCx3REFBd0Q7b0JBQ3hELE1BQUEsa0JBQWtCLENBQUMsT0FBTywwQ0FBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzlDO2FBQ0o7UUFDTCxDQUFDLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQSxNQUFBLGtCQUFrQixDQUFDLE9BQU8sMENBQUUsTUFBTSxLQUFJLENBQUMsRUFBRTtZQUN6QyxPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUNELE9BQU8sa0JBQWtCLENBQUM7SUFDOUIsQ0FBQzs7SUF6RnlCO1FBQXpCLFFBQVEsQ0FBQyxjQUFjLENBQUM7NkRBQThDO0lBRjlELG1CQUFtQjtRQUQvQixJQUFJLENBQUMscUJBQXFCLENBQUM7T0FDZixtQkFBbUIsQ0E0Ri9CO0lBQUQsMEJBQUM7Q0FBQSxBQTVGRCxDQUF5QyxRQUFRLEdBNEZoRDtTQTVGWSxtQkFBbUI7QUE4SGhDO0lBRUksNkJBQW9CLGtCQUFzQyxFQUFVLFlBQTJCLEVBQVUsYUFBNEI7UUFBakgsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFlO1FBQVUsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFBSSxDQUFDO0lBRTFJLHlDQUFXLEdBQVg7UUFBQSxpQkFzRUM7UUFyRUcsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELElBQU0sV0FBVyxHQUFHLFVBQUMsU0FBaUIsRUFBRSxXQUFtQixFQUFFLFNBQW9CLEVBQUUsR0FBd0I7WUFDdkcsT0FBTztnQkFDSCxJQUFJLEVBQUUsY0FBYyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7Z0JBQzVDLE1BQU0sRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFNBQVMsV0FBQSxFQUFFLENBQUMsRUFBakQsQ0FBaUQ7Z0JBQy9ELElBQUksRUFBRSxHQUFHO2FBQ1osQ0FBQztRQUNOLENBQUMsQ0FBQztRQUNGLE9BQU87WUFDSCxJQUFJLEVBQUUsY0FBYyxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUM7WUFDakQsSUFBSSxFQUFFLFlBQVk7WUFDbEIsT0FBTyxFQUFFO2dCQUNMO29CQUNJLElBQUksRUFBRSxrQkFBa0I7b0JBQ3hCLElBQUksRUFBRSxjQUFjLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQztvQkFDN0MsT0FBTyxFQUFFO3dCQUNMLFdBQVcsQ0FBQyxlQUFlLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxvQkFBb0IsQ0FBQzt3QkFDbkYsV0FBVyxDQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixDQUFDO3dCQUNuRixXQUFXLENBQUMsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUsdUJBQXVCLENBQUM7cUJBQ3BHO2lCQUNKO2dCQUNEO29CQUNJLElBQUksRUFBRSxlQUFlO29CQUNyQixJQUFJLEVBQUUsY0FBYyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUM7b0JBQ3ZDLE9BQU8sRUFBRTt3QkFDTCxXQUFXLENBQUMsWUFBWSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLENBQUM7d0JBQzFFLFdBQVcsQ0FBQyxZQUFZLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxpQkFBaUIsQ0FBQzt3QkFDMUUsV0FBVyxDQUFDLGVBQWUsRUFBRSxtQkFBbUIsRUFBRSxlQUFlLEVBQUUsb0JBQW9CLENBQUM7cUJBQzNGO2lCQUNKO2dCQUNEO29CQUNJLElBQUksRUFBRSxlQUFlO29CQUNyQixJQUFJLEVBQUUsY0FBYyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUM7b0JBQ3ZDLE9BQU8sRUFBRTt3QkFDTCxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDO3dCQUNqRCxXQUFXLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDO3FCQUN4RTtpQkFDSjtnQkFDRCxXQUFXLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLENBQUM7Z0JBQzFEO29CQUNJLElBQUksRUFBRSxjQUFjO29CQUNwQixJQUFJLEVBQUUsY0FBYyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUM7b0JBQ2hELE9BQU8sRUFBRTt3QkFDTCxXQUFXLENBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDO3dCQUNqRSxXQUFXLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsYUFBYSxDQUFDO3FCQUNoRTtpQkFDSjtnQkFDRDtvQkFDSSxJQUFJLEVBQUUsZ0JBQWdCO29CQUN0QixJQUFJLEVBQUUsY0FBYyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUM7b0JBQ3pDLE9BQU8sRUFDSDt3QkFDSSxXQUFXLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDO3dCQUNyRCxXQUFXLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLENBQUM7d0JBQzdFLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBRSxxQkFBcUIsQ0FBQztxQkFDOUY7aUJBQ1I7Z0JBQ0QsV0FBVyxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxxQkFBcUIsQ0FBQztnQkFDbkY7b0JBQ0ksSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsSUFBSSxFQUFFLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxhQUFhLENBQUM7b0JBQ3ZELE9BQU8sRUFBRTt3QkFDTCxXQUFXLENBQUMsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsc0JBQXNCLENBQUM7d0JBQy9GLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsQ0FBQztxQkFDbEc7aUJBQ0o7YUFDSjtZQUNELElBQUksRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUM7U0FDeEUsQ0FBQTtJQUNMLENBQUM7SUFFRCw2Q0FBZSxHQUFmO1FBQ0ksT0FBTztZQUNILFdBQVcsRUFBRTtnQkFDVCxJQUFJLEVBQUUsa0JBQWtCO2dCQUN4QixNQUFNLEVBQUUsb0JBQW9CO2dCQUM1QixhQUFhLEVBQUUsb0JBQW9CO2dCQUNuQyxnQkFBZ0IsRUFBRSx1QkFBdUI7YUFDNUM7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLEdBQUcsRUFBRSxpQkFBaUI7Z0JBQ3RCLFVBQVUsRUFBRSxpQkFBaUI7Z0JBQzdCLGFBQWEsRUFBRSxvQkFBb0I7YUFDdEM7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLEdBQUcsRUFBRSxVQUFVO2dCQUNmLFFBQVEsRUFBRSxlQUFlO2FBQzVCO1lBQ0QsU0FBUyxFQUFFO2dCQUNQLElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLElBQUksRUFBRSxnQkFBZ0I7YUFDekI7WUFDRCxZQUFZLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLE1BQU0sRUFBRSxhQUFhO2dCQUNyQixPQUFPLEVBQUUsY0FBYzthQUMxQjtZQUNELFNBQVMsRUFBRTtnQkFDUCxJQUFJLEVBQUUsZ0JBQWdCO2dCQUN0QixJQUFJLEVBQUUsV0FBVztnQkFDakIsV0FBVyxFQUFFLGtCQUFrQjtnQkFDL0IsY0FBYyxFQUFFLHFCQUFxQjthQUN4QztZQUNELGNBQWMsRUFBRTtnQkFDWixJQUFJLEVBQUUscUJBQXFCO2dCQUMzQixTQUFTLEVBQUUscUJBQXFCO2FBQ25DO1lBQ0QsZ0JBQWdCLEVBQUU7Z0JBQ2QsSUFBSSxFQUFFLHVCQUF1QjtnQkFDN0IsZUFBZSxFQUFFLHNCQUFzQjtnQkFDdkMsZUFBZSxFQUFFLHNCQUFzQjtnQkFDdkMsV0FBVyxFQUFFLEVBQVMsQ0FBQyw2RUFBNkU7YUFDdkc7U0FDSixDQUFBO0lBQ0wsQ0FBQztJQUVMLDBCQUFDO0FBQUQsQ0FBQyxBQTNIRCxJQTJIQztBQWFEO0lBRUksNkJBQW9CLGtCQUFzQyxFQUFVLFlBQTJCLEVBQVUsYUFBNEI7UUFBakgsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFlO1FBQVUsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFBSSxDQUFDO0lBRTFJLHlDQUFXLEdBQVg7UUFBQSxpQkF1RUM7UUF0RUcsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELElBQU0sV0FBVyxHQUFHLFVBQUMsU0FBaUIsRUFBRSxXQUFtQixFQUFFLFNBQW9CLEVBQUUsR0FBd0I7WUFDdkcsT0FBTztnQkFDSCxJQUFJLEVBQUUsY0FBYyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7Z0JBQzVDLE1BQU0sRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLFlBQVksQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsRUFBeEQsQ0FBd0Q7Z0JBQ3RFLElBQUksRUFBRSxHQUFHO2FBQ1osQ0FBQztRQUNOLENBQUMsQ0FBQztRQUVGLE9BQU87WUFDSCxJQUFJLEVBQUUsY0FBYyxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUM7WUFDakQsSUFBSSxFQUFFLFlBQVk7WUFDbEIsT0FBTyxFQUFFO2dCQUNMO29CQUNJLElBQUksRUFBRSxjQUFjLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQztvQkFDN0MsT0FBTyxFQUFFO3dCQUNMLFdBQVcsQ0FBQyxlQUFlLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxvQkFBb0IsQ0FBQzt3QkFDbkYsV0FBVyxDQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixDQUFDO3dCQUNuRixXQUFXLENBQUMsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUsdUJBQXVCLENBQUM7cUJBQ3BHO29CQUNELElBQUksRUFBRSxrQkFBa0I7aUJBQzNCO2dCQUNEO29CQUNJLElBQUksRUFBRSxjQUFjLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQztvQkFDdkMsT0FBTyxFQUFFO3dCQUNMLFdBQVcsQ0FBQyxZQUFZLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxpQkFBaUIsQ0FBQzt3QkFDMUUsV0FBVyxDQUFDLFlBQVksRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixDQUFDO3dCQUMxRSxXQUFXLENBQUMsZUFBZSxFQUFFLG1CQUFtQixFQUFFLGVBQWUsRUFBRSxvQkFBb0IsQ0FBQztxQkFDM0Y7b0JBQ0QsSUFBSSxFQUFFLGVBQWU7aUJBQ3hCO2dCQUNEO29CQUNJLElBQUksRUFBRSxjQUFjLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQztvQkFDdkMsT0FBTyxFQUFFO3dCQUNMLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUM7d0JBQ2pELFdBQVcsQ0FBQyxVQUFVLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUM7cUJBQ3hFO29CQUNELElBQUksRUFBRSxlQUFlO2lCQUN4QjtnQkFDRCxXQUFXLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLENBQUM7Z0JBQzFEO29CQUNJLElBQUksRUFBRSxjQUFjLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQztvQkFDaEQsT0FBTyxFQUFFO3dCQUNMLFdBQVcsQ0FBQyxTQUFTLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUM7d0JBQ2pFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUM7cUJBQ2hFO29CQUNELElBQUksRUFBRSxjQUFjO2lCQUN2QjtnQkFDRDtvQkFDSSxJQUFJLEVBQUUsY0FBYyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUM7b0JBQ3pDLE9BQU8sRUFDSDt3QkFDSSxXQUFXLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDO3dCQUNyRCxXQUFXLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLENBQUM7d0JBQzdFLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBRSxxQkFBcUIsQ0FBQztxQkFDOUY7b0JBQ0wsSUFBSSxFQUFFLGdCQUFnQjtpQkFDekI7Z0JBQ0QsV0FBVyxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxxQkFBcUIsQ0FBQztnQkFDbkY7b0JBQ0ksSUFBSSxFQUFFLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxhQUFhLENBQUM7b0JBQ3ZELE9BQU8sRUFBRTt3QkFDTCxXQUFXLENBQUMsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsc0JBQXNCLENBQUM7d0JBQy9GLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsQ0FBQztxQkFDbEc7b0JBQ0QsSUFBSSxFQUFFLHVCQUF1QjtpQkFDaEM7YUFDSjtZQUNELElBQUksRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUM7U0FDeEUsQ0FBQTtJQUNMLENBQUM7SUFFRCw2Q0FBZSxHQUFmO1FBQ0ksT0FBTztZQUNILFdBQVcsRUFBRTtnQkFDVCxJQUFJLEVBQUUsa0JBQWtCO2dCQUN4QixNQUFNLEVBQUUsb0JBQW9CO2dCQUM1QixhQUFhLEVBQUUsb0JBQW9CO2dCQUNuQyxnQkFBZ0IsRUFBRSx1QkFBdUI7YUFDNUM7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLEdBQUcsRUFBRSxpQkFBaUI7Z0JBQ3RCLFVBQVUsRUFBRSxpQkFBaUI7Z0JBQzdCLGFBQWEsRUFBRSxvQkFBb0I7YUFDdEM7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLEdBQUcsRUFBRSxVQUFVO2dCQUNmLFFBQVEsRUFBRSxlQUFlO2FBQzVCO1lBQ0QsU0FBUyxFQUFFO2dCQUNQLElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLElBQUksRUFBRSxnQkFBZ0I7YUFDekI7WUFDRCxZQUFZLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLE1BQU0sRUFBRSxhQUFhO2dCQUNyQixPQUFPLEVBQUUsY0FBYzthQUMxQjtZQUNELFNBQVMsRUFBRTtnQkFDUCxJQUFJLEVBQUUsZ0JBQWdCO2dCQUN0QixJQUFJLEVBQUUsV0FBVztnQkFDakIsV0FBVyxFQUFFLGtCQUFrQjtnQkFDL0IsY0FBYyxFQUFFLHFCQUFxQjthQUN4QztZQUNELGNBQWMsRUFBRTtnQkFDWixJQUFJLEVBQUUscUJBQXFCO2dCQUMzQixTQUFTLEVBQUUscUJBQXFCO2FBQ25DO1lBQ0QsZ0JBQWdCLEVBQUU7Z0JBQ2QsSUFBSSxFQUFFLHVCQUF1QjtnQkFDN0IsZUFBZSxFQUFFLHNCQUFzQjtnQkFDdkMsZUFBZSxFQUFFLHNCQUFzQjtnQkFDdkMsV0FBVyxFQUFFLEVBQVMsQ0FBQyw2RUFBNkU7YUFDdkc7U0FDSixDQUFBO0lBQ0wsQ0FBQztJQUNMLDBCQUFDO0FBQUQsQ0FBQyxBQTNIRCxJQTJIQyJ9