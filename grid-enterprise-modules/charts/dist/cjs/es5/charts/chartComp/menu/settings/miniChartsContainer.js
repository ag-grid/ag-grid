"use strict";
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniChartsContainer = void 0;
var core_1 = require("@ag-grid-community/core");
var index_1 = require("./miniCharts/index"); // please leave this as is - we want it to be explicit for build reasons
var miniChartMapping = {
    columnGroup: {
        column: { range: true, pivot: true, enterprise: false, icon: index_1.MiniColumn },
        stackedColumn: { range: true, pivot: true, enterprise: false, icon: index_1.MiniStackedColumn },
        normalizedColumn: { range: true, pivot: true, enterprise: false, icon: index_1.MiniNormalizedColumn },
    },
    barGroup: {
        bar: { range: true, pivot: true, enterprise: false, icon: index_1.MiniBar },
        stackedBar: { range: true, pivot: true, enterprise: false, icon: index_1.MiniStackedBar },
        normalizedBar: { range: true, pivot: true, enterprise: false, icon: index_1.MiniNormalizedBar },
    },
    pieGroup: {
        pie: { range: true, pivot: true, enterprise: false, icon: index_1.MiniPie },
        donut: { range: true, pivot: true, enterprise: false, icon: index_1.MiniDonut },
        doughnut: { range: true, pivot: true, enterprise: false, icon: index_1.MiniDonut },
    },
    lineGroup: { line: { range: true, pivot: true, enterprise: false, icon: index_1.MiniLine } },
    scatterGroup: {
        scatter: { range: true, pivot: true, enterprise: false, icon: index_1.MiniScatter },
        bubble: { range: true, pivot: true, enterprise: false, icon: index_1.MiniBubble },
    },
    areaGroup: {
        area: { range: true, pivot: true, enterprise: false, icon: index_1.MiniArea },
        stackedArea: { range: true, pivot: true, enterprise: false, icon: index_1.MiniStackedArea },
        normalizedArea: { range: true, pivot: true, enterprise: false, icon: index_1.MiniNormalizedArea },
    },
    polarGroup: {
        radarLine: { range: true, pivot: false, enterprise: true, icon: index_1.MiniRadarLine },
        radarArea: { range: true, pivot: false, enterprise: true, icon: index_1.MiniRadarArea },
        nightingale: { range: true, pivot: false, enterprise: true, icon: index_1.MiniNightingale },
        radialColumn: { range: true, pivot: false, enterprise: true, icon: index_1.MiniRadialColumn },
        radialBar: { range: true, pivot: false, enterprise: true, icon: index_1.MiniRadialBar },
    },
    statisticalGroup: {
        boxPlot: { range: true, pivot: false, enterprise: true, icon: index_1.MiniBoxPlot },
        histogram: { range: true, pivot: false, enterprise: false, icon: index_1.MiniHistogram },
        rangeBar: { range: true, pivot: false, enterprise: true, icon: index_1.MiniRangeBar },
        rangeArea: { range: true, pivot: false, enterprise: true, icon: index_1.MiniRangeArea },
    },
    hierarchicalGroup: {
        treemap: { range: true, pivot: true, enterprise: true, icon: index_1.MiniTreemap },
        sunburst: { range: true, pivot: true, enterprise: true, icon: index_1.MiniSunburst },
    },
    specializedGroup: {
        heatmap: { range: true, pivot: false, enterprise: true, icon: index_1.MiniHeatmap },
        waterfall: { range: true, pivot: false, enterprise: true, icon: index_1.MiniWaterfall },
    },
    combinationGroup: {
        columnLineCombo: { range: true, pivot: true, enterprise: false, icon: index_1.MiniColumnLineCombo },
        areaColumnCombo: { range: true, pivot: true, enterprise: false, icon: index_1.MiniAreaColumnCombo },
        customCombo: { range: true, pivot: true, enterprise: false, icon: index_1.MiniCustomCombo },
    },
};
var MiniChartsContainer = /** @class */ (function (_super) {
    __extends(MiniChartsContainer, _super);
    function MiniChartsContainer(chartController, fills, strokes, themeTemplateParameters, isCustomTheme, chartGroups) {
        if (chartGroups === void 0) { chartGroups = core_1.DEFAULT_CHART_GROUPS; }
        var _this = _super.call(this, MiniChartsContainer.TEMPLATE) || this;
        _this.wrappers = {};
        _this.chartController = chartController;
        _this.fills = fills;
        _this.strokes = strokes;
        _this.themeTemplateParameters = themeTemplateParameters;
        _this.isCustomTheme = isCustomTheme;
        _this.chartGroups = __assign({}, chartGroups);
        return _this;
    }
    MiniChartsContainer.prototype.init = function () {
        var e_1, _a, e_2, _b;
        var _this = this;
        var eGui = this.getGui();
        var isEnterprise = this.chartController.isEnterprise();
        var isPivotChart = this.chartController.isPivotChart();
        var isRangeChart = !isPivotChart;
        // Determine the set of chart types that are specified by the chartGroupsDef config, filtering out any entries
        // that are invalid for the current chart configuration (pivot/range) and license type
        var displayedMenuGroups = Object.keys(this.chartGroups).map(function (group) {
            var _a;
            var menuGroup = group in miniChartMapping
                ? miniChartMapping[group]
                : undefined;
            if (!menuGroup) {
                // User has specified an invalid chart group in the chartGroupsDef config
                core_1._.warnOnce("invalid chartGroupsDef config '".concat(group, "'"));
                return null;
            }
            // Determine the valid chart types within this group, based on the chartGroupsDef config
            var chartGroupValues = (_a = _this.chartGroups[group]) !== null && _a !== void 0 ? _a : [];
            var menuItems = chartGroupValues.map(function (chartType) {
                var menuItem = chartType in menuGroup
                    ? menuGroup[chartType]
                    : undefined;
                if (!menuItem) {
                    // User has specified an invalid chart type in the chartGroupsDef config
                    core_1._.warnOnce("invalid chartGroupsDef config '".concat(group, ".").concat(chartType, "'"));
                    return null;
                }
                if (!isEnterprise && menuItem.enterprise) {
                    return null; // skip enterprise charts if community
                }
                // Only show the chart if it is valid for the current chart configuration (pivot/range)
                if (isRangeChart && menuItem.range)
                    return menuItem;
                if (isPivotChart && menuItem.pivot)
                    return menuItem;
                return null;
            })
                .filter(function (menuItem) { return menuItem != null; });
            if (menuItems.length === 0)
                return null; // don't render empty chart groups
            return {
                label: _this.chartTranslationService.translate(group),
                items: menuItems
            };
        })
            .filter(function (menuGroup) { return menuGroup != null; });
        try {
            // Render the filtered menu items
            for (var displayedMenuGroups_1 = __values(displayedMenuGroups), displayedMenuGroups_1_1 = displayedMenuGroups_1.next(); !displayedMenuGroups_1_1.done; displayedMenuGroups_1_1 = displayedMenuGroups_1.next()) {
                var _c = displayedMenuGroups_1_1.value, label = _c.label, items = _c.items;
                var groupComponent = this.createBean(new core_1.AgGroupComponent({
                    title: label,
                    suppressEnabledCheckbox: true,
                    enabled: true,
                    suppressOpenCloseIcons: true,
                    cssIdentifier: 'charts-settings',
                    direction: 'horizontal',
                }));
                var _loop_1 = function (menuItem) {
                    var MiniClass = menuItem.icon;
                    var miniWrapper = document.createElement('div');
                    miniWrapper.classList.add('ag-chart-mini-thumbnail');
                    var miniClassChartType = MiniClass.chartType;
                    this_1.addManagedListener(miniWrapper, 'click', function () {
                        _this.chartController.setChartType(miniClassChartType);
                        _this.updateSelectedMiniChart();
                    });
                    this_1.wrappers[miniClassChartType] = miniWrapper;
                    this_1.createBean(new MiniClass(miniWrapper, this_1.fills, this_1.strokes, this_1.themeTemplateParameters, this_1.isCustomTheme));
                    groupComponent.addItem(miniWrapper);
                };
                var this_1 = this;
                try {
                    for (var items_1 = (e_2 = void 0, __values(items)), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                        var menuItem = items_1_1.value;
                        _loop_1(menuItem);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (items_1_1 && !items_1_1.done && (_b = items_1.return)) _b.call(items_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                eGui.appendChild(groupComponent.getGui());
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (displayedMenuGroups_1_1 && !displayedMenuGroups_1_1.done && (_a = displayedMenuGroups_1.return)) _a.call(displayedMenuGroups_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // hide MiniCustomCombo if no custom combo exists
        if (!this.chartController.customComboExists() && this.chartGroups.combinationGroup) {
            this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter(function (chartType) { return chartType !== 'customCombo'; });
        }
        this.updateSelectedMiniChart();
    };
    MiniChartsContainer.prototype.updateSelectedMiniChart = function () {
        var selectedChartType = this.chartController.getChartType();
        for (var miniChartType in this.wrappers) {
            var miniChart = this.wrappers[miniChartType];
            var selected = miniChartType === selectedChartType;
            miniChart.classList.toggle('ag-selected', selected);
        }
    };
    MiniChartsContainer.TEMPLATE = "<div class=\"ag-chart-settings-mini-wrapper\"></div>";
    __decorate([
        (0, core_1.Autowired)('chartTranslationService')
    ], MiniChartsContainer.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], MiniChartsContainer.prototype, "init", null);
    return MiniChartsContainer;
}(core_1.Component));
exports.MiniChartsContainer = MiniChartsContainer;
