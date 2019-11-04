"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-grid-community/grid-core");
var chartController_1 = require("../../chartController");
var ChartDataPanel = /** @class */ (function (_super) {
    __extends(ChartDataPanel, _super);
    function ChartDataPanel(chartController) {
        var _this = _super.call(this, ChartDataPanel.TEMPLATE) || this;
        _this.columnComps = new Map();
        _this.chartController = chartController;
        return _this;
    }
    ChartDataPanel.prototype.init = function () {
        this.addPanels();
        this.addDestroyableEventListener(this.chartController, chartController_1.ChartController.EVENT_CHART_MODEL_UPDATED, this.addPanels.bind(this));
    };
    ChartDataPanel.prototype.destroy = function () {
        this.clearComponents();
        _super.prototype.destroy.call(this);
    };
    ChartDataPanel.prototype.addPanels = function () {
        var _this = this;
        var currentChartType = this.chartType;
        var _a = this.chartController.getColStateForMenu(), dimensionCols = _a.dimensionCols, valueCols = _a.valueCols;
        var colIds = dimensionCols.map(function (c) { return c.colId; }).concat(valueCols.map(function (c) { return c.colId; }));
        this.chartType = this.chartController.getChartType();
        if (grid_core_1._.areEqual(grid_core_1._.keys(this.columnComps), colIds) && this.chartType === currentChartType) {
            // if possible, we just update existing components
            __spreadArrays(dimensionCols, valueCols).forEach(function (col) {
                _this.columnComps.get(col.colId).setValue(col.selected, true);
            });
            if (this.chartController.isActiveXYChart()) {
                var getSeriesLabel_1 = this.generateGetSeriesLabel();
                valueCols.forEach(function (col) {
                    _this.columnComps.get(col.colId).setLabel(getSeriesLabel_1(col));
                });
            }
        }
        else {
            // otherwise we re-create everything
            this.clearComponents();
            this.createCategoriesGroupComponent(dimensionCols);
            this.createSeriesGroupComponent(valueCols);
        }
    };
    ChartDataPanel.prototype.addComponent = function (parent, component) {
        var eDiv = document.createElement('div');
        eDiv.appendChild(component.getGui());
        parent.appendChild(eDiv);
    };
    ChartDataPanel.prototype.addChangeListener = function (component, columnState) {
        var _this = this;
        this.addDestroyableEventListener(component, grid_core_1.AgAbstractField.EVENT_CHANGED, function () {
            columnState.selected = component.getValue();
            _this.chartController.updateForMenuChange(columnState);
        });
    };
    ChartDataPanel.prototype.createCategoriesGroupComponent = function (columns) {
        var _this = this;
        this.categoriesGroupComp = this.wireBean(new grid_core_1.AgGroupComponent({
            title: this.getCategoryGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false
        }));
        var inputName = "chartDimension" + this.getCompId();
        columns.forEach(function (col) {
            var comp = _this.categoriesGroupComp.wireDependentBean(new grid_core_1.AgRadioButton());
            comp.setLabel(grid_core_1._.escape(col.displayName));
            comp.setValue(col.selected);
            comp.setInputName(inputName);
            _this.addChangeListener(comp, col);
            _this.categoriesGroupComp.addItem(comp);
            _this.columnComps.set(col.colId, comp);
        });
        this.addComponent(this.getGui(), this.categoriesGroupComp);
    };
    ChartDataPanel.prototype.createSeriesGroupComponent = function (columns) {
        var _this = this;
        this.seriesGroupComp = this.wireDependentBean(new grid_core_1.AgGroupComponent({
            title: this.getSeriesGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false
        }));
        var getSeriesLabel = this.generateGetSeriesLabel();
        columns.forEach(function (col) {
            var comp = _this.seriesGroupComp.wireDependentBean(new grid_core_1.AgCheckbox());
            comp.setLabel(getSeriesLabel(col));
            comp.setValue(col.selected);
            _this.addChangeListener(comp, col);
            _this.seriesGroupComp.addItem(comp);
            _this.columnComps.set(col.colId, comp);
        });
        this.addComponent(this.getGui(), this.seriesGroupComp);
    };
    ChartDataPanel.prototype.generateGetSeriesLabel = function () {
        if (!this.chartController.isActiveXYChart()) {
            return function (col) { return grid_core_1._.escape(col.displayName); };
        }
        var isBubble = this.chartType === grid_core_1.ChartType.Bubble;
        var activeSeriesCount = 0;
        return function (col) {
            var escapedLabel = grid_core_1._.escape(col.displayName);
            if (!col.selected) {
                return escapedLabel;
            }
            activeSeriesCount++;
            var axisLabel;
            if (activeSeriesCount === 1) {
                axisLabel = "X";
            }
            else if (isBubble) {
                axisLabel = (activeSeriesCount - 1) % 2 === 1 ? "Y" : "size";
            }
            else {
                axisLabel = "Y";
            }
            return escapedLabel + " (" + axisLabel + ")";
        };
    };
    ChartDataPanel.prototype.getCategoryGroupTitle = function () {
        return this.chartTranslator.translate(this.chartController.isActiveXYChart() ? 'labels' : 'categories');
    };
    ChartDataPanel.prototype.getSeriesGroupTitle = function () {
        return this.chartTranslator.translate(this.chartController.isActiveXYChart() ? 'xyValues' : 'series');
    };
    ChartDataPanel.prototype.clearComponents = function () {
        grid_core_1._.clearElement(this.getGui());
        this.columnComps.clear();
        if (this.categoriesGroupComp) {
            this.categoriesGroupComp.destroy();
            this.categoriesGroupComp = undefined;
        }
        if (this.seriesGroupComp) {
            this.seriesGroupComp.destroy();
            this.seriesGroupComp = undefined;
        }
    };
    ChartDataPanel.TEMPLATE = "<div class=\"ag-chart-data-wrapper\"></div>";
    __decorate([
        grid_core_1.Autowired('chartTranslator')
    ], ChartDataPanel.prototype, "chartTranslator", void 0);
    __decorate([
        grid_core_1.PostConstruct
    ], ChartDataPanel.prototype, "init", null);
    return ChartDataPanel;
}(grid_core_1.Component));
exports.ChartDataPanel = ChartDataPanel;
